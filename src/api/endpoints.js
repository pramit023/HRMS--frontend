import api from './client';

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  refreshToken: (data) => api.post('/auth/refresh-token', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
  updatePassword: (data) => api.put('/auth/update-password', data),
  forceChangePassword: (data) => api.post('/auth/force-change-password', data),
  logout: () => api.post('/auth/logout'),
};

export const employeeApi = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  uploadPhoto: (id, formData) =>
    api.post(`/employees/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadDocument: (id, formData) =>
    api.post(`/employees/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteDocument: (id, docId) => api.delete(`/employees/${id}/documents/${docId}`),
};

export const departmentApi = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
  getStats: () => api.get('/departments/stats'),
};

export const attendanceApi = {
  checkIn: (data) => api.post('/attendance/check-in', data),
  checkOut: () => api.post('/attendance/check-out'),
  getToday: () => api.get('/attendance/today'),
  getDaily: (params) => api.get('/attendance/daily', { params }),
  getHistory: (employeeId = 'me', params) =>
    api.get(`/attendance/history/${employeeId}`, { params }),
  manualEntry: (data) => api.post('/attendance/manual', data),
};

export const leaveApi = {
  apply: (data) => api.post('/leaves', data),
  getAll: (params) => api.get('/leaves', { params }),
  getBalance: () => api.get('/leaves/balance'),
  approve: (id, data) => api.put(`/leaves/${id}/approve`, data),
  reject: (id, data) => api.put(`/leaves/${id}/reject`, data),
  cancel: (id) => api.put(`/leaves/${id}/cancel`),
};

export const payrollApi = {
  generate: (data) => api.post('/payroll/generate', data),
  getAll: (params) => api.get('/payroll', { params }),
  getById: (id) => api.get(`/payroll/${id}`),
  update: (id, data) => api.put(`/payroll/${id}`, data),
  getSummary: () => api.get('/payroll/summary'),
  getPdfDownloadUrl: (id) => `/api/payroll/${id}/download-pdf`,
};

export const performanceApi = {
  getAll: (params) => api.get('/performance', { params }),
  getById: (id) => api.get(`/performance/${id}`),
  create: (data) => api.post('/performance', data),
  update: (id, data) => api.put(`/performance/${id}`, data),
  delete: (id) => api.delete(`/performance/${id}`),
};

export const notificationApi = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const dashboardApi = {
  getSuperAdmin: () => api.get('/dashboard/super-admin'),
  getHR: () => api.get('/dashboard/hr'),
  getEmployee: () => api.get('/dashboard/employee'),
};

export const reportApi = {
  getAttendance: (params) => api.get('/reports/attendance', { params }),
  getLeave: (params) => api.get('/reports/leave', { params }),
  getPayroll: (params) => api.get('/reports/payroll', { params }),
  getEmployee: (params) => api.get('/reports/employee', { params }),
  getExcelDownloadUrl: (type, params = {}) => {
    const searchParams = new URLSearchParams({ ...params, format: 'excel' });
    return `/api/reports/${type}?${searchParams.toString()}`;
  },
};

export const auditApi = {
  getLogs: (params) => api.get('/audit', { params }),
};

export const taskApi = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  updateProgress: (id, data) => api.patch(`/tasks/${id}/progress`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

export const documentApi = {
  getAll: (params) => api.get('/documents', { params }),
  upload: (formData) =>
    api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getDownloadUrl: (id) => `/api/documents/${id}/download`,
  verify: (id, data) => api.patch(`/documents/${id}/verify`, data),
  delete: (id) => api.delete(`/documents/${id}`),
};

