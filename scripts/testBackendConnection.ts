/**
 * Backend Connection Test Script
 * 
 * Run this to verify:
 * 1. API health check
 * 2. LiveKit configuration
 * 3. Environment variables
 * 4. Network connectivity
 * 
 * Usage (in development):
 * ```typescript
 * import { runBackendTests } from '@/scripts/testBackendConnection';
 * await runBackendTests();
 * ```
 */

import { API_BASE, apiFetch } from '@/services/api';
import {
    checkLiveKitConfiguration,
    getLiveKitConnectionInfo,
    getLiveKitTokenSafe,
} from '@/services/livekit';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function log(result: TestResult) {
  results.push(result);
  const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
  console.log(`${icon} ${result.name}: ${result.message}`);
  if (result.details) {
    console.log('   Details:', result.details);
  }
}

/**
 * Test 1: Environment Variables
 */
async function testEnvironmentVariables() {
  console.log('\n📋 Test 1: Environment Variables\n');

  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || API_BASE;
  const livekitUrl = process.env.EXPO_PUBLIC_LIVEKIT_WS_URL;
  const env = process.env.EXPO_PUBLIC_ENV || 'production';

  log({
    name: 'API Base URL',
    status: apiBaseUrl ? 'pass' : 'fail',
    message: apiBaseUrl || 'Not configured',
    details: { apiBaseUrl, env },
  });

  log({
    name: 'LiveKit WebSocket URL',
    status: livekitUrl ? 'pass' : 'fail',
    message: livekitUrl || 'Not configured',
    details: { livekitUrl },
  });

  // Check for production security
  if (env === 'production') {
    if (apiBaseUrl.startsWith('http://')) {
      log({
        name: 'API Security',
        status: 'warning',
        message: 'Production should use HTTPS',
        details: { apiBaseUrl },
      });
    } else {
      log({
        name: 'API Security',
        status: 'pass',
        message: 'Using HTTPS',
      });
    }

    if (livekitUrl?.startsWith('ws://')) {
      log({
        name: 'LiveKit Security',
        status: 'warning',
        message: 'Production should use WSS',
        details: { livekitUrl },
      });
    } else if (livekitUrl?.startsWith('wss://')) {
      log({
        name: 'LiveKit Security',
        status: 'pass',
        message: 'Using secure WebSocket (WSS)',
      });
    }
  }
}

/**
 * Test 2: API Health Check
 */
async function testApiHealthCheck() {
  console.log('\n🏥 Test 2: API Health Check\n');

  try {
    const startTime = Date.now();
    const response = await apiFetch<{ status: string; ts: number }>('/health');
    const duration = Date.now() - startTime;

    if (response.status === 'ok') {
      log({
        name: 'Health Check',
        status: 'pass',
        message: `API is healthy (${duration}ms)`,
        details: response,
      });

      // Check response time
      if (duration > 1000) {
        log({
          name: 'Response Time',
          status: 'warning',
          message: `Slow response (${duration}ms)`,
        });
      } else {
        log({
          name: 'Response Time',
          status: 'pass',
          message: `Fast response (${duration}ms)`,
        });
      }
    } else {
      log({
        name: 'Health Check',
        status: 'fail',
        message: 'Unexpected response',
        details: response,
      });
    }
  } catch (error: any) {
    log({
      name: 'Health Check',
      status: 'fail',
      message: error.message || 'Connection failed',
      details: { error: error.toString() },
    });
  }
}

/**
 * Test 3: LiveKit Configuration
 */
async function testLiveKitConfiguration() {
  console.log('\n🎥 Test 3: LiveKit Configuration\n');

  const info = getLiveKitConnectionInfo();
  const configError = checkLiveKitConfiguration();

  if (configError) {
    log({
      name: 'LiveKit Config',
      status: 'fail',
      message: configError,
      details: info,
    });
    return;
  }

  log({
    name: 'LiveKit Config',
    status: 'pass',
    message: 'Configuration valid',
    details: info,
  });

  // Check WebSocket URL format
  if (info.wsUrl.endsWith('/rtc')) {
    log({
      name: 'LiveKit Endpoint',
      status: 'pass',
      message: 'Correct endpoint (/livekit/rtc)',
    });
  } else {
    log({
      name: 'LiveKit Endpoint',
      status: 'warning',
      message: 'URL should end with /rtc',
      details: { wsUrl: info.wsUrl },
    });
  }
}

/**
 * Test 4: LiveKit Token (requires backend endpoint)
 */
