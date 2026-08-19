import { createApiClient } from '@/config/httpClient';

const http = createApiClient('/privacy');

export const privacyApi = {
  // GDPR Art. 15 / 20 — download everything we hold about this account.
  export: () => http.get('/export', { responseType: 'blob' }).then((r) => r.data),
  // GDPR Art. 17 — both require the account password as confirmation.
  deleteAccount: (password) => http.delete('/me', { data: { password } }).then((r) => r.data),
  deleteOrganization: (password) => http.delete('/organization', { data: { password } }).then((r) => r.data),
};
