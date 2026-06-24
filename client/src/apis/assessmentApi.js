import { createApiClient } from '@/config/httpClient';

const http = createApiClient('/assessments');

export const assessmentApi = {
  list: (lang) => http.get('/', { params: lang ? { lang } : {} }).then((r) => r.data.assessments),
  getById: (id, lang) => http.get(`/${id}`, { params: lang ? { lang } : {} }).then((r) => r.data.assessment),
  activity: (id) => http.get(`/${id}/activity`).then((r) => r.data.activity),
  start: (data) => http.post('/start', data).then((r) => r.data),
  startFrameworks: (frameworkKeys) => http.post('/start-frameworks', { frameworkKeys }).then((r) => r.data),
  markReviewed: (id) => http.post(`/${id}/mark-reviewed`).then((r) => r.data.assessment),
};
