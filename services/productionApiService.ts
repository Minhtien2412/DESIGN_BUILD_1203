/**
 * Production API Integration Service
 * Tích hợp hoàn toàn với https://api.thietkeresort.com.vn/
 */

import { apiFetch } from '@/services/api';
import { ApiErrorContext, apiErrorHandler } from './apiErrorHandler';
import { storage } from './storage';

export interface ProductionApiResponse<T> {
  success: boolean;
  data?: T;
  total?: number;
  items?: any;
  item?: any;
  access_token?: string;
  user?: any;
  source: 'production' | 'fallback' | 'cache';
  error?: ApiErrorContext;
  recommendations?: string[];
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface User {
  sub: string;
  email: string;
  fullName: string;
  roles: string[];
  iat: number;
  exp: number;
}

export interface Contact {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  message: string;
  status: 'new' | 'read' | 'responded';
  createdAt: string;
}

export interface PaymentMethod {
  code: string;
  name: string;
  capture: boolean;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  method: string;
  description: string;
  bookingId?: string;
  status: string;
  createdAt: string;
}

class ProductionApiService {
  private baseUrl: string;
  private token: string | null = null;
  private user: User | null = null;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Use unified API service baseURL
    const { API_BASE } = require('./api');
    this.baseUrl = API_BASE;
    this.loadStoredAuth();
  }

  // ========= AUTHENTICATION =========

  async login(credentials: AuthCredentials): Promise<ProductionApiResponse<{ token: string; user: User }>> {
    try {
      console.log('[ProductionAPI] 🔐 Logging in...');
      
      const response = await apiErrorHandler.smartRetry(
        () => fetch(`${this.baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        }).then(r => r.json()),
        '/auth/login',
        'POST'
      ) as any;

      if (response.success && response.access_token) {
        this.token = response.access_token;
        
        // Get user profile
        const userResponse = await this.getCurrentUser();
        if (userResponse.success && userResponse.user) {
          this.user = userResponse.user;
          await this.storeAuth();
          
          console.log('[ProductionAPI] ✅ Login successful');
          return {
            success: true,
            data: { token: this.token!, user: this.user! },
            source: 'production'
          };
        }
      }

      throw new Error('Login failed');
      
    } catch (error) {
      const errorContext = apiErrorHandler.analyzeApiError(error, '/auth/login', 'POST');
      const recommendations = apiErrorHandler.getErrorRecommendations(errorContext);
      
      console.log('[ProductionAPI] ❌ Login failed');
      return {
        success: false,
        source: 'production',
        error: errorContext,
        recommendations
      };
    }
  }

  async getCurrentUser(): Promise<ProductionApiResponse<{ user: User }>> {
    if (!this.token) {
      return { success: false, source: 'production' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/me`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      }).then(r => r.json()) as any;

      if (response.success && response.user) {
        this.user = response.user;
        return {
          success: true,
          user: response.user,
          source: 'production'
        };
      }

      return { success: false, source: 'production' };
      
    } catch (error) {
      const errorContext = apiErrorHandler.analyzeApiError(error, '/auth/me', 'GET');
      return {
        success: false,
        source: 'production',
        error: errorContext,
        recommendations: apiErrorHandler.getErrorRecommendations(errorContext)
      };
    }
  }

  async logout(): Promise<void> {
    this.token = null;
    this.user = null;
    await Promise.all([
      storage.remove('production_api_token'),
      storage.remove('production_api_user')
    ]);
    console.log('[ProductionAPI] 🚪 Logged out');
  }

  // ========= CONTACTS MANAGEMENT =========

  async getContacts(): Promise<ProductionApiResponse<Contact[]>> {
    try {
      console.log('[ProductionAPI] 📋 Fetching contacts...');
      
      const response = await apiErrorHandler.smartRetry(
        () => fetch(`${this.baseUrl}/contacts`).then(r => r.json()),
        '/contacts',
        'GET'
      ) as any;

      if (response.success && response.items) {
        this.setCache('contacts', response.items);
        
        console.log(`[ProductionAPI] ✅ Loaded ${response.items.length} contacts`);
        return {
          success: true,
          items: response.items,
          total: response.total,
          source: 'production'
        };
      }

      throw new Error('Failed to fetch contacts');
      
    } catch (error) {
      const errorContext = apiErrorHandler.analyzeApiError(error, '/contacts', 'GET');
      const recommendations = apiErrorHandler.getErrorRecommendations(errorContext);
      
      // Try cache
      const cached = this.getFromCache('contacts');
      if (cached) {
        console.log('[ProductionAPI] ✅ Using cached contacts');
        return {
          success: true,
          items: cached,
          source: 'cache',
          error: errorContext,
          recommendations
        };
      }

      // Fallback
      const fallbackContacts = this.getFallbackContacts();
      console.log('[ProductionAPI] ✅ Using fallback contacts');
      return {
        success: true,
        items: fallbackContacts,
        source: 'fallback',
        error: errorContext,
        recommendations
      };
    }
  }

  async createContact(contactData: Omit<Contact, 'id' | 'status' | 'createdAt'>): Promise<ProductionApiResponse<Contact>> {
    try {
      console.log('[ProductionAPI] 📝 Creating contact...');
      
      const response = await apiErrorHandler.smartRetry(
        () => fetch(`${this.baseUrl}/contacts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contactData)
        }).then(r => r.json()),
        '/contacts',
        'POST'
      ) as any;

      if (response.success && response.item) {
        this.invalidateCache('contacts');
        
        console.log('[ProductionAPI] ✅ Contact created successfully');
        return {
          success: true,
          item: response.item,
          source: 'production'
        };
      }

      throw new Error('Failed to create contact');
      
    } catch (error) {
      const errorContext = apiErrorHandler.analyzeApiError(error, '/contacts', 'POST');
      const recommendations = apiErrorHandler.getErrorRecommendations(errorContext);
      
      console.log('[ProductionAPI] ❌ Failed to create contact');
      throw {
        error: errorContext,
        recommendations,
        userMessage: apiErrorHandler.getUserFriendlyMessage(errorContext)
      };
    }
  }

  // ========= PAYMENTS =========

  async getPaymentMethods(): Promise<ProductionApiResponse<PaymentMethod[]>> {
    try {
      console.log('[ProductionAPI] 💳 Fetching payment methods...');
      
      const response = await apiErrorHandler.smartRetry(
        () => fetch(`${this.baseUrl}/payments/methods/list`).then(r => r.json()),
        '/payments/methods/list',
        'GET'
      ) as any;

      if (response.success && response.items) {
        this.setCache('payment_methods', response.items);
        
        console.log(`[ProductionAPI] ✅ Loaded ${response.items.length} payment methods`);
        return {
          success: true,
          items: response.items,
          source: 'production'
        };
      }

      throw new Error('Failed to fetch payment methods');
      
    } catch (error) {
      const errorContext = apiErrorHandler.analyzeApiError(error, '/payments/methods/list', 'GET');
      const recommendations = apiErrorHandler.getErrorRecommendations(errorContext);
      
      // Try cache
      const cached = this.getFromCache('payment_methods');
      if (cached) {
        console.log('[ProductionAPI] ✅ Using cached payment methods');
        return {
          success: true,
          items: cached,
          source: 'cache',
          error: errorContext,
          recommendations
        };
      }

      // Fallback
      const fallbackMethods = this.getFallbackPaymentMethods();
      console.log('[ProductionAPI] ✅ Using fallback payment methods');
      return {
        success: true,
        items: fallbackMethods,
        source: 'fallback',
        error: errorContext,
        recommendations
      };
    }
  }

  async createPayment(paymentData: {
    amount: number;
    method: string;
    description: string;
    bookingId?: string;
  }): Promise<ProductionApiResponse<Payment>> {
    try {
      console.log('[ProductionAPI] 💰 Creating payment...');
      
      const response = await apiErrorHandler.smartRetry(
        () => fetch(`${this.baseUrl}/payments/checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paymentData)
        }).then(r => r.json()),
        '/payments/checkout',
        'POST'
      ) as any;

