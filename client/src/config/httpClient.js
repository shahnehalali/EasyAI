import axios from 'axios';
import { API_BASE } from './urls';

// Factory for an axios instance scoped to a base path segment.
// Cookies (the session) are sent automatically with withCredentials.
export function createApiClient(segment = '') {
  const instance = axios.create({
    baseURL: `${API_BASE}${segment}`,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });

  // Normalise server error messages.
  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      const message = err.response?.data?.error?.message || err.message || 'Request failed';
      const details = err.response?.data?.error?.details;
      return Promise.reject(Object.assign(new Error(message), { status: err.response?.status, details }));
    },
  );

  return instance;
}
