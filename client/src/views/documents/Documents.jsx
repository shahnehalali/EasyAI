import { useQuery, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '@/apis/documentApi';
import { SkeletonPage, ErrorState, EmptyState } from '@/components/ui/Ui';
import { formatDate, bytes } from '@/utils/format';
import { useT } from '@/hooks/useT';
import { useAuth } from '@/hooks/useAuth';

export default function Documents() {
  const { t } = useT();
  const { can } = useAuth();
  const canEdit = can('compliance.edit');
  const qc = useQueryClient();
  const { data: documents = [], isLoading, error, refetch } = useQuery({ queryKey: ['documents'], queryFn: documentApi.list });

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await documentApi.upload(file);
    qc.invalidateQueries({ queryKey: ['documents'] });
    e.target.value = '';
  };

  const remove = async (id) => {
    await documentApi.remove(id);
    qc.invalidateQueries({ queryKey: ['documents'] });
  };

  if (isLoading) return <SkeletonPage />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div data-testid="documents">
      <div className="page-head">
        <div>
          <div className="eyebrow">{t('doc.eyebrow')}</div>
          <h1>{t('doc.title')}</h1>
          <p className="sub">{t('doc.sub')}</p>
        </div>
        {canEdit && (
          <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
            {t('doc.upload')}
            <input type="file" data-testid="upload-file" onChange={upload} style={{ display: 'none' }} />
          </label>
        )}
      </div>

      {documents.length === 0 ? (
        <div className="card"><EmptyState icon="▤" title={t('doc.empty.title')}>{t('doc.empty.body')}</EmptyState></div>
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead><tr><th>{t('doc.col.file')}</th><th>{t('doc.col.type')}</th><th>{t('doc.col.size')}</th><th>{t('doc.col.uploaded')}</th><th></th></tr></thead>
            <tbody>
              {documents.map((d) => (
                <tr key={d.id} data-testid="document-row">
                  <td><a href={documentApi.downloadUrl(d.id)} target="_blank" rel="noreferrer">{d.fileName}</a></td>
                  <td className="muted small">{d.mimeType}</td>
                  <td className="muted small">{bytes(d.sizeBytes)}</td>
                  <td className="muted small">{formatDate(d.createdAt)}</td>
                  <td style={{ textAlign: 'right' }}>
                    {canEdit && <button className="btn btn-danger btn-sm" data-testid="delete-document" onClick={() => remove(d.id)}>{t('common.delete')}</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
