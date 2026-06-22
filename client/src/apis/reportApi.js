// Report downloads are plain authenticated GET endpoints that stream a file with a
// Content-Disposition header. The dev server proxies /api to the backend with cookies,
// so an anchor link to these URLs downloads the file directly.
import { API_BASE } from '@/config/urls';

export const reportApi = {
  assessmentPdfUrl: (id) => `${API_BASE}/reports/assessments/${id}/pdf`,
  orgPdfUrl: () => `${API_BASE}/reports/organization/pdf`,
  orgCsvUrl: () => `${API_BASE}/reports/organization/csv`,
  auditCsvUrl: () => `${API_BASE}/reports/audit/csv`,
};
