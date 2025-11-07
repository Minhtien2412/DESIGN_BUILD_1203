/**
 * Authentication Service - Design Build Integration
 * Handles login, profile, roles/permissions with JWT
 * Follows RBAC schema with User/Role/Permission entities
 */

import type {
    ApiResponse,
    LoginRequest,
    LoginResponse,
    UserWithRoles
} from '../types/api';
import { apiFetch, clearToken, setToken } from './api';
import { storage } from './storage';

export class AuthService {
  private currentUser: UserWithRoles | null = null;

  /**
   * Login with username/password and get JWT token
   * @param username - User's username or email
   * @param password - User's password
   * @returns Login response with token and user info
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      console.log('🔐 Attempting login for:', username);
      
      const loginData: LoginRequest = { username, password };
      const response = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginData),
      });

      if (response.token) {
        // Store token securely
        await storage.set('auth_token', response.token);
        setToken(response.token);
        
        // Cache user info
        this.currentUser = response.user;
        
        console.log('✅ Login successful:', response.user.username);
        return response;
      }

      throw new Error('No token received from server');
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }

  /**
   * Get current user profile with roles and permissions
   * @returns Current user with roles/permissions
   */
  async getProfile(): Promise<UserWithRoles> {
    try {
      console.log('👤 Fetching user profile...');
      
      const response = await apiFetch<ApiResponse<UserWithRoles>>('/auth/me');
      
      if (response.data) {
        this.currentUser = response.data;
        console.log('✅ Profile loaded:', response.data.username);
        return response.data;
      }

      throw new Error('No user data received');
    } catch (error) {
      console.error('❌ Failed to get profile:', error);
      throw error;
    }
  }

  /**
   * Logout and clear all auth data
   */
  async logout(): Promise<void> {
    try {
      console.log('👋 Logging out...');
      
      // Clear token and cache
      await clearToken();
      this.currentUser = null;
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Still clear local data even if server call fails
      await clearToken();
      this.currentUser = null;
    }
  }

  /**
   * Check if user is currently authenticated
   * @returns true if user has valid token
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await storage.get('auth_token');
      return !!token;
    } catch {
      return false;
    }
  }

  /**
   * Get cached current user (null if not logged in)
   * @returns Current user or null
   */
  getCurrentUser(): UserWithRoles | null {
    return this.currentUser;
  }

  /**
   * Check if current user has specific permission
   * @param permissionCode - Permission code to check (e.g., "chat.send")
   * @returns true if user has permission
   */
  hasPermission(permissionCode: string): boolean {
    if (!this.currentUser?.permissions) return false;
    
    return this.currentUser.permissions.some(
      permission => permission.code === permissionCode
    );
  }

  /**
   * Check if current user has specific role
   * @param roleCode - Role code to check (e.g., "admin", "contractor")
   * @returns true if user has role
   */
  hasRole(roleCode: string): boolean {
    if (!this.currentUser?.roles) return false;
    
    return this.currentUser.roles.some(
      role => role.code === roleCode
    );
  }

  /**
   * Get all permission codes for current user
   * @returns Array of permission codes
   */
  getPermissions(): string[] {
    if (!this.currentUser?.permissions) return [];
    
    return this.currentUser.permissions.map(p => p.code);
  }

  /**
   * Get all role codes for current user
   * @returns Array of role codes
   */
  getRoles(): string[] {
    if (!this.currentUser?.roles) return [];
    
    return this.currentUser.roles.map(r => r.code);
  }

  /**
   * Check if user can perform action based on permission
   * Used for UI control (show/hide buttons, disable features)
   */
  canPerformAction(action: string): boolean {
    // Map actions to permissions
    const actionPermissions: Record<string, string> = {
      'send_message': 'chat.send',
      'start_stream': 'stream.start',
      'block_user': 'user.block',
      'create_project': 'project.create',
      'manage_workorders': 'workorder.manage',
      'view_payments': 'payment.view',
    };

    const requiredPermission = actionPermissions[action];
    if (!requiredPermission) {
      console.warn(`Unknown action: ${action}`);
      return false;
    }

    return this.hasPermission(requiredPermission);
  }

  /**
   * Initialize auth state from stored token
   * Call this on app startup
   */
  async initialize(): Promise<UserWithRoles | null> {
    try {
      const isAuth = await this.isAuthenticated();
      if (isAuth) {
        // Load user profile if we have a token
        const user = await this.getProfile();
        return user;
      }
      return null;
    } catch (error) {
      console.warn('Auth initialization failed:', error);
      // Clear invalid token
      await this.logout();
      return null;
    }
  }

  /**
   * Refresh user data (useful after profile updates)
   */
  async refresh(): Promise<UserWithRoles> {
    return await this.getProfile();
  }
}

// Export singleton instance
export const authService = new AuthService();
