import { createApiClient } from '@/config/httpClient';

const http = createApiClient('/invitations');

export const invitationApi = {
  list: () => http.get('/').then((r) => r.data.invitations),
  create: (data) => http.post('/', data).then((r) => r.data),
  revoke: (id) => http.delete(`/${id}`).then((r) => r.data),
  lookup: (token) => http.get(`/lookup/${token}`).then((r) => r.data.invitation),
  accept: (data) => http.post('/accept', data).then((r) => r.data),
};
