import { createApiClient } from '@/config/httpClient';

const http = createApiClient('/audit');

export const auditApi = {
  list: (params = {}) => http.get('/', { params }).then((r) => r.data),
};
