import { createApiClient } from '@/config/httpClient';

const http = createApiClient('/auth');

export const authApi = {
  register: (data) => http.post('/register', data).then((r) => r.data),
  verifyEmail: (token) => http.post('/verify-email', { token }).then((r) => r.data),
  resendVerification: (email) => http.post('/resend-verification', { email }).then((r) => r.data),
  login: (data) => http.post('/login', data).then((r) => r.data),
  logout: () => http.post('/logout').then((r) => r.data),
  me: () => http.get('/me').then((r) => r.data),
  forgotPassword: (email) => http.post('/forgot-password', { email }).then((r) => r.data),
  resetPassword: (token, password) => http.post('/reset-password', { token, password }).then((r) => r.data),
};
