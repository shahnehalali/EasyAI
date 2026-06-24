import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { aiSystemApi } from '@/apis/aiSystemApi';
import { useT } from '@/hooks/useT';
import { Banner, Card } from '@/components/ui/Ui';

export default function AiSystemNew() {
  const { t } = useT();
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
      <Link className="small" to="/ai-systems">← {t('nav.aiSystems')}</Link>
      <div className="page-head" style={{ marginTop: 10 }}>
        <div>
          <div className="eyebrow">{t('ain.step')}</div>
          <h1>{t('common.register')}</h1>
          <p className="sub">{t('ain.sub')}</p>
        </div>
      </div>

      {error && <Banner kind="error">{error}</Banner>}
      <Card variant="ruled">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="field">
            <label className="label">{t('ain.systemName')}</label>
            <input className="input" data-testid="name" {...register('name', { required: t('ain.nameRequired') })} />
            {errors.name && <div className="error-text">{errors.name.message}</div>}
          </div>
          <div className="field">
            <label className="label">{t('ain.purpose')}</label>
            <input className="input" data-testid="purpose" placeholder={t('ain.purposePlaceholder')} {...register('purpose')} />
          </div>
          <div className="field">
            <label className="label">{t('ain.description')}</label>
            <textarea className="textarea" data-testid="description" {...register('description')} />
          </div>
          <div className="grid grid-2">
            <div className="field">
              <label className="label">{t('ain.vendor')}</label>
              <select className="select" data-testid="vendor" {...register('vendor')}>
                <option value="">{t('ain.select')}</option>
                <option value="in_house">{t('ain.inHouse')}</option>
                <option value="third_party">{t('ain.thirdParty')}</option>
              </select>
            </div>
            <div className="field">
              <label className="label">{t('ain.stage')}</label>
              <select className="select" data-testid="lifecycleStage" {...register('lifecycleStage')}>
                <option value="planning">{t('ain.planning')}</option>
                <option value="deployed">{t('ain.deployed')}</option>
                <option value="retired">{t('ain.retired')}</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary" type="submit" data-testid="submit" disabled={busy}>
            {busy ? t('ain.saving') : t('ain.continue')}
          </button>
        </form>
      </Card>
    </div>
  );
}
