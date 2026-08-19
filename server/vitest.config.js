import { defineConfig } from 'vitest/config';

// The server is CommonJS, so the mocks API cannot be imported from 'vitest'
// inside a test file (vi.mock hoisting needs ESM). `globals: true` exposes
// describe/it/expect/vi directly instead.
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['__tests__/**/*.test.js'],
  },
});
