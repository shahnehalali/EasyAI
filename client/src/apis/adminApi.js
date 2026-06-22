import { createApiClient } from '@/config/httpClient';

const http = createApiClient('/admin');

export const adminApi = {
  overview: () => http.get('/overview').then((r) => r.data.counts),
  createFramework: (data) => http.post('/frameworks', data).then((r) => r.data.framework),
  createRequirement: (key, data) => http.post(`/frameworks/${key}/requirements`, data).then((r) => r.data.requirement),
  createTemplate: (key, data) => http.post(`/frameworks/${key}/templates`, data).then((r) => r.data.template),
};
