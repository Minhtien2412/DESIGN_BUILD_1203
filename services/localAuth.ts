/**
 * Local Authentication Service
 * Xử lý đăng ký/đăng nhập hoàn toàn phía client với database local
 * Bỏ dependency với external API server
 */

import { AuthUser, Role } from '@/types/auth';
import { deleteItem, getItem, setItem } from '@/utils/storage';
import { UserEntity } from './databaseManager';

// Authentication interfaces
export interface LocalAuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  token?: string;
}

export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  role?: Role;
}

export interface SignInRequest {
  account: string; // có thể là username hoặc email
  password: string;
}

// Mock local database cho users
class LocalUserDatabase {
  private users: Map<string, UserEntity> = new Map();
  private emailIndex: Map<string, string> = new Map(); // email -> userId mapping
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load users từ storage
      const savedUsers = await getItem('local_users_db');
      if (savedUsers) {
        const parsedUsers = JSON.parse(savedUsers);
        Object.entries(parsedUsers).forEach(([id, user]) => {
          this.users.set(id, user as UserEntity);
          this.emailIndex.set((user as UserEntity).email, id);
        });
      }

      // Tạo admin user mặc định nếu chưa có
      if (this.users.size === 0) {
        await this.createDefaultAdmin();
      }

      this.initialized = true;
      console.log('[LocalUserDB] 🎯 Initialized with', this.users.size, 'users');
    } catch (error) {
      console.error('[LocalUserDB] ❌ Failed to initialize:', error);
      this.initialized = true; // Continue anyway
    }
  }

  private async createDefaultAdmin(): Promise<void> {
    const adminUser: UserEntity = {
      id: 'admin-001',
      username: 'admin',
      email: 'admin@thietkeresort.com.vn',
      password: this.hashPassword('123@#'), // Simple hash for demo
      role: 'admin',
      fullName: 'System Administrator',
      phone: '+84901234567',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
      metadata: { isDefault: true }
    };

    this.users.set(adminUser.id, adminUser);
    this.emailIndex.set(adminUser.email, adminUser.id);
    await this.persistToStorage();
    
    console.log('[LocalUserDB] 👑 Created default admin user');
  }

  private async persistToStorage(): Promise<void> {
    try {
      const usersObject = Object.fromEntries(this.users.entries());
      await setItem('local_users_db', JSON.stringify(usersObject));
    } catch (error) {
      console.error('[LocalUserDB] ❌ Failed to persist:', error);
    }
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    await this.initialize();
    
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    await this.initialize();
    
    const userId = this.emailIndex.get(email);
    if (userId) {
      return this.users.get(userId) || null;
    }
    return null;
  }

  async findByAccount(account: string): Promise<UserEntity | null> {
    // Tìm theo username hoặc email
    let user = await this.findByUsername(account);
    if (!user) {
      user = await this.findByEmail(account);
    }
    return user;
  }

  async createUser(userData: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity> {
    await this.initialize();

    // Check duplicate username
    if (await this.findByUsername(userData.username)) {
      throw new Error('Username đã tồn tại');
    }

    // Check duplicate email
    if (await this.findByEmail(userData.email)) {
      throw new Error('Email đã tồn tại');
    }

    const userId = this.generateUserId();
    const newUser: UserEntity = {
      ...userData,
      id: userId,
      password: this.hashPassword(userData.password),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.users.set(userId, newUser);
    this.emailIndex.set(newUser.email, userId);
    await this.persistToStorage();

    return newUser;
  }

  async updateUser(userId: string, updateData: Partial<UserEntity>): Promise<UserEntity | null> {
    await this.initialize();

    const user = this.users.get(userId);
    if (!user) return null;

    const updatedUser: UserEntity = {
      ...user,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    this.users.set(userId, updatedUser);
    await this.persistToStorage();

    return updatedUser;
  }

  async getAllUsers(): Promise<UserEntity[]> {
    await this.initialize();
    return Array.from(this.users.values());
  }

  async deleteUser(userId: string): Promise<boolean> {
    await this.initialize();

    const user = this.users.get(userId);
    if (!user) return false;

    this.users.delete(userId);
    this.emailIndex.delete(user.email);
    await this.persistToStorage();

    return true;
  }

  private generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private hashPassword(password: string): string {
    // Simple hash cho demo - trong production nên dùng bcrypt hoặc tương tự
    let hash = 0;
    const salt = 'thietkeresort_salt_2025';
    const input = password + salt;
    
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  verifyPassword(plainPassword: string, hashedPassword: string): boolean {
    return this.hashPassword(plainPassword) === hashedPassword;
  }
}

// Singleton instance
const localUserDB = new LocalUserDatabase();

/**
 * Local Authentication Service
 */
class LocalAuthService {
  private currentSession: { user: AuthUser; token: string } | null = null;

  /**
   * Đăng ký user mới
   */
  async signUp(request: SignUpRequest): Promise<LocalAuthResponse> {
    try {
      console.log('[LocalAuth] 📝 Sign up attempt:', request.username);

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

      if (!request.password || request.password.length < 4) {
        return {
          success: false,
          message: 'Password phải có ít nhất 4 ký tự'
        };
      }

      // Tạo user mới
      const userData: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'> = {
        username: request.username.toLowerCase().trim(),
        email: request.email.toLowerCase().trim(),
        password: request.password,
        fullName: request.fullName || request.username,
        phone: request.phone || '',
        role: (request.role as 'admin' | 'user' | 'manager' | 'viewer') || 'user',
        isActive: true,
        createdBy: 'self-registration'
      };

      const newUser = await localUserDB.createUser(userData);
      const authUser = this.convertToAuthUser(newUser);
      const token = this.generateToken(newUser.id);

      // Save session
      this.currentSession = { user: authUser, token };
      await this.saveSession(authUser, token);

      console.log('[LocalAuth] ✅ Sign up successful:', newUser.username);
      
      return {
        success: true,
        message: 'Đăng ký thành công',
        user: authUser,
        token
      };

    } catch (error) {
      console.error('[LocalAuth] ❌ Sign up failed:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Đăng ký thất bại'
      };
    }
  }

  /**
   * Đăng nhập
   */
  async signIn(request: SignInRequest): Promise<LocalAuthResponse> {
    try {
      console.log('[LocalAuth] 🔐 Sign in attempt:', request.account);

      // Validation
      if (!request.account || !request.password) {
        return {
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin'
        };
      }

      // Tìm user
      const user = await localUserDB.findByAccount(request.account.toLowerCase().trim());
      if (!user) {
        return {
          success: false,
          message: 'Tài khoản không tồn tại'
        };
      }

      // Kiểm tra password
      if (!localUserDB.verifyPassword(request.password, user.password)) {
        return {
          success: false,
          message: 'Mật khẩu không đúng'
        };
      }

      // Kiểm tra tài khoản có active không
      if (!user.isActive) {
        return {
          success: false,
          message: 'Tài khoản đã bị khóa'
        };
      }

      // Update last login
      await localUserDB.updateUser(user.id, {
        lastLogin: new Date().toISOString()
      });

      const authUser = this.convertToAuthUser(user);
      const token = this.generateToken(user.id);

      // Save session
      this.currentSession = { user: authUser, token };
      await this.saveSession(authUser, token);

      console.log('[LocalAuth] ✅ Sign in successful:', user.username);
      
      return {
        success: true,
        message: 'Đăng nhập thành công',
        user: authUser,
        token
      };

    } catch (error) {
      console.error('[LocalAuth] ❌ Sign in failed:', error);
      
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
      this.currentSession = null;
      await deleteItem('auth_user');
      await deleteItem('auth_token');
      
      console.log('[LocalAuth] 👋 Sign out successful');
    } catch (error) {
      console.error('[LocalAuth] ❌ Sign out failed:', error);
    }
  }

  /**
   * Lấy session hiện tại
   */
  async getCurrentSession(): Promise<{ user: AuthUser; token: string } | null> {
    if (this.currentSession) {
      return this.currentSession;
    }

    try {
      const savedUser = await getItem('auth_user');
      const savedToken = await getItem('auth_token');

      if (savedUser && savedToken) {
        const user = JSON.parse(savedUser) as AuthUser;
        this.currentSession = { user, token: savedToken };
        return this.currentSession;
      }
    } catch (error) {
      console.error('[LocalAuth] ❌ Failed to restore session:', error);
    }

    return null;
  }

  /**
   * Refresh user data
   */
  async refreshUser(userId: string): Promise<AuthUser | null> {
    try {
      const users = await localUserDB.getAllUsers();
      const user = users.find(u => u.id === userId);
      
      if (user) {
        const authUser = this.convertToAuthUser(user);
        
        // Update current session
        if (this.currentSession) {
          this.currentSession.user = authUser;
          await this.saveSession(authUser, this.currentSession.token);
        }
        
        return authUser;
      }
    } catch (error) {
      console.error('[LocalAuth] ❌ Failed to refresh user:', error);
    }

    return null;
  }

  /**
   * Lấy danh sách users (chỉ admin)
   */
  async getAllUsers(): Promise<UserEntity[]> {
    return await localUserDB.getAllUsers();
  }

  /**
   * Tạo user mới (admin function)
   */
  async createUser(userData: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity> {
    return await localUserDB.createUser(userData);
  }

  // Private helper methods
  private convertToAuthUser(user: UserEntity): AuthUser {
    return {
      id: user.id,
      phone: user.phone || '',
      name: user.fullName || user.username,
      email: user.email,
      avatar: undefined,
      role: user.role as Role,
      reward_points: 100, // Default points
      is_active: user.isActive,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
      companies: [], // Simple setup
      current_company_id: 'default',
      is_admin: user.role === 'admin',
      scopes: [], // Will be populated by AuthContext
      global_roles: [user.role as Role]
    };
  }

  private generateToken(userId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36);
    return `local_token_${userId}_${timestamp}_${random}`;
  }

  private async saveSession(user: AuthUser, token: string): Promise<void> {
    try {
      await setItem('auth_user', JSON.stringify(user));
      await setItem('auth_token', token);
    } catch (error) {
      console.error('[LocalAuth] ❌ Failed to save session:', error);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Export singleton instance
export const localAuthService = new LocalAuthService();

// Export user database for admin functions
export { localUserDB };

// Utility functions for quick access
export const localSignUp = (params: SignUpRequest) => localAuthService.signUp(params);
export const localSignIn = (account: string, password: string) => localAuthService.signIn({ account, password });
export const localSignOut = () => localAuthService.signOut();
export const localGetCurrentSession = () => localAuthService.getCurrentSession();
export const localRefreshUser = (userId: string) => localAuthService.refreshUser(userId);