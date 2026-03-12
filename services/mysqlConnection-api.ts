/**
 * MySQL Connection Service - Backend API Version
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
  details?: {
    host: string;
    port: number;
    database: string;
    serverVersion?: string;
    pingTime: number;
    tables: string[];
    connectedAt: string;
  };
  error?: string;
  code?: string;
}

export interface DatabaseTestResult {
  success: boolean;
  message: string;
  results?: {
    tests: {
      test: string;
      status: 'PASSED' | 'FAILED';
      result?: string;
      error?: string;
    }[];
    summary: {
      total: number;
      passed: number;
      failed: number;
    };
  };
}

/**
 * Test MySQL connection via backend API
 */
export async function testMySQLConnection(): Promise<MySQLConnectionResult> {
  try {
    console.log('[MySQL] 🔍 Testing connection via backend API...');
    
    const response = await apiFetch('/mysql/test-connection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.success) {
      console.log('[MySQL] ✅ Connection successful!');
      return {
        success: true,
        message: response.message,
        details: response.details
      };
    } else {
      console.error('[MySQL] ❌ Connection failed:', response.message);
      return {
        success: false,
        message: response.message,
        error: response.error,
        code: response.code
      };
    }
    
  } catch (error: any) {
    console.error('[MySQL] ❌ API call failed:', error.message);
    return {
      success: false,
      message: 'API call failed',
      error: error.message
    };
  }
}

/**
 * Ping MySQL connection via backend API
 */
export async function pingMySQLConnection(): Promise<{ success: boolean; ping?: number; error?: string }> {
  try {
    const response = await apiFetch('/mysql/ping');
    
    if (response.success) {
      return {
        success: true,
        ping: response.ping
      };
    } else {
      return {
        success: false,
        error: response.message
      };
    }
    
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check if users table exists via backend API
 */
export async function checkUsersTable(): Promise<{ success: boolean; exists?: boolean; structure?: any; recordCount?: number; error?: string }> {
  try {
    const response = await apiFetch('/mysql/check-table');
    
    if (response.success) {
      return {
        success: true,
        exists: response.exists,
        structure: response.structure,
        recordCount: response.recordCount
      };
    } else {
      return {
        success: false,
        error: response.message
      };
    }
    
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create users table via backend API
 */
export async function createUsersTable(): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await apiFetch('/mysql/create-table', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return {
      success: response.success,
      message: response.message,
      error: response.error
    };
    
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Run full database test via backend API
 */
export async function runFullDatabaseTest(): Promise<DatabaseTestResult> {
  try {
    console.log('[MySQL] 🧪 Running full database test via backend API...');
    
    const response = await apiFetch('/mysql/full-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.success) {
      console.log('[MySQL] ✅ Database test completed!');
      return {
        success: true,
        message: response.message,
        results: response.results
      };
    } else {
      console.error('[MySQL] ❌ Database test failed:', response.message);
      return {
        success: false,
        message: response.message
      };
    }
    
  } catch (error: any) {
    console.error('[MySQL] ❌ Database test API call failed:', error.message);
    return {
      success: false,
      message: 'Database test API call failed',
    };
  }
}

/**
 * Ensure admin user exists via backend API
 */
export async function ensureAdminUser(): Promise<{ success: boolean; message?: string; existed?: boolean; credentials?: any; error?: string }> {
  try {
    const response = await apiFetch('/mysql/ensure-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return {
      success: response.success,
      message: response.message,
      existed: response.existed,
      credentials: response.credentials,
      error: response.error
    };
    
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}
