const { installFakeDb } = require('./helpers/fakeDb');

// Capture the delete filters so we can assert on WHAT would be removed without
// needing a database. Each store records the `where` it was called with.
const calls = {};
const store = (name) => ({
  deleteMany: async ({ where }) => { calls[name] = where; return { count: 1 }; },
});

installFakeDb({
  auditLog: store('auditLog'),
  emailToken: store('emailToken'),
  invitation: store('invitation'),
  notification: store('notification'),
});

const config = require('../config');
const { runRetentionSweep } = require('../services/retention/retentionService');

const NOW = new Date('2027-01-01T00:00:00.000Z');
const daysBefore = (n) => new Date(NOW.getTime() - n * 86400000);

beforeEach(() => {
  for (const k of Object.keys(calls)) delete calls[k];
});

describe('retention sweep', () => {
  it('reports what it removed from each store', async () => {
    const counts = await runRetentionSweep(NOW);
    expect(counts).toEqual({ auditLogs: 1, emailTokens: 1, invitations: 1, notifications: 1 });
  });

  it('prunes audit entries older than the configured window', async () => {
    await runRetentionSweep(NOW);
    expect(calls.auditLog.createdAt.lt).toEqual(daysBefore(config.retention.auditLogDays));
  });

  it('only removes email tokens that can no longer be used', async () => {
    await runRetentionSweep(NOW);
    const cutoff = daysBefore(config.retention.emailTokenDays);
    // Either already consumed, or past expiry — never a live pending token.
    expect(calls.emailToken.OR).toEqual([
      { consumedAt: { not: null, lt: cutoff } },
      { expiresAt: { lt: cutoff } },
    ]);
  });

  it('keeps pending invitations and only clears settled ones', async () => {
    await runRetentionSweep(NOW);
    expect(calls.invitation.status.in).toEqual(['accepted', 'revoked']);
    expect(calls.invitation.status.in).not.toContain('pending');
    expect(calls.invitation.createdAt.lt).toEqual(daysBefore(config.retention.invitationDays));
  });

  it('keeps unread notifications regardless of age', async () => {
    await runRetentionSweep(NOW);
    expect(calls.notification.readAt).toEqual({ not: null });
    expect(calls.notification.createdAt.lt).toEqual(daysBefore(config.retention.notificationDays));
  });

  it('never touches the customer compliance record', async () => {
    await runRetentionSweep(NOW);
    // Only the four transient stores are swept. Assessments, responses, AI
    // systems and documents are the tenant's own records and are removed only
    // by an explicit erasure request.
    expect(Object.keys(calls).sort()).toEqual(['auditLog', 'emailToken', 'invitation', 'notification']);
  });
});
