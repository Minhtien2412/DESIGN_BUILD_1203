// Connection testing utility for frontend-backend integration
// Run in React Native debugger console or as standalone script

import { Platform } from 'react-native';
import { API_BASE, api, healthCheck } from '../services/api';
import { healthMonitor } from '../services/healthMonitor';

interface TestResult {
  name: string;
  success: boolean;
  message: string;
  data?: any;
  duration?: number;
}

class ConnectionTester {
  private results: TestResult[] = [];

  // Test individual endpoint
  async testEndpoint(name: string, url: string, method: 'GET' | 'POST' = 'GET', data?: any): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const response = method === 'GET' 
        ? await api.get(url)
        : await api.post(url, data);
      
      const duration = Date.now() - startTime;
      
      return {
        name,
        success: true,
        message: `✅ ${name} (${response.status}) - ${duration}ms`,
        data: response.data,
        duration
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      return {
        name,
        success: false,
        message: `❌ ${name} - ${error.message}`,
        data: { error: error.message, status: error.status },
        duration
      };
    }
  }

  // Test health endpoint
  async testHealth(): Promise<TestResult> {
    console.log('🏥 Testing health endpoint...');
    
    try {
      const result = await healthCheck();
      return {
        name: 'Health Check',
        success: result.status === 'ok',
        message: result.status === 'ok' ? '✅ Health check passed' : '⚠️ Health check degraded',
        data: result
      };
    } catch (error: any) {
      return {
        name: 'Health Check',
        success: false,
        message: `❌ Health check failed: ${error.message}`,
        data: { error: error.message }
      };
    }
  }

  // Test configuration loading
  async testConfig(): Promise<TestResult> {
    console.log('⚙️ Testing config endpoint...');
    return this.testEndpoint('Config Load', '/config');
  }

  // Test authentication flow
  async testAuth(): Promise<TestResult> {
    console.log('🔐 Testing authentication...');
    
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const loginResult = await this.testEndpoint('Auth Login', '/auth/login', 'POST', loginData);
    
    if (loginResult.success && loginResult.data?.token) {
      // Test protected endpoint
      const meResult = await this.testEndpoint('Auth Me', '/auth/me');
      return {
        name: 'Authentication Flow',
        success: loginResult.success && meResult.success,
        message: loginResult.success && meResult.success 
          ? '✅ Authentication flow working'
          : '❌ Authentication flow failed',
        data: { login: loginResult.data, me: meResult.data }
      };
    }
    
    return loginResult;
  }

  // Test production WorkOrder API
  async testWorkOrderAPI(): Promise<TestResult> {
    console.log('🏗️ Testing WorkOrder API...');
    
    const workOrderData = {
      projectId: 1,
      title: "Frontend Connection Test",
      meta: {
        deadline: "2025-10-20",
        source: "frontend-test",
        timestamp: new Date().toISOString()
      }
    };
    
    return this.testEndpoint('WorkOrder API', '/v1/workorders', 'POST', workOrderData);
  }

  // Test production database connectivity  
  async testDatabaseConnectivity(): Promise<TestResult> {
    console.log('💾 Testing Database Connectivity...');
    
    const listResult = await this.testEndpoint('WorkOrder List', '/v1/workorders');
    
    return {
      name: 'Database Connectivity',
      success: listResult.success && (listResult.data?.data !== undefined),
      message: listResult.success 
        ? `✅ Database connectivity working (${Array.isArray(listResult.data?.data) ? listResult.data.data.length : 'data'} records)`
        : '❌ Database connectivity failed',
      data: listResult.data
    };
  }

  // Test data endpoints
  async testDataEndpoints(): Promise<TestResult[]> {
    console.log('📊 Testing data endpoints...');
    
    const tests = [
      this.testEndpoint('Projects', '/projects'),
      this.testEndpoint('Products', '/products')
    ];
    
    return Promise.all(tests);
  }

  // Test LiveKit endpoints
  async testLiveKit(): Promise<TestResult[]> {
    console.log('🎥 Testing LiveKit endpoints...');
    
    const roomData = {
      name: 'test-room-' + Date.now(),
      maxParticipants: 10
    };
    
    const createRoomTest = this.testEndpoint('Create Room', '/rooms', 'POST', roomData);
    const getTokenTest = this.testEndpoint('Get Token', `/rooms/${roomData.name}/token`);
    
    return Promise.all([createRoomTest, getTokenTest]);
  }

  // Test health monitoring
  async testHealthMonitoring(): Promise<TestResult> {
    console.log('📊 Testing health monitoring...');
    
    return new Promise((resolve) => {
      let checkCount = 0;
      const maxChecks = 3;
      
      const unsubscribe = healthMonitor.subscribe((status) => {
        checkCount++;
        
        if (checkCount >= maxChecks) {
          unsubscribe();
          healthMonitor.stop();
          
          resolve({
            name: 'Health Monitoring',
            success: true,
            message: `✅ Health monitoring working (${checkCount} checks)`,
            data: status
          });
        }
      });
      
      healthMonitor.start();
      
      // Timeout after 10 seconds
      setTimeout(() => {
        unsubscribe();
        healthMonitor.stop();
        
        resolve({
          name: 'Health Monitoring',
          success: false,
          message: '❌ Health monitoring timeout',
          data: { checkCount }
        });
      }, 10000);
    });
  }

  // Run comprehensive test suite
  async runFullTest(): Promise<void> {
    console.log('\n🚀 Starting Comprehensive Connection Test');
    console.log('==========================================');
    console.log(`📍 API Base: ${API_BASE}`);
    console.log(`📱 Platform: ${Platform.OS}`);
    console.log('');

    this.results = [];

    // Basic connectivity tests
    console.log('1️⃣ Basic Connectivity Tests');
    this.results.push(await this.testHealth());
    this.results.push(await this.testConfig());
    
    // Authentication tests
    console.log('\n2️⃣ Authentication Tests');
    this.results.push(await this.testAuth());
    
    // Data endpoint tests
    console.log('\n3️⃣ Data Endpoint Tests');
    const dataResults = await this.testDataEndpoints();
    this.results.push(...dataResults);
    
    // LiveKit tests
    console.log('\n4️⃣ LiveKit Tests');
    const liveKitResults = await this.testLiveKit();
    this.results.push(...liveKitResults);
    
    // Health monitoring test
    console.log('\n5️⃣ Health Monitoring Test');
    this.results.push(await this.testHealthMonitoring());
    
    // Print summary
    this.printSummary();
  }

  // Print test results summary
  printSummary(): void {
    console.log('\n📋 Test Results Summary');
    console.log('=======================');
    
    const successful = this.results.filter(r => r.success).length;
    const total = this.results.length;
    const successRate = ((successful / total) * 100).toFixed(1);
    
    this.results.forEach(result => {
      console.log(result.message);
      if (result.duration) {
        console.log(`   ⏱️ Duration: ${result.duration}ms`);
      }
    });
    
    console.log('');
    console.log(`📊 Success Rate: ${successful}/${total} (${successRate}%)`);
    
    if (successful === total) {
      console.log('🎉 All tests passed! Connection is working properly.');
    } else {
      console.log('⚠️ Some tests failed. Check backend server and configuration.');
    }
    
    console.log('=======================');
  }

  // Get test results
  getResults(): TestResult[] {
    return this.results;
  }
}

// Export for use in app
export const connectionTester = new ConnectionTester();

// Auto-run test in development
if (__DEV__) {
  // Run test after a delay to allow app initialization
  setTimeout(() => {
    connectionTester.runFullTest().catch(console.error);
  }, 5000);
}

// Standalone test function for manual use
export async function testConnection() {
  return connectionTester.runFullTest();
}

// Quick health test function
export async function quickHealthTest() {
  console.log('🏥 Quick Health Test');
  console.log('===================');
  
  const tester = new ConnectionTester();
  const result = await tester.testHealth();
  
  console.log(result.message);
  console.log('Data:', result.data);
  
  return result;
}
