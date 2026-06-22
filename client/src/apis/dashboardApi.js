import { createApiClient } from '@/config/httpClient';

const http = createApiClient('/dashboard');

export const dashboardApi = {
  summary: () => http.get('/summary').then((r) => r.data),
  trends: (days = 90) => http.get('/trends', { params: { days } }).then((r) => r.data.trends),
};
