#!/usr/bin/env node

/**
 * LiveKit API Key Generator
 * Generates cryptographically secure API keys for LiveKit server
 * 
 * Usage:
 *   node scripts/generate-livekit-keys.js
 *   node scripts/generate-livekit-keys.js --count 3
 *   node scripts/generate-livekit-keys.js --prefix custom
 */

const crypto = require('crypto');
const args = process.argv.slice(2);

// Parse command line arguments
const getArg = (name, defaultValue) => {
  const index = args.indexOf(`--${name}`);
  return index > -1 ? args[index + 1] : defaultValue;
};

const count = parseInt(getArg('count', '1'));
const prefix = getArg('prefix', 'api');
const environment = getArg('env', 'prod');

/**
 * Generate a secure LiveKit API key
 */
function generateApiKey(prefix = 'api') {
  // Format: lk_{prefix}_{32_random_chars}
  const randomPart = crypto.randomBytes(16).toString('hex');
  return `lk_${prefix}_${randomPart}`;
}

/**
 * Generate a secure LiveKit API secret
 */
function generateApiSecret() {
  // 64 character random string
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a complete key set
 */
function generateKeySet(prefix = 'api') {
  return {
    apiKey: generateApiKey(prefix),
    apiSecret: generateApiSecret(),
    createdAt: new Date().toISOString(),
    environment: environment
  };
}

// Generate header
console.log('🔐 LiveKit API Key Generator');
console.log('============================');
console.log(`Environment: ${environment}`);
console.log(`Generating ${count} key set(s)...\n`);

// Generate key sets
for (let i = 0; i < count; i++) {
  const keySet = generateKeySet(prefix);
  
  console.log(`🔑 Key Set ${i + 1}:`);
  console.log(`   Created: ${keySet.createdAt}`);
  console.log(`   API Key: ${keySet.apiKey}`);
  console.log(`   Secret:  ${keySet.apiSecret}`);
  console.log('');
  
  // Environment file format
  console.log('📝 Environment File Format:');
  console.log(`LIVEKIT_URL=http://127.0.0.1:7880`);
  console.log(`LIVEKIT_API_KEY=${keySet.apiKey}`);
  console.log(`LIVEKIT_API_SECRET=${keySet.apiSecret}`);
  
  if (i < count - 1) {
    console.log('\n' + '─'.repeat(50) + '\n');
  }
}

// Security reminder
console.log('\n🛡️  Security Reminders:');
console.log('   • Store these keys securely');
console.log('   • Never commit to version control');
console.log('   • Use different keys for each environment');
console.log('   • Rotate keys periodically (3-6 months)');
console.log('   • Set proper file permissions (chmod 600)');

// Quick commands
console.log('\n⚡ Quick Commands:');
console.log('   sudo nano /var/www/thietkeresort-api/.env');
console.log('   pm2 restart thietkeresort-api --update-env');
console.log('   pm2 logs thietkeresort-api --lines 20');

// Validation snippet
console.log('\n🧪 Validation Snippet (add to your server):');
console.log(`
const validateLiveKitConfig = () => {
  const required = ['LIVEKIT_URL', 'LIVEKIT_API_KEY', 'LIVEKIT_API_SECRET'];
  
  for (const envVar of required) {
    if (!process.env[envVar]) {
      console.error(\`❌ Missing: \${envVar}\`);
      process.exit(1);
    }
  }
  
  console.log('✅ LiveKit configuration valid');
};
`);

// Export for programmatic use
if (require.main !== module) {
  module.exports = {
    generateApiKey,
    generateApiSecret,
    generateKeySet
  };
}