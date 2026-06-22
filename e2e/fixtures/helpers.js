// Shared e2e helpers. Uses page.request so any session cookie set by the API
// is stored in the browser context and sent on later page navigations.

let counter = 0;
function uniqueEmail(prefix = 'user') {
  counter += 1;
  return `${prefix}_${Date.now()}_${counter}@example.com`;
}

// Register + verify a brand new owner, leaving the browser context signed in.
async function signUpAndSignIn(page, { fullName = 'Test User', organizationName = 'Test GmbH' } = {}) {
  const email = uniqueEmail();
  const password = 'Test12345!';
  await page.request.post('/api/auth/register', { data: { fullName, email, password, organizationName } });
  const tokRes = await page.request.post('/api/auth/dev/verification-token', { data: { email } });
  const { token } = await tokRes.json();
  await page.request.post('/api/auth/verify-email', { data: { token } });
  return { email, password };
}

// Sign in as the seeded platform admin (admin@aicompliance.local).
async function signInAsAdmin(page) {
  await page.request.post('/api/auth/login', { data: { email: 'admin@aicompliance.local', password: 'Admin12345!' } });
}

// Create + classify an AI system via API, returning its id. answers is a map of question code -> bool.
async function createClassifiedSystem(page, { name = 'Test AI', answers = {} } = {}) {
  const createRes = await page.request.post('/api/ai-systems', { data: { name, purpose: 'testing' } });
  const { aiSystem } = await createRes.json();
  await page.request.post(`/api/ai-systems/${aiSystem.id}/classify`, { data: { answers } });
  return aiSystem.id;
}

module.exports = { uniqueEmail, signUpAndSignIn, signInAsAdmin, createClassifiedSystem };
