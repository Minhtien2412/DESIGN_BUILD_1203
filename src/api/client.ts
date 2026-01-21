import axios, { AxiosError } from 'axios';
import Constants from 'expo-constants';
import { authActions, getAuthState } from '../store/auth';

// Get API URL from environment
const DEFAULT_API_URL = 'https://api.thietkeresort.com.vn';
const extra = Constants?.expoConfig?.extra || {};
const API_URL = extra.EXPO_PUBLIC_API_BASE_URL || extra.API_URL || DEFAULT_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Refresh token queue management
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  
  failedQueue = [];
};

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config) => {
    const authState = getAuthState();
    const accessToken = authState.accessToken;
    
    if (accessToken && !config.headers?.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    const { response } = error;

    if (response?.status === 401 && !originalRequest._retry) {
      const authState = getAuthState();
      const refreshToken = authState.refreshToken;
      
      if (!refreshToken) {
        // No refresh token, clear session and redirect to login
        authActions.clear();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Already refreshing, add to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const { accessToken: newAccessToken } = response.data;
        
        if (!newAccessToken) {
          throw new Error('No access token in refresh response');
        }

        // Update store with new token
        const currentUser = authState.user;
        if (currentUser) {
          await authActions.setSession(newAccessToken, refreshToken, currentUser);
        }

        processQueue(null, newAccessToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        processQueue(refreshError, null);
        authActions.clear();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Enhanced error messages
    if (response?.status === 429) {
      error.message = 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.';
    } else if (response?.status === 403) {
      error.message = 'Bạn không có quyền thực hiện thao tác này.';
    } else if (response?.status === 404) {
      error.message = 'Không tìm thấy dữ liệu yêu cầu.';
    } else if (response?.status && response.status >= 500) {
      error.message = 'Máy chủ bận. Vui lòng thử lại sau.';
    } else if (!response) {
      error.message = 'Không thể kết nối máy chủ. Kiểm tra mạng hoặc API_URL.';
    }

    return Promise.reject(error);
  }
);

export default api;
