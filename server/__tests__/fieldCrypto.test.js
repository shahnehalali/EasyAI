const { installFakeDb } = require('./helpers/fakeDb');

// In-memory stand-in for the Organization table: fieldCrypto only ever reads
// and writes `encKeyWrapped`. Installed before fieldCrypto is required.
const orgs = new Map();
installFakeDb({
  organization: {
    findUnique: async ({ where }) => (orgs.has(where.id) ? { encKeyWrapped: orgs.get(where.id) } : null),
    update: async ({ where, data }) => { orgs.set(where.id, data.encKeyWrapped); return {}; },
    updateMany: async ({ where, data }) => { if (orgs.has(where.id)) orgs.set(where.id, data.encKeyWrapped); return { count: 1 }; },
  },
});

const config = require('../config');
const fc = require('../services/crypto/fieldCrypto');

// A valid base64 32-byte master key.
const MASTER = Buffer.alloc(32, 7).toString('base64');

let n = 0;
const newOrg = () => { const id = `org-${++n}`; orgs.set(id, null); return id; };

beforeEach(() => { config.dataEncKey = MASTER; });

describe('field encryption', () => {
  it('round-trips a string and does not store the plaintext', async () => {
    const org = newOrg();
    const secret = 'Processes health data of named patients';
    const sealed = await fc.encryptField(org, secret);

    expect(sealed).not.toBe(secret);
    expect(sealed.startsWith('enc:1:')).toBe(true);
    expect(sealed).not.toContain('patients');
    expect(await fc.decryptField(org, sealed)).toBe(secret);
  });

  it('round-trips a JSON value', async () => {
    const org = newOrg();
    const profile = { lawfulBasis: 'consent', categories: ['health', 'biometric'] };
    const sealed = await fc.encryptJson(org, profile);

    expect(typeof sealed).toBe('string');
    expect(sealed).not.toContain('biometric');
    expect(await fc.decryptJson(org, sealed)).toEqual(profile);
  });

  it('round-trips a file buffer', async () => {
    const org = newOrg();
    const file = Buffer.from('%PDF-1.7 confidential DPIA contents');
    const { data, encrypted } = await fc.encryptBuffer(org, file);

    expect(encrypted).toBe(true);
    expect(data.includes(Buffer.from('confidential'))).toBe(false);
    expect((await fc.decryptBuffer(org, data)).equals(file)).toBe(true);
  });

  it('gives each organisation a different key, so one tenant cannot read another', async () => {
    const a = newOrg();
    const b = newOrg();
    const sealed = await fc.encryptField(a, 'tenant A secret');

    // Wrong key -> authentication tag fails -> the value comes back untouched
    // rather than leaking anything decodable.
    expect(await fc.decryptField(b, sealed)).not.toBe('tenant A secret');
  });

  it('produces different ciphertext for the same plaintext (random IV)', async () => {
    const org = newOrg();
    const a = await fc.encryptField(org, 'same');
    const b = await fc.encryptField(org, 'same');
    expect(a).not.toBe(b);
    expect(await fc.decryptField(org, a)).toBe('same');
    expect(await fc.decryptField(org, b)).toBe('same');
  });

  it('leaves empty and null values alone', async () => {
    const org = newOrg();
    expect(await fc.encryptField(org, '')).toBe('');
    expect(await fc.encryptField(org, null)).toBeNull();
    expect(await fc.encryptField(org, undefined)).toBeUndefined();
  });

  it('reads legacy plaintext rows unchanged', async () => {
    const org = newOrg();
    expect(await fc.decryptField(org, 'written before encryption existed')).toBe('written before encryption existed');
  });

  it('passes through when no master key is configured (dev mode)', async () => {
    config.dataEncKey = '';
    const org = newOrg();
    expect(await fc.encryptField(org, 'plain in dev')).toBe('plain in dev');
  });

  it('rejects a master key that is not 32 bytes', async () => {
    config.dataEncKey = Buffer.alloc(16, 1).toString('base64');
    await expect(fc.encryptField(newOrg(), 'x')).rejects.toThrow(/32 bytes/);
  });
});

describe('crypto-shredding (Art. 17)', () => {
  it('makes the organisation ciphertext permanently unreadable', async () => {
    const org = newOrg();
    const sealed = await fc.encryptField(org, 'erase me');
    expect(await fc.decryptField(org, sealed)).toBe('erase me');

    await fc.shredOrgKey(org);

    // Key gone from the row and from the in-process cache: a backup restored
    // from before the request still cannot yield the plaintext.
    expect(orgs.get(org)).toBeNull();
    expect(await fc.decryptField(org, sealed)).not.toBe('erase me');
  });
});
