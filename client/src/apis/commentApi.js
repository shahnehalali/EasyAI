import { createApiClient } from '@/config/httpClient';

const http = createApiClient('/comments');

export const commentApi = {
  listByAssessment: (assessmentId) => http.get('/', { params: { assessmentId } }).then((r) => r.data.comments),
  create: (data) => http.post('/', data).then((r) => r.data.comment),
  remove: (id) => http.delete(`/${id}`).then((r) => r.data),
};
