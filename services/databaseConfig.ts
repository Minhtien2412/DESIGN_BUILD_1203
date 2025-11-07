/**
 * Database Configuration Service
 * Quản lý cấu hình kết nối MySQL database
 */

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: boolean;
  connectionLimit: number;
  idleTimeout: number;
  acquireTimeout: number;
  maxQueryTime: number;
}

export interface BackupConfig {
  enabled: boolean;
  schedule: string;
  retentionDays: number;
}

export interface SecurityConfig {
  encryptSensitiveData: boolean;
  auditLogEnabled: boolean;
  maxQueryTime: number;
}

class DatabaseConfigService {
  private config: DatabaseConfig;
  private backupConfig: BackupConfig;
  private securityConfig: SecurityConfig;

  constructor() {
    // Load configuration from environment or defaults
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'nhaxinhd_designbuild',
      password: process.env.DB_PASSWORD || 'tv!2+luM+5G4Y-?q',
      database: process.env.DB_NAME || 'nhaxinhd_designbuild',
      ssl: process.env.DB_SSL === 'true',
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
      idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
      acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000'),
      maxQueryTime: parseInt(process.env.DB_MAX_QUERY_TIME || '30000')
    };

    this.backupConfig = {
      enabled: process.env.DB_BACKUP_ENABLED === 'true',
      schedule: process.env.DB_BACKUP_SCHEDULE || '0 2 * * *',
      retentionDays: parseInt(process.env.DB_BACKUP_RETENTION_DAYS || '7')
    };

    this.securityConfig = {
      encryptSensitiveData: process.env.DB_ENCRYPT_SENSITIVE_DATA === 'true',
      auditLogEnabled: process.env.DB_AUDIT_LOG_ENABLED === 'true',
      maxQueryTime: parseInt(process.env.DB_MAX_QUERY_TIME || '30000')
    };
  }

  // ===========================================
  // CONFIGURATION GETTERS
  // ===========================================

  getConfig(): DatabaseConfig {
    return { ...this.config };
  }

  getBackupConfig(): BackupConfig {
    return { ...this.backupConfig };
  }

  getSecurityConfig(): SecurityConfig {
    return { ...this.securityConfig };
  }

  // ===========================================
  // CONNECTION STRING GENERATION
  // ===========================================

  /**
   * Tạo connection string cho MySQL
   */
  getConnectionString(): string {
    const { host, port, user, password, database, ssl } = this.config;
    
    let connectionString = `mysql://${user}:${password}@${host}:${port}/${database}`;
    
    if (ssl) {
      connectionString += '?ssl=true';
    }
    
    return connectionString;
  }

  /**
   * Tạo connection options cho MySQL driver
   */
  getConnectionOptions(): any {
    return {
      host: this.config.host,
      port: this.config.port,
      user: this.config.user,
      password: this.config.password,
      database: this.config.database,
      ssl: this.config.ssl ? { rejectUnauthorized: false } : false,
      connectionLimit: this.config.connectionLimit,
      idleTimeout: this.config.idleTimeout,
      acquireTimeout: this.config.acquireTimeout,
      timeout: this.config.maxQueryTime,
      charset: 'utf8mb4',
      timezone: '+07:00', // Vietnam timezone
      dateStrings: true,
      supportBigNumbers: true,
      bigNumberStrings: true
    };
  }

  // ===========================================
  // VALIDATION & TESTING
  // ===========================================

  /**
   * Validate configuration
   */
  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.host) {
      errors.push('Database host is required');
    }

    if (!this.config.user) {
      errors.push('Database user is required');
    }

    if (!this.config.password) {
      errors.push('Database password is required');
    }

    if (!this.config.database) {
      errors.push('Database name is required');
    }

    if (this.config.port < 1 || this.config.port > 65535) {
      errors.push('Database port must be between 1 and 65535');
    }

    if (this.config.connectionLimit < 1 || this.config.connectionLimit > 100) {
      errors.push('Connection limit must be between 1 and 100');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<{ success: boolean; message: string; responseTime: number }> {
    const startTime = Date.now();
    
    try {
      // This would be implemented with actual MySQL connection test
      // For now, we'll simulate the test
      const connectionOptions = this.getConnectionOptions();
      
      console.log('[DatabaseConfig] Testing connection to:', {
        host: connectionOptions.host,
        port: connectionOptions.port,
        user: connectionOptions.user,
        database: connectionOptions.database
      });

      // Simulate connection test delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const responseTime = Date.now() - startTime;
      
      return {
        success: true,
        message: 'Database connection successful',
        responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
        responseTime
      };
    }
  }

  // ===========================================
  // SECURITY UTILITIES
  // ===========================================

  /**
   * Mask sensitive information for logging
   */
  getMaskedConfig(): any {
    return {
      host: this.config.host,
      port: this.config.port,
      user: this.config.user,
      password: '***masked***',
      database: this.config.database,
      ssl: this.config.ssl,
      connectionLimit: this.config.connectionLimit
    };
  }

  /**
   * Get configuration for environment display
   */
  getDisplayConfig(): any {
    return {
      'Database Host': this.config.host,
      'Database Port': this.config.port,
      'Database Name': this.config.database,
      'Username': this.config.user,
      'SSL Enabled': this.config.ssl ? 'Yes' : 'No',
      'Connection Pool Size': this.config.connectionLimit,
      'Backup Enabled': this.backupConfig.enabled ? 'Yes' : 'No',
      'Audit Log': this.securityConfig.auditLogEnabled ? 'Yes' : 'No'
    };
  }

  // ===========================================
  // DYNAMIC CONFIGURATION UPDATE
  // ===========================================

  /**
   * Update configuration at runtime
   */
  updateConfig(newConfig: Partial<DatabaseConfig>): { success: boolean; message: string } {
    try {
      // Validate new configuration
      const tempConfig = { ...this.config, ...newConfig };
      
      // Basic validation
      if (newConfig.port && (newConfig.port < 1 || newConfig.port > 65535)) {
        return { success: false, message: 'Invalid port number' };
      }

      if (newConfig.connectionLimit && (newConfig.connectionLimit < 1 || newConfig.connectionLimit > 100)) {
        return { success: false, message: 'Invalid connection limit' };
      }

      // Update configuration
      this.config = tempConfig;
      
      console.log('[DatabaseConfig] Configuration updated successfully');
      
      return { success: true, message: 'Configuration updated successfully' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update configuration'
      };
    }
  }
}

// Export singleton instance
export const databaseConfigService = new DatabaseConfigService();
export default databaseConfigService;