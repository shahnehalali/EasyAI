const { installFakeDb } = require('./helpers/fakeDb');

// Mutable fixture the fake Prisma reads from; reset per test.
const state = {};

function makeTx() {
  return {
    organization: {
      create: async ({ data }) => {
        const org = { id: `org-${state.orgs.length + 1}`, ...data, createdAt: new Date(), updatedAt: new Date() };
        state.orgs.push(org);
        return org;
      },
    },
    user: {
      create: async ({ data }) => {
        const user = { id: `user-${state.users.length + 1}`, ...data, createdAt: new Date(), updatedAt: new Date() };
        state.users.push(user);
        return user;
      },
    },
    avvAcceptance: {
      create: async ({ data }) => {
        const rec = { id: `avv-${state.avvAcceptances.length + 1}`, ...data };
        state.avvAcceptances.push(rec);
        return rec;
      },
    },
  };
}

installFakeDb({
  user: {
    findUnique: async ({ where }) => state.users.find((u) => u.email === where.email) || null,
  },
  $transaction: async (cb) => cb(makeTx()),
  emailToken: { create: async ({ data }) => { state.emailTokens.push(data); return { id: 'token-1', ...data }; } },
  auditLog: { create: async (args) => { state.audits.push(args.data.action); return {}; } },
});

const { register } = require('../controllers/identity/authController');
const emailService = require('../services/email/emailService');

function setup() {
  state.orgs = [];
  state.users = [];
  state.avvAcceptances = [];
  state.emailTokens = [];
  state.audits = [];
}

function fakeRes() {
  return {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
}

function req(body) {
  return { body, headers: { 'user-agent': 'vitest-agent' }, ip: '203.0.113.5' };
}

const VALID_BODY = {
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  password: 'correct-horse-battery',
  organizationName: 'Acme GmbH',
  organizationLegalForm: 'GmbH',
  organizationAddress: 'Musterstrasse 1, 10115 Berlin',
  avvAccepted: true,
};

describe('register (AVV acceptance)', () => {
  beforeEach(setup);

  it('creates the organization, owner user, and AVV acceptance record together', async () => {
    const res = fakeRes();
    await register(req(VALID_BODY), res);

    expect(res.statusCode).toBe(201);
    expect(state.orgs).toHaveLength(1);
    expect(state.users).toHaveLength(1);
    expect(state.avvAcceptances).toHaveLength(1);

    const org = state.orgs[0];
    expect(org.name).toBe('Acme GmbH');
    expect(org.legalForm).toBe('GmbH');
    expect(org.address).toBe('Musterstrasse 1, 10115 Berlin');

    const user = state.users[0];
    expect(user.role).toBe('owner');
    expect(user.organizationId).toBe(org.id);

    const acceptance = state.avvAcceptances[0];
    expect(acceptance.organizationId).toBe(org.id);
    expect(acceptance.version).toBe('1.0');
    expect(acceptance.acceptedByUserId).toBe(user.id);
    expect(acceptance.acceptedByName).toBe('Jane Doe');
    expect(acceptance.acceptedByRole).toBe('owner');
    expect(acceptance.acceptedByEmail).toBe('jane@example.com');
    expect(acceptance.companyName).toBe('Acme GmbH');
    expect(acceptance.companyLegalForm).toBe('GmbH');
    expect(acceptance.companyAddress).toBe('Musterstrasse 1, 10115 Berlin');
    expect(acceptance.ip).toBe('203.0.113.5');
    expect(acceptance.userAgent).toBe('vitest-agent');
  });

  it('records both an auth.register and an avv.accepted audit entry', async () => {
    await register(req(VALID_BODY), fakeRes());
    expect(state.audits).toContain('auth.register');
    expect(state.audits).toContain('avv.accepted');
  });

  it('rejects registration when the AVV was not accepted, even if the field is merely falsy', async () => {
    await expect(register(req({ ...VALID_BODY, avvAccepted: false }), fakeRes()))
      .rejects.toMatchObject({ status: 422 });
    expect(state.orgs).toHaveLength(0);
    expect(state.users).toHaveLength(0);
  });

  it('rejects a duplicate email before creating anything', async () => {
    state.users.push({ id: 'existing-1', email: 'jane@example.com' });
    await expect(register(req(VALID_BODY), fakeRes())).rejects.toMatchObject({ status: 409 });
    expect(state.orgs).toHaveLength(0);
    expect(state.avvAcceptances).toHaveLength(0);
  });

  it('creates the organization without a legal form when none is given (optional field)', async () => {
    const { organizationLegalForm, ...body } = VALID_BODY;
    await register(req(body), fakeRes());
    expect(state.orgs[0].legalForm).toBeNull();
    expect(state.avvAcceptances[0].companyLegalForm).toBeNull();
  });

  it('does not fail registration when the AVV signed-copy email fails to send', async () => {
    const spy = vi.spyOn(emailService, 'sendAvvSignedEmail').mockRejectedValue(new Error('resend down'));
    const res = fakeRes();
    await register(req(VALID_BODY), res);

    expect(res.statusCode).toBe(201);
    expect(state.orgs).toHaveLength(1); // the acceptance record itself is unaffected by the email failing
    spy.mockRestore();
  });

  it('attempts to send the AVV signed-copy email with the accepted version attached', async () => {
    const spy = vi.spyOn(emailService, 'sendAvvSignedEmail').mockResolvedValue({ messageId: 'msg-1' });
    await register(req(VALID_BODY), fakeRes());

    expect(spy).toHaveBeenCalledTimes(1);
    const [emailedUser, emailedOrg, version, pdfBuffer] = spy.mock.calls[0];
    expect(emailedUser.email).toBe('jane@example.com');
    expect(emailedOrg.name).toBe('Acme GmbH');
    expect(version).toBe('1.0');
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.length).toBeGreaterThan(0);
    spy.mockRestore();
  });
});
