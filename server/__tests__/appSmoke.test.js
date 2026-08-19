// Catches wiring mistakes that only surface when the whole app is assembled —
// a bad route import, or a rate-limiter keyGenerator that express-rate-limit
// rejects at construction (ERR_ERL_KEY_GEN_IPV6). None of these show up in the
// unit tests, because nothing else requires index.js.
const { installFakeDb } = require('./helpers/fakeDb');

installFakeDb({ $connect: async () => {} });

describe('app wiring', () => {
  it('builds the express app without throwing', () => {
    let app;
    expect(() => { app = require('../index'); }).not.toThrow();
    expect(typeof app).toBe('function'); // an express app is callable
  });

  it('registers the privacy routes', () => {
    const app = require('../index');
    const paths = [];
    const walk = (stack, prefix = '') => {
      for (const layer of stack || []) {
        if (layer.route) paths.push(prefix + layer.route.path);
        else if (layer.name === 'router' && layer.handle?.stack) {
          // Recover the mount path from the layer's regexp source.
          const src = layer.regexp?.source || '';
          const seg = src.replace('^\\/', '').replace('\\/?(?=\\/|$)', '').replace(/\\\//g, '/');
          walk(layer.handle.stack, `${prefix}/${seg}`);
        }
      }
    };
    walk(app._router?.stack);
    const joined = paths.join(' ');
    expect(joined).toContain('/export');
    expect(joined).toContain('/organization');
  });
});
