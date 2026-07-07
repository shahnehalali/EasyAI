const logger = require('../../utils/logger');

// Create a Spirex ticket (a "story") from a feedback submission. Runs AFTER the
// feedback email is sent, so a Spirex outage never loses the feedback (the email
// already went out). Gated on config: if the API key/org/project are not set it
// is a no-op and the feedback flow is unaffected.
//
// Auth: Bearer <SPIREX_API_KEY> + X-Org-Id header (the key impersonates one user;
// X-Org-Id picks the active org). Endpoint discovered from the Spirex API:
//   POST /api/stories  { projectId, title, description, type, priority } -> { story }

const BASE = (process.env.SPIREX_BASE_URL || 'https://spirex.rit.services').replace(/\/+$/, '');
const KEY = process.env.SPIREX_API_KEY || '';
const ORG = process.env.SPIREX_ORG_ID || '';
const PROJECT = process.env.SPIREX_PROJECT_ID || '';
const STORY_TYPE = process.env.SPIREX_STORY_TYPE || 'task'; // story | task | bug

function isEnabled() {
  return Boolean(KEY && ORG && PROJECT);
}

// Compose a readable ticket body from the feedback payload + submitter identity.
function buildDescription({ payload, submitter, receivedAt }) {
  const lines = [payload.description || ''];
  lines.push('', '---');
  if (submitter) lines.push(`Reported by: ${submitter.name} <${submitter.email}>`);
  if (payload.pageUrl) lines.push(`Page: ${payload.pageUrl}`);
  if (payload.viewport) lines.push(`Viewport: ${payload.viewport.width}x${payload.viewport.height}`);
  if (payload.userAgent) lines.push(`User agent: ${payload.userAgent}`);
  const when = receivedAt instanceof Date ? receivedAt.toISOString() : receivedAt;
  if (when) lines.push(`Received: ${when}`);
  lines.push('', 'Screenshot attached to this ticket.');
  return lines.join('\n');
}

// Upload the feedback screenshot (a base64 data URL) as an attachment on the
// story. Spirex: POST /api/attachments (multipart) with file + projectId +
// storyId. Uses global fetch/FormData/Blob (Node 18+).
const DATA_URL = /^data:(image\/(png|jpe?g|webp));base64,(.+)$/;
async function uploadScreenshot(storyId, screenshot) {
  const m = DATA_URL.exec(screenshot || '');
  if (!m) return null;
  const contentType = m[1];
  const ext = m[2] === 'jpeg' ? 'jpg' : m[2];
  const buffer = Buffer.from(m[3], 'base64');
  const form = new FormData();
  form.append('file', new Blob([buffer], { type: contentType }), `feedback-screenshot.${ext}`);
  form.append('projectId', PROJECT);
  if (storyId) form.append('storyId', storyId);
  const res = await fetch(`${BASE}/api/attachments`, {
    method: 'POST',
    // No content-type header: fetch sets multipart/form-data with the boundary.
    headers: { authorization: `Bearer ${KEY}`, 'x-org-id': ORG },
    body: form,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Spirex attachments ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json().catch(() => null);
}

// Create the story. Returns the created story ({ id, key, ... }) or throws.
async function createStory({ payload, submitter, receivedAt }) {
  if (!isEnabled()) return null;
  const res = await fetch(`${BASE}/api/stories`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${KEY}`,
      'x-org-id': ORG,
    },
    body: JSON.stringify({
      projectId: PROJECT,
      title: String(payload.title || 'Feedback').slice(0, 250),
      description: buildDescription({ payload, submitter, receivedAt }),
      type: STORY_TYPE,
      priority: 'medium',
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Spirex API ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = await res.json();
  const story = data.story || null;

  // Attach the screenshot to the story (best-effort: the email already has it,
  // so a failed upload should not fail the whole feedback flow).
  if (story && payload.screenshot) {
    try {
      await uploadScreenshot(story.id, payload.screenshot);
    } catch (err) {
      logger.warn(`spirex: screenshot attach failed for ${story.key || story.id}: ${err.message}`);
    }
  }
  return story;
}

module.exports = { isEnabled, createStory };
