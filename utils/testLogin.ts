/**
 * Test Login Helper
 * Quick login với dữ liệu mẫu từ backend
 */

import authApi from '@/services/api/authApi';
import { setItem } from '@/utils/storage';

// Test accounts từ backend (Created: 2025-12-11)
export const TEST_ACCOUNTS = {
  client: {
    email: 'client.test@demo.com',
    password: 'Test123456',
    role: 'CLIENT',
    description: 'Test user - Khách hàng'
  },
  engineer: {
    email: 'engineer.test@demo.com',
    password: 'Test123456',
    role: 'ENGINEER',
    description: 'Test engineer - Kỹ sư'
  },
  admin: {
    email: 'admin.test@demo.com',
    password: 'Test123456',
    role: 'ADMIN',
    description: 'Test admin - Quản trị viên'
  }
} as const;

export type TestAccountType = keyof typeof TEST_ACCOUNTS;

/**
 * Quick login với test account
 */
export async function quickLogin(accountType: TestAccountType = 'client') {
  const account = TEST_ACCOUNTS[accountType];
  
  console.log(`[QuickLogin] Logging in as ${account.description}...`);
  console.log(`[QuickLogin] Email: ${account.email}`);
  
  try {
    const response = await authApi.login({
      email: account.email,
      password: account.password
    });
    
    // Store tokens
    await setItem('accessToken', response.accessToken);
    await setItem('refreshToken', response.refreshToken);
    
    console.log('[QuickLogin] ✅ Login successful!');
    console.log('[QuickLogin] User:', {
      id: response.user.id,
      email: response.user.email,
      name: response.user.name,
      role: response.user.role
    });
    
    return response;
  } catch (error: any) {
    console.error('[QuickLogin] ❌ Login failed:', error.message);
    throw error;
  }
}

/**
 * Get all available test accounts info
 */
export function getTestAccountsInfo() {
  return Object.entries(TEST_ACCOUNTS).map(([key, account]) => ({
    type: key as TestAccountType,
    email: account.email,
    password: account.password,
    role: account.role,
    description: account.description
  }));
}

export default {
  TEST_ACCOUNTS,
  quickLogin,
  getTestAccountsInfo
};
