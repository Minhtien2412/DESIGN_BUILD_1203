import ENV from '@/config/env';
import { apiFetch } from '@/services/api';
import { getItem, setItem } from '@/utils/storage';

// API Key management for production backend integration
export interface ApiKeyConfig {
  apiKey: string;
  keyType: 'development' | 'production';
  expiresAt?: string;
  permissions?: string[];
  userId?: string;
}

export interface ApiKeyResponse {
  success: boolean;
  data?: {
    api_key: string;
    expires_at?: string;
    permissions?: string[];
    key_type?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

class ApiKeyManager {
  private static instance: ApiKeyManager;
  private currentApiKey: ApiKeyConfig | null = null;
  private readonly STORAGE_KEY = 'api_key_config';

  static getInstance(): ApiKeyManager {
    if (!ApiKeyManager.instance) {
      ApiKeyManager.instance = new ApiKeyManager();
    }
    return ApiKeyManager.instance;
  }

  private constructor() {
    // Load API key synchronously from environment first
    this.loadApiKeyFromEnv();
    // Then async load from storage in background
    this.loadStoredApiKey().catch(err => {
      console.warn('[ApiKeyManager] Background load failed:', err);
    });
  }

  /**
   * Load API key synchronously from environment variable
   */
  private loadApiKeyFromEnv(): void {
    try {
      const envApiKey = ENV.API_KEY;
      
      if (envApiKey) {
        console.log('[ApiKeyManager] ✅ Loading API key from ENV:', envApiKey.substring(0, 15) + '...');
        this.currentApiKey = {
          apiKey: envApiKey,
          keyType: 'production',
          permissions: ['read', 'write'],
        };
        
        // Immediately set in api.ts
        import('@/services/api').then(api => {
          api.setApiKey(envApiKey);
          console.log('[ApiKeyManager] ✅ API key set in api.ts');
        });
      } else {
        console.error('[ApiKeyManager] ❌ No API key found in ENV config!');
        console.error('[ApiKeyManager] Check app.config.ts and .env file');
      }
    } catch (error) {
      console.error('[ApiKeyManager] ❌ Failed to load API key from env:', error);
    }
  }

  /**
   * Load API key from secure storage or environment variable (async backup)
   */
  private async loadStoredApiKey(): Promise<void> {
    try {
      // If already loaded from env, just save to storage and return
      if (this.currentApiKey) {
        await this.saveApiKey(this.currentApiKey);
        return;
      }

      // Otherwise try loading from storage
      const stored = await getItem(this.STORAGE_KEY);
      if (stored) {
        const config: ApiKeyConfig = JSON.parse(stored);
        // Check if key is still valid
        if (this.isKeyValid(config)) {
          this.currentApiKey = config;
          console.log('[ApiKeyManager] API key loaded from storage');
        } else {
          await this.clearStoredApiKey();
          console.log('[ApiKeyManager] Stored API key expired');
        }
      } else {
        console.log('[ApiKeyManager] No API key found in storage');
      }
    } catch (error) {
      console.warn('[ApiKeyManager] Failed to load stored API key:', error);
    }
  }

  /**
   * Save API key to secure storage
   */
  private async saveApiKey(config: ApiKeyConfig): Promise<void> {
    try {
      await setItem(this.STORAGE_KEY, JSON.stringify(config));
      this.currentApiKey = config;
    } catch (error) {
      console.error('[ApiKeyManager] Failed to save API key:', error);
      throw new Error('Failed to save API key securely');
    }
  }

  /**
   * Clear stored API key
   */
  private async clearStoredApiKey(): Promise<void> {
    try {
      await setItem(this.STORAGE_KEY, '');
      this.currentApiKey = null;
    } catch (error) {
      console.warn('[ApiKeyManager] Failed to clear API key:', error);
    }
  }

  /**
   * Check if API key is still valid
   */
  private isKeyValid(config: ApiKeyConfig): boolean {
    if (!config.expiresAt) return true; // No expiration
    return new Date(config.expiresAt) > new Date();
  }

  /**
   * Get current API key
   */
  getCurrentApiKey(): string | null {
    if (!this.currentApiKey || !this.isKeyValid(this.currentApiKey)) {
      return null;
    }
    return this.currentApiKey.apiKey;
  }

  /**
   * Get API key configuration
   */
  getApiKeyConfig(): ApiKeyConfig | null {
    return this.currentApiKey;
  }

  /**
   * Generate new API key by authenticating with user credentials
   */
  async generateApiKey(credentials: {
    account: string;
    password: string;
  }): Promise<ApiKeyConfig> {
    try {
      // First authenticate to get JWT token
      const authResponse = await apiFetch<{
        success: boolean;
        data?: { token: string; user?: any };
        error?: { code: string; message: string };
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (!authResponse.success || !authResponse.data?.token) {
        throw new Error(authResponse.error?.message || 'Authentication failed');
      }

      // Use JWT token to request API key
      const apiKeyResponse = await apiFetch<ApiKeyResponse>('/auth/api-key', {
        method: 'POST',
        token: authResponse.data.token,
        body: JSON.stringify({
          key_type: this.getEnvironmentKeyType(),
          permissions: ['read', 'write'], // Default permissions
        }),
      });

      if (!apiKeyResponse.success || !apiKeyResponse.data?.api_key) {
        throw new Error(apiKeyResponse.error?.message || 'Failed to generate API key');
      }

      const config: ApiKeyConfig = {
        apiKey: apiKeyResponse.data.api_key,
        keyType: (apiKeyResponse.data.key_type as any) || this.getEnvironmentKeyType(),
        expiresAt: apiKeyResponse.data.expires_at,
        permissions: apiKeyResponse.data.permissions,
        userId: authResponse.data.user?.id,
      };

      await this.saveApiKey(config);
      return config;
    } catch (error) {
      console.error('[ApiKeyManager] Failed to generate API key:', error);
      throw error;
    }
  }

  /**
   * Refresh API key if needed
   */
  async refreshApiKey(): Promise<ApiKeyConfig | null> {
    if (!this.currentApiKey) return null;

    try {
      const response = await apiFetch<ApiKeyResponse>('/auth/api-key/refresh', {
        method: 'POST',
        headers: {
          'X-API-Key': this.currentApiKey.apiKey,
        },
      });

      if (response.success && response.data?.api_key) {
        const config: ApiKeyConfig = {
          ...this.currentApiKey,
          apiKey: response.data.api_key,
          expiresAt: response.data.expires_at,
        };

        await this.saveApiKey(config);
        return config;
      }
    } catch (error) {
      console.warn('[ApiKeyManager] Failed to refresh API key:', error);
    }

    return null;
  }

  /**
   * Revoke current API key
   */
  async revokeApiKey(): Promise<void> {
    if (!this.currentApiKey) return;

    try {
      await apiFetch('/auth/api-key/revoke', {
        method: 'DELETE',
        headers: {
          'X-API-Key': this.currentApiKey.apiKey,
        },
      });
    } catch (error) {
      console.warn('[ApiKeyManager] Failed to revoke API key:', error);
    } finally {
      await this.clearStoredApiKey();
    }
  }

  /**
   * Determine environment-based key type
   */
  private getEnvironmentKeyType(): 'development' | 'production' {
    // Use EXPO_PUBLIC_ENV if available, otherwise fallback to __DEV__ check
    const ENV = process.env.EXPO_PUBLIC_ENV ?? (__DEV__ ? "development" : "production");
    return ENV === 'production' ? 'production' : 'development';
  }

  /**
   * Get API headers with current key
   */
  getApiHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    const apiKey = this.getCurrentApiKey();
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    return headers;
  }

  /**
   * Check if API key is required for the current environment
   */
  isApiKeyRequired(): boolean {
    return this.getEnvironmentKeyType() === 'production';
  }
}

// Export singleton instance
export const apiKeyManager = ApiKeyManager.getInstance();

// Convenience functions
export const getCurrentApiKey = () => apiKeyManager.getCurrentApiKey();
export const generateApiKey = (credentials: { account: string; password: string }) => 
  apiKeyManager.generateApiKey(credentials);
export const revokeApiKey = () => apiKeyManager.revokeApiKey();
export const getApiHeaders = () => apiKeyManager.getApiHeaders();
export const isApiKeyRequired = () => apiKeyManager.isApiKeyRequired();
