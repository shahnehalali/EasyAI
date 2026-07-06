import { createApiClient } from '@/config/httpClient';
import { API_BASE } from '@/config/urls';

const http = createApiClient('/ai-systems');

export const aiSystemApi = {
  list: () => http.get('/').then((r) => r.data.aiSystems),
  create: (data) => http.post('/', data).then((r) => r.data.aiSystem),
  getById: (id) => http.get(`/${id}`).then((r) => r.data.aiSystem),
  update: (id, data) => http.patch(`/${id}`, data).then((r) => r.data.aiSystem),
  remove: (id) => http.delete(`/${id}`).then((r) => r.data),
  getQuestionnaire: (id, lang = 'en') => http.get(`/${id}/questionnaire`, { params: { lang } }).then((r) => r.data.questionnaire),
  classify: (id, answers, lang = 'en') => http.post(`/${id}/classify`, { answers }, { params: { lang } }).then((r) => r.data),
  getDataProfile: (id, lang = 'en') => http.get(`/${id}/data-profile`, { params: { lang } }).then((r) => r.data),
  saveDataProfile: (id, answers, lang = 'en') => http.post(`/${id}/data-profile`, { answers }, { params: { lang } }).then((r) => r.data),
  dataProfilePdfUrl: (id, lang = 'en') => `${API_BASE}/ai-systems/${id}/data-profile/pdf?lang=${lang}`,
  createProfileAssessment: (id) => http.post(`/${id}/data-profile/assessment`).then((r) => r.data),
};
