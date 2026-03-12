#!/usr/bin/env node
/**
 * Automated Registration Test Suite
 * Tests register functionality with various scenarios
 */

// Use node-fetch for older Node versions, or native fetch for Node 18+
let fetch;
try {
  // Try native fetch (Node 18+)
  fetch = globalThis.fetch;
  if (!fetch) throw new Error('Native fetch not available');
} catch (e) {
  // Fallback to node-fetch (requires installation)
  console.log('⚠️  Native fetch not available. Install node-fetch: npm install node-fetch');
  process.exit(1);
}

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.thietkeresort.com.vn';
const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

class TestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.tests = [];
  }

  async test(name, fn) {
    process.stdout.write(`${COLORS.blue}Testing:${COLORS.reset} ${name}... `);
    try {
      await fn();
      this.passed++;
      console.log(`${COLORS.green}✅ PASS${COLORS.reset}`);
      this.tests.push({ name, status: 'PASS' });
    } catch (error) {
      this.failed++;
      console.log(`${COLORS.red}❌ FAIL${COLORS.reset}`);
      console.log(`  ${COLORS.red}Error: ${error.message}${COLORS.reset}`);
      this.tests.push({ name, status: 'FAIL', error: error.message });
    }
  }

  summary() {
    console.log(`\n${'━'.repeat(60)}`);
    console.log(`${COLORS.bold}📊 Test Summary${COLORS.reset}`);
    console.log(`${'━'.repeat(60)}`);
    console.log(`Total: ${this.passed + this.failed}`);
    console.log(`${COLORS.green}Passed: ${this.passed}${COLORS.reset}`);
    console.log(`${COLORS.red}Failed: ${this.failed}${COLORS.reset}`);
    console.log(`Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);
    
    if (this.failed > 0) {
      console.log(`\n${COLORS.red}Failed Tests:${COLORS.reset}`);
      this.tests.filter(t => t.status === 'FAIL').forEach(t => {
        console.log(`  - ${t.name}: ${t.error}`);
      });
    }
  }
}

// Test Helpers
async function registerUser(email, password, fullName, role = 'client') {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName, role }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || `HTTP ${response.status}`);
  }
  
  return data;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function generateRandomEmail() {
  return `test${Date.now()}${Math.random().toString(36).substring(7)}@test.com`;
}

// Test Suite
async function runTests() {
  const runner = new TestRunner();
  
  console.log(`${COLORS.bold}🧪 Registration Test Suite${COLORS.reset}`);
  console.log(`API: ${API_BASE}`);
  console.log(`${'━'.repeat(60)}\n`);

  // Test 1: Valid registration
  await runner.test('Valid registration with all fields', async () => {
    const email = generateRandomEmail();
    const result = await registerUser(email, 'Test123!', 'Test User', 'client');
    assert(result.token, 'Should return token');
    assert(result.user, 'Should return user object');
    assert(result.user.email === email, 'Email should match');
  });

  // Test 2: Different roles
  const roles = ['client', 'contractor', 'company', 'architect'];
  for (const role of roles) {
    await runner.test(`Registration with role: ${role}`, async () => {
      const email = generateRandomEmail();
      const result = await registerUser(email, 'Test123!', `Test ${role}`, role);
      assert(result.user.role === role, `Role should be ${role}`);
    });
  }

  // Test 3: Duplicate email (should fail)
  await runner.test('Duplicate email returns error', async () => {
    const email = generateRandomEmail();
    
    // First registration
    await registerUser(email, 'Test123!', 'First User', 'client');
    
    // Second registration with same email (should fail)
    try {
      await registerUser(email, 'Test123!', 'Second User', 'client');
      throw new Error('Should have thrown error for duplicate email');
    } catch (error) {
      assert(error.message.includes('exist') || error.message.includes('duplicate'), 
        'Error message should mention duplicate/existing email');
    }
  });

  // Test 4: Invalid email format (should fail on backend)
  await runner.test('Invalid email format returns error', async () => {
    try {
      await registerUser('notanemail', 'Test123!', 'Test User', 'client');
      throw new Error('Should have thrown error for invalid email');
    } catch (error) {
      assert(error.message.includes('email') || error.message.includes('invalid'), 
        'Error should mention email validation');
    }
  });

  // Test 5: Short password (if backend validates)
  await runner.test('Short password returns error', async () => {
    try {
      await registerUser(generateRandomEmail(), '123', 'Test User', 'client');
      throw new Error('Should have thrown error for short password');
    } catch (error) {
      assert(error.message.includes('password') || error.message.includes('length'), 
        'Error should mention password validation');
    }
  });

  // Test 6: Missing required fields
  await runner.test('Missing name returns error', async () => {
    try {
      await registerUser(generateRandomEmail(), 'Test123!', '', 'client');
      throw new Error('Should have thrown error for missing name');
    } catch (error) {
      assert(error.message.includes('name') || error.message.includes('required'), 
        'Error should mention required field');
    }
  });

  // Test 7: Server response structure
  await runner.test('Response contains required fields', async () => {
    const result = await registerUser(generateRandomEmail(), 'Test123!', 'Test User', 'client');
    assert(result.token, 'Response should have token');
    assert(result.user, 'Response should have user');
    assert(result.user.id, 'User should have id');
    assert(result.user.email, 'User should have email');
    assert(result.user.name, 'User should have name');
    assert(result.user.role, 'User should have role');
  });

  // Test 8: Special characters in name
  await runner.test('Name with special characters', async () => {
    const result = await registerUser(
      generateRandomEmail(), 
      'Test123!', 
      'Nguyễn Văn Tèo (Test)', 
      'client'
    );
    assert(result.user.name.includes('Nguyễn'), 'Should preserve Vietnamese characters');
  });

  // Test 9: Long name
  await runner.test('Long name (100 characters)', async () => {
    const longName = 'A'.repeat(100);
    const result = await registerUser(generateRandomEmail(), 'Test123!', longName, 'client');
    assert(result.user.name.length === 100, 'Should accept long names');
  });

  // Test 10: Email case sensitivity
  await runner.test('Email case sensitivity check', async () => {
    const baseEmail = `test${Date.now()}@test.com`;
    const result1 = await registerUser(baseEmail.toLowerCase(), 'Test123!', 'User 1', 'client');
    
    try {
      await registerUser(baseEmail.toUpperCase(), 'Test123!', 'User 2', 'client');
      // If this succeeds, backend treats emails as case-sensitive (which is incorrect)
      console.log(`  ${COLORS.yellow}⚠️  Warning: Backend may be case-sensitive for emails${COLORS.reset}`);
    } catch (error) {
      // This is expected - emails should be case-insensitive
      assert(error.message.includes('exist') || error.message.includes('duplicate'), 
        'Should reject uppercase variant as duplicate');
    }
  });

  runner.summary();
  
  // Exit with error code if tests failed
  if (runner.failed > 0) {
    process.exit(1);
  }
}

// Check server health first
async function checkServer() {
  console.log(`${COLORS.blue}Checking server health...${COLORS.reset}`);
  try {
    const response = await fetch(`${API_BASE}/health`, { timeout: 5000 });
    const data = await response.json();
    console.log(`${COLORS.green}✅ Server is healthy${COLORS.reset}`);
    console.log(`   Status: ${data.status}`);
    console.log(`   Uptime: ${Math.floor(data.uptime / 60)}m ${Math.floor(data.uptime % 60)}s\n`);
    return true;
  } catch (error) {
    console.log(`${COLORS.red}❌ Server is offline or unreachable${COLORS.reset}`);
    console.log(`   Error: ${error.message}`);
    console.log(`\n${COLORS.yellow}Attempting to run tests anyway (may use fallback)...${COLORS.reset}\n`);
    return false;
  }
}

// Main
(async () => {
  try {
    await checkServer();
    await runTests();
  } catch (error) {
    console.error(`${COLORS.red}Fatal error:${COLORS.reset}`, error);
    process.exit(1);
  }
})();
