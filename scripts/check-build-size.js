#!/usr/bin/env node

/**
 * Check EAS Build Size
 * Monitor and report APK/IPA file sizes from EAS builds
 * 
 * Run: node scripts/check-build-size.js
 */

const https = require('https');
const { execSync } = require('child_process');

console.log('\n═══════════════════════════════════════════════════════════');
console.log('📦 EAS BUILD SIZE CHECKER');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('🔍 Checking latest builds...\n');

try {
  // Get latest builds
  const output = execSync('eas build:list --platform android --limit 5', {
    encoding: 'utf8',
    cwd: process.cwd()
  });

  console.log(output);
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('💡 TIPS');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('📊 Target Sizes (After Optimization):');
  console.log('   Android APK: <15 MB');
  console.log('   Android AAB: <12 MB');
  console.log('   iOS IPA: <10 MB\n');
  console.log('📥 To download latest build:');
  console.log('   eas build:list');
  console.log('   # Copy build ID, then:');
  console.log('   eas build:download --id <BUILD_ID>\n');
  console.log('📏 To check APK size:');
  console.log('   # Windows PowerShell:');
  console.log('   (Get-Item "*.apk").Length / 1MB');
  console.log('   # Linux/Mac:');
  console.log('   ls -lh *.apk\n');

} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\n💡 Make sure you are logged in to EAS:');
  console.log('   eas login\n');
}
