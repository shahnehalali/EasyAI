import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '@/apis/adminApi';
import { useAuth } from '@/hooks/useAuth';
import { Banner, Card, EmptyState } from '@/components/ui/Ui';

export default function Admin() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const { data: counts } = useQuery({ queryKey: ['admin-overview'], queryFn: adminApi.overview, enabled: isAdmin });
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: { tier: 2, jurisdiction: 'DE', status: 'published' } });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!isAdmin) {
    return <Card><EmptyState icon="⛭" title="Administrators only">This area is for platform administrators who author the law catalog.</EmptyState></Card>;
  }

  const onSubmit = async (data) => {
    setError(''); setResult(null);
    try {
      const framework = await adminApi.createFramework({ ...data, tier: Number(data.tier) });
      // Add a starter checklist template with two items, so it works end to end immediately.
      await adminApi.createTemplate(framework.key, {
        key: `${framework.key}_baseline`,
        name: `${framework.shortName || framework.name} Baseline`,
        description: 'Starter checklist created with the framework. Edit items as needed.',
        appliesToRiskCategory: null,
        status: 'published',
        items: [
          { title: 'Confirm this law applies to your organisation', inputType: 'longtext', isRequired: true, sortOrder: 0,
            guidanceText: 'Document whether and how this law applies to your AI use.' },
          { title: 'Record your compliance measures', inputType: 'longtext', isRequired: false, sortOrder: 1,
            guidanceText: 'Describe the steps you take to comply with this law.' },
        ],
      });
      setResult(framework);
      qc.invalidateQueries({ queryKey: ['admin-overview'] });
      qc.invalidateQueries({ queryKey: ['frameworks'] });
      qc.invalidateQueries({ queryKey: ['laws'] });
      reset({ tier: 2, jurisdiction: 'DE', status: 'published' });
    } catch (err) { setError(err.message); }
  };

  return (
    <div data-testid="admin" style={{ maxWidth: 820 }}>
      <div className="page-head">
        <div>
          <div className="eyebrow">Expandable by design</div>
          <h1>Catalog administration</h1>
          <p className="sub">Add a new area of law as data. No code change is needed. New frameworks appear in the Law Explorer and Frameworks immediately, and can be worked as checklists.</p>
        </div>
      </div>

      {counts && (
        <div className="grid grid-4" style={{ marginBottom: 18 }}>
          {[['Frameworks', counts.frameworks], ['Requirements', counts.requirements], ['Templates', counts.templates], ['Items', counts.items]].map(([l, n]) => (
            <div key={l} className="card stat"><div className="num">{n}</div><div className="label">{l}</div></div>
          ))}
        </div>
      )}

      {error && <Banner kind="error">{error}</Banner>}
      {result && (
        <Banner kind="success" >
          Added <strong>{result.name}</strong> with a starter checklist. View it in the{' '}
          <Link to="/law-explorer">Law Explorer</Link> or open its <Link to={`/frameworks/${result.key}`} data-testid="result-framework-link">framework page</Link>.
        </Banner>
      )}

      <Card title="Add a regulatory framework" variant="ruled-gold">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-2">
            <div className="field">
              <label className="label">Key (lowercase, underscores)</label>
              <input className="input" data-testid="fw-key" placeholder="bafin_ki" {...register('key', { required: 'Key is required' })} />
              {errors.key && <div className="error-text">{errors.key.message}</div>}
            </div>
            <div className="field">
              <label className="label">Tier</label>
              <select className="select" data-testid="fw-tier" {...register('tier')}>
                <option value={1}>Tier 1 - EU</option>
                <option value={2}>Tier 2 - German national</option>
                <option value={3}>Tier 3 - Sector</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label className="label">Name</label>
            <input className="input" data-testid="fw-name" placeholder="BaFin AI Supervision" {...register('name', { required: 'Name is required' })} />
            {errors.name && <div className="error-text">{errors.name.message}</div>}
          </div>
          <div className="grid grid-2">
            <div className="field">
              <label className="label">Short name</label>
              <input className="input" data-testid="fw-shortName" placeholder="BaFin" {...register('shortName')} />
            </div>
            <div className="field">
              <label className="label">Reference</label>
              <input className="input" placeholder="BaFin guidance 2021" {...register('reference')} />
            </div>
          </div>
          <div className="field">
            <label className="label">Plain-language description</label>
            <textarea className="textarea" data-testid="fw-desc" {...register('shortDescription')} />
          </div>
          <div className="field">
            <label className="label">Who must comply</label>
            <input className="input" {...register('appliesTo')} />
          </div>
          <div className="field">
            <label className="label">Regulator</label>
            <input className="input" placeholder="BaFin" {...register('regulator')} />
          </div>
          <button className="btn btn-primary" type="submit" data-testid="create-framework">Add framework and starter checklist</button>
        </form>
      </Card>
    </div>
  );
}
