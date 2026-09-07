import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { organizationApi } from '@/apis/organizationApi';
import { supportAccessApi } from '@/apis/supportAccessApi';
import { reminderApi } from '@/apis/reminderApi';
import { invitationApi } from '@/apis/invitationApi';
import { userApi } from '@/apis/userApi';
import { useAuth } from '@/hooks/useAuth';
import { useT } from '@/hooks/useT';
import { SkeletonPage, Banner, Card, Chip } from '@/components/ui/Ui';
import Pagination, { usePagination } from '@/components/ui/Pagination';
import { formatDate, initials } from '@/utils/format';
import MfaCard from '@/components/settings/MfaCard';
import PrivacyCard from '@/components/settings/PrivacyCard';

export default function Settings() {
  const qc = useQueryClient();
  const { t } = useT();
  const { user, can } = useAuth();
  const canManage = can('members.manage');
  const roleLabel = (r) => t(`set.r.${r}`) === `set.r.${r}` ? (r || '').replace('_', ' ') : t(`set.r.${r}`);
  const ROLE_CAPABILITIES = [
    ['owner', t('set.capOwner')],
    ['admin', t('set.capAdmin')],
    ['member', t('set.capMember')],
    ['viewer', t('set.capViewer')],
  ];

  const { data: org, isLoading } = useQuery({ queryKey: ['organization'], queryFn: organizationApi.current });
  const { data: members = [] } = useQuery({ queryKey: ['members'], queryFn: organizationApi.members });
  const { data: reminders = [] } = useQuery({ queryKey: ['reminders'], queryFn: reminderApi.list });
  const { data: invitations = [] } = useQuery({ queryKey: ['invitations'], queryFn: invitationApi.list, enabled: canManage });
  const { data: avv } = useQuery({ queryKey: ['avv'], queryFn: organizationApi.avv, retry: false });
  const { data: grants = [] } = useQuery({ queryKey: ['support-access'], queryFn: supportAccessApi.list, enabled: canManage });

  const [form, setForm] = useState({ name: '', legalForm: '', address: '', industry: '', sizeBand: '' });
  const [saved, setSaved] = useState('');
  const [memberError, setMemberError] = useState('');
  const [invite, setInvite] = useState({ email: '', role: 'member' });
  const [inviteLink, setInviteLink] = useState('');
  const [grantForm, setGrantForm] = useState({ caseReference: '', durationHours: 72 });
  const [grantError, setGrantError] = useState('');

  useEffect(() => {
    if (org) {
      setForm({
        name: org.name || '', legalForm: org.legalForm || '', address: org.address || '',
        industry: org.industry || '', sizeBand: org.sizeBand || '',
      });
    }
  }, [org]);

  const membersPage = usePagination(members, 8);
  const remindersPage = usePagination(reminders, 8);

  if (isLoading) return <SkeletonPage rows={2} />;

  const refreshMembers = () => {
    qc.invalidateQueries({ queryKey: ['members'] });
    qc.invalidateQueries({ queryKey: ['invitations'] });
  };

  const saveOrg = async (e) => {
    e.preventDefault();
    await organizationApi.update(form);
    qc.invalidateQueries({ queryKey: ['organization'] });
    setSaved(t('set.savedMsg'));
    setTimeout(() => setSaved(''), 2000);
  };

  const sendInvite = async (e) => {
    e.preventDefault();
    setMemberError(''); setInviteLink('');
    try {
      const res = await invitationApi.create(invite);
      setInviteLink(res.inviteUrl);
      setInvite({ email: '', role: 'member' });
      refreshMembers();
    } catch (err) { setMemberError(err.message); }
  };

  const changeRole = async (id, role) => {
    setMemberError('');
    try { await userApi.updateRole(id, role); refreshMembers(); }
    catch (err) { setMemberError(err.message); }
  };

  const removeMember = async (id) => {
    setMemberError('');
    try { await userApi.remove(id); refreshMembers(); }
    catch (err) { setMemberError(err.message); }
  };

  const revokeInvite = async (id) => { await invitationApi.revoke(id); refreshMembers(); };

  const toggleNonEuSupport = async (checked) => {
    await organizationApi.update({ allowNonEuSupportAccess: checked });
    qc.invalidateQueries({ queryKey: ['organization'] });
  };

  const submitGrant = async (e) => {
    e.preventDefault();
    setGrantError('');
    try {
      await supportAccessApi.create(grantForm);
      setGrantForm({ caseReference: '', durationHours: 72 });
      qc.invalidateQueries({ queryKey: ['support-access'] });
    } catch (err) { setGrantError(err.message); }
  };

  const revokeGrant = async (id) => {
    await supportAccessApi.revoke(id);
    qc.invalidateQueries({ queryKey: ['support-access'] });
  };

  const roleOptions = user?.role === 'owner' ? ['owner', 'admin', 'member', 'viewer'] : ['admin', 'member', 'viewer'];

  return (
    <div data-testid="settings" style={{ maxWidth: 860 }}>
      <div className="page-head"><div><div className="eyebrow">{t('set.eyebrow')}</div><h1>{t('set.title')}</h1></div></div>

      {saved && <Banner kind="success">{saved}</Banner>}

      <div className="stack">
        <Card title={t('set.orgProfile')} variant="ruled">
          <form onSubmit={saveOrg}>
            <div className="field">
              <label className="label" htmlFor="org-name">{t('set.orgName')}</label>
              <input id="org-name" className="input" data-testid="org-name-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={!canManage} />
            </div>
            <div className="grid grid-2">
              <div className="field">
                <label className="label" htmlFor="org-legal-form">{t('set.legalForm')}</label>
                <input id="org-legal-form" className="input" data-testid="org-legal-form-input" value={form.legalForm} onChange={(e) => setForm({ ...form, legalForm: e.target.value })} disabled={!canManage} />
              </div>
              <div className="field">
                <label className="label" htmlFor="org-address">{t('set.address')}</label>
                <input id="org-address" className="input" data-testid="org-address-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} disabled={!canManage} />
              </div>
            </div>
            <div className="grid grid-2">
              <div className="field">
                <label className="label" htmlFor="org-industry">{t('set.industry')}</label>
                <input id="org-industry" className="input" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} disabled={!canManage} />
              </div>
              <div className="field">
                <label className="label" htmlFor="org-size">{t('set.companySize')}</label>
                <select id="org-size" className="select" value={form.sizeBand} onChange={(e) => setForm({ ...form, sizeBand: e.target.value })} disabled={!canManage}>
                  <option value="">{t('set.sizeSelect')}</option>
                  <option value="1-9">{t('set.size1')}</option>
                  <option value="10-49">{t('set.size2')}</option>
                  <option value="50-249">{t('set.size3')}</option>
                  <option value="250+">{t('set.size4')}</option>
                </select>
              </div>
            </div>
            {canManage && <button className="btn btn-primary" type="submit" data-testid="save-org">{t('set.saveProfile')}</button>}
          </form>
        </Card>

        <Card title={t('set.avvTitle')} variant="ruled" data-testid="avv-card">
          {avv ? (
            <p className="small">
              {t('set.avvVersion')} {avv.version} · {t('set.avvAcceptedBy')} {avv.acceptedByName} ({roleLabel(avv.acceptedByRole)}) · {t('set.avvAcceptedOn')} {formatDate(avv.acceptedAt)}
            </p>
          ) : (
            <p className="muted small" data-testid="avv-not-found">{t('set.avvNotFound')}</p>
          )}
          <div className="row" style={{ gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
            {avv && (
              <a className="btn btn-outline btn-sm" href={organizationApi.avvPdfUrl()} data-testid="avv-download">
                {t('set.avvDownload')}
              </a>
            )}
            <a className="btn btn-ghost btn-sm" href="/avv" target="_blank" rel="noreferrer">{t('set.avvReadTemplate')}</a>
          </div>
        </Card>

        {canManage && (
          <Card title={t('set.supportAccess')} variant="ruled" data-testid="support-access-card">
            <label className="row" style={{ gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
              <input
                type="checkbox"
                data-testid="allow-non-eu-support"
                checked={Boolean(org?.allowNonEuSupportAccess)}
                onChange={(e) => toggleNonEuSupport(e.target.checked)}
                style={{ marginTop: 3 }}
              />
              <span>
                <strong className="small">{t('set.allowNonEuSupport')}</strong>
                <div className="muted small">{t('set.allowNonEuSupportHint')}</div>
              </span>
            </label>

            {grantError && <Banner kind="error">{grantError}</Banner>}
            <form onSubmit={submitGrant} className="row" style={{ gap: 10, alignItems: 'flex-end', flexWrap: 'wrap', marginTop: 16 }}>
              <div className="field" style={{ flex: 1, minWidth: 220, marginBottom: 0 }}>
                <label className="label" htmlFor="grant-case">{t('set.caseReference')}</label>
                <input
                  id="grant-case"
                  className="input"
                  data-testid="grant-case-reference"
                  placeholder={t('set.caseReferencePlaceholder')}
                  value={grantForm.caseReference}
                  onChange={(e) => setGrantForm({ ...grantForm, caseReference: e.target.value })}
                  required
                />
              </div>
              <div className="field" style={{ width: 190, marginBottom: 0 }}>
                <label className="label" htmlFor="grant-duration">{t('set.duration')}</label>
                <select
                  id="grant-duration"
                  className="select"
                  data-testid="grant-duration"
                  value={grantForm.durationHours}
                  onChange={(e) => setGrantForm({ ...grantForm, durationHours: Number(e.target.value) })}
                >
                  <option value={72}>{t('set.duration72h')}</option>
                  <option value={168}>{t('set.duration7d')}</option>
                  <option value={336}>{t('set.duration14d')}</option>
                </select>
              </div>
              <button className="btn btn-primary" type="submit" data-testid="grant-submit">{t('set.grant')}</button>
            </form>

            {grants.length === 0 ? (
              <p className="muted small" style={{ marginTop: 16 }}>{t('set.noActiveGrants')}</p>
            ) : (
              <table className="table" style={{ marginTop: 16 }}>
                <thead>
                  <tr>
                    <th>{t('set.colCase')}</th><th>{t('set.colStatusGrant')}</th>
                    <th>{t('set.colGrantedBy')}</th><th>{t('set.colWindow')}</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {grants.map((g) => (
                    <tr key={g.id} data-testid="grant-row">
                      <td>{g.caseReference}</td>
                      <td>
                        {g.status === 'active' && <Chip className="chip-green">{t('set.grantStatusActive')}</Chip>}
                        {g.status === 'revoked' && <Chip className="chip-grey">{t('set.grantStatusRevoked')}</Chip>}
                        {g.status === 'expired' && <Chip className="chip-amber">{t('set.grantStatusExpired')}</Chip>}
                      </td>
                      <td className="muted small">{g.grantedBy?.fullName}</td>
                      <td className="muted small">{formatDate(g.createdAt)} - {formatDate(g.expiresAt)}</td>
                      <td style={{ textAlign: 'right' }}>
                        {g.status === 'active' && (
                          <button className="btn btn-danger btn-sm" data-testid="grant-revoke" onClick={() => revokeGrant(g.id)}>
                            {t('set.revokeGrant')}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        )}

        {canManage && (
          <Card title={t('set.invite')} variant="ruled">
            {memberError && <Banner kind="error">{memberError}</Banner>}
            {inviteLink && (
              <Banner kind="success" data-testid="invite-link">
                {t('set.inviteSent')}{' '}
                <a href={inviteLink} onClick={(e) => e.preventDefault()}>{inviteLink}</a>
              </Banner>
            )}
            <form onSubmit={sendInvite} className="row" style={{ gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="field" style={{ flex: 1, minWidth: 220, marginBottom: 0 }}>
                <label className="label" htmlFor="invite-email">{t('set.email')}</label>
                <input id="invite-email" className="input" type="email" data-testid="invite-email" placeholder="teammate@company.de"
                  value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} required />
              </div>
              <div className="field" style={{ width: 150, marginBottom: 0 }}>
                <label className="label" htmlFor="invite-role">{t('set.role')}</label>
                <select id="invite-role" className="select" data-testid="invite-role" value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value })}>
                  <option value="member">{t('set.r.member')}</option>
                  <option value="admin">{t('set.r.admin')}</option>
                  <option value="viewer">{t('set.r.viewer')}</option>
                </select>
              </div>
              <button className="btn btn-primary" type="submit" data-testid="send-invite">{t('set.sendInvite')}</button>
            </form>

            {invitations.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div className="card-title-eyebrow">{t('set.pendingInvites')}</div>
                <div className="stack" style={{ gap: 6 }}>
                  {invitations.map((i) => (
                    <div key={i.id} className="row-between" data-testid="pending-invite" style={{ padding: '6px 0', borderBottom: '1px solid var(--border-2)' }}>
                      <span className="small">{i.email} <Chip className="chip-grey">{roleLabel(i.role)}</Chip></span>
                      <button className="btn btn-ghost btn-sm" onClick={() => revokeInvite(i.id)}>{t('set.revoke')}</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        <Card title={t('set.teamMembers')} variant="ruled" bodyClass="card-body table-wrap">
          {!canManage && memberError && <Banner kind="error">{memberError}</Banner>}
          <table className="table">
            <thead><tr><th>{t('set.colName')}</th><th>{t('set.email')}</th><th>{t('set.role')}</th><th>{t('set.colStatus')}</th>{canManage && <th></th>}</tr></thead>
            <tbody>
              {membersPage.pageItems.map((m) => (
                <tr key={m.id} data-testid="member-row">
                  <td><div className="row" style={{ gap: 8 }}><span className="avatar" style={{ width: 26, height: 26, fontSize: 10 }}>{initials(m.fullName)}</span>{m.fullName}{m.id === user?.id && <span className="muted small">{t('set.you')}</span>}</div></td>
                  <td className="muted small">{m.email}</td>
                  <td>
                    {canManage && m.id !== user?.id ? (
                      <select className="select" data-testid="member-role" style={{ width: 130, padding: '5px 8px' }}
                        value={m.role} onChange={(e) => changeRole(m.id, e.target.value)}>
                        {roleOptions.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
                      </select>
                    ) : (
                      <span>{roleLabel(m.role)}</span>
                    )}
                  </td>
                  <td>{m.emailVerifiedAt ? <Chip className="chip-green">{t('set.verified')}</Chip> : <Chip className="chip-amber">{t('set.pending')}</Chip>}</td>
                  {canManage && (
                    <td style={{ textAlign: 'right' }}>
                      {m.id !== user?.id && <button className="btn btn-danger btn-sm" data-testid="remove-member" onClick={() => removeMember(m.id)}>{t('set.remove')}</button>}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={membersPage.page} pageCount={membersPage.pageCount} onChange={membersPage.setPage} total={membersPage.total} pageSize={membersPage.pageSize} />
        </Card>

        <Card title={t('set.rolesPerms')} variant="ruled">
          <div className="stack" style={{ gap: 8 }}>
            {ROLE_CAPABILITIES.map(([role, desc]) => (
              <div key={role} className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
                <Chip className="chip-navy" dot={false}>{roleLabel(role)}</Chip>
                <span className="small muted" style={{ flex: 1 }}>{desc}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title={t('set.reminders')} variant="ruled" bodyClass="card-body table-wrap">
          {reminders.length === 0 ? (
            <p className="muted small">{t('set.remindersEmpty')}</p>
          ) : (
            <table className="table">
              <thead><tr><th>{t('set.colAssessment')}</th><th>{t('set.cadence')}</th><th>{t('set.nextReminder')}</th><th>{t('set.active')}</th></tr></thead>
              <tbody>
                {remindersPage.pageItems.map((r) => (
                  <tr key={r.id}>
                    <td>{r.assessment?.title}</td>
                    <td>{r.cadence === 'annual' ? t('set.cadenceAnnual') : r.cadence}</td>
                    <td className="muted small">{formatDate(r.nextRunAt)}</td>
                    <td>{r.active ? <Chip className="chip-green">{t('set.on')}</Chip> : <Chip className="chip-grey">{t('set.off')}</Chip>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Pagination page={remindersPage.page} pageCount={remindersPage.pageCount} onChange={remindersPage.setPage} total={remindersPage.total} pageSize={remindersPage.pageSize} />
        </Card>

        <MfaCard />

        <Card title={t('set.account')} variant="ruled">
          <p className="small"><strong>{user?.fullName}</strong> ({user?.email}) - {t('set.roleLabel')}: {roleLabel(user?.role)}</p>
        </Card>

        <PrivacyCard />
      </div>
    </div>
  );
}
