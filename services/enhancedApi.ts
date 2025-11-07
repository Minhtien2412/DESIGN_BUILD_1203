// Enhanced API Client for ThietKe Resort - Production Ready
// Integrates with existing services/api.ts while adding real-time features

import { storage } from '@/services/storage';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { AppError, handleApiError } from '../utils/errorHandler';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: any;
}

class EnhancedApiClient {
  private api: AxiosInstance;
  private refreshPromise: Promise<string | null> | null = null;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_API_BASE || 'https://api.thietkeresort.com.vn';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add correlation ID for debugging
        config.headers['X-Request-ID'] = Date.now().toString();
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle token refresh and errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshTokenSilently();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.api.request(originalRequest);
            }
          } catch (refreshError) {
            // Clear tokens and redirect to login
            await this.clearTokens();
            // Emit auth event for app to handle
            this.emitAuthEvent('token_expired');
          }
        }

        // Transform axios error to our error format
        const appError = handleApiError(error);
        return Promise.reject(appError);
      }
    );
  }

  private async getAccessToken(): Promise<string | null> {
    try {
      return await storage.get('accessToken');
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  private async getRefreshToken(): Promise<string | null> {
    try {
      return await storage.get('refreshToken');
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }

  private async saveTokens(tokens: AuthTokens): Promise<void> {
    try {
      await Promise.all([
        storage.set('accessToken', tokens.accessToken),
        storage.set('refreshToken', tokens.refreshToken),
      ]);
    } catch (error) {
      console.error('Failed to save tokens:', error);
      throw new AppError(0, 'Failed to save authentication tokens');
    }
  }

  private async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        storage.remove('accessToken').catch(() => {}),
        storage.remove('refreshToken').catch(() => {}),
      ]);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  private async refreshTokenSilently(): Promise<string | null> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string | null> {
    const refreshToken = await this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      // Use a fresh axios instance to avoid interceptor loops
      const response = await axios.post(
        `${this.baseURL}/auth/refresh`,
        { refreshToken },
        { 
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      if (!accessToken || !newRefreshToken) {
        throw new Error('Invalid refresh response');
      }

      await this.saveTokens({ 
        accessToken, 
        refreshToken: newRefreshToken 
      });
      
      return accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.clearTokens();
      throw error;
    }
  }

  private emitAuthEvent(event: string) {
    // Emit custom event for app to handle auth state changes
    // You can integrate this with your existing auth context
    console.log(`Auth event: ${event}`);
  }

  // Public Authentication Methods
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await this.api.post('/auth/login', credentials);
      const { accessToken, refreshToken, user } = response.data;
      
      if (!accessToken || !refreshToken) {
        throw new AppError(400, 'Invalid login response format');
      }

      await this.saveTokens({ accessToken, refreshToken });
      
      return { user, accessToken, refreshToken };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw handleApiError(error);
    }
  }

  async register(userData: any): Promise<LoginResponse> {
    try {
      const response = await this.api.post('/auth/register', userData);
      const { accessToken, refreshToken, user } = response.data;
      
      await this.saveTokens({ accessToken, refreshToken });
      
      return { user, accessToken, refreshToken };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      // Try to notify server about logout
      await this.api.post('/auth/logout');
    } catch (error) {
      // Continue with local logout even if server request fails
      console.warn('Logout request failed:', error);
    } finally {
      await this.clearTokens();
    }
  }

  async refreshToken(): Promise<string> {
    const token = await this.refreshTokenSilently();
    if (!token) {
      throw new AppError(401, 'Failed to refresh authentication token');
    }
    return token;
  }

  // Profile Management
  async getProfile(): Promise<any> {
    const response = await this.api.get('/me');
    return response.data;
  }

  async updateProfile(data: any): Promise<any> {
    const response = await this.api.patch('/me/profile', data);
    return response.data;
  }

  // Chat API Methods
  async getChats(): Promise<any[]> {
    const response = await this.api.get('/chats');
    return response.data;
  }

  async createChat(data: { type: string; members: string[]; name?: string }): Promise<any> {
    const response = await this.api.post('/chats', data);
    return response.data;
  }

  async getChatMessages(chatId: string, cursor?: string, limit = 50): Promise<any> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());

    const response = await this.api.get(`/chats/${chatId}/messages?${params}`);
    return response.data;
  }

  async sendMessage(chatId: string, payload: any): Promise<any> {
    const response = await this.api.post(`/chats/${chatId}/messages`, payload);
    return response.data;
  }

  async markMessageAsRead(chatId: string, messageId: string): Promise<void> {
    await this.api.post(`/chats/${chatId}/messages/${messageId}/read`);
  }

  // Notifications
  async getNotifications(cursor?: string, limit = 50): Promise<any> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());

    const response = await this.api.get(`/me/notifications?${params}`);
    return response.data;
  }

  async registerPushToken(data: { token: string; platform: string; deviceId?: string }): Promise<void> {
    await this.api.post('/me/push-tokens', data);
  }

  // Storage/File Upload
  async getPresignedUpload(data: { mime: string; prefix?: string }): Promise<any> {
    const response = await this.api.post('/storage/presign', data);
    return response.data;
  }

  // Generic HTTP Methods
  async get(url: string, config?: AxiosRequestConfig): Promise<any> {
    const response = await this.api.get(url, config);
    return response.data;
  }

  async post(url: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
    const response = await this.api.post(url, data, config);
    return response.data;
  }

  async put(url: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
    const response = await this.api.put(url, data, config);
    return response.data;
  }

  async patch(url: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
    const response = await this.api.patch(url, data, config);
    return response.data;
  }

  async delete(url: string, config?: AxiosRequestConfig): Promise<any> {
    const response = await this.api.delete(url, config);
    return response.data;
  }

  // Utility Methods
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }

  getBaseURL(): string {
    return this.baseURL;
  }

  // Health check
  async healthCheck(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/health`, { timeout: 5000 });
      return response.data;
    } catch (error) {
      throw new AppError(0, 'API health check failed');
    }
  }
}

// Create singleton instance
export const apiClient = new EnhancedApiClient();

// Export for compatibility with existing code
export default apiClient;

// Export types
export type { AuthTokens, LoginCredentials, LoginResponse };
