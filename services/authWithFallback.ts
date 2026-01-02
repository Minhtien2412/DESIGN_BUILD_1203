/**
 * Auth Service with Multi-Tier Fallback
 * 
 * Strategy:
 * 1. Try Production Server (https://baotienweb.cloud)
 * 2. Fallback to SSH Tunnel (http://localhost:5000) 
 * 3. Fallback to Local Mock (http://localhost:3001)
 * 4. Ultimate Fallback: Offline Mock Auth
 * 
 * Usage:
 * - SSH Tunnel Command: ssh -L 5000:127.0.0.1:4000 root@103.200.20.100
 * - Local Mock Server: npm run mock-auth (or node mock-auth-server.js)
 */

import ENV from '@/config/env';
import { getApiBaseUrl, setApiBaseUrl, setAuthTokens } from './apiClient';
import { login as apiLogin, register as apiRegister, AuthResponse, LoginData, RegisterData } from './authApi';

// ============================================================================
// Types
// ============================================================================

export interface FallbackConfig {
  name: string;
  baseUrl: string;
  timeout: number;
  priority: number;
}

export interface AuthResult {
  success: boolean;
  response?: AuthResponse;
  error?: Error;
  serverUsed?: string;
  fallbackUsed: boolean;
}

// ============================================================================
// Server Configurations
// ============================================================================

const SERVERS: FallbackConfig[] = [
  {
    name: 'Production VPS (BaoTien)',
    baseUrl: 'https://baotienweb.cloud',
    timeout: 8000,
    priority: 1,
  },
  {
    name: 'SSH Tunnel (localhost:5000)',
    baseUrl: 'http://localhost:5000',
    timeout: 5000,
    priority: 2,
  },
  {
    name: 'Local Mock Server',
    baseUrl: 'http://localhost:3001',
    timeout: 3000,
    priority: 3,
  },
];

// ============================================================================
// Health Check
// ============================================================================

