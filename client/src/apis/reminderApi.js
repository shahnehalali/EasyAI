import { createApiClient } from '@/config/httpClient';

const http = createApiClient('/reminders');

export const reminderApi = {
  list: () => http.get('/').then((r) => r.data.reminders),
  update: (id, data) => http.patch(`/${id}`, data).then((r) => r.data.reminder),
  runDue: (now) => http.post('/run-due', now ? { now } : {}).then((r) => r.data),
};
