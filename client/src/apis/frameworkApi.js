import { createApiClient } from '@/config/httpClient';

const http = createApiClient('/frameworks');

export const frameworkApi = {
  list: () => http.get('/').then((r) => r.data.frameworks),
  getByKey: (key, lang) => http.get(`/${key}`, { params: lang ? { lang } : {} }).then((r) => r.data.framework),
};
