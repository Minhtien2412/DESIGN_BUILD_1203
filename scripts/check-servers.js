#!/usr/bin/env node

/**
 * Server Health Check Tool
 * Tests connection to all available servers
 */

const https = require('https');
const http = require('http');

const SERVERS = [
  {
    name: 'Production VPS',
    url: 'https://api.thietkeresort.com.vn/health',
    protocol: https,
  },
  {
    name: 'SSH Tunnel',
    url: 'http://localhost:5000/health',
    protocol: http,
  },
  {
    name: 'Local Mock Server',
    url: 'http://localhost:3001/health',
    protocol: http,
  },
];

function checkServer(config) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const urlObj = new URL(config.url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname,
      method: 'GET',
      timeout: 5000,
    };

    const req = config.protocol.request(options, (res) => {
      const duration = Date.now() - startTime;
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          name: config.name,
          status: res.statusCode === 200 ? 'healthy' : 'error',
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          response: data,
        });
      });
    });

    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      resolve({
        name: config.name,
        status: 'offline',
        duration: `${duration}ms`,
        error: error.message,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const duration = Date.now() - startTime;
      resolve({
        name: config.name,
        status: 'timeout',
        duration: `${duration}ms`,
        error: 'Request timeout after 5s',
      });
    });

    req.end();
  });
}

async function checkAllServers() {
  console.log('🔍 Checking server health...\n');
  
  const results = await Promise.all(SERVERS.map(server => checkServer(server)));
  
  let healthyCount = 0;
  
  results.forEach((result, index) => {
    const icon = result.status === 'healthy' ? '✅' : 
                 result.status === 'timeout' ? '⏱️' : '❌';
    
    console.log(`${icon} ${result.name}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Duration: ${result.duration}`);
    
    if (result.status === 'healthy') {
      healthyCount++;
      console.log(`   Response: ${result.response.substring(0, 100)}`);
    } else if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    
    console.log('');
  });
  
  console.log('━'.repeat(50));
  console.log(`\n📊 Summary: ${healthyCount}/${SERVERS.length} servers healthy\n`);
  
  if (healthyCount === 0) {
    console.log('⚠️  No servers available!');
    console.log('\n💡 Solutions:');
    console.log('   1. Check internet connection');
    console.log('   2. Start SSH tunnel: ./scripts/ssh-tunnel.ps1');
    console.log('   3. Start mock server: npm run mock-auth');
    console.log('   4. App will use offline mode automatically\n');
  } else {
    const healthyServers = results.filter(r => r.status === 'healthy');
    console.log(`✅ Available: ${healthyServers.map(s => s.name).join(', ')}\n`);
  }
}

// Run check
checkAllServers().catch(console.error);
