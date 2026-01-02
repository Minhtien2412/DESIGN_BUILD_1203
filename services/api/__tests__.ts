/**
 * API Integration Test Script
 * Manual testing script for new API services
 * 
 * Usage:
 * 1. Open this file in your app
 * 2. Import and call test functions
 * 3. Check console logs for results
 */

import authService from '@/services/api/auth.service';
import { getAccessToken, getRefreshToken } from '@/services/api/client';
import dashboardService from '@/services/api/dashboard.service';
import projectService from '@/services/api/project.service';
import taskService from '@/services/api/task.service';
import type { RegisterData } from '@/services/api/types';
import userService from '@/services/api/user.service';

// ==================== TEST DATA ====================

const TEST_CREDENTIALS = {
  admin: {
    email: 'admin@baotien.vn',
    password: 'admin123',
  },
  engineer: {
    email: 'engineer@baotien.vn',
    password: 'engineer123',
  },
  client: {
    email: 'client@baotien.vn',
    password: 'client123',
  },
};

// ==================== AUTH TESTS ====================

export async function testLogin(role: 'admin' | 'engineer' | 'client' = 'admin') {
  console.log('🧪 Testing Login...');
  
  try {
    const credentials = TEST_CREDENTIALS[role];
    const response = await authService.login(credentials);
    
    console.log('✅ Login Success!');
    console.log('User:', response.user);
    console.log('Token:', response.token ? 'Present' : 'Missing');
    console.log('Refresh Token:', response.refreshToken ? 'Present' : 'Missing');
    
    return response;
  } catch (error: any) {
    console.error('❌ Login Failed:', error.message);
    throw error;
  }
}

export async function testRegister() {
  console.log('🧪 Testing Register...');
  
  try {
    const registerData: RegisterData = {
      email: `test${Date.now()}@example.com`,
      password: 'test123456',
      fullName: 'Test User',
      role: 'CLIENT',
      phone: '0123456789',
    };
    
    const response = await authService.register(registerData);
    
    console.log('✅ Register Success!');
    console.log('User:', response.user);
    console.log('Token:', response.token ? 'Present' : 'Missing');
    
    return response;
  } catch (error: any) {
    console.error('❌ Register Failed:', error.message);
    throw error;
  }
}

export async function testGetCurrentUser() {
  console.log('🧪 Testing Get Current User...');
  
  try {
    const user = await authService.me();
    
    console.log('✅ Get User Success!');
    console.log('User:', user);
    
    return user;
  } catch (error: any) {
    console.error('❌ Get User Failed:', error.message);
    throw error;
  }
}

export async function testLogout() {
  console.log('🧪 Testing Logout...');
  
  try {
    await authService.logout();
    
    const token = await getAccessToken();
    const refreshToken = await getRefreshToken();
    
    console.log('✅ Logout Success!');
    console.log('Tokens cleared:', !token && !refreshToken);
    
    return true;
  } catch (error: any) {
    console.error('❌ Logout Failed:', error.message);
    throw error;
  }
}

// ==================== USER TESTS ====================

export async function testUpdateProfile() {
  console.log('🧪 Testing Update Profile...');
  
  try {
    const user = await userService.updateProfile({
      fullName: 'Updated Name ' + Date.now(),
      phone: '0987654321',
    });
    
    console.log('✅ Update Profile Success!');
    console.log('User:', user);
    
    return user;
  } catch (error: any) {
    console.error('❌ Update Profile Failed:', error.message);
    throw error;
  }
}

export async function testChangePassword() {
  console.log('🧪 Testing Change Password...');
  
  try {
    await userService.changePassword({
      currentPassword: 'admin123',
      newPassword: 'admin123', // Same password for testing
    });
    
    console.log('✅ Change Password Success!');
    
    return true;
  } catch (error: any) {
    console.error('❌ Change Password Failed:', error.message);
    throw error;
  }
}

export async function testListUsers() {
  console.log('🧪 Testing List Users...');
  
  try {
    const response = await userService.list({
      page: 1,
      limit: 10,
    });
    
    console.log('✅ List Users Success!');
    console.log('Total:', response.meta.total);
    console.log('Users:', response.data.length);
    
    return response;
  } catch (error: any) {
    console.error('❌ List Users Failed:', error.message);
    throw error;
  }
}

// ==================== PROJECT TESTS ====================

export async function testListProjects() {
  console.log('🧪 Testing List Projects...');
  
  try {
    const response = await projectService.list({
      page: 1,
      limit: 10,
    });
    
    console.log('✅ List Projects Success!');
    console.log('Total:', response.meta.total);
    console.log('Projects:', response.data.length);
    
    return response;
  } catch (error: any) {
    console.error('❌ List Projects Failed:', error.message);
    throw error;
  }
}

export async function testCreateProject() {
  console.log('🧪 Testing Create Project...');
  
  try {
    const project = await projectService.create({
      name: 'Test Project ' + Date.now(),
      description: 'Test project created by API test',
      startDate: new Date().toISOString().split('T')[0],
      budget: 1000000,
    });
    
    console.log('✅ Create Project Success!');
    console.log('Project:', project);
    
    return project;
  } catch (error: any) {
    console.error('❌ Create Project Failed:', error.message);
    throw error;
  }
}

