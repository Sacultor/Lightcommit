import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  githubLogin: () => {
    window.location.href = `${API_BASE_URL}/auth/github`;
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },
};

export const contributionsApi = {
  getAll: async (params?: {
    type?: string;
    status?: string;
    userId?: string;
    repositoryId?: string;
  }) => {
    const response = await apiClient.get('/contributions', { params });
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await apiClient.get(`/contributions/${id}`);
    return response.data;
  },

  getMy: async () => {
    const response = await apiClient.get('/contributions/my');
    return response.data;
  },

  getStats: async (userId?: string) => {
    const response = await apiClient.get('/contributions/stats', {
      params: { userId },
    });
    return response.data;
  },
};

export const healthApi = {
  check: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

