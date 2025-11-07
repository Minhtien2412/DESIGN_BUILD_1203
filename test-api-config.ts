/**
 * Test API Endpoints Configuration
 * Verify /auth/* endpoints work correctly
 */

import { ENV } from './config/env';

console.log('🧪 Testing API Configuration...\n');

// Expected endpoints
const endpoints = {
  register: `${ENV.API_BASE_URL}${ENV.API_PREFIX}/auth/register`,
  login: `${ENV.API_BASE_URL}${ENV.API_PREFIX}/auth/login`,
  me: `${ENV.API_BASE_URL}${ENV.API_PREFIX}/auth/me`,
  roles: `${ENV.API_BASE_URL}${ENV.API_PREFIX}/auth/roles`,
  refresh: `${ENV.API_BASE_URL}${ENV.AUTH_REFRESH_PATH}`,
  google: `${ENV.API_BASE_URL}${ENV.AUTH_GOOGLE_PATH}`,
  facebook: `${ENV.API_BASE_URL}${ENV.AUTH_FACEBOOK_PATH}`,
};

console.log('✅ API Endpoints (Production):\n');
Object.entries(endpoints).forEach(([name, url]) => {
  console.log(`   ${name.padEnd(10)}: ${url}`);
});

console.log('\n📋 Expected URLs:');
console.log('   ✅ POST https://api.thietkeresort.com.vn/auth/register');
console.log('   ✅ POST https://api.thietkeresort.com.vn/auth/login');
console.log('   ✅ GET  https://api.thietkeresort.com.vn/auth/me');
console.log('   ✅ GET  https://api.thietkeresort.com.vn/auth/roles');

console.log('\n🔍 Verification:');
const correct = 
  endpoints.register === 'https://api.thietkeresort.com.vn/auth/register' &&
  endpoints.login === 'https://api.thietkeresort.com.vn/auth/login' &&
  endpoints.me === 'https://api.thietkeresort.com.vn/auth/me' &&
  endpoints.roles === 'https://api.thietkeresort.com.vn/auth/roles';

if (correct) {
  console.log('   ✅ Configuration CORRECT!');
} else {
  console.log('   ❌ Configuration INCORRECT!');
  console.log('   Please check config/env.ts');
}

console.log('\n💡 Note:');
console.log('   • API_PREFIX is empty (NO /api prefix)');
console.log('   • Mobile app uses /auth/* directly');
console.log('   • Backend handles /auth/register, /auth/login, etc.');
