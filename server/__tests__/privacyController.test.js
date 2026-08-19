const bcrypt = require('bcryptjs');
const { installFakeDb } = require('./helpers/fakeDb');

// Mutable fixture the fake Prisma reads from; reset per test.
const state = {};
const noop = async () => ({ count: 0 });
const updateManyStore = (name) => ({
  updateMany: async (args) => { state.updated.push({ store: name, ...args }); return { count: 1 }; },
});

installFakeDb({
  user: {
    findUnique: async ({ where }) => (where.id === state.user.id ? state.user : null),
    count: async ({ where }) => (where.role === 'owner' ? state.ownerCount : state.memberCount),
    delete: async ({ where }) => { state.deletedUserId = where.id; return {}; },
    updateMany: noop,
  },
  organization: {
    delete: async ({ where }) => { state.deletedOrgId = where.id; return {}; },
    updateMany: async ({ where, data }) => { state.shreddedOrgId = where.id; state.shredData = data; return { count: 1 }; },
    findUnique: async () => ({ encKeyWrapped: null }),
    update: async () => ({}),
  },
  auditLog: { create: async (args) => { state.audits.push(args.data.action); return {}; }, ...updateManyStore('auditLog') },
  aiSystem: updateManyStore('aiSystem'),
  assessment: updateManyStore('assessment'),
  document: updateManyStore('document'),
  checklistItemResponse: updateManyStore('checklistItemResponse'),
});

const { deleteMe, deleteOrganization } = require('../controllers/identity/privacyController');

const PASSWORD = 'correct-horse-battery';
let hash;

beforeAll(async () => { hash = await bcrypt.hash(PASSWORD, 4); });

function fakeRes() {
  return {
    cleared: null,
    body: null,
    clearCookie(name) { this.cleared = name; },
    json(payload) { this.body = payload; return this; },
  };
}

function setup({ role = 'owner', ownerCount = 1, memberCount = 1, orgId = 'org-1' } = {}) {
  state.user = { id: 'user-1', organizationId: orgId, role, passwordHash: hash };
  state.ownerCount = ownerCount;
  state.memberCount = memberCount;
  state.updated = [];
  state.audits = [];
  state.deletedUserId = null;
  state.deletedOrgId = null;
  state.shreddedOrgId = null;
  state.shredData = null;
}

const req = (body = {}) => ({ user: { id: 'user-1' }, organizationId: state.user.organizationId, body });

describe('erasure — password confirmation', () => {
  beforeEach(() => setup());

  it('refuses without a password', async () => {
    await expect(deleteMe(req({}), fakeRes())).rejects.toMatchObject({ status: 422 });
    expect(state.deletedUserId).toBeNull();
  });

  it('refuses with the wrong password', async () => {
    await expect(deleteMe(req({ password: 'wrong' }), fakeRes())).rejects.toMatchObject({ status: 401 });
    expect(state.deletedUserId).toBeNull();
    expect(state.deletedOrgId).toBeNull();
  });
});

describe('erasure — account deletion', () => {
  it('blocks the last owner while other members remain', async () => {
    setup({ role: 'owner', ownerCount: 1, memberCount: 3 });
    await expect(deleteMe(req({ password: PASSWORD }), fakeRes())).rejects.toMatchObject({ status: 422 });
    expect(state.deletedUserId).toBeNull();
    expect(state.deletedOrgId).toBeNull();
  });

  it('deletes a non-last-owner member and detaches their identifiers', async () => {
    setup({ role: 'member', ownerCount: 2, memberCount: 3 });
    const res = fakeRes();
    await deleteMe(req({ password: PASSWORD }), res);

    expect(state.deletedUserId).toBe('user-1');
    expect(state.deletedOrgId).toBeNull(); // org survives for the other members
    // Every non-FK reference to the user is nulled, so no identifier survives.
    expect(state.updated.map((u) => u.store).sort()).toEqual(
      ['aiSystem', 'assessment', 'auditLog', 'checklistItemResponse', 'document'],
    );
    for (const u of state.updated) expect(Object.values(u.data)[0]).toBeNull();
    expect(res.cleared).toBeTruthy();
  });

  it('deletes the whole tenant when the account is its only member', async () => {
    setup({ role: 'owner', ownerCount: 1, memberCount: 1 });
    const res = fakeRes();
    await deleteMe(req({ password: PASSWORD }), res);

    expect(state.deletedOrgId).toBe('org-1');
    // Key shredded BEFORE the delete, so pre-existing backups stay unreadable.
    expect(state.shreddedOrgId).toBe('org-1');
    expect(state.shredData).toEqual({ encKeyWrapped: null });
  });
});

describe('erasure — organisation deletion', () => {
  it('requires owner role', async () => {
    setup({ role: 'member', ownerCount: 2, memberCount: 3 });
    await expect(deleteOrganization(req({ password: PASSWORD }), fakeRes())).rejects.toMatchObject({ status: 403 });
    expect(state.deletedOrgId).toBeNull();
    expect(state.shreddedOrgId).toBeNull();
  });

  it('shreds the key and deletes the organisation for an owner', async () => {
    setup({ role: 'owner', ownerCount: 2, memberCount: 4 });
    const res = fakeRes();
    await deleteOrganization(req({ password: PASSWORD }), res);

    expect(state.shreddedOrgId).toBe('org-1');
    expect(state.deletedOrgId).toBe('org-1');
    expect(res.body.message).toMatch(/deleted/i);
  });
});
