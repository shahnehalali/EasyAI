// Swap the shared Prisma client for an in-memory fake.
//
// The server is CommonJS and vitest's vi.mock only intercepts ESM imports, so
// it never reaches a `require('../../db/db')` inside a controller or service.
// Seeding require.cache before the module under test is first required does
// work, and keeps the production code free of test-only injection seams.
//
// Must be called BEFORE requiring whatever pulls in db/db.
function installFakeDb(prisma) {
  const dbPath = require.resolve('../../db/db');
  require.cache[dbPath] = {
    id: dbPath,
    filename: dbPath,
    loaded: true,
    exports: { prisma, connectDb: async () => {} },
  };
  return prisma;
}

module.exports = { installFakeDb };
