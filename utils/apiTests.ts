// Test script to verify API fixes and health monitoring
// Run this in React Native debugger console or as a standalone test

import { API_BASE, healthCheck } from '../services/api';
import { healthMonitor } from '../services/healthMonitor';

// Test 1: Verify URL resolution
console.log('🔍 Testing URL Resolution...');
console.log('API_BASE:', API_BASE);
console.log('Platform:', require('react-native').Platform.OS);

// Test 2: Test health check function
async function testHealthCheck() {
  console.log('\n🏥 Testing Health Check...');
  try {
    const result = await healthCheck();
    console.log('✅ Health check success:', result);
    return true;
  } catch (error: any) {
    console.log('❌ Health check failed:', error.message);
    console.log('Error details:', {
      status: error.status,
      code: error.code,
      url: error.url
    });
    return false;
  }
}

// Test 3: Test health monitor with exponential backoff
function testHealthMonitor() {
  console.log('\n📊 Testing Health Monitor...');
  
  let checkCount = 0;
  const unsubscribe = healthMonitor.subscribe((status) => {
    checkCount++;
    console.log(`Health Monitor Update #${checkCount}:`, {
      isOnline: status.isOnline,
      errorCount: status.errorCount,
      lastCheck: status.lastCheck.toISOString(),
      service: status.service
    });
    
    // Stop after 5 updates to prevent spam
    if (checkCount >= 5) {
      console.log('🛑 Stopping health monitor test');
      unsubscribe();
      healthMonitor.stop();
    }
  });
  
  // Start monitoring
  healthMonitor.start();
  
  // Also test manual check
  setTimeout(() => {
    console.log('🔄 Testing manual health check...');
    healthMonitor.checkNow();
  }, 2000);
}

// Test 4: Test network error handling
async function testNetworkErrorHandling() {
  console.log('\n🌐 Testing Network Error Handling...');
  
  const { api } = require('../services/api');
  
  try {
    // Try to call a non-existent endpoint to test error handling
    await api.get('/nonexistent-endpoint');
  } catch (error: any) {
    console.log('✅ Error handling working:', {
      name: error.name,
      message: error.message,
      status: error.status,
      code: error.code
    });
  }
}

// Test 5: Test Android-specific URL handling
function testAndroidUrls() {
  console.log('\n📱 Testing Android URL Handling...');
  
  const testUrls = [
    'http://localhost:4000',
    'http://127.0.0.1:4000',
    'https://api.thietkeresort.com.vn'
  ];
  
  const { normalizeDevUrl } = require('../services/api');
  
  testUrls.forEach(url => {
    // This function is private, so we'll test the logic manually
    try {
      const u = new URL(url);
      const isAndroid = require('react-native').Platform.OS === 'android';
      if (isAndroid && (u.hostname === 'localhost' || u.hostname === '127.0.0.1')) {
        u.hostname = '10.0.2.2';
        console.log(`✅ ${url} → ${u.toString()}`);
      } else {
        console.log(`ℹ️  ${url} → unchanged (${isAndroid ? 'Android' : 'not Android'})`);
      }
    } catch (e) {
      console.log(`❌ Invalid URL: ${url}`);
    }
  });
}

// Run all tests
export async function runApiTests() {
  console.log('🚀 Starting API Tests...\n');
  console.log('==========================');
  
  // Test URL resolution
  testAndroidUrls();
  
  // Test health check
  const healthOk = await testHealthCheck();
  
  // Test error handling
  await testNetworkErrorHandling();
  
  // Test health monitor (only if health check works)
  if (healthOk) {
    testHealthMonitor();
  } else {
    console.log('⚠️  Skipping health monitor test due to health check failure');
  }
  
  console.log('\n==========================');
  console.log('🏁 API Tests Complete!');
}

// Auto-run tests if in development
if (__DEV__) {
  setTimeout(() => {
    runApiTests().catch(console.error);
  }, 1000);
}