async function checkServerHealth(config: FallbackConfig): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    const response = await fetch(`${config.baseUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log(`[AuthFallback] ✅ ${config.name} is healthy`);
      return true;
    }
    
    console.log(`[AuthFallback] ⚠️ ${config.name} returned status ${response.status}`);
    return false;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log(`[AuthFallback] ⏱️ ${config.name} timeout after ${config.timeout}ms`);
    } else {
      console.log(`[AuthFallback] ❌ ${config.name} health check failed:`, error.message);
    }
    return false;
  }
}

async function findAvailableServer(): Promise<FallbackConfig | null> {
  console.log('[AuthFallback] 🔍 Checking server availability...');
  
  // Try servers in priority order
  for (const server of SERVERS) {
    const isHealthy = await checkServerHealth(server);
    if (isHealthy) {
      console.log(`[AuthFallback] ✅ Using: ${server.name}`);
      return server;
    }
  }
  
  console.log('[AuthFallback] ⚠️ No servers available, will use offline mock');
  return null;
}

// ============================================================================
// Offline Mock Authentication
// ============================================================================

const MOCK_USERS = [
  {
    id: 'mock-user-1',
    email: 'admin@test.com',
    name: 'Admin User',
    role: 'admin',
    roleName: 'Administrator',
    password: '123456',
  },
  {
    id: 'mock-user-2',
    email: 'user@test.com',
    name: 'Test User',
    role: 'client',
    roleName: 'Client',
    password: '123456',
  },
  {
    id: 'mock-user-3',
    email: 'lamchankhan113@gmail.com',
    name: 'Lam Chan Khan',
    role: 'client',
    roleName: 'Client',
    password: '123456',
  },
];

function generateMockToken(userId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return `mock_token_${userId}_${timestamp}_${random}`;
}

async function mockLogin(data: LoginData): Promise<AuthResponse> {
  console.log('[AuthFallback] 🎭 Using offline mock authentication');
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const user = MOCK_USERS.find(u => u.email === data.email && u.password === data.password);
  
  if (!user) {
    throw new Error('Email hoặc mật khẩu không đúng');
  }
  
  const accessToken = generateMockToken(user.id);
  const refreshToken = generateMockToken(user.id + '_refresh');
  
  return {
    message: 'Login successful (offline mode)',
    success: true,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.name,
      role: user.role,
      roleName: user.roleName,
      createdAt: new Date().toISOString(),
      isActive: true,
    },
    accessToken,
    refreshToken,
    expiresIn: '7d',
    refreshExpiresIn: '30d',
  };
}

async function mockRegister(data: RegisterData): Promise<AuthResponse> {
  console.log('[AuthFallback] 🎭 Using offline mock registration');
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if user exists
  const existingUser = MOCK_USERS.find(u => u.email === data.email);
  if (existingUser) {
    throw new Error('Email đã được sử dụng');
  }
  
  const newUser = {
    id: `mock-user-${Date.now()}`,
    email: data.email,
    name: data.fullName,
    role: data.role || 'client',
    roleName: (data.role === 'client' || !data.role) ? 'Client' : 
              data.role === 'contractor' ? 'Contractor' :
              data.role === 'company' ? 'Company' : 
              'Architect',
    password: data.password,
  };
  
  MOCK_USERS.push(newUser);
  
  const accessToken = generateMockToken(newUser.id);
  const refreshToken = generateMockToken(newUser.id + '_refresh');
  
  return {
    message: 'Registration successful (offline mode)',
    success: true,
    user: {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.name,
      role: newUser.role,
      roleName: newUser.roleName,
      createdAt: new Date().toISOString(),
      isActive: true,
    },
    accessToken,
    refreshToken,
    expiresIn: '7d',
    refreshExpiresIn: '30d',
  };
}

// ============================================================================
// Main Auth Functions with Fallback
// ============================================================================

/**
 * Login with automatic server fallback
 */
export async function loginWithFallback(data: LoginData): Promise<AuthResult> {
  console.log('[AuthFallback] 🚀 Starting login with fallback...');
  
  // Try to find an available server
  const server = await findAvailableServer();
  
  if (!server) {
    // No servers available - use offline mock
    try {
      const response = await mockLogin(data);
      await setAuthTokens(response.accessToken, response.refreshToken);
      
      return {
        success: true,
        response,
        serverUsed: 'Offline Mock',
        fallbackUsed: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error,
        serverUsed: 'Offline Mock',
        fallbackUsed: true,
      };
    }
  }
  
  // Try login with available server
  try {
    // Temporarily override ENV base URL
    const originalBaseUrl = ENV.API_BASE_URL;
    const originalAxiosBase = getApiBaseUrl();
    (ENV as any).API_BASE_URL = server.baseUrl;
    setApiBaseUrl(server.baseUrl);
    
    try {
      const response = await apiLogin(data);
      return {
        success: true,
        response,
        serverUsed: server.name,
        fallbackUsed: server.priority > 1,
      };
    } finally {
      (ENV as any).API_BASE_URL = originalBaseUrl;
      setApiBaseUrl(originalAxiosBase);
    }
  } catch (error: any) {
    console.error(`[AuthFallback] ❌ Login failed on ${server.name}:`, error.message);
    
    // Ultimate fallback to offline mock
    try {
      const response = await mockLogin(data);
      await setAuthTokens(response.accessToken, response.refreshToken);
      
      return {
        success: true,
        response,
        serverUsed: 'Offline Mock',
        fallbackUsed: true,
      };
    } catch (mockError: any) {
      return {
        success: false,
        error: mockError,
        serverUsed: 'Offline Mock',
        fallbackUsed: true,
      };
    }
  }
}

/**
 * Register with automatic server fallback
 */
export async function registerWithFallback(data: RegisterData): Promise<AuthResult> {
  console.log('[AuthFallback] 🚀 Starting registration with fallback...');
  
  // Try to find an available server
  const server = await findAvailableServer();
  
  if (!server) {
    // No servers available - use offline mock
    try {
      const response = await mockRegister(data);
      await setAuthTokens(response.accessToken, response.refreshToken);
      
      return {
        success: true,
        response,
        serverUsed: 'Offline Mock',
        fallbackUsed: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error,
        serverUsed: 'Offline Mock',
        fallbackUsed: true,
      };
    }
  }
  
  // Try register with available server
  try {
    // Temporarily override ENV base URL
    const originalBaseUrl = ENV.API_BASE_URL;
    const originalAxiosBase = getApiBaseUrl();
    (ENV as any).API_BASE_URL = server.baseUrl;
    setApiBaseUrl(server.baseUrl);
    
    try {
      const response = await apiRegister(data);
      return {
        success: true,
        response,
        serverUsed: server.name,
        fallbackUsed: server.priority > 1,
      };
    } finally {
      (ENV as any).API_BASE_URL = originalBaseUrl;
      setApiBaseUrl(originalAxiosBase);
    }
  } catch (error: any) {
    console.error(`[AuthFallback] ❌ Registration failed on ${server.name}:`, error.message);
    
    // Ultimate fallback to offline mock
    try {
      const response = await mockRegister(data);
      await setAuthTokens(response.accessToken, response.refreshToken);
      
      return {
        success: true,
        response,
        serverUsed: 'Offline Mock',
        fallbackUsed: true,
      };
    } catch (mockError: any) {
      return {
        success: false,
        error: mockError,
        serverUsed: 'Offline Mock',
        fallbackUsed: true,
      };
    }
  }
}

/**
 * Helper to show user which server is being used
 */
export function getServerStatusMessage(result: AuthResult): string {
  if (!result.success) {
    return 'Đăng nhập thất bại';
  }
  
  if (result.serverUsed === 'Offline Mock') {
    return '⚠️ Chế độ offline - Dữ liệu demo';
  }
  
  if (result.fallbackUsed) {
    return `✅ Kết nối thành công (${result.serverUsed})`;
  }
  
  return '✅ Kết nối Production server';
}

// ============================================================================
// SSH Tunnel Helper
// ============================================================================

export function getSSHTunnelCommand(): string {
  return 'ssh -L 5000:127.0.0.1:4000 root@103.200.20.100';
}

export function getSSHTunnelInstructions(): string {
  return `
Để sử dụng SSH Tunnel:

1. Mở terminal mới
2. Chạy lệnh: ${getSSHTunnelCommand()}
3. Nhập password VPS
4. Giữ terminal chạy
5. Restart app để kết nối qua localhost:5000

Hoặc sử dụng chế độ offline với mock data.
  `.trim();
}
