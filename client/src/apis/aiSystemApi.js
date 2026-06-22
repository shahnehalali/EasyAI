import { createApiClient } from '@/config/httpClient';

const http = createApiClient('/ai-systems');

export const aiSystemApi = {
  list: () => http.get('/').then((r) => r.data.aiSystems),
  create: (data) => http.post('/', data).then((r) => r.data.aiSystem),
  getById: (id) => http.get(`/${id}`).then((r) => r.data.aiSystem),
  update: (id, data) => http.patch(`/${id}`, data).then((r) => r.data.aiSystem),
  remove: (id) => http.delete(`/${id}`).then((r) => r.data),
  getQuestionnaire: (id) => http.get(`/${id}/questionnaire`).then((r) => r.data.questionnaire),
  classify: (id, answers) => http.post(`/${id}/classify`, { answers }).then((r) => r.data),
  getDataProfile: (id) => http.get(`/${id}/data-profile`).then((r) => r.data),
  saveDataProfile: (id, answers) => http.post(`/${id}/data-profile`, { answers }).then((r) => r.data),
};
