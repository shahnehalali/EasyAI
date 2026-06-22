import { createApiClient } from '@/config/httpClient';

const http = createApiClient('/organizations');

export const organizationApi = {
  current: () => http.get('/current').then((r) => r.data.organization),
  update: (data) => http.patch('/current', data).then((r) => r.data.organization),
  updateFunctions: (selectedFunctions) => http.patch('/current/functions', { selectedFunctions }).then((r) => r.data.organization),
  members: () => http.get('/current/members').then((r) => r.data.members),
};
