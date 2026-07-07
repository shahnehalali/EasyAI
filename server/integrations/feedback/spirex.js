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
  lines.push('', 'A screenshot is attached to the feedback email for this report.');
  return lines.join('\n');
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
  return data.story || null;
}

module.exports = { isEnabled, createStory };
