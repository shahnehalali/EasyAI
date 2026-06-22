import { createApiClient } from '@/config/httpClient';

const http = createApiClient('/laws');

export const lawApi = {
  explorer: () => http.get('/').then((r) => r.data),
  analyze: (text) => http.post('/analyze', { text }).then((r) => r.data),
};
