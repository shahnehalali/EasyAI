import { createApiClient } from '@/config/httpClient';

const http = createApiClient('/documents');

export const documentApi = {
  list: () => http.get('/').then((r) => r.data.documents),
  upload: (file, meta = {}) => {
    const form = new FormData();
    form.append('file', file);
    Object.entries(meta).forEach(([k, v]) => { if (v) form.append(k, v); });
    return http.post('/', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data.document);
  },
  downloadUrl: (id) => `/api/documents/${id}/download`,
  remove: (id) => http.delete(`/${id}`).then((r) => r.data),
};
