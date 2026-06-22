import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { organizationApi } from '@/apis/organizationApi';
import { reminderApi } from '@/apis/reminderApi';
import { invitationApi } from '@/apis/invitationApi';
import { userApi } from '@/apis/userApi';
import { useAuth } from '@/hooks/useAuth';
import { SkeletonPage, Banner, Card, Chip } from '@/components/ui/Ui';
import { formatDate, initials } from '@/utils/format';

const ROLE_CAPABILITIES = [
  ['Owner', 'Full control: members, billing, settings, and all compliance work'],
  ['Admin', 'Manage members and settings, and do all compliance work'],
  ['Member', 'Do compliance work (AI systems, assessments, documents) but not manage members'],
];

export default function Settings() {
  const qc = useQueryClient();
  const { user, can } = useAuth();
  const canManage = can('members.manage');

  const { data: org, isLoading } = useQuery({ queryKey: ['organization'], queryFn: organizationApi.current });
  const { data: members = [] } = useQuery({ queryKey: ['members'], queryFn: organizationApi.members });
  const { data: reminders = [] } = useQuery({ queryKey: ['reminders'], queryFn: reminderApi.list });
  const { data: invitations = [] } = useQuery({ queryKey: ['invitations'], queryFn: invitationApi.list, enabled: canManage });

  const [form, setForm] = useState({ name: '', industry: '', sizeBand: '' });
  const [saved, setSaved] = useState('');
  const [memberError, setMemberError] = useState('');
  const [invite, setInvite] = useState({ email: '', role: 'member' });
  const [inviteLink, setInviteLink] = useState('');

  useEffect(() => { if (org) setForm({ name: org.name || '', industry: org.industry || '', sizeBand: org.sizeBand || '' }); }, [org]);

  if (isLoading) return <SkeletonPage rows={2} />;

  const refreshMembers = () => {
    qc.invalidateQueries({ queryKey: ['members'] });
    qc.invalidateQueries({ queryKey: ['invitations'] });
  };

  const saveOrg = async (e) => {
    e.preventDefault();
    await organizationApi.update(form);
    qc.invalidateQueries({ queryKey: ['organization'] });
    setSaved('Organisation profile saved.');
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

  const roleOptions = user?.role === 'owner' ? ['owner', 'admin', 'member'] : ['admin', 'member'];

  return (
    <div data-testid="settings" style={{ maxWidth: 860 }}>
      <div className="page-head"><div><div className="eyebrow">Configuration</div><h1>Settings</h1></div></div>

      {saved && <Banner kind="success">{saved}</Banner>}

      <div className="stack">
        <Card title="Organisation profile" variant="ruled">
          <form onSubmit={saveOrg}>
            <div className="field">
              <label className="label" htmlFor="org-name">Organisation name</label>
              <input id="org-name" className="input" data-testid="org-name-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={!canManage} />
            </div>
            <div className="grid grid-2">
              <div className="field">
                <label className="label" htmlFor="org-industry">Industry</label>
                <input id="org-industry" className="input" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} disabled={!canManage} />
              </div>
              <div className="field">
                <label className="label" htmlFor="org-size">Company size</label>
                <select id="org-size" className="select" value={form.sizeBand} onChange={(e) => setForm({ ...form, sizeBand: e.target.value })} disabled={!canManage}>
                  <option value="">Select...</option>
                  <option value="1-9">1 to 9</option>
                  <option value="10-49">10 to 49</option>
                  <option value="50-249">50 to 249</option>
                  <option value="250+">250 or more</option>
                </select>
              </div>
            </div>
            {canManage && <button className="btn btn-primary" type="submit" data-testid="save-org">Save profile</button>}
          </form>
        </Card>

        {canManage && (
          <Card title="Invite a teammate" variant="ruled">
            {memberError && <Banner kind="error">{memberError}</Banner>}
            {inviteLink && (
              <Banner kind="success" data-testid="invite-link">
                Invitation sent. You can also share this link directly:{' '}
                <a href={inviteLink} onClick={(e) => e.preventDefault()}>{inviteLink}</a>
              </Banner>
            )}
            <form onSubmit={sendInvite} className="row" style={{ gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="field" style={{ flex: 1, minWidth: 220, marginBottom: 0 }}>
                <label className="label" htmlFor="invite-email">Email</label>
                <input id="invite-email" className="input" type="email" data-testid="invite-email" placeholder="teammate@company.de"
                  value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} required />
              </div>
              <div className="field" style={{ width: 150, marginBottom: 0 }}>
                <label className="label" htmlFor="invite-role">Role</label>
                <select id="invite-role" className="select" data-testid="invite-role" value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value })}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button className="btn btn-primary" type="submit" data-testid="send-invite">Send invitation</button>
            </form>

            {invitations.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div className="card-title-eyebrow">Pending invitations</div>
                <div className="stack" style={{ gap: 6 }}>
                  {invitations.map((i) => (
                    <div key={i.id} className="row-between" data-testid="pending-invite" style={{ padding: '6px 0', borderBottom: '1px solid var(--border-2)' }}>
                      <span className="small">{i.email} <Chip className="chip-grey">{i.role}</Chip></span>
                      <button className="btn btn-ghost btn-sm" onClick={() => revokeInvite(i.id)}>Revoke</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        <Card title="Team members" variant="ruled" bodyClass="card-body table-wrap">
          {!canManage && memberError && <Banner kind="error">{memberError}</Banner>}
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th>{canManage && <th></th>}</tr></thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} data-testid="member-row">
                  <td><div className="row" style={{ gap: 8 }}><span className="avatar" style={{ width: 26, height: 26, fontSize: 10 }}>{initials(m.fullName)}</span>{m.fullName}{m.id === user?.id && <span className="muted small">(you)</span>}</div></td>
                  <td className="muted small">{m.email}</td>
                  <td>
                    {canManage && m.id !== user?.id ? (
                      <select className="select" data-testid="member-role" style={{ width: 130, padding: '5px 8px' }}
                        value={m.role} onChange={(e) => changeRole(m.id, e.target.value)}>
                        {roleOptions.map((r) => <option key={r} value={r} style={{ textTransform: 'capitalize' }}>{r}</option>)}
                      </select>
                    ) : (
                      <span style={{ textTransform: 'capitalize' }}>{m.role.replace('_', ' ')}</span>
                    )}
                  </td>
                  <td>{m.emailVerifiedAt ? <Chip className="chip-green">Verified</Chip> : <Chip className="chip-amber">Pending</Chip>}</td>
                  {canManage && (
                    <td style={{ textAlign: 'right' }}>
                      {m.id !== user?.id && <button className="btn btn-danger btn-sm" data-testid="remove-member" onClick={() => removeMember(m.id)}>Remove</button>}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Roles and permissions" variant="ruled">
          <div className="stack" style={{ gap: 8 }}>
            {ROLE_CAPABILITIES.map(([role, desc]) => (
              <div key={role} className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
                <Chip className="chip-navy" dot={false}>{role}</Chip>
                <span className="small muted" style={{ flex: 1 }}>{desc}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Annual review reminders" variant="ruled" bodyClass="card-body table-wrap">
          {reminders.length === 0 ? (
            <p className="muted small">Reminders are created automatically when you classify an AI system.</p>
          ) : (
            <table className="table">
              <thead><tr><th>Assessment</th><th>Cadence</th><th>Next reminder</th><th>Active</th></tr></thead>
              <tbody>
                {reminders.map((r) => (
                  <tr key={r.id}>
                    <td>{r.assessment?.title}</td>
                    <td style={{ textTransform: 'capitalize' }}>{r.cadence}</td>
                    <td className="muted small">{formatDate(r.nextRunAt)}</td>
                    <td>{r.active ? <Chip className="chip-green">On</Chip> : <Chip className="chip-grey">Off</Chip>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Your account" variant="ruled">
          <p className="small"><strong>{user?.fullName}</strong> ({user?.email}) - role: {user?.role?.replace('_', ' ')}</p>
        </Card>
      </div>
    </div>
  );
}
