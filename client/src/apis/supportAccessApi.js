import { createApiClient } from '@/config/httpClient';

const http = createApiClient('/organizations/current/support-access');

export const supportAccessApi = {
  list: () => http.get('/').then((r) => r.data.grants),
  create: (data) => http.post('/', data).then((r) => r.data.grant),
  revoke: (id) => http.post(`/${id}/revoke`).then((r) => r.data.grant),
};