async function testLiveKitToken() {
  console.log('\n🎫 Test 4: LiveKit Token Fetch\n');

  try {
    const result = await getLiveKitTokenSafe('test-room', 'test-user');

    if (result.success && result.token) {
      log({
        name: 'LiveKit Token',
        status: 'pass',
        message: 'Token received from backend',
        details: {
          tokenLength: result.token.length,
          preview: result.token.substring(0, 30) + '...',
        },
      });

      // Basic JWT validation
      if (result.token.split('.').length === 3) {
        log({
          name: 'Token Format',
          status: 'pass',
          message: 'Valid JWT format (3 parts)',
        });
      } else {
        log({
          name: 'Token Format',
          status: 'warning',
          message: 'Unexpected token format',
        });
      }
    } else {
      log({
        name: 'LiveKit Token',
        status: 'fail',
        message: result.error || 'Failed to get token',
      });
    }
  } catch (error: any) {
    log({
      name: 'LiveKit Token',
      status: 'fail',
      message: error.message || 'Token fetch failed',
      details: { error: error.toString() },
    });

    // Check if backend endpoint exists
    log({
      name: 'Backend Endpoint',
      status: 'warning',
      message: 'POST /livekit/token may not be implemented yet',
    });
  }
}

/**
 * Test 5: CORS & Network
 */
async function testCorsAndNetwork() {
  console.log('\n🌐 Test 5: CORS & Network\n');

  try {
    // Try a simple OPTIONS request (preflight)
    const response = await fetch(`${API_BASE}/health`, {
      method: 'OPTIONS',
    });

    const corsHeaders = {
      'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
      'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
      'access-control-allow-headers': response.headers.get('access-control-allow-headers'),
    };

    if (corsHeaders['access-control-allow-origin']) {
      log({
        name: 'CORS Headers',
        status: 'pass',
        message: 'CORS enabled',
        details: corsHeaders,
      });
    } else {
      log({
        name: 'CORS Headers',
        status: 'warning',
        message: 'CORS headers not detected (may not be needed for native)',
      });
    }

    // Check if SSL/TLS is working
    if (API_BASE.startsWith('https://')) {
      log({
        name: 'TLS/SSL',
        status: 'pass',
        message: 'Secure connection (HTTPS)',
      });
    }
  } catch (error: any) {
    log({
      name: 'CORS & Network',
      status: 'warning',
      message: 'Could not check CORS (not critical for native apps)',
    });
  }
}

/**
 * Test 6: Platform-Specific Network
 */
async function testPlatformNetwork() {
  console.log('\n📱 Test 6: Platform-Specific Configuration\n');

  const platform = require('react-native').Platform.OS;
  const apiBase = API_BASE;

  log({
    name: 'Platform',
    status: 'pass',
    message: platform,
    details: { apiBase },
  });

  // Platform-specific warnings
  if (platform === 'android' && apiBase.includes('localhost')) {
    log({
      name: 'Android Network',
      status: 'warning',
      message: 'Android emulator should use 10.0.2.2 instead of localhost',
      details: { suggestion: apiBase.replace('localhost', '10.0.2.2') },
    });
  }

  if (platform === 'ios' && apiBase.includes('10.0.2.2')) {
    log({
      name: 'iOS Network',
      status: 'warning',
      message: 'iOS simulator should use localhost instead of 10.0.2.2',
      details: { suggestion: apiBase.replace('10.0.2.2', 'localhost') },
    });
  }
}

/**
 * Generate Test Report
 */
function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60) + '\n');

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}\n`);

  if (failed === 0) {
    console.log('🎉 All critical tests passed!');
    if (warnings > 0) {
      console.log('⚠️  Review warnings for optimization opportunities.');
    }
  } else {
    console.log('❌ Some tests failed. Please fix critical issues before deploying.');
  }

  console.log('\n' + '='.repeat(60) + '\n');

  return {
    passed,
    failed,
    warnings,
    total,
    success: failed === 0,
    results,
  };
}

/**
 * Run all backend tests
 */
export async function runBackendTests() {
  console.clear();
  console.log('🚀 Backend Connection Test Suite');
  console.log('='.repeat(60));

  await testEnvironmentVariables();
  await testApiHealthCheck();
  await testLiveKitConfiguration();
  await testLiveKitToken();
  await testCorsAndNetwork();
  await testPlatformNetwork();

  return generateReport();
}

/**
 * Quick health check only (fast)
 */
export async function quickHealthCheck() {
  try {
    const response = await apiFetch<{ status: string }>('/health');
    return response.status === 'ok';
  } catch {
    return false;
  }
}

/**
 * Export for use in app
 */
export default {
  runBackendTests,
  quickHealthCheck,
};
