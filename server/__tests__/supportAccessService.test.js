const { installFakeDb } = require('./helpers/fakeDb');

const state = {};

function setup() {
  state.grants = [];
  state.audits = [];
  state.orgs = { 'org-1': { id: 'org-1', name: 'Acme GmbH' } };
  state.users = [
    { id: 'owner-1', organizationId: 'org-1', role: 'owner', email: 'owner@acme.test', fullName: 'Owner One' },
    { id: 'admin-1', organizationId: 'org-1', role: 'admin', email: 'admin@acme.test', fullName: 'Admin One' },
    { id: 'member-1', organizationId: 'org-1', role: 'member', email: 'member@acme.test', fullName: 'Member One' },
  ];
  state.nextId = 1;
}
setup();

installFakeDb({
  supportAccessGrant: {
    create: async ({ data }) => {
      const grant = { id: `grant-${state.nextId++}`, status: 'active', createdAt: new Date(), revokedAt: null, reportSentAt: null, ...data };
      state.grants.push(grant);
      return grant;
    },
    findFirst: async ({ where }) => state.grants.find((g) => g.id === where.id && g.organizationId === where.organizationId) || null,
    findMany: async ({ where }) => state.grants.filter((g) => g.status === where.status && g.expiresAt <= where.expiresAt.lte),
    update: async ({ where, data }) => {
      const grant = state.grants.find((g) => g.id === where.id);
      Object.assign(grant, data);
      return grant;
    },
  },
  organization: {
    findUnique: async ({ where }) => state.orgs[where.id] || null,
  },
  user: {
    findMany: async ({ where }) => state.users.filter((u) => u.organizationId === where.organizationId && where.role.in.includes(u.role)),
  },
  auditLog: {
    create: async (args) => { state.audits.push(args.data.action); return {}; },
  },
});

const emailService = require('../services/email/emailService');
const supportAccessService = require('../services/support/supportAccessService');

describe('supportAccessService', () => {
  beforeEach(setup);

  describe('createGrant', () => {
    it('creates an active grant defaulting to 72 hours', async () => {
      const before = Date.now();
      const grant = await supportAccessService.createGrant({
        req: {}, organizationId: 'org-1', grantedByUserId: 'owner-1', caseReference: 'Ticket #123',
      });
      expect(grant.status).toBe('active');
      expect(grant.caseReference).toBe('Ticket #123');
      const hours = (grant.expiresAt.getTime() - before) / (60 * 60 * 1000);
      expect(hours).toBeGreaterThan(71.9);
      expect(hours).toBeLessThan(72.1);
    });

    it('caps the requested duration at 14 days (336 hours)', async () => {
      const grant = await supportAccessService.createGrant({
        req: {}, organizationId: 'org-1', grantedByUserId: 'owner-1', caseReference: 'Very long case', durationHours: 10000,
      });
      const hours = (grant.expiresAt.getTime() - Date.now()) / (60 * 60 * 1000);
      expect(hours).toBeLessThanOrEqual(336.1);
    });

    it('records a support_access.granted audit entry', async () => {
      await supportAccessService.createGrant({ req: {}, organizationId: 'org-1', grantedByUserId: 'owner-1', caseReference: 'Ticket #1' });
      expect(state.audits).toContain('support_access.granted');
    });

    it('emails every owner and admin, but not members', async () => {
      const spy = vi.spyOn(emailService, 'sendSupportAccessGrantedEmail').mockResolvedValue({});
      await supportAccessService.createGrant({ req: {}, organizationId: 'org-1', grantedByUserId: 'owner-1', caseReference: 'Ticket #1' });
      const recipients = spy.mock.calls.map(([user]) => user.email);
      expect(recipients).toEqual(expect.arrayContaining(['owner@acme.test', 'admin@acme.test']));
      expect(recipients).not.toContain('member@acme.test');
      spy.mockRestore();
    });
  });

  describe('revokeGrant', () => {
    it('revokes an active grant and sends a report', async () => {
      const reportSpy = vi.spyOn(emailService, 'sendSupportAccessReportEmail').mockResolvedValue({});
      const grant = await supportAccessService.createGrant({ req: {}, organizationId: 'org-1', grantedByUserId: 'owner-1', caseReference: 'Ticket #1' });

      const revoked = await supportAccessService.revokeGrant({ req: {}, organizationId: 'org-1', grantId: grant.id, revokedByUserId: 'admin-1' });

      expect(revoked.status).toBe('revoked');
      expect(revoked.revokedByUserId).toBe('admin-1');
      expect(revoked.revokedAt).toBeInstanceOf(Date);
      expect(reportSpy).toHaveBeenCalled();
      expect(state.audits).toContain('support_access.revoked');
      reportSpy.mockRestore();
    });

    it('returns null for a grant that does not belong to the organization', async () => {
      const grant = await supportAccessService.createGrant({ req: {}, organizationId: 'org-1', grantedByUserId: 'owner-1', caseReference: 'Ticket #1' });
      const result = await supportAccessService.revokeGrant({ req: {}, organizationId: 'org-2', grantId: grant.id, revokedByUserId: 'owner-1' });
      expect(result).toBeNull();
    });

    it('is a no-op on an already-revoked grant (does not send a second report)', async () => {
      const reportSpy = vi.spyOn(emailService, 'sendSupportAccessReportEmail').mockResolvedValue({});
      const grant = await supportAccessService.createGrant({ req: {}, organizationId: 'org-1', grantedByUserId: 'owner-1', caseReference: 'Ticket #1' });
      await supportAccessService.revokeGrant({ req: {}, organizationId: 'org-1', grantId: grant.id, revokedByUserId: 'owner-1' });
      reportSpy.mockClear();

      const second = await supportAccessService.revokeGrant({ req: {}, organizationId: 'org-1', grantId: grant.id, revokedByUserId: 'owner-1' });
      expect(second.status).toBe('revoked');
      expect(reportSpy).not.toHaveBeenCalled();
      reportSpy.mockRestore();
    });
  });

  describe('expireDueGrants', () => {
    it('flips active grants past their expiry to expired and reports them', async () => {
      const reportSpy = vi.spyOn(emailService, 'sendSupportAccessReportEmail').mockResolvedValue({});
      const grant = await supportAccessService.createGrant({
        req: {}, organizationId: 'org-1', grantedByUserId: 'owner-1', caseReference: 'Ticket #1', durationHours: 1,
      });

      const future = new Date(grant.expiresAt.getTime() + 1000);
      const count = await supportAccessService.expireDueGrants(future);

      expect(count).toBe(1);
      expect(state.grants[0].status).toBe('expired');
      expect(reportSpy).toHaveBeenCalled();
      expect(state.audits).toContain('support_access.expired');
      reportSpy.mockRestore();
    });

    it('leaves grants that are not yet due alone', async () => {
      await supportAccessService.createGrant({
        req: {}, organizationId: 'org-1', grantedByUserId: 'owner-1', caseReference: 'Ticket #1', durationHours: 72,
      });
      const count = await supportAccessService.expireDueGrants(new Date());
      expect(count).toBe(0);
      expect(state.grants[0].status).toBe('active');
    });
  });
});
