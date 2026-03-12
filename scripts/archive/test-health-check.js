/**
 * Health Check Test Script
 * Verify server status với X-API-Key header
 * 
 * Run: node scripts/test-health-check.js
 */

const SERVERS = [
  {
    name: 'Production VPS',
    url: 'https://api.thietkeresort.com.vn/health',
  },
  {
    name: 'SSH Tunnel',
    url: 'http://localhost:5000/health',
  },
  {
    name: 'Local Mock',
    url: 'http://localhost:3001/health',
  },
];

const API_KEY = 'thietke-resort-api-key-2024';

async function checkHealth(config) {
  const startTime = Date.now();
  
  try {
    console.log(`\n🔍 Checking ${config.name}...`);
    console.log(`   URL: ${config.url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(config.url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Latency: ${responseTime}ms`);

    if (response.ok) {
      try {
        const data = await response.json();
        console.log(`   Response:`, JSON.stringify(data, null, 2));
        
        if (data.status === 'healthy') {
          console.log(`   ✅ ONLINE - Server is healthy!`);
          return { status: 'online', latency: responseTime, data };
        } else {
          console.log(`   ⚠️ WARNING - Unexpected status: ${data.status}`);
          return { status: 'error', latency: responseTime, data };
        }
      } catch (parseError) {
        console.log(`   ❌ ERROR - JSON parse failed:`, parseError.message);
        return { status: 'error', latency: responseTime, error: 'Parse error' };
      }
    } else {
      console.log(`   ❌ ERROR - HTTP ${response.status}`);
      return { status: 'error', latency: responseTime, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.log(`   ❌ OFFLINE - ${error.message}`);
    return { status: 'offline', latency: responseTime, error: error.message };
  }
}

async function testAllServers() {
  console.log('═══════════════════════════════════════════════');
  console.log('🏥 HEALTH CHECK TEST');
  console.log('═══════════════════════════════════════════════');
  console.log(`API Key: ${API_KEY}`);
  console.log(`Timeout: 10 seconds`);
  
  const results = [];
  
  for (const server of SERVERS) {
    const result = await checkHealth(server);
    results.push({ server: server.name, ...result });
  }
  
  console.log('\n═══════════════════════════════════════════════');
  console.log('📊 SUMMARY');
  console.log('═══════════════════════════════════════════════');
  
  results.forEach(result => {
    const icon = result.status === 'online' ? '🟢' : 
                 result.status === 'error' ? '🟡' : '🔴';
    console.log(`${icon} ${result.server.padEnd(20)} ${result.latency}ms - ${result.status.toUpperCase()}`);
  });
  
  const onlineCount = results.filter(r => r.status === 'online').length;
  console.log(`\n✅ ${onlineCount}/${results.length} servers online`);
  
  if (onlineCount === 0) {
    console.log('\n⚠️ WARNING: All servers offline!');
    console.log('Possible issues:');
    console.log('  1. X-API-Key header not sent correctly');
    console.log('  2. Network connectivity problems');
    console.log('  3. Server is down');
  }
  
  console.log('═══════════════════════════════════════════════\n');
}

// Run test
testAllServers().catch(console.error);
