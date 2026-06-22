/* Runs after the whole test suite. The admin e2e test creates a published
   framework in the shared catalog; this removes any such test-only ("orphan")
   frameworks and de-duplicates assessments so the live app stays clean. */
const { execSync } = require('child_process');
const path = require('path');

const SERVER_DIR = path.join(__dirname, '..', 'server');

module.exports = async () => {
  try {
    console.log('[global-teardown] cleaning test-created catalog frameworks...');
    execSync('node scripts/cleanupCatalog.js', { cwd: SERVER_DIR, stdio: 'inherit', env: process.env });
  } catch (err) {
    console.warn('[global-teardown] cleanup skipped:', err.message);
  }
};
