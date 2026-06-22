import { createApiClient } from '@/config/httpClient';

const http = createApiClient('/checklist-responses');

export const checklistResponseApi = {
  update: (id, data) => http.patch(`/${id}`, data).then((r) => r.data),
};
