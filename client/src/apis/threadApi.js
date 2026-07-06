import { createApiClient } from '@/config/httpClient';

const http = createApiClient('/community');

export const threadApi = {
  list: (params = {}) => http.get('/threads', { params }).then((r) => r.data.threads),
  get: (id, lang = 'en') => http.get(`/threads/${id}`, { params: { lang } }).then((r) => r.data),
  create: (data) => http.post('/threads', data).then((r) => r.data.thread),
  remove: (id) => http.delete(`/threads/${id}`).then((r) => r.data),
  lock: (id) => http.post(`/threads/${id}/lock`).then((r) => r.data),
  voteThread: (id, value) => http.post(`/threads/${id}/vote`, { value }).then((r) => r.data),
  reply: (id, data) => http.post(`/threads/${id}/posts`, data).then((r) => r.data.post),
  votePost: (id, value) => http.post(`/posts/${id}/vote`, { value }).then((r) => r.data),
  removePost: (id) => http.delete(`/posts/${id}`).then((r) => r.data),
  report: (data) => http.post('/report', data).then((r) => r.data),
};
