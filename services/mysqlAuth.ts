/**
 * MySQL Authentication Service
 * Xử lý đăng ký/đăng nhập với MySQL database server
 */

import { AuthUser, Role } from '@/types/auth';
import { deleteItem, getItem, setItem } from '@/utils/storage';
import bcrypt from 'bcryptjs';
import { apiFetch } from './api';
import { MYSQL_CONFIG } from './mysqlConnection';

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
  role?: 'admin' | 'user' | 'manager' | 'viewer';
}

export interface MySQLSignInRequest {
  account: string; // username hoặc email
  password: string;
}

export interface MySQLUser {
  id: number;
  username: string;
  email: string;
  password: string;
  full_name: string | null;
  phone: string | null;
  role: 'admin' | 'user' | 'manager' | 'viewer';
  is_active: boolean;
  avatar_url: string | null;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  metadata: any;
}

/**
 * MySQL Authentication Service
 */
class MySQLAuthService {
  
  /**
   * Đăng ký user mới với MySQL
   */
  async signUp(request: MySQLSignUpRequest): Promise<MySQLAuthResponse> {
    try {
      console.log('[MySQLAuth] 📝 Sign up attempt:', request.username);

      // Validation
      if (!request.username || request.username.length < 3) {
        return {
          success: false,
          message: 'Username phải có ít nhất 3 ký tự'
        };
      }

      if (!request.email || !this.isValidEmail(request.email)) {
        return {
          success: false,
          message: 'Email không hợp lệ'
        };
      }

      if (!request.password || request.password.length < 6) {
        return {
          success: false,
          message: 'Password phải có ít nhất 6 ký tự'
        };
      }

      // Check if username exists
      const existingUser = await this.findUserByUsername(request.username);
      if (existingUser) {
        return {
          success: false,
          message: 'Username đã tồn tại'
        };
      }

      // Check if email exists
      const existingEmail = await this.findUserByEmail(request.email);
      if (existingEmail) {
        return {
          success: false,
          message: 'Email đã được sử dụng'
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(request.password, 10);

      // Insert new user
      const insertResult = await apiFetch('/database/query', {
        method: 'POST',
        data: {
          ...MYSQL_CONFIG,
          query: `
            INSERT INTO users (username, email, password, full_name, phone, role, is_active, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, TRUE, NOW(), NOW())
          `,
          params: [
            request.username.toLowerCase().trim(),
            request.email.toLowerCase().trim(),
            hashedPassword,
            request.fullName || request.username,
            request.phone || null,
            request.role || 'user'
          ]
        }
      });

      if (!insertResult.success || !insertResult.insertId) {
        return {
          success: false,
          message: 'Không thể tạo tài khoản'
        };
      }

      // Get created user
      const newUser = await this.findUserById(insertResult.insertId);
      if (!newUser) {
        return {
          success: false,
          message: 'Tạo tài khoản thành công nhưng không thể lấy thông tin user'
        };
      }

      // Create auth user object
      const authUser = this.convertToAuthUser(newUser);
      const token = this.generateToken(newUser.id);

      // Save session
      await this.saveSession(authUser, token);

      console.log('[MySQLAuth] ✅ Sign up successful:', newUser.username);

      return {
        success: true,
        message: 'Đăng ký thành công',
        user: authUser,
        token,
        userId: newUser.id
      };

    } catch (error) {
      console.error('[MySQLAuth] ❌ Sign up failed:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Đăng ký thất bại'
      };
    }
  }

  /**
   * Đăng nhập với MySQL
   */
  async signIn(request: MySQLSignInRequest): Promise<MySQLAuthResponse> {
    try {
      console.log('[MySQLAuth] 🔐 Sign in attempt:', request.account);

      // Validation
      if (!request.account || !request.password) {
        return {
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin'
        };
      }

      // Find user by username or email
      const user = await this.findUserByAccount(request.account.toLowerCase().trim());
      if (!user) {
        return {
          success: false,
          message: 'Tài khoản không tồn tại'
        };
      }

      // Check password
      const passwordValid = await bcrypt.compare(request.password, user.password);
      if (!passwordValid) {
        return {
          success: false,
          message: 'Mật khẩu không đúng'
        };
      }

      // Check if account is active
      if (!user.is_active) {
        return {
          success: false,
          message: 'Tài khoản đã bị khóa'
        };
      }

      // Update last login
      await this.updateLastLogin(user.id);

      // Create auth user object
      const authUser = this.convertToAuthUser(user);
      const token = this.generateToken(user.id);

      // Save session
      await this.saveSession(authUser, token);

      console.log('[MySQLAuth] ✅ Sign in successful:', user.username);

      return {
        success: true,
        message: 'Đăng nhập thành công',
        user: authUser,
        token,
        userId: user.id
      };

    } catch (error) {
      console.error('[MySQLAuth] ❌ Sign in failed:', error);
      
      return {
        success: false,
        message: 'Đăng nhập thất bại'
      };
    }
  }

  /**
   * Đăng xuất
   */
  async signOut(): Promise<void> {
    try {
      await deleteItem('auth_user');
      await deleteItem('auth_token');
      await deleteItem('mysql_user_id');
      
      console.log('[MySQLAuth] 👋 Sign out successful');
    } catch (error) {
      console.error('[MySQLAuth] ❌ Sign out failed:', error);
    }
  }

  /**
   * Lấy session hiện tại
   */
  async getCurrentSession(): Promise<{ user: AuthUser; token: string } | null> {
    try {
      const savedUser = await getItem('auth_user');
      const savedToken = await getItem('auth_token');

      if (savedUser && savedToken) {
        const user = JSON.parse(savedUser) as AuthUser;
        return { user, token: savedToken };
      }
    } catch (error) {
      console.error('[MySQLAuth] ❌ Failed to restore session:', error);
    }

    return null;
  }

  /**
   * Refresh user data từ database
   */
  async refreshUser(userId: number): Promise<AuthUser | null> {
    try {
      const user = await this.findUserById(userId);
      if (user) {
        const authUser = this.convertToAuthUser(user);
        
        // Update saved session
        const savedToken = await getItem('auth_token');
        if (savedToken) {
          await this.saveSession(authUser, savedToken);
        }
        
        return authUser;
      }
    } catch (error) {
      console.error('[MySQLAuth] ❌ Failed to refresh user:', error);
    }

    return null;
  }

  // Private helper methods

  /**
   * Find user by ID
   */
  private async findUserById(id: number): Promise<MySQLUser | null> {
    try {
      const result = await apiFetch('/database/query', {
        method: 'POST',
        data: {
          ...MYSQL_CONFIG,
          query: 'SELECT * FROM users WHERE id = ? LIMIT 1',
          params: [id]
        }
      });

      if (result.success && result.results && result.results.length > 0) {
        return result.results[0] as MySQLUser;
      }
    } catch (error) {
      console.error('[MySQLAuth] ❌ Find user by ID failed:', error);
    }

    return null;
  }

  /**
   * Find user by username
   */
  private async findUserByUsername(username: string): Promise<MySQLUser | null> {
    try {
      const result = await apiFetch('/database/query', {
        method: 'POST',
        data: {
          ...MYSQL_CONFIG,
          query: 'SELECT * FROM users WHERE username = ? LIMIT 1',
          params: [username.toLowerCase()]
        }
      });

      if (result.success && result.results && result.results.length > 0) {
        return result.results[0] as MySQLUser;
      }
    } catch (error) {
      console.error('[MySQLAuth] ❌ Find user by username failed:', error);
    }

    return null;
  }

  /**
   * Find user by email
   */
  private async findUserByEmail(email: string): Promise<MySQLUser | null> {
    try {
      const result = await apiFetch('/database/query', {
        method: 'POST',
        data: {
          ...MYSQL_CONFIG,
          query: 'SELECT * FROM users WHERE email = ? LIMIT 1',
          params: [email.toLowerCase()]
        }
      });

      if (result.success && result.results && result.results.length > 0) {
        return result.results[0] as MySQLUser;
      }
    } catch (error) {
      console.error('[MySQLAuth] ❌ Find user by email failed:', error);
    }

    return null;
  }

  /**
   * Find user by username or email
   */
  private async findUserByAccount(account: string): Promise<MySQLUser | null> {
    try {
      const result = await apiFetch('/database/query', {
        method: 'POST',
        data: {
          ...MYSQL_CONFIG,
          query: 'SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1',
          params: [account, account]
        }
      });

      if (result.success && result.results && result.results.length > 0) {
        return result.results[0] as MySQLUser;
      }
    } catch (error) {
      console.error('[MySQLAuth] ❌ Find user by account failed:', error);
    }

    return null;
  }

  /**
   * Update last login timestamp
   */
  private async updateLastLogin(userId: number): Promise<void> {
    try {
      await apiFetch('/database/query', {
        method: 'POST',
        data: {
          ...MYSQL_CONFIG,
          query: 'UPDATE users SET last_login = NOW() WHERE id = ?',
          params: [userId]
        }
      });
    } catch (error) {
      console.error('[MySQLAuth] ❌ Update last login failed:', error);
    }
  }

  /**
   * Convert MySQL user to AuthUser
   */
  private convertToAuthUser(user: MySQLUser): AuthUser {
    return {
      id: user.id.toString(),
      phone: user.phone || '',
      name: user.full_name || user.username,
      email: user.email,
      avatar: user.avatar_url || undefined,
      role: user.role as Role,
      reward_points: user.metadata?.rewardPoints || 0,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      companies: [],
      current_company_id: 'default',
      is_admin: user.role === 'admin',
      scopes: [],
      global_roles: [user.role as Role]
    };
  }

  /**
   * Generate authentication token
   */
  private generateToken(userId: number): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36);
    return `mysql_token_${userId}_${timestamp}_${random}`;
  }

