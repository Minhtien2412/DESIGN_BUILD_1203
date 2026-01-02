import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://baotienweb.cloud/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - thêm token vào headers
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      Cookies.remove('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (data: { email: string; password: string; name: string; phone?: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    Cookies.remove('admin_token');
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Users API
export const usersApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await api.get('/users', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/users', data);
    return response.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

// Products API
export const productsApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; category?: string }) => {
    const response = await api.get('/products', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/products', data);
    return response.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

// Projects API
export const projectsApi = {
  getAll: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await api.get('/projects', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/projects/stats');
    return response.data;
  },
};

// Analytics API
export const analyticsApi = {
  getDashboard: async () => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },
  
  getRevenue: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await api.get('/analytics/revenue', { params });
    return response.data;
  },
};

export default api;
