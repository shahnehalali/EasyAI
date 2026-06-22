import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { aiSystemApi } from '@/apis/aiSystemApi';
import { Banner, Card } from '@/components/ui/Ui';

export default function AiSystemNew() {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { lifecycleStage: 'planning' } });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (data) => {
    setError(''); setBusy(true);
    try {
      const system = await aiSystemApi.create(data);
      qc.invalidateQueries({ queryKey: ['ai-systems'] });
      navigate(`/ai-systems/${system.id}/classify`);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <div data-testid="ai-system-new" style={{ maxWidth: 680 }}>
      <Link className="small" to="/ai-systems">← AI systems</Link>
      <div className="page-head" style={{ marginTop: 10 }}>
        <div>
          <div className="eyebrow">Step 1 of 2</div>
          <h1>Register an AI system</h1>
          <p className="sub">Describe the AI system. Next, you will answer a short questionnaire so we can classify its risk level.</p>
        </div>
      </div>

      {error && <Banner kind="error">{error}</Banner>}
      <Card variant="ruled">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="field">
            <label className="label">System name</label>
            <input className="input" data-testid="name" {...register('name', { required: 'Name is required' })} />
            {errors.name && <div className="error-text">{errors.name.message}</div>}
          </div>
          <div className="field">
            <label className="label">Purpose</label>
            <input className="input" data-testid="purpose" placeholder="What is it used for?" {...register('purpose')} />
          </div>
          <div className="field">
            <label className="label">Description</label>
            <textarea className="textarea" data-testid="description" {...register('description')} />
          </div>
          <div className="grid grid-2">
            <div className="field">
              <label className="label">Vendor</label>
              <select className="select" data-testid="vendor" {...register('vendor')}>
                <option value="">Select...</option>
                <option value="in_house">Built in-house</option>
                <option value="third_party">Third party</option>
              </select>
            </div>
            <div className="field">
              <label className="label">Lifecycle stage</label>
              <select className="select" data-testid="lifecycleStage" {...register('lifecycleStage')}>
                <option value="planning">Planning</option>
                <option value="deployed">Deployed</option>
                <option value="retired">Retired</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary" type="submit" data-testid="submit" disabled={busy}>
            {busy ? 'Saving...' : 'Continue to classification'}
          </button>
        </form>
      </Card>
    </div>
  );
}