  /**
   * Save session to storage
   */
  private async saveSession(user: AuthUser, token: string): Promise<void> {
    try {
      await setItem('auth_user', JSON.stringify(user));
      await setItem('auth_token', token);
      await setItem('mysql_user_id', user.id);
    } catch (error) {
      console.error('[MySQLAuth] ❌ Failed to save session:', error);
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<MySQLUser[]> {
    try {
      const result = await apiFetch('/database/query', {
        method: 'POST',
        data: {
          ...MYSQL_CONFIG,
          query: 'SELECT * FROM users ORDER BY created_at DESC'
        }
      });

      if (result.success && result.results) {
        return result.results as MySQLUser[];
      }
    } catch (error) {
      console.error('[MySQLAuth] ❌ Get all users failed:', error);
    }

    return [];
  }

  /**
   * Create admin user if not exists
   */
  async ensureAdminUser(): Promise<MySQLAuthResponse> {
    try {
      // Check if admin exists
      const existingAdmin = await this.findUserByUsername('admin');
      if (existingAdmin) {
        return {
          success: true,
          message: 'Admin user đã tồn tại'
        };
      }

      // Create admin user
      return await this.signUp({
        username: 'admin',
        email: 'admin@thietkeresort.com.vn',
        password: '123@#',
        fullName: 'System Administrator',
        phone: '+84901234567',
        role: 'admin'
      });
    } catch (error) {
      console.error('[MySQLAuth] ❌ Ensure admin user failed:', error);
      return {
        success: false,
        message: 'Không thể tạo admin user'
      };
    }
  }
}

// Export singleton instance
export const mySQLAuthService = new MySQLAuthService();

// Export utility functions
export const mySQLSignUp = (params: MySQLSignUpRequest) => mySQLAuthService.signUp(params);
export const mySQLSignIn = (account: string, password: string) => mySQLAuthService.signIn({ account, password });
export const mySQLSignOut = () => mySQLAuthService.signOut();
export const getMySQLCurrentSession = () => mySQLAuthService.getCurrentSession();
export const refreshMySQLUser = (userId: number) => mySQLAuthService.refreshUser(userId);
export const ensureAdminUser = () => mySQLAuthService.ensureAdminUser();