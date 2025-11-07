/**
 * Enhanced Error Handling & API Connectivity Management
 * Xử lý lỗi API một cách thông minh với security considerations
 */

import { apiFetch } from './api';

export interface ApiErrorContext {
  endpoint: string;
  method: string;
  timestamp: Date;
  errorType: 'network' | 'auth' | 'server' | 'timeout' | 'unknown';
  isRetryable: boolean;
  fallbackAvailable: boolean;
}

export interface ConnectivityStatus {
  isOnline: boolean;
  apiAvailable: boolean;
  authAvailable: boolean;
  lastHealthCheck: Date | null;
  retryCount: number;
}

class ApiErrorHandler {
  private connectivityStatus: ConnectivityStatus = {
    isOnline: true,
    apiAvailable: false,
    authAvailable: false,
    lastHealthCheck: null,
    retryCount: 0
  };

  private readonly MAX_RETRY_COUNT = 3;
  private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
  private healthCheckTimer: any = null;
  private healthCheckInFlight: Promise<boolean> | null = null;
  private lastHealthResult: { ok: boolean; at: number } | null = null;

  constructor() {
    this.startHealthMonitoring();
  }

  // Phân tích lỗi API và đưa ra context
  analyzeApiError(error: any, endpoint: string, method: string = 'GET'): ApiErrorContext {
    const context: ApiErrorContext = {
      endpoint,
      method,
      timestamp: new Date(),
      errorType: 'unknown',
      isRetryable: false,
      fallbackAvailable: false
    };

    // Phân tích message để xác định loại lỗi
    const errorMessage = error?.message || error?.toString() || '';
    
    if (errorMessage.includes('Development server not available')) {
      context.errorType = 'server';
      context.isRetryable = true;
      context.fallbackAvailable = true;
      console.log('[ErrorHandler] 🔧 Development server unavailable - normal in offline development');
    } else if (errorMessage.includes('auth') || endpoint.includes('/auth/')) {
      context.errorType = 'auth';
      context.isRetryable = true;
      context.fallbackAvailable = endpoint.includes('/auth/me') ? false : true;
      console.log('[ErrorHandler] 🔐 Auth endpoint unavailable - expected when not authenticated');
    } else if (error?.status === 503) {
      context.errorType = 'server';
      context.isRetryable = true;
      context.fallbackAvailable = true;
      console.log('[ErrorHandler] 🚧 Server busy (503) - will retry');
    } else if (error?.status === 404) {
      context.errorType = 'server';
      context.isRetryable = false;
      context.fallbackAvailable = true;
      console.log('[ErrorHandler] 📭 Endpoint not found (404) - using fallback');
    } else if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
      context.errorType = 'network';
      context.isRetryable = true;
      context.fallbackAvailable = true;
      console.log('[ErrorHandler] 📡 Network timeout - will retry');
    }

    // Cập nhật connectivity status
    this.updateConnectivityStatus(context);
    
