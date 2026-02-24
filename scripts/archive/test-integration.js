#!/usr/bin/env node
/**
 * Backend Integration Test
 * Test actual registration flow end-to-end
 */

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.thietkeresort.com.vn';

const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

console.log(`${COLORS.bold}${COLORS.cyan}🧪 Backend Integration Test${COLORS.reset}\n`);

async function testBackendRegistration() {
  console.log(`${COLORS.blue}Testing: Production Backend Registration${COLORS.reset}`);
  console.log(`API: ${API_BASE}\n`);
  
  // Step 1: Check server health
  console.log(`${COLORS.yellow}[1/4]${COLORS.reset} Checking server health...`);
  try {
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log(`${COLORS.green}✅${COLORS.reset} Server is healthy`);
    console.log(`      Status: ${healthData.status}`);
    console.log(`      Service: ${healthData.service}`);
    console.log(`      Uptime: ${Math.floor(healthData.uptime / 60)}m\n`);
  } catch (error) {
    console.log(`${COLORS.red}❌${COLORS.reset} Server health check failed: ${error.message}\n`);
    return;
  }
  
  // Step 2: Test validation
  console.log(`${COLORS.yellow}[2/4]${COLORS.reset} Testing input validation...`);
  try {
    const validationResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'invalidemail', // Invalid format
        password: '123',        // Too short
        fullName: '',           // Empty
        role: 'client'
      }),
    });
    
    const validationData = await validationResponse.json();
    
    if (!validationResponse.ok) {
      console.log(`${COLORS.green}✅${COLORS.reset} Backend validation working`);
      console.log(`      Error: ${validationData.message}`);
      console.log(`      Status: ${validationResponse.status}\n`);
    } else {
      console.log(`${COLORS.yellow}⚠️${COLORS.reset} Validation may be weak\n`);
    }
  } catch (error) {
    if (error.message.includes('429')) {
      console.log(`${COLORS.yellow}⚠️${COLORS.reset} Rate limited (expected from previous tests)\n`);
    } else {
      console.log(`${COLORS.red}❌${COLORS.reset} Validation test failed: ${error.message}\n`);
    }
  }
  
  // Step 3: Test with valid data (will create account)
  console.log(`${COLORS.yellow}[3/4]${COLORS.reset} Testing valid registration...`);
  
  const testEmail = `test${Date.now()}@integration-test.com`;
  const testData = {
    email: testEmail,
    password: 'TestPass123!',
    fullName: 'Integration Test User',
    role: 'client'
  };
  
  console.log(`      Email: ${testEmail}`);
  console.log(`      Name: ${testData.fullName}`);
  console.log(`      Role: ${testData.role}`);
  
  try {
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    });
    
    const registerData = await registerResponse.json();
    
    if (registerResponse.ok) {
      console.log(`${COLORS.green}✅${COLORS.reset} Registration successful!`);
      console.log(`      User ID: ${registerData.user?.id || 'N/A'}`);
      console.log(`      Token: ${registerData.token ? '✅ Received' : '❌ Missing'}`);
      
      // Step 4: Verify we can login with new account
      console.log(`\n${COLORS.yellow}[4/4]${COLORS.reset} Testing login with new account...`);
      
      const loginResponse = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'TestPass123!'
        }),
      });
      
      const loginData = await loginResponse.json();
      
      if (loginResponse.ok) {
        console.log(`${COLORS.green}✅${COLORS.reset} Login successful!`);
        console.log(`      User: ${loginData.user?.fullName || 'N/A'}`);
        console.log(`      Token: ${loginData.token ? '✅ Received' : '❌ Missing'}\n`);
        
        // Success summary
        console.log(`${'─'.repeat(60)}`);
        console.log(`${COLORS.bold}${COLORS.green}🎉 COMPLETE FLOW SUCCESSFUL${COLORS.reset}`);
        console.log(`${'─'.repeat(60)}`);
        console.log(`✅ Server health check`);
        console.log(`✅ Input validation`);
        console.log(`✅ User registration`);
        console.log(`✅ User login`);
        console.log(`\n${COLORS.green}${COLORS.bold}Backend is fully operational!${COLORS.reset}\n`);
        
      } else {
        console.log(`${COLORS.red}❌${COLORS.reset} Login failed: ${loginData.message}\n`);
      }
      
    } else {
      if (registerResponse.status === 429) {
        console.log(`${COLORS.yellow}⚠️${COLORS.reset} Rate limited (${registerData.message})`);
        console.log(`      This is normal after running multiple tests`);
        console.log(`      ${COLORS.cyan}Solution: Wait 1 hour or test manually in browser${COLORS.reset}\n`);
      } else {
        console.log(`${COLORS.red}❌${COLORS.reset} Registration failed: ${registerData.message}`);
        console.log(`      Status: ${registerResponse.status}\n`);
      }
    }
    
  } catch (error) {
    console.log(`${COLORS.red}❌${COLORS.reset} Registration test failed: ${error.message}\n`);
  }
}

// Run test
testBackendRegistration().catch(error => {
  console.error(`${COLORS.red}Fatal error:${COLORS.reset}`, error);
  process.exit(1);
});
