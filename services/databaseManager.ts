/**
 * Database Manager Service
 * Quản lý cơ sở dữ liệu tích hợp với API backend
 * Version: 2.0 - MySQL Production Integration
 */

import { apiFetch } from './api';
import { databaseConfigService } from './databaseConfig';

// Database Entity Interfaces
export interface DatabaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// User Entity for tien_users table
export interface UserEntity extends DatabaseEntity {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user' | 'manager' | 'viewer';
  fullName?: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: string;
  metadata?: Record<string, any>;
}

export interface DatabaseQuery {
  table: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  where?: Record<string, any>;
  data?: Record<string, any>;
  orderBy?: string;
  limit?: number;
  offset?: number;
}

export interface DatabaseTransaction {
  id: string;
  queries: DatabaseQuery[];
  rollbackQueries?: DatabaseQuery[];
}

export interface DatabaseResponse<T = any> {
  success: boolean;
  data: T | null;
  message?: string;
  rowCount?: number;
  executionTime?: number;
}

class DatabaseManager {
  private transactionLog: DatabaseTransaction[] = [];
  private connectionPool = new Map<string, any>();

  // ===========================================
  // CORE DATABASE OPERATIONS
  // ===========================================

  /**
   * Thực hiện truy vấn database
   */
  async executeQuery<T = any>(query: DatabaseQuery): Promise<DatabaseResponse<T>> {
    try {
      console.log('[DatabaseManager] 🔄 Executing query:', query.operation, query.table);
      
      const response = await apiFetch('/database/query', {
        method: 'POST',
        data: query,
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('[DatabaseManager] ✅ Query executed successfully');
      return {
        success: true,
        data: response.data || response,
        rowCount: response.rowCount,
        executionTime: response.executionTime
      };
      
    } catch (error) {
      console.error('[DatabaseManager] ❌ Query failed:', error);
      return {
        success: false,
        data: null as T,
        message: error instanceof Error ? error.message : 'Query execution failed'
      };
    }
  }

  /**
   * Thực hiện transaction với rollback support
   */
  async executeTransaction(transaction: DatabaseTransaction): Promise<DatabaseResponse> {
    try {
      console.log('[DatabaseManager] 🔄 Starting transaction:', transaction.id);
      
      const response = await apiFetch('/database/transaction', {
        method: 'POST',
        data: transaction,
        headers: { 'Content-Type': 'application/json' }
      });

      // Lưu transaction log
      this.transactionLog.push(transaction);
      
      console.log('[DatabaseManager] ✅ Transaction completed:', transaction.id);
      return {
        success: true,
        data: response.data || response,
        message: 'Transaction completed successfully'
      };
      
    } catch (error) {
      console.error('[DatabaseManager] ❌ Transaction failed:', transaction.id, error);
      
      // Thực hiện rollback nếu có
      if (transaction.rollbackQueries) {
        await this.rollbackTransaction(transaction);
      }
      
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Transaction failed'
      };
    }
  }

  /**
   * Rollback transaction
   */
  private async rollbackTransaction(transaction: DatabaseTransaction): Promise<void> {
    try {
      console.log('[DatabaseManager] 🔄 Rolling back transaction:', transaction.id);
      
      if (transaction.rollbackQueries) {
        for (const query of transaction.rollbackQueries.reverse()) {
          await this.executeQuery(query);
        }
      }
      
      console.log('[DatabaseManager] ✅ Transaction rolled back:', transaction.id);
    } catch (error) {
      console.error('[DatabaseManager] ❌ Rollback failed:', transaction.id, error);
    }
  }

  // ===========================================
  // CRUD OPERATIONS
  // ===========================================

  /**
   * Tạo record mới
   */
  async create<T extends DatabaseEntity>(
    table: string, 
    data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<DatabaseResponse<T>> {
    const id = `${table}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const now = new Date().toISOString();
    
    const transaction: DatabaseTransaction = {
      id: `create_${table}_${Date.now()}`,
      queries: [
        {
          table,
          operation: 'INSERT',
          data: {
            ...data,
            id,
            createdAt: now,
            updatedAt: now
          }
        }
      ],
      rollbackQueries: [
        {
          table,
          operation: 'DELETE',
          where: { id }
        }
      ]
    };

    const result = await this.executeTransaction(transaction);
      return {
        success: true,
        data: result.success ? { ...data, id, createdAt: now, updatedAt: now } as T : null
      };
  }

  /**
   * Đọc records
   */
  async read<T>(
    table: string,
    where?: Record<string, any>,
    orderBy?: string,
    limit?: number,
    offset?: number
  ): Promise<DatabaseResponse<T[]>> {
    const query: DatabaseQuery = {
      table,
      operation: 'SELECT',
      where,
      orderBy,
      limit,
      offset
    };

    return await this.executeQuery<T[]>(query);
  }

  /**
   * Đọc record theo ID
   */
  async readById<T>(table: string, id: string): Promise<DatabaseResponse<T | null>> {
    const result = await this.read<T>(table, { id }, undefined, 1);
    return {
      ...result,
      data: result.data && result.data.length > 0 ? result.data[0] : null
    };
  }

  /**
   * Cập nhật record
   */
  async update<T extends DatabaseEntity>(
    table: string,
    id: string,
    updates: Partial<Omit<T, 'id' | 'createdAt'>>
  ): Promise<DatabaseResponse<T>> {
    // Lấy dữ liệu cũ để rollback
    const existingResult = await this.readById<T>(table, id);
    
    if (!existingResult.success || !existingResult.data) {
      return {
        success: false,
        data: null as unknown as T,
        message: 'Record not found'
      };
    }

    const oldData = existingResult.data;
    const now = new Date().toISOString();

    const transaction: DatabaseTransaction = {
      id: `update_${table}_${id}_${Date.now()}`,
      queries: [
        {
          table,
          operation: 'UPDATE',
          where: { id },
          data: {
            ...updates,
            updatedAt: now
          }
        }
      ],
      rollbackQueries: [
        {
          table,
          operation: 'UPDATE',
          where: { id },
          data: oldData
        }
      ]
    };

    const result = await this.executeTransaction(transaction);
    return {
      success: result.success,
      data: result.success ? { ...oldData, ...updates, updatedAt: now } as T : null,
      message: result.message
    };
  }

  /**
   * Xóa record
   */
  async delete(table: string, id: string): Promise<DatabaseResponse<boolean>> {
    // Lấy dữ liệu để rollback
    const existingResult = await this.readById(table, id);
    
    if (!existingResult.success || !existingResult.data) {
      return {
        success: false,
        data: false,
        message: 'Record not found'
      };
    }

    const transaction: DatabaseTransaction = {
      id: `delete_${table}_${id}_${Date.now()}`,
      queries: [
        {
          table,
          operation: 'DELETE',
          where: { id }
        }
      ],
      rollbackQueries: [
        {
          table,
          operation: 'INSERT',
          data: existingResult.data
        }
      ]
    };

    const result = await this.executeTransaction(transaction);
    return {
      ...result,
      data: result.success
    };
  }

  // ===========================================
  // ADVANCED OPERATIONS
  // ===========================================

  /**
   * Tìm kiếm với full-text search
   */
  async search<T>(
    table: string,
    searchQuery: string,
    searchFields: string[],
    filters?: Record<string, any>,
    limit: number = 20,
    offset: number = 0
  ): Promise<DatabaseResponse<T[]>> {
    try {
      const response = await apiFetch('/database/search', {
        method: 'POST',
        data: {
          table,
          searchQuery,
          searchFields,
          filters,
          limit,
          offset
        },
        headers: { 'Content-Type': 'application/json' }
      });

      return {
        success: true,
        data: response.data || [],
        rowCount: response.total
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Search failed'
      };
    }
  }

  /**
   * Aggregation queries
   */
  async aggregate(
    table: string,
    aggregations: {
      count?: string[];
      sum?: string[];
      avg?: string[];
      min?: string[];
      max?: string[];
    },
    groupBy?: string[],
    where?: Record<string, any>
  ): Promise<DatabaseResponse<any[]>> {
    try {
      const response = await apiFetch('/database/aggregate', {
        method: 'POST',
        data: {
          table,
          aggregations,
          groupBy,
          where
        },
        headers: { 'Content-Type': 'application/json' }
      });

      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Aggregation failed'
      };
    }
  }

  // ===========================================
  // DATABASE MAINTENANCE
  // ===========================================

  /**
   * Backup database
   */
  async backup(tables?: string[]): Promise<DatabaseResponse<{ backupId: string; timestamp: string }>> {
    try {
      const backupData = {
        tables: tables || [],
        timestamp: new Date().toISOString(),
        requestedBy: 'system'
      };

      const response = await apiFetch('/database/backup', {
        method: 'POST',
        data: backupData,
        headers: { 'Content-Type': 'application/json' }
      });

      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        data: { backupId: '', timestamp: '' },
        message: error instanceof Error ? error.message : 'Backup failed'
      };
    }
  }

  /**
   * Restore database
   */
  async restore(backupId: string): Promise<DatabaseResponse<boolean>> {
    try {
      await apiFetch('/database/restore', {
        method: 'POST',
        data: { backupId },
        headers: { 'Content-Type': 'application/json' }
      });

      return {
        success: true,
        data: true,
        message: 'Database restored successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: false,
        message: error instanceof Error ? error.message : 'Restore failed'
      };
    }
  }

  /**
   * Lấy thống kê database
   */
  async getStats(): Promise<DatabaseResponse<{
    tables: { name: string; rowCount: number; size: string }[];
    totalSize: string;
    activeConnections: number;
    lastBackup: string;
    uptime: string;
  }>> {
    try {
      const response = await apiFetch('/database/stats', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        data: {
          tables: [],
          totalSize: '0MB',
          activeConnections: 0,
          lastBackup: 'Never',
          uptime: 'Unknown'
        },
        message: error instanceof Error ? error.message : 'Failed to get stats'
      };
    }
  }

  /**
   * Tối ưu hóa database
   */
  async optimize(tables?: string[]): Promise<DatabaseResponse<{ optimizedTables: string[]; timeTaken: number }>> {
    try {
      const response = await apiFetch('/database/optimize', {
        method: 'POST',
        data: { tables: tables || [] },
        headers: { 'Content-Type': 'application/json' }
      });

      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        data: { optimizedTables: [], timeTaken: 0 },
        message: error instanceof Error ? error.message : 'Optimization failed'
      };
    }
  }

  /**
   * Migration support
   */
  async runMigration(migrationScript: string): Promise<DatabaseResponse<boolean>> {
    try {
      await apiFetch('/database/migrate', {
        method: 'POST',
        data: { script: migrationScript },
        headers: { 'Content-Type': 'application/json' }
      });

      return {
        success: true,
        data: true,
        message: 'Migration completed successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: false,
        message: error instanceof Error ? error.message : 'Migration failed'
      };
    }
  }

  // ===========================================
  // UTILITY METHODS
  // ===========================================

  /**
   * Lấy transaction log
   */
  getTransactionLog(): DatabaseTransaction[] {
    return [...this.transactionLog];
  }

  /**
   * Clear transaction log
   */
  clearTransactionLog(): void {
    this.transactionLog = [];
  }

  /**
   * Validate connection
   */
  async validateConnection(): Promise<boolean> {
    try {
      const response = await apiFetch('/database/ping', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      return response.success === true;
    } catch (error) {
      console.error('[DatabaseManager] Connection validation failed:', error);
      return false;
    }
  }

  /**
   * Test MySQL connection với production config
   */
  async testMySQLConnection(): Promise<{
    success: boolean;
    message: string;
    responseTime: number;
    config: any;
  }> {
    try {
      console.log('[DatabaseManager] Testing MySQL production connection...');
      
      // Test connection thông qua database config service
      const configTest = await databaseConfigService.testConnection();
      const displayConfig = databaseConfigService.getDisplayConfig();
      
      console.log('[DatabaseManager] MySQL connection test result:', configTest);
      
      return {
        success: configTest.success,
        message: configTest.message,
        responseTime: configTest.responseTime,
        config: displayConfig
      };
    } catch (error) {
      console.error('[DatabaseManager] MySQL connection test failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed',
        responseTime: 0,
        config: {}
      };
    }
  }

  /**
   * Lấy thông tin cấu hình database hiện tại
   */
  getDatabaseConfiguration(): any {
    const config = databaseConfigService.getDisplayConfig();
    const validation = databaseConfigService.validateConfig();
    
    return {
      configuration: config,
      validation: validation,
      connectionString: databaseConfigService.getConnectionString().replace(/:[^:@]*@/, ':***@') // Mask password
    };
  }

  // ===========================================
  // USER MANAGEMENT METHODS
  // ===========================================

  /**
   * Import sample users vào bảng tien_users
   */
  async importSampleUsers(): Promise<DatabaseResponse<UserEntity[]>> {
    try {
      console.log('[DatabaseManager] 🔄 Importing sample users to tien_users...');
      
      const sampleUsers: Partial<UserEntity>[] = [
        {
          username: 'admin',
          email: 'admin@thietkeresort.com.vn',
          password: '123@#', // Simple password for testing
          role: 'admin',
          fullName: 'System Administrator',
          phone: '+84901234567',
          isActive: true,
          metadata: { department: 'IT', level: 'senior' }
        },
        {
          username: 'tienuser',
          email: 'tien@thietkeresort.com.vn', 
          password: '123@#',
          role: 'manager',
          fullName: 'Tiến User Manager',
          phone: '+84907654321',
          isActive: true,
          metadata: { department: 'Design', level: 'manager' }
        },
        {
          username: 'testuser1',
          email: 'test1@thietkeresort.com.vn',
          password: '123@#',
          role: 'user',
          fullName: 'Test User 1',
          phone: '+84909876543',
          isActive: true,
          metadata: { department: 'Sales', level: 'junior' }
        },
        {
          username: 'demo_viewer',
          email: 'viewer@thietkeresort.com.vn',
          password: '123@#',
          role: 'viewer',
          fullName: 'Demo Viewer',
          phone: '+84905432109',
          isActive: true,
          metadata: { department: 'Guest', level: 'readonly' }
        }
      ];

      // Create transaction for multiple user inserts
      const transaction: DatabaseTransaction = {
        id: `import_users_${Date.now()}`,
        queries: sampleUsers.map(user => ({
          table: 'tien_users',
          operation: 'INSERT' as const,
          data: {
            ...user,
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'system'
          }
        })),
        rollbackQueries: [] // Will be populated if needed
      };

      const result = await this.executeTransaction(transaction);
      
      if (result.success) {
        console.log('[DatabaseManager] ✅ Sample users imported successfully');
        return {
          success: true,
          data: result.data || [],
          message: `Successfully imported ${sampleUsers.length} users`,
          rowCount: sampleUsers.length
        };
      } else {
        return {
          success: false,
          data: null,
          message: result.message || 'Failed to import users'
        };
      }
    } catch (error) {
      console.error('[DatabaseManager] ❌ Failed to import users:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Import failed'
      };
    }
  }

  /**
   * Lấy danh sách users từ bảng tien_users
   */
  async getUsers(filters?: {
    role?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<DatabaseResponse<UserEntity[]>> {
    try {
      console.log('[DatabaseManager] 🔄 Getting users from tien_users...');
      
      const where: Record<string, any> = {};
      if (filters?.role) where.role = filters.role;
      if (filters?.isActive !== undefined) where.isActive = filters.isActive;
      
      const result = await this.read<UserEntity>(
        'tien_users',
        Object.keys(where).length > 0 ? where : undefined,
        'createdAt DESC',
        50
      );

      if (result.success && result.data) {
        let users = result.data;
        
        // Apply search filter if provided
        if (filters?.search) {
          const searchTerm = filters.search.toLowerCase();
          users = users.filter(user => 
            user.username?.toLowerCase().includes(searchTerm) ||
            user.email?.toLowerCase().includes(searchTerm) ||
            user.fullName?.toLowerCase().includes(searchTerm)
          );
        }

        console.log('[DatabaseManager] ✅ Users loaded:', users.length);
        return {
          success: true,
          data: users,
          message: `Found ${users.length} users`,
          rowCount: users.length
        };
      } else {
        return {
          success: false,
          data: null,
          message: result.message || 'Failed to load users'
        };
      }
    } catch (error) {
      console.error('[DatabaseManager] ❌ Failed to get users:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to load users'
      };
    }
  }

  /**
   * Tạo user mới
   */
  async createUser(userData: Partial<UserEntity>): Promise<DatabaseResponse<UserEntity>> {
    try {
      console.log('[DatabaseManager] 🔄 Creating new user:', userData.username);
      
      const newUser = {
        ...userData,
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: userData.isActive ?? true,
        password: userData.password || '123@#', // Default password
        username: userData.username || 'defaultuser',
        email: userData.email || 'default@email.com',
        role: userData.role || 'user'
      } as UserEntity;

      const result = await this.create<UserEntity>('tien_users', newUser);
      
      if (result.success && result.data) {
        console.log('[DatabaseManager] ✅ User created successfully');
        return result;
      } else {
        return {
          success: false,
          data: null,
          message: result.message || 'Failed to create user'
        };
      }
    } catch (error) {
      console.error('[DatabaseManager] ❌ Failed to create user:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'User creation failed'
      };
    }
  }

  /**
   * Test login user với username và password
   */
  async testUserLogin(username: string, password: string): Promise<{
    success: boolean;
    user?: UserEntity;
    message: string;
  }> {
    try {
      console.log('[DatabaseManager] 🔄 Testing user login:', username);
      
      const result = await this.read<UserEntity>('tien_users', { 
        username: username,
        password: password,
        isActive: true 
      });

      if (result.success && result.data && result.data.length > 0) {
        const user = result.data[0];
        console.log('[DatabaseManager] ✅ Login successful for:', username);
        
        // Update last login time
        await this.update('tien_users', user.id, {
          updatedAt: new Date().toISOString()
        } as any);

        return {
          success: true,
          user: user,
          message: 'Login successful'
        };
      } else {
        console.log('[DatabaseManager] ❌ Login failed for:', username);
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }
    } catch (error) {
      console.error('[DatabaseManager] ❌ Login test failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login test failed'
      };
    }
  }

  /**
   * Xóa tất cả users (for testing purposes)
   */
  async clearAllUsers(): Promise<DatabaseResponse<boolean>> {
    try {
      console.log('[DatabaseManager] 🔄 Clearing all users from tien_users...');
      
      // This would delete all users - use with caution!
      const result = await this.executeQuery({
        table: 'tien_users',
        operation: 'DELETE',
        where: {} // Empty where = delete all
      });

      if (result.success) {
        console.log('[DatabaseManager] ✅ All users cleared');
        return {
          success: true,
          data: true,
          message: 'All users cleared successfully'
        };
      } else {
        return {
          success: false,
          data: false,
          message: result.message || 'Failed to clear users'
        };
      }
    } catch (error) {
      console.error('[DatabaseManager] ❌ Failed to clear users:', error);
      return {
        success: false,
        data: false,
        message: error instanceof Error ? error.message : 'Clear operation failed'
      };
    }
  }
}

// Export singleton instance
export const databaseManager = new DatabaseManager();
export default databaseManager;