    return context;
  }

  // Thực hiện smart retry với backoff
  async smartRetry<T>(
    operation: () => Promise<T>,
    endpoint: string,
    method: string = 'GET',
    maxRetries: number = this.MAX_RETRY_COUNT
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[ErrorHandler] Attempt ${attempt}/${maxRetries} for ${endpoint}`);
        const result = await operation();
        
        // Reset retry count on success
        this.connectivityStatus.retryCount = 0;
        return result;
        
      } catch (error) {
        lastError = error;
        const context = this.analyzeApiError(error, endpoint, method);
        
        if (!context.isRetryable || attempt === maxRetries) {
          console.log(`[ErrorHandler] ❌ Final attempt failed for ${endpoint}`);
          break;
        }
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`[ErrorHandler] ⏳ Waiting ${delay}ms before retry...`);
        await this.delay(delay);
      }
    }
    
    throw lastError;
  }

  // Kiểm tra sức khỏe API
  async performHealthCheck(): Promise<boolean> {
    // Coalesce concurrent calls
    if (this.healthCheckInFlight) return this.healthCheckInFlight;
    // Return cached result within interval window
    if (this.lastHealthResult && Date.now() - this.lastHealthResult.at < this.HEALTH_CHECK_INTERVAL) {
      return this.lastHealthResult.ok;
    }
    this.healthCheckInFlight = (async () => {
      try {
      console.log('[ErrorHandler] 🔍 Performing API health check...');
      
      const response = await apiFetch('/health', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' }
      }) as any;
      
      const isHealthy = response?.ok || response?.body?.ok || response?.status === 'ok';
      
      this.connectivityStatus.apiAvailable = isHealthy;
      this.connectivityStatus.lastHealthCheck = new Date();
      this.lastHealthResult = { ok: !!isHealthy, at: Date.now() };
      
      if (isHealthy) {
        console.log('[ErrorHandler] ✅ API health check passed');
        // Skip extra auth probe to avoid noise in development
      } else {
        console.log('[ErrorHandler] ⚠️ API health check inconclusive');
      }
      
      return isHealthy;
      
    } catch (error) {
      console.log('[ErrorHandler] ❌ API health check failed:', (error as Error)?.message || 'Unknown error');
      this.connectivityStatus.apiAvailable = false;
      this.connectivityStatus.lastHealthCheck = new Date();
      this.lastHealthResult = { ok: false, at: Date.now() };
      return false;
    } finally {
      this.healthCheckInFlight = null;
    }})();
    return this.healthCheckInFlight;
  }

  // Kiểm tra auth endpoints
  private async checkAuthEndpoints(): Promise<void> {
    try {
      // Test non-sensitive auth endpoint
      await apiFetch('/auth/me');
      this.connectivityStatus.authAvailable = true;
      console.log('[ErrorHandler] ✅ Auth endpoints available');
    } catch (error) {
      this.connectivityStatus.authAvailable = false;
      console.log('[ErrorHandler] 🔐 Auth endpoints unavailable (normal in development)');
    }
  }

  // Đưa ra recommendations dựa trên lỗi
  getErrorRecommendations(context: ApiErrorContext): string[] {
    const recommendations: string[] = [];
    
    switch (context.errorType) {
      case 'server':
        recommendations.push('🔧 Server không khả dụng - sử dụng fallback data');
        recommendations.push('💡 Khởi động mock server: node mock-api-server.js');
        if (context.fallbackAvailable) {
          recommendations.push('✅ Fallback data sẵn sàng - app sẽ tiếp tục hoạt động');
        }
        break;
        
      case 'auth':
        recommendations.push('🔐 Auth endpoints không khả dụng');
        recommendations.push('✅ Chức năng cơ bản vẫn hoạt động với dữ liệu public');
        recommendations.push('💡 Đăng nhập khi server auth sẵn sàng');
        break;
        
      case 'network':
        recommendations.push('📡 Vấn đề kết nối mạng');
        recommendations.push('🔄 Đang thử kết nối lại...');
        recommendations.push('✅ Dữ liệu cache/offline vẫn khả dụng');
        break;
        
      default:
        recommendations.push('⚠️ Lỗi không xác định');
        recommendations.push('🔄 Đang thử các phương án khôi phục...');
    }
    
    return recommendations;
  }

  // Lấy user-friendly error message
  getUserFriendlyMessage(context: ApiErrorContext): string {
    switch (context.errorType) {
      case 'server':
        return 'Máy chủ tạm thời không khả dụng. Đang sử dụng dữ liệu có sẵn.';
      case 'auth':
        return 'Chức năng đăng nhập tạm thời không khả dụng. Vẫn có thể xem nội dung công khai.';
      case 'network':
        return 'Kết nối mạng không ổn định. Đang thử kết nối lại...';
      default:
        return 'Đã xảy ra lỗi tạm thời. Ứng dụng sẽ tiếp tục hoạt động với dữ liệu có sẵn.';
    }
  }

  // Kiểm tra xem có nên hiển thị error cho user không
  shouldShowErrorToUser(context: ApiErrorContext): boolean {
    // Không hiển thị lỗi development server cho user
    if (context.errorType === 'server' && context.fallbackAvailable) {
      return false;
    }
    
    // Không hiển thị lỗi auth trong development
    if (context.errorType === 'auth' && process.env.EXPO_PUBLIC_ENV !== 'production') {
      return false;
    }
    
    return true;
  }

  // Lấy connectivity status hiện tại
  getConnectivityStatus(): ConnectivityStatus {
    return { ...this.connectivityStatus };
  }

  // Start health monitoring
  private startHealthMonitoring(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    
    // Initial health check
    setTimeout(() => this.performHealthCheck(), 1000);
    
    // Disable periodic interval to avoid duplicate logs; callers can invoke on demand
    this.healthCheckTimer = null;
  }

  // Stop health monitoring
  stopHealthMonitoring(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  private updateConnectivityStatus(context: ApiErrorContext): void {
    this.connectivityStatus.retryCount++;
    
    if (context.errorType === 'auth') {
      this.connectivityStatus.authAvailable = false;
    }
    
    if (context.errorType === 'server' || context.errorType === 'network') {
      this.connectivityStatus.apiAvailable = false;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton
export const apiErrorHandler = new ApiErrorHandler();
export default apiErrorHandler;