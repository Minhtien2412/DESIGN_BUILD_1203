// @ts-nocheck
/**
 * MySQL Connection Service
 * Updated to use backend API endpoints for MySQL operations
 */

import { apiFetch } from './api';

// MySQL Configuration từ parameters
export const MYSQL_CONFIG = {
  host: '14.225.203.94',
  port: 3306,
  user: 'nhaxinhd_designbuild',
  password: 'tv!2+luM+5G4Y-?q',
  database: 'nhaxinhd_designbuild',
  ssl: false,
  charset: 'utf8mb4'
};

export interface MySQLConnectionResult {
  success: boolean;
  message: string;
  // Keep details permissive since different backends return different shapes
  details?: Record<string, any>;
  error?: string;
  code?: string;
}

export interface DatabaseTestResult {
  // Ensure consumers can rely on these fields existing
  connection: MySQLConnectionResult | any;
  userTable: any;
  operations: Record<string, boolean>;
  success?: boolean;
  message?: string;
  results?: any;
}

/**
 * MySQL Connection Service
 */
class MySQLConnectionService {
  
  /**
   * Test basic MySQL connection
   */
  async testConnection(): Promise<MySQLConnectionResult> {
    try {
      console.log('[MySQL] 🔄 Testing connection to:', MYSQL_CONFIG.host);
      
      const startTime = Date.now();
      
      // Test connection via API endpoint
      const response = await apiFetch('/database/test-connection', {
        method: 'POST',
        data: {
          host: MYSQL_CONFIG.host,
          port: MYSQL_CONFIG.port,
          user: MYSQL_CONFIG.user,
          password: MYSQL_CONFIG.password,
          database: MYSQL_CONFIG.database,
          ssl: MYSQL_CONFIG.ssl
        },
        timeout: 10000 // 10 second timeout
      });

      const ping = Date.now() - startTime;

      if (response.success) {
        console.log('[MySQL] ✅ Connection successful, ping:', ping + 'ms');
        
        return {
          success: true,
          message: 'Kết nối MySQL thành công',
          details: {
            host: MYSQL_CONFIG.host,
            port: MYSQL_CONFIG.port,
            database: MYSQL_CONFIG.database,
            connected: true,
            ping,
            version: response.version,
            tables: response.tables || []
          }
        };
      } else {
        console.log('[MySQL] ❌ Connection failed:', response.message);
        
        return {
          success: false,
          message: `Kết nối thất bại: ${response.message}`,
          details: {
            host: MYSQL_CONFIG.host,
            port: MYSQL_CONFIG.port,
            database: MYSQL_CONFIG.database,
            connected: false,
            ping
          }
        };
      }

    } catch (error) {
      console.error('[MySQL] ❌ Connection error:', error);
      
      return {
        success: false,
        message: `Lỗi kết nối: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: {
          host: MYSQL_CONFIG.host,
          port: MYSQL_CONFIG.port,
          database: MYSQL_CONFIG.database,
          connected: false
        }
      };
    }
  }

  /**
   * Test user table operations
   */
  async testUserTable(): Promise<DatabaseTestResult['userTable']> {
    try {
      console.log('[MySQL] 🔄 Testing user table operations...');

      // Check if users table exists
      const tableCheck = await apiFetch('/database/check-table', {
        method: 'POST',
        data: {
          ...MYSQL_CONFIG,
          tableName: 'users'
        }
      });

      if (!tableCheck.exists) {
        return {
          exists: false
        };
      }

      // Get table structure
      const structure = await apiFetch('/database/table-structure', {
        method: 'POST',
        data: {
          ...MYSQL_CONFIG,
          tableName: 'users'
        }
      });

      // Get user count
      const countResult = await apiFetch('/database/query', {
        method: 'POST',
        data: {
          ...MYSQL_CONFIG,
          query: 'SELECT COUNT(*) as count FROM users'
        }
      });

      const count = countResult.results?.[0]?.count || 0;

      return {
        exists: true,
        structure: structure.columns,
        count
      };

    } catch (error) {
      console.error('[MySQL] ❌ User table test failed:', error);
      return {
        exists: false
      };
    }
  }

  /**
   * Test CRUD operations
   */
  async testCRUDOperations(): Promise<DatabaseTestResult['operations']> {
    try {
      console.log('[MySQL] 🔄 Testing CRUD operations...');

      const operations = {
        select: false,
        insert: false,
        update: false,
        delete: false
      };

      // Test SELECT
      try {
        await apiFetch('/database/query', {
          method: 'POST',
          data: {
            ...MYSQL_CONFIG,
            query: 'SELECT 1 as test'
          }
        });
        operations.select = true;
      } catch (error) {
        console.error('[MySQL] SELECT test failed:', error);
      }

      // Test INSERT (with rollback)
      try {
        const testData = {
          username: `test_${Date.now()}`,
          email: `test_${Date.now()}@example.com`,
          password: 'test123',
          created_at: new Date().toISOString()
        };

        const insertResult = await apiFetch('/database/query', {
          method: 'POST',
          data: {
            ...MYSQL_CONFIG,
            query: 'INSERT INTO users (username, email, password, created_at) VALUES (?, ?, ?, ?)',
            params: [testData.username, testData.email, testData.password, testData.created_at]
          }
        });

        if (insertResult.success && insertResult.insertId) {
          operations.insert = true;

          // Test UPDATE
          try {
            await apiFetch('/database/query', {
              method: 'POST',
              data: {
                ...MYSQL_CONFIG,
                query: 'UPDATE users SET email = ? WHERE id = ?',
                params: [`updated_${testData.email}`, insertResult.insertId]
              }
            });
            operations.update = true;
          } catch (error) {
            console.error('[MySQL] UPDATE test failed:', error);
          }

          // Test DELETE (cleanup)
          try {
            await apiFetch('/database/query', {
              method: 'POST',
              data: {
                ...MYSQL_CONFIG,
                query: 'DELETE FROM users WHERE id = ?',
                params: [insertResult.insertId]
              }
            });
            operations.delete = true;
          } catch (error) {
            console.error('[MySQL] DELETE test failed:', error);
          }
        }
      } catch (error) {
        console.error('[MySQL] INSERT test failed:', error);
      }

      return operations;

    } catch (error) {
      console.error('[MySQL] ❌ CRUD operations test failed:', error);
      return {
        select: false,
        insert: false,
        update: false,
        delete: false
      };
    }
  }

  /**
   * Comprehensive database test
   */
  async runFullDatabaseTest(): Promise<DatabaseTestResult> {
    try {
      console.log('[MySQL] 🧪 Running full database test...');

      // Test connection
      const connection = await this.testConnection();
      
      let userTable = { exists: false };
      let operations = {
        select: false,
        insert: false,
        update: false,
        delete: false
      };

      // Only test tables and operations if connection successful
      if (connection.success) {
        userTable = await this.testUserTable();
        operations = await this.testCRUDOperations();
      }

      const result: DatabaseTestResult = {
        connection,
        userTable,
        operations
      };

      console.log('[MySQL] 📊 Full test results:', result);
      return result;

    } catch (error) {
      console.error('[MySQL] ❌ Full database test failed:', error);
      
      return {
        connection: {
          success: false,
          message: `Test thất bại: ${error instanceof Error ? error.message : 'Unknown error'}`
        },
        userTable: { exists: false },
        operations: {
          select: false,
          insert: false,
          update: false,
          delete: false
        }
      };
    }
  }

  /**
   * Quick connection ping
   */
  async pingConnection(): Promise<{ success: boolean; ping: number; message: string }> {
    try {
      const startTime = Date.now();
      
      // Simple ping test
      const response = await apiFetch('/database/ping', {
        method: 'POST',
        data: {
          host: MYSQL_CONFIG.host,
          port: MYSQL_CONFIG.port,
          user: MYSQL_CONFIG.user,
          password: MYSQL_CONFIG.password,
          database: MYSQL_CONFIG.database
        },
        timeout: 5000
      });

      const ping = Date.now() - startTime;

      return {
        success: response.success || false,
        ping,
        message: response.success ? `Ping thành công: ${ping}ms` : 'Ping thất bại'
      };

    } catch (error) {
      return {
        success: false,
        ping: 0,
        message: `Ping lỗi: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Create users table if not exists
   */
  async createUsersTable(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('[MySQL] 🔄 Creating users table...');

      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          full_name VARCHAR(255),
          phone VARCHAR(20),
          role ENUM('admin', 'user', 'manager', 'viewer') DEFAULT 'user',
          is_active BOOLEAN DEFAULT TRUE,
          avatar_url TEXT,
          last_login TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          metadata JSON,
          INDEX idx_username (username),
          INDEX idx_email (email),
          INDEX idx_role (role),
          INDEX idx_active (is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;

      const result = await apiFetch('/database/query', {
        method: 'POST',
        data: {
          ...MYSQL_CONFIG,
          query: createTableSQL
        }
      });

      if (result.success) {
        console.log('[MySQL] ✅ Users table created successfully');
        return {
          success: true,
          message: 'Bảng users đã được tạo thành công'
        };
      } else {
        return {
          success: false,
          message: `Tạo bảng thất bại: ${result.message}`
        };
      }

    } catch (error) {
      console.error('[MySQL] ❌ Create table failed:', error);
      return {
        success: false,
        message: `Lỗi tạo bảng: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Export singleton instance
export const mySQLConnectionService = new MySQLConnectionService();

// Export utility functions
export const testMySQLConnection = () => mySQLConnectionService.testConnection();
export const runFullDatabaseTest = () => mySQLConnectionService.runFullDatabaseTest();
export const pingMySQLConnection = () => mySQLConnectionService.pingConnection();
export const createUsersTable = () => mySQLConnectionService.createUsersTable();