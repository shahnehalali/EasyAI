import { createApiClient } from '@/config/httpClient';

const http = createApiClient('/notifications');

export const notificationApi = {
  list: () => http.get('/').then((r) => r.data.notifications),
  unreadCount: () => http.get('/unread-count').then((r) => r.data.count),
  markRead: (id) => http.patch(`/${id}/read`).then((r) => r.data),
  markAllRead: () => http.patch('/read-all').then((r) => r.data),
};
