import { createApiClient } from '@/config/httpClient';
import { API_BASE } from '@/config/urls';

const http = createApiClient('/organizations');

export const organizationApi = {
  current: () => http.get('/current').then((r) => r.data.organization),
  update: (data) => http.patch('/current', data).then((r) => r.data.organization),
  updateFunctions: (selectedFunctions) => http.patch('/current/functions', { selectedFunctions }).then((r) => r.data.organization),
  members: () => http.get('/current/members').then((r) => r.data.members),
  avv: () => http.get('/current/avv').then((r) => r.data.avv),
  // Plain authenticated GET with a Content-Disposition header, same pattern
  // as reportApi's PDF links: an <a href> to this URL downloads it directly.
  avvPdfUrl: () => `${API_BASE}/organizations/current/avv/pdf`,
};
