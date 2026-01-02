#!/usr/bin/env node
/**
 * Comprehensive Backend Health Check
 * Tests all backend endpoints and functionality
 * Run with: node scripts/backend-health-check.js
 */

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.thietkeresort.com.vn';

const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

class HealthChecker {
  constructor() {
    this.results = {
      endpoints: [],
      totalTests: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
    };
  }

  async checkEndpoint(name, url, options = {}) {
    this.results.totalTests++;
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), options.timeout || 10000);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeout);
      const duration = Date.now() - startTime;
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = await response.text();
      }
      
      const result = {
        name,
        url,
        status: response.status,
        ok: response.ok,
        duration,
        data,
      };
      
      if (response.ok) {
        this.results.passed++;
        console.log(`${COLORS.green}✅${COLORS.reset} ${name} ${COLORS.dim}(${duration}ms)${COLORS.reset}`);
      } else {
        this.results.failed++;
        console.log(`${COLORS.red}❌${COLORS.reset} ${name} ${COLORS.dim}(${response.status})${COLORS.reset}`);
      }
      
      this.results.endpoints.push(result);
      return result;
      
    } catch (error) {
      this.results.failed++;
      const duration = Date.now() - startTime;
      
      console.log(`${COLORS.red}❌${COLORS.reset} ${name} ${COLORS.dim}(${error.message})${COLORS.reset}`);
      
      this.results.endpoints.push({
        name,
        url,
        error: error.message,
        duration,
      });
      
      return null;
    }
  }

  async checkAuth() {
    console.log(`\n${COLORS.bold}${COLORS.blue}🔐 Authentication Endpoints${COLORS.reset}`);
    console.log(`${'─'.repeat(60)}`);
    
    // Test register endpoint structure
    await this.checkEndpoint(
      'Register endpoint (expect validation error)',
      `${API_BASE}/auth/register`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // Empty body to test validation
      }
    );
    
    // Test login endpoint structure
    await this.checkEndpoint(
      'Login endpoint (expect validation error)',
      `${API_BASE}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }
    );
    
    // Test with invalid credentials
    await this.checkEndpoint(
      'Login with invalid credentials',
      `${API_BASE}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@test.com',
          password: 'wrongpassword',
        }),
      }
    );
  }

  async checkHealth() {
    console.log(`\n${COLORS.bold}${COLORS.blue}🏥 Health Check Endpoints${COLORS.reset}`);
    console.log(`${'─'.repeat(60)}`);
    
    await this.checkEndpoint('Health endpoint', `${API_BASE}/health`);
    await this.checkEndpoint('API root', `${API_BASE}/`);
  }

  async checkCORS() {
    console.log(`\n${COLORS.bold}${COLORS.blue}🌐 CORS & Network${COLORS.reset}`);
    console.log(`${'─'.repeat(60)}`);
    
    try {
      const response = await fetch(`${API_BASE}/health`, {
        method: 'OPTIONS',
      });
      
      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
      };
      
      console.log(`${COLORS.green}✅${COLORS.reset} CORS Configuration:`);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        if (value) {
          console.log(`   ${COLORS.dim}${key}:${COLORS.reset} ${value}`);
        }
      });
    } catch (error) {
      console.log(`${COLORS.yellow}⚠️${COLORS.reset} CORS check failed: ${error.message}`);
    }
  }

  async checkResponseTimes() {
    console.log(`\n${COLORS.bold}${COLORS.blue}⚡ Performance Test${COLORS.reset}`);
    console.log(`${'─'.repeat(60)}`);
    
    const iterations = 5;
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      try {
        await fetch(`${API_BASE}/health`);
        times.push(Date.now() - startTime);
        process.stdout.write(`${COLORS.dim}.${COLORS.reset}`);
      } catch (error) {
        times.push(-1);
      }
    }
    
    console.log(''); // New line
    
    const validTimes = times.filter(t => t > 0);
    if (validTimes.length > 0) {
      const avg = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
      const min = Math.min(...validTimes);
      const max = Math.max(...validTimes);
      
      console.log(`${COLORS.green}✅${COLORS.reset} Response Times (${iterations} requests):`);
      console.log(`   Average: ${avg.toFixed(0)}ms`);
      console.log(`   Min: ${min}ms`);
      console.log(`   Max: ${max}ms`);
      
      if (avg > 1000) {
        console.log(`   ${COLORS.yellow}⚠️  Warning: Average response time > 1s${COLORS.reset}`);
        this.results.warnings++;
      }
    } else {
      console.log(`${COLORS.red}❌${COLORS.reset} All requests failed`);
    }
  }

  async checkSSL() {
    console.log(`\n${COLORS.bold}${COLORS.blue}🔒 SSL/TLS Check${COLORS.reset}`);
    console.log(`${'─'.repeat(60)}`);
    
    if (API_BASE.startsWith('https://')) {
      console.log(`${COLORS.green}✅${COLORS.reset} HTTPS enabled`);
      
      try {
        const url = new URL(API_BASE);
        console.log(`   Domain: ${url.hostname}`);
        console.log(`   Protocol: ${url.protocol}`);
      } catch (error) {
        console.log(`${COLORS.yellow}⚠️${COLORS.reset} Invalid URL`);
      }
    } else {
      console.log(`${COLORS.yellow}⚠️${COLORS.reset} HTTP only (not secure)`);
      this.results.warnings++;
    }
  }

  async checkRateLimit() {
    console.log(`\n${COLORS.bold}${COLORS.blue}🚦 Rate Limiting${COLORS.reset}`);
    console.log(`${'─'.repeat(60)}`);
    
    console.log(`Testing rapid requests...`);
    
    let rateLimitHit = false;
    for (let i = 0; i < 10; i++) {
      try {
        const response = await fetch(`${API_BASE}/health`);
        if (response.status === 429) {
          rateLimitHit = true;
          console.log(`${COLORS.yellow}⚠️${COLORS.reset} Rate limit hit at request ${i + 1}`);
          break;
        }
      } catch (error) {
        // Ignore
      }
    }
    
    if (!rateLimitHit) {
      console.log(`${COLORS.green}✅${COLORS.reset} No rate limiting detected (or limit not reached)`);
    }
  }

  async checkErrorHandling() {
    console.log(`\n${COLORS.bold}${COLORS.blue}🐛 Error Handling${COLORS.reset}`);
    console.log(`${'─'.repeat(60)}`);
    
    // Test 404
    const result404 = await this.checkEndpoint(
      '404 handler',
      `${API_BASE}/nonexistent-endpoint-${Date.now()}`
    );
    
    if (result404 && result404.status === 404) {
      console.log(`   ${COLORS.green}✅${COLORS.reset} Proper 404 responses`);
    }
    
    // Test malformed JSON
    await this.checkEndpoint(
      'Malformed request body',
      `${API_BASE}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{invalid json',
      }
    );
  }

  printSummary() {
    console.log(`\n${'━'.repeat(60)}`);
    console.log(`${COLORS.bold}📊 Health Check Summary${COLORS.reset}`);
    console.log(`${'━'.repeat(60)}`);
    
    console.log(`Total Tests: ${this.results.totalTests}`);
    console.log(`${COLORS.green}Passed: ${this.results.passed}${COLORS.reset}`);
    console.log(`${COLORS.red}Failed: ${this.results.failed}${COLORS.reset}`);
    console.log(`${COLORS.yellow}Warnings: ${this.results.warnings}${COLORS.reset}`);
    
    const successRate = ((this.results.passed / this.results.totalTests) * 100).toFixed(1);
    console.log(`Success Rate: ${successRate}%`);
    
    console.log(`\n${COLORS.bold}Backend Status:${COLORS.reset}`);
    if (this.results.failed === 0) {
      console.log(`${COLORS.green}${COLORS.bold}✅ ALL SYSTEMS OPERATIONAL${COLORS.reset}`);
    } else if (this.results.passed > this.results.failed) {
      console.log(`${COLORS.yellow}${COLORS.bold}⚠️  PARTIAL FUNCTIONALITY${COLORS.reset}`);
    } else {
      console.log(`${COLORS.red}${COLORS.bold}❌ MAJOR ISSUES DETECTED${COLORS.reset}`);
    }
    
    console.log(`\n${COLORS.dim}API Base URL: ${API_BASE}${COLORS.reset}`);
    console.log(`${COLORS.dim}Timestamp: ${new Date().toISOString()}${COLORS.reset}`);
  }

  async runAll() {
    console.log(`${COLORS.bold}${COLORS.cyan}`);
    console.log(`╔════════════════════════════════════════════════════════════╗`);
    console.log(`║          BACKEND COMPREHENSIVE HEALTH CHECK                ║`);
    console.log(`╚════════════════════════════════════════════════════════════╝`);
    console.log(COLORS.reset);
    console.log(`${COLORS.dim}API: ${API_BASE}${COLORS.reset}\n`);
    
    await this.checkHealth();
    await this.checkSSL();
    await this.checkCORS();
    await this.checkAuth();
    await this.checkResponseTimes();
    await this.checkRateLimit();
    await this.checkErrorHandling();
    
    this.printSummary();
    
    // Exit with error code if critical failures
    if (this.results.failed > this.results.passed) {
      process.exit(1);
    }
  }
}

// Main execution
(async () => {
  try {
    const checker = new HealthChecker();
    await checker.runAll();
  } catch (error) {
    console.error(`${COLORS.red}Fatal error:${COLORS.reset}`, error);
    process.exit(1);
  }
})();
