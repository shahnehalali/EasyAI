import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { aiSystemApi } from '@/apis/aiSystemApi';
import { useT } from '@/hooks/useT';
import { Banner, Card, SkeletonPage, ErrorState } from '@/components/ui/Ui';
import BackLink from '@/components/BackLink';

export default function AiSystemEdit() {
  const { id } = useParams();
  const { t } = useT();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const { data: system, isLoading, error: loadError, refetch } = useQuery({
    queryKey: ['ai-system', id], queryFn: () => aiSystemApi.getById(id),
  });

  // `values` (RHF 7.4+) reactively resets the form once the system loads, so we
  // can keep the hook above the loading guards without a manual reset().
  const { register, handleSubmit, formState: { errors } } = useForm({
    values: system && {
      name: system.name ?? '',
      purpose: system.purpose ?? '',
      description: system.description ?? '',
      vendor: system.vendor ?? '',
      lifecycleStage: system.lifecycleStage ?? 'planning',
    },
  });

  if (isLoading) return <SkeletonPage rows={3} />;
  if (loadError) return <ErrorState error={loadError} onRetry={refetch} />;

  const onSubmit = async (data) => {
    setError(''); setBusy(true);
    try {
      await aiSystemApi.update(id, data);
      qc.invalidateQueries({ queryKey: ['ai-system', id] });
      qc.invalidateQueries({ queryKey: ['ai-systems'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      navigate(`/ai-systems/${id}`);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <div data-testid="ai-system-edit" style={{ maxWidth: 680 }}>
      <BackLink to={`/ai-systems/${id}`}>{system?.name || t('nav.aiSystems')}</BackLink>
      <div className="page-head" style={{ marginTop: 10 }}>
        <div>
          <div className="eyebrow">{t('asd.eyebrow')}</div>
          <h1>{t('aie.title')}</h1>
          <p className="sub">{t('aie.sub')}</p>
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
          <div className="row" style={{ gap: 10 }}>
            <button className="btn btn-primary" type="submit" data-testid="submit" disabled={busy}>
              {busy ? t('ain.saving') : t('aie.save')}
            </button>
            <button type="button" className="btn btn-ghost" data-testid="cancel" onClick={() => navigate(`/ai-systems/${id}`)}>
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
