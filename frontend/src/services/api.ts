import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
            refresh,
          });
          localStorage.setItem('access_token', response.data.access);
          original.headers.Authorization = `Bearer ${response.data.access}`;
          return api(original);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (data: any) => api.post('/auth/register/', data),
  login: (username: string, password: string) =>
    api.post('/auth/token/', { username, password }),
  me: () => api.get('/auth/me/'),
};

export const expenseService = {
  list: (params?: any) => api.get('/expenses/', { params }),
  create: (data: any) => api.post('/expenses/', data),
  update: (id: number, data: any) => api.patch(`/expenses/${id}/`, data),
  delete: (id: number) => api.delete(`/expenses/${id}/`),
  summary: (params?: any) => api.get('/expenses/summary/', { params }),
  exportPdf: () => api.post('/expenses/export_pdf/'),
};

export const budgetService = {
  list: (params?: any) => api.get('/budgets/', { params }),
  create: (data: any) => api.post('/budgets/', data),
  update: (id: number, data: any) => api.patch(`/budgets/${id}/`, data),
  delete: (id: number) => api.delete(`/budgets/${id}/`),
  spendingStatus: () => api.get('/budgets/spending_status/'),
};

export const analyticsService = {
  monthlyTrends: (params?: any) => api.get('/analytics/monthly_trends/', { params }),
  categoryBreakdown: (params?: any) => api.get('/analytics/category_breakdown/', { params }),
  forecast: (params?: any) => api.get('/analytics/forecast/', { params }),
  summary: () => api.get('/analytics/summary/'),
};

export const taskService = {
  status: (taskId: string) => api.get('/tasks/task_status/', { params: { task_id: taskId } }),
};

export default api;
