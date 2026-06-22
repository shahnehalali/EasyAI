/* Ensures the database schema and seed data exist before the test run.
   Requires PostgreSQL to be reachable via the server's DATABASE_URL. */
const { execSync } = require('child_process');
const path = require('path');

const SERVER_DIR = path.join(__dirname, '..', 'server');

module.exports = async () => {
  const opts = { cwd: SERVER_DIR, stdio: 'inherit', env: process.env };
  try {
    console.log('[global-setup] applying schema (prisma db push)...');
    execSync('npx prisma db push --skip-generate', opts);
    console.log('[global-setup] seeding catalog and demo users...');
    execSync('node prisma/seed.js', opts);
  } catch (err) {
    console.error('\n[global-setup] FAILED. Is PostgreSQL running?');
    console.error('Start it with: docker compose up -d   (from the project root)\n');
    throw err;
  }
};