      if (response.success && response.item) {
        console.log('[ProductionAPI] ✅ Payment created successfully');
        return {
          success: true,
          item: response.item,
          source: 'production'
        };
      }

      throw new Error('Failed to create payment');
      
    } catch (error) {
      const errorContext = apiErrorHandler.analyzeApiError(error, '/payments/checkout', 'POST');
      const recommendations = apiErrorHandler.getErrorRecommendations(errorContext);
      
      console.log('[ProductionAPI] ❌ Failed to create payment');
      throw {
        error: errorContext,
        recommendations,
        userMessage: apiErrorHandler.getUserFriendlyMessage(errorContext)
      };
    }
  }

  // ========= HEALTH CHECK =========

  async healthCheck(): Promise<ProductionApiResponse<{ ok: boolean; ts?: string; mode?: string }>> {
    try {
      const response = await apiFetch<any>('/health', { method: 'GET', timeoutMs: 8000 });
      if (response?.ok) {
        console.log('[ProductionAPI] ✅ Health check passed');
        return { success: true, data: response, source: 'production' };
      }
      return { success: false, source: 'production' };
    } catch (error) {
      const errorContext = apiErrorHandler.analyzeApiError(error, '/health', 'GET');
      return { success: false, source: 'production', error: errorContext, recommendations: apiErrorHandler.getErrorRecommendations(errorContext) };
    }
  }

  // ========= UTILITY METHODS =========

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  getUser(): User | null {
    return this.user;
  }

  getToken(): string | null {
    return this.token;
  }

  private async storeAuth(): Promise<void> {
    if (this.token && this.user) {
      await Promise.all([
        storage.set('production_api_token', this.token),
        storage.set('production_api_user', JSON.stringify(this.user))
      ]);
    }
  }

  private async loadStoredAuth(): Promise<void> {
    try {
      const [token, userJson] = await Promise.all([
        storage.get('production_api_token'),
        storage.get('production_api_user')
      ]);
      
      if (token && userJson) {
        this.token = token;
        this.user = JSON.parse(userJson);
        
        // Verify token is still valid
        const userCheck = await this.getCurrentUser();
        if (!userCheck.success) {
          await this.logout();
        }
      }
    } catch (error) {
      console.log('[ProductionAPI] Failed to load stored auth:', error);
    }
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private invalidateCache(key: string): void {
    this.cache.delete(key);
  }

  private getFallbackContacts(): Contact[] {
    return [
      {
        id: 'fallback-c1',
        fullName: 'Nguyễn Văn A',
        email: 'a@example.com',
        phone: '0900000001',
        message: 'Tư vấn thiết kế biệt thự',
        status: 'new',
        createdAt: '2025-10-02T01:00:00Z'
      },
      {
        id: 'fallback-c2',
        fullName: 'Trần Thị B',
        email: 'b@example.com',
        phone: '0900000002',
        message: 'Báo giá nhà phố',
        status: 'read',
        createdAt: '2025-10-02T03:00:00Z'
      }
    ];
  }

  private getFallbackPaymentMethods(): PaymentMethod[] {
    return [
      { code: 'cash', name: 'Tiền mặt', capture: true },
      { code: 'bank', name: 'Chuyển khoản', capture: true },
      { code: 'momo', name: 'MoMo', capture: false },
      { code: 'zalopay', name: 'ZaloPay', capture: false },
      { code: 'card', name: 'Thẻ', capture: false }
    ];
  }
}

// Lazy singleton to avoid SSR issues
let productionApiInstance: ProductionApiService | null = null;

export function getProductionApiService(): ProductionApiService {
  if (!productionApiInstance) {
    productionApiInstance = new ProductionApiService();
  }
  return productionApiInstance;
}

// Backwards-compatible singleton export used by older modules
export const productionApiService = getProductionApiService();

export default getProductionApiService;