// ==================== DASHBOARD TESTS ====================

export async function testAdminDashboard() {
  console.log('🧪 Testing Admin Dashboard...');
  
  try {
    const dashboard = await dashboardService.admin();
    
    console.log('✅ Admin Dashboard Success!');
    console.log('Stats:', dashboard.stats);
    console.log('Projects:', dashboard.recentProjects?.length || 0);
    console.log('Activities:', dashboard.recentActivities?.length || 0);
    
    return dashboard;
  } catch (error: any) {
    console.error('❌ Admin Dashboard Failed:', error.message);
    throw error;
  }
}

export async function testEngineerDashboard() {
  console.log('🧪 Testing Engineer Dashboard...');
  
  try {
    const dashboard = await dashboardService.engineer();
    
    console.log('✅ Engineer Dashboard Success!');
    console.log('Stats:', dashboard.stats);
    console.log('Projects:', dashboard.projects?.length || 0);
    console.log('Tasks:', dashboard.tasks?.length || 0);
    
    return dashboard;
  } catch (error: any) {
    console.error('❌ Engineer Dashboard Failed:', error.message);
    throw error;
  }
}

export async function testClientDashboard() {
  console.log('🧪 Testing Client Dashboard...');
  
  try {
    const dashboard = await dashboardService.client();
    
    console.log('✅ Client Dashboard Success!');
    console.log('Stats:', dashboard.stats);
    console.log('Projects:', dashboard.projects?.length || 0);
    
    return dashboard;
  } catch (error: any) {
    console.error('❌ Client Dashboard Failed:', error.message);
    throw error;
  }
}

// ==================== TASK TESTS ====================

export async function testListTasks() {
  console.log('🧪 Testing List Tasks...');
  
  try {
    const response = await taskService.list({
      page: 1,
      limit: 10,
    });
    
    console.log('✅ List Tasks Success!');
    console.log('Total:', response.meta.total);
    console.log('Tasks:', response.data.length);
    
    return response;
  } catch (error: any) {
    console.error('❌ List Tasks Failed:', error.message);
    throw error;
  }
}

// ==================== TOKEN TESTS ====================

export async function testTokenStorage() {
  console.log('🧪 Testing Token Storage...');
  
  try {
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();
    
    console.log('✅ Token Storage Test!');
    console.log('Access Token:', accessToken ? 'Present' : 'Missing');
    console.log('Refresh Token:', refreshToken ? 'Present' : 'Missing');
    
    return { accessToken, refreshToken };
  } catch (error: any) {
    console.error('❌ Token Storage Failed:', error.message);
    throw error;
  }
}

// ==================== COMPREHENSIVE TEST SUITE ====================

export async function runAllTests() {
  console.log('\n🚀 Running All API Tests...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: [] as Array<{ name: string; status: 'pass' | 'fail'; error?: string }>,
  };
  
  const tests = [
    { name: 'Login', fn: () => testLogin('admin') },
    { name: 'Get Current User', fn: testGetCurrentUser },
    { name: 'Update Profile', fn: testUpdateProfile },
    { name: 'List Users', fn: testListUsers },
    { name: 'List Projects', fn: testListProjects },
    { name: 'Admin Dashboard', fn: testAdminDashboard },
    { name: 'List Tasks', fn: testListTasks },
    { name: 'Token Storage', fn: testTokenStorage },
  ];
  
  for (const test of tests) {
    try {
      console.log(`\n--- ${test.name} ---`);
      await test.fn();
      results.passed++;
      results.tests.push({ name: test.name, status: 'pass' });
    } catch (error: any) {
      results.failed++;
      results.tests.push({ name: test.name, status: 'fail', error: error.message });
    }
  }
  
  console.log('\n\n📊 Test Results:');
  console.log('================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Total: ${tests.length}`);
  
  console.log('\n\nDetailed Results:');
  results.tests.forEach(test => {
    const icon = test.status === 'pass' ? '✅' : '❌';
    console.log(`${icon} ${test.name}${test.error ? `: ${test.error}` : ''}`);
  });
  
  return results;
}

// ==================== QUICK TESTS ====================

export async function quickTest() {
  console.log('🧪 Quick API Test...\n');
  
  try {
    // 1. Login
    console.log('1️⃣ Testing Login...');
    await testLogin('admin');
    
    // 2. Get User
    console.log('\n2️⃣ Testing Get User...');
    await testGetCurrentUser();
    
    // 3. Token Storage
    console.log('\n3️⃣ Testing Token Storage...');
    await testTokenStorage();
    
    console.log('\n✅ All Quick Tests Passed!');
  } catch (error: any) {
    console.error('\n❌ Quick Test Failed:', error.message);
  }
}

// Export all test functions
export default {
  // Auth
  testLogin,
  testRegister,
  testGetCurrentUser,
  testLogout,
  
  // User
  testUpdateProfile,
  testChangePassword,
  testListUsers,
  
  // Project
  testListProjects,
  testCreateProject,
  
  // Dashboard
  testAdminDashboard,
  testEngineerDashboard,
  testClientDashboard,
  
  // Task
  testListTasks,
  
  // Token
  testTokenStorage,
  
  // Suites
  runAllTests,
  quickTest,
};
