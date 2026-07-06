const { prisma } = require('../../db/db');
const translateService = require('../i18n/translateService');

// ---- Visibility ---------------------------------------------------------
// Global threads are visible to everyone; org threads only to the author's org.
// Returns a Prisma `where` fragment for the threads a user may see.
function visibilityWhere(user, scope = 'all') {
  const orgClause = { visibility: 'org', organizationId: user.organizationId };
  const globalClause = { visibility: 'global' };
  if (scope === 'global') return globalClause;
  if (scope === 'org') return orgClause;
  return { OR: [globalClause, orgClause] };
}

function canSeeThread(thread, user) {
  if (thread.visibility === 'global') return true;
  return thread.organizationId === user.organizationId;
}

// Moderation: platform admins moderate everything; for org threads the org's
// owner/admin can moderate too. Authors can always remove their own content.
function canModerate(thread, user) {
  if (user.role === 'platform_admin') return true;
  if (thread.visibility === 'org'
    && thread.organizationId === user.organizationId
    && ['owner', 'admin'].includes(user.role)) return true;
  return false;
}

// ---- Scoring ------------------------------------------------------------
// Set a user's vote on a target and recompute the cached score. value 0 clears.
async function setVote({ userId, targetType, targetId, value }) {
  if (value === 0) {
    await prisma.threadVote.deleteMany({ where: { userId, targetType, targetId } });
  } else {
    await prisma.threadVote.upsert({
      where: { userId_targetType_targetId: { userId, targetType, targetId } },
      update: { value },
      create: { userId, targetType, targetId, value },
    });
  }
  const agg = await prisma.threadVote.aggregate({ where: { targetType, targetId }, _sum: { value: true } });
  const score = agg._sum.value || 0;
  if (targetType === 'thread') await prisma.thread.update({ where: { id: targetId }, data: { score } });
  else await prisma.threadPost.update({ where: { id: targetId }, data: { score } });
  return { score, myVote: value };
}

// Attach the current user's vote to a set of thread/post ids in one query.
async function myVotes(userId, targetType, ids) {
  if (!ids.length) return {};
  const votes = await prisma.threadVote.findMany({
    where: { userId, targetType, targetId: { in: ids } },
    select: { targetId: true, value: true },
  });
  return Object.fromEntries(votes.map((v) => [v.targetId, v.value]));
}

// ---- Serializers --------------------------------------------------------
// Author identity is always Name + Company (the chosen identity model).
function publicAuthor(u) {
  if (!u) return null;
  return { id: u.id, fullName: u.fullName, company: u.organization?.name || null };
}

// ---- Machine translation of user content ---------------------------------
// Threads/posts are free text people typed, so they cannot be pre-translated
// like the UI. We translate on demand into `lang`, cache the result on the row
// (translations.<lang>), and serve the cached copy thereafter. `translated` in
// the payload lets the client show an "auto-translated" note.

// Read the best available text for a row given `lang`, preferring a cached
// translation that actually differs from the original.
function pickText(row, lang, fields) {
  const tr = (lang && lang !== 'en' && row.translations && row.translations[lang]) || null;
  const out = {};
  let translated = false;
  for (const f of fields) {
    const v = tr && tr[f];
    out[f] = v || row[f];
    if (v && v !== row[f]) translated = true;
  }
  out._translated = translated;
  return out;
}

function publicThread(t, { myVote = 0, canModerate: mod = false } = {}, lang = 'en') {
  const text = t.deletedAt ? { title: t.title, body: null, _translated: false } : pickText(t, lang, ['title', 'body']);
  return {
    id: t.id,
    title: text.title,
    body: text.body,
    deleted: !!t.deletedAt,
    translated: text._translated,
    visibility: t.visibility,
    status: t.status,
    pinned: t.pinned,
    score: t.score,
    replyCount: t.replyCount,
    frameworkKey: t.framework?.key || null,
    frameworkName: t.framework?.shortName || t.framework?.name || null,
    requirementCode: t.requirementCode || null,
    author: publicAuthor(t.author),
    myVote,
    canModerate: mod,
    lastActivityAt: t.lastActivityAt,
    createdAt: t.createdAt,
  };
}

function publicPost(p, { myVote = 0, canModerate: mod = false } = {}, lang = 'en') {
  const text = p.deletedAt ? { body: null, _translated: false } : pickText(p, lang, ['body']);
  return {
    id: p.id,
    threadId: p.threadId,
    parentPostId: p.parentPostId,
    body: text.body,
    deleted: !!p.deletedAt,
    translated: text._translated,
    score: p.score,
    author: publicAuthor(p.author),
    myVote,
    canModerate: mod,
    createdAt: p.createdAt,
  };
}

// Merge a translated field into a row's translations cache (in memory + DB).
async function cacheTranslation(model, row, lang, field, value) {
  const merged = { ...(row.translations || {}) };
  merged[lang] = { ...(merged[lang] || {}), [field]: value };
  row.translations = merged; // mutate so the serializer sees it this request
  try {
    await model.update({ where: { id: row.id }, data: { translations: merged } });
  } catch (err) {
    // Cache write is best-effort; the request still returns the translation.
  }
}

// List view: ensure every visible thread has a cached title translation for
// `lang`. Titles only (the list shows titles); bodies are done on the detail
// view. One batched API call covers all missing titles.
async function ensureThreadTitles(threads, lang) {
  if (lang === 'en' || !translateService.isEnabled()) return;
  const need = threads.filter(
    (t) => !t.deletedAt && !(t.translations && t.translations[lang] && t.translations[lang].title),
  );
  if (!need.length) return;
  const out = await translateService.translateStrings(need.map((t) => t.title), lang);
  if (!out) return;
  await Promise.all(need.map((t, i) => {
    const title = out[i];
    if (!title) return Promise.resolve();
    return cacheTranslation(prisma.thread, t, lang, 'title', title);
  }));
}

// Detail view: translate the thread title+body and every reply body into `lang`
// (only the parts not already cached), in a single batched API call.
async function ensureThreadDetail(thread, posts, lang) {
  if (lang === 'en' || !translateService.isEnabled()) return;
  const jobs = []; // { model, row, field, text }
  const tTr = (thread.translations && thread.translations[lang]) || {};
  if (!thread.deletedAt) {
    if (!tTr.title) jobs.push({ model: prisma.thread, row: thread, field: 'title', text: thread.title });
    if (!tTr.body) jobs.push({ model: prisma.thread, row: thread, field: 'body', text: thread.body });
  }
  for (const p of posts) {
    if (p.deletedAt) continue;
    const pTr = (p.translations && p.translations[lang]) || {};
    if (!pTr.body) jobs.push({ model: prisma.threadPost, row: p, field: 'body', text: p.body });
  }
  if (!jobs.length) return;
  const out = await translateService.translateStrings(jobs.map((j) => j.text), lang);
  if (!out) return;
  await Promise.all(jobs.map((j, i) => {
    const val = out[i];
    if (!val) return Promise.resolve();
    return cacheTranslation(j.model, j.row, lang, j.field, val);
  }));
}

// Author include used across queries (name + company).
const authorInclude = { select: { id: true, fullName: true, organization: { select: { name: true } } } };

module.exports = {
  visibilityWhere,
  canSeeThread,
  canModerate,
  setVote,
  myVotes,
  publicAuthor,
  publicThread,
  publicPost,
  authorInclude,
  ensureThreadTitles,
  ensureThreadDetail,
};
