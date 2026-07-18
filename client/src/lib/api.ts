import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// ============================================
// API Functions
// ============================================

// Auth
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
  me: () => api.get('/auth/me'),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

// Employees
export const employeeApi = {
  getAll: (params?: Record<string, any>) =>
    api.get('/employees', { params }),
  getById: (id: string) =>
    api.get(`/employees/${id}`),
  create: (data: any) =>
    api.post('/employees', data),
  update: (id: string, data: any) =>
    api.put(`/employees/${id}`, data),
  delete: (id: string) =>
    api.delete(`/employees/${id}`),
  importCsv: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/employees/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getReportees: (id: string) =>
    api.get(`/employees/${id}/reportees`),
  assignManager: (id: string, managerId: string | null) =>
    api.patch(`/employees/${id}/manager`, { managerId }),
};

// Organization
export const orgApi = {
  getTree: () => api.get('/organization/tree'),
};

// Dashboard
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};

// Departments
export const departmentApi = {
  getAll: () => api.get('/departments'),
};
