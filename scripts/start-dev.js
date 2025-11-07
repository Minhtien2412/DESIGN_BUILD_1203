#!/usr/bin/env node

/**
 * Development startup script
 * - Starts mock API server
 * - Configures environment for local development
 * - Starts Expo with proper settings
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting development environment...\n');

// Check if mock server is already running
const checkPort = (port) => {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => resolve(false));
      server.close();
    });
    
    server.on('error', () => resolve(true));
  });
};

async function startDevelopment() {
  // Check if mock server port is available
  const mockServerRunning = await checkPort(3001);
  
  if (!mockServerRunning) {
    console.log('📡 Starting mock API server...');
    const mockServer = spawn('node', ['mock-api-server.js'], {
      stdio: 'inherit',
      shell: true
    });
    
    // Wait a bit for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
  } else {
    console.log('📡 Mock API server already running on port 3001');
  }
  
  // Update .env to use local API
  console.log('⚙️  Configuring environment for local development...');
  const envPath = path.join(__dirname, '..', '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Ensure we're pointing to local mock server
  envContent = envContent.replace(
    /EXPO_PUBLIC_API_BASE_URL=https:\/\/api\.thietkeresort\.com\.vn/g,
    'EXPO_PUBLIC_API_BASE_URL=http://localhost:3001'
  );
  
  fs.writeFileSync(envPath, envContent);
  
  console.log('🎯 Starting Expo development server...\n');
  
  // Start Expo
  const expo = spawn('npx', ['expo', 'start', '--clear'], {
    stdio: 'inherit',
    shell: true
  });
  
  // Handle cleanup
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development environment...');
    expo.kill();
    process.exit(0);
  });
}

startDevelopment().catch(console.error);