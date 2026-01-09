/**
 * MySQL Authentication Service - Backend API Version
 * Updated to use backend API endpoints for MySQL authentication
 */

import { AuthUser, Role } from '@/types/auth';
import { deleteItem, getItem, setItem } from '@/utils/storage';
import { apiFetch, clearToken as clearApiToken, setToken as setApiToken } from './api';

// Authentication interfaces
export interface MySQLAuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  token?: string;
  userId?: number;
}

export interface MySQLSignUpRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  role?: 'admin' | 'manager' | 'designer' | 'contractor' | 'client';
}

export interface MySQLSignInRequest {
  account: string; // username hoặc email
  password: string;
}

export interface MySQLUser {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: 'admin' | 'manager' | 'designer' | 'contractor' | 'client';
  is_active: boolean;
  avatar_url: string | null;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  metadata: any;
}

/**
 * Convert MySQL user to AuthUser
 */
function convertToAuthUser(mysqlUser: MySQLUser): AuthUser {
  return {
    id: mysqlUser.id.toString(),
    name: mysqlUser.full_name || mysqlUser.username,
    email: mysqlUser.email,
    phone: mysqlUser.phone || undefined,
    role: mysqlUser.role as Role,
    companies: [{
      id: 'default-mysql',
      name: 'MySQL Database',
      description: 'MySQL authenticated user',
      roles: [mysqlUser.role as Role],
      permissions: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }],
    current_company_id: 'default-mysql',
    is_admin: mysqlUser.role === 'admin',
    scopes: [],
    global_roles: [mysqlUser.role as Role],
    reward_points: 100,
    is_active: mysqlUser.is_active,
    avatar: mysqlUser.avatar_url || undefined,
    created_at: mysqlUser.created_at,
    updated_at: mysqlUser.updated_at
  };
}

/**
 * Sign up user với MySQL via backend API
 */
export async function mySQLSignUp(request: MySQLSignUpRequest): Promise<MySQLAuthResponse> {
  try {
    console.log('[MySQLAuth] 📝 Sign up attempt via backend API:', request.username);

    const response = await apiFetch('/api/mysql/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data: request
    });

    if (response?.success && response?.user) {
      const authUser = convertToAuthUser(response.user);
      
      // Save session
      await setItem('mysql_auth_user', JSON.stringify(authUser));
      await setItem('mysql_auth_token', response.token || '');
      await setItem('mysql_user_id', response.userId?.toString() || '');
      if (response.token) setApiToken(response.token);

      console.log('[MySQLAuth] ✅ Sign up successful:', authUser.name);
      
      return {
        success: true,
        message: response.message,
        user: authUser,
        token: response.token,
        userId: response.userId
      };
    } else {
      console.error('[MySQLAuth] ❌ Sign up failed:', response.message);
      return {
        success: false,
        message: response.message
      };
    }

  } catch (error: any) {
    console.error('[MySQLAuth] ❌ Sign up API call failed:', error.message);
    return {
      success: false,
      message: `Sign up failed: ${error.message}`
    };
  }
}

/**
 * Sign in user với MySQL via backend API
 */
export async function mySQLSignIn(account: string, password: string): Promise<MySQLAuthResponse> {
  try {
    console.log('[MySQLAuth] 🔐 Sign in attempt via backend API:', account);

    const response = await apiFetch('/api/mysql/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data: { account, password }
    });

    if (response?.success && response?.user) {
      const authUser = convertToAuthUser(response.user);
      
      // Save session
      await setItem('mysql_auth_user', JSON.stringify(authUser));
      await setItem('mysql_auth_token', response.token || '');
      await setItem('mysql_user_id', response.user.id.toString());
      if (response.token) setApiToken(response.token);

      console.log('[MySQLAuth] ✅ Sign in successful:', authUser.name);
      
      return {
        success: true,
        message: response.message,
        user: authUser,
        token: response.token
      };
    } else {
      console.error('[MySQLAuth] ❌ Sign in failed:', response.message);
      return {
        success: false,
        message: response.message
      };
    }

  } catch (error: any) {
    console.error('[MySQLAuth] ❌ Sign in API call failed:', error.message);
    return {
      success: false,
      message: `Sign in failed: ${error.message}`
    };
  }
}

/**
 * Get current MySQL session
 */
export async function getMySQLCurrentSession(): Promise<AuthUser | null> {
  try {
    const userJson = await getItem('mysql_auth_user');
    const token = await getItem('mysql_auth_token');
    
    if (userJson && token) {
      const user = JSON.parse(userJson) as AuthUser;
      console.log('[MySQLAuth] 📱 Session restored:', user.name);
      setApiToken(token);
      return user;
    }
    
    return null;
  } catch (error) {
    console.error('[MySQLAuth] ❌ Failed to get session:', error);
    return null;
  }
}

/**
 * Sign out từ MySQL session
 */
export async function mySQLSignOut(): Promise<void> {
  try {
    await deleteItem('mysql_auth_user');
    await deleteItem('mysql_auth_token');
    await deleteItem('mysql_user_id');
    clearApiToken();
    
    console.log('[MySQLAuth] 👋 Signed out successfully');
  } catch (error) {
    console.error('[MySQLAuth] ❌ Sign out error:', error);
  }
}

/**
 * Ensure admin user exists via backend API
 */
export async function ensureAdminUser(): Promise<{ success: boolean; message: string; credentials?: any }> {
  try {
    console.log('[MySQLAuth] 👑 Ensuring admin user exists...');

  const response = await apiFetch('/api/mysql/ensure-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.success) {
      console.log('[MySQLAuth] ✅ Admin user ready');
      return {
        success: true,
        message: response.message,
        credentials: response.credentials
      };
    } else {
      console.error('[MySQLAuth] ❌ Admin user setup failed:', response.message);
      return {
        success: false,
        message: response.message
      };
    }

  } catch (error: any) {
    console.error('[MySQLAuth] ❌ Admin user API call failed:', error.message);
    return {
      success: false,
      message: `Admin user setup failed: ${error.message}`
    };
  }
}

/**
 * Find user by username via backend API
 */
export async function findUserByUsername(username: string): Promise<MySQLUser | null> {
  try {
  const response = await apiFetch(`/api/mysql/user/username/${encodeURIComponent(username)}`);
    
    if (response.success && response.user) {
      return response.user as MySQLUser;
    }
    
    return null;
  } catch (error) {
    console.error('[MySQLAuth] ❌ Find user by username failed:', error);
    return null;
  }
}

/**
 * Find user by email via backend API
 */
export async function findUserByEmail(email: string): Promise<MySQLUser | null> {
  try {
  const response = await apiFetch(`/api/mysql/user/email/${encodeURIComponent(email)}`);
    
    if (response.success && response.user) {
      return response.user as MySQLUser;
    }
    
    return null;
  } catch (error) {
    console.error('[MySQLAuth] ❌ Find user by email failed:', error);
    return null;
  }
}
