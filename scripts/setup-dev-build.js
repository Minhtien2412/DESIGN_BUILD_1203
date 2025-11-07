#!/usr/bin/env node

/**
 * Development Build Setup Script
 * Checks and installs required dependencies for full app functionality
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Checking Development Build Setup...\n');

// Check if package.json exists
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

// Required packages for full functionality
const requiredPackages = {
  'react-native-webrtc': '^124.0.6',
  'expo-dev-client': '~6.0.12',
  'expo-notifications': '~0.32.11',
  'expo-media-library': '~18.2.0',
  '@react-native-async-storage/async-storage': '2.2.0',
};

console.log('📦 Checking required packages...\n');

let needsInstall = false;
const toInstall = [];

for (const [pkg, version] of Object.entries(requiredPackages)) {
  const installed = dependencies[pkg];
  if (!installed) {
    console.log(`❌ ${pkg} - NOT INSTALLED`);
    toInstall.push(`${pkg}@${version}`);
    needsInstall = true;
  } else if (installed !== version) {
    console.log(`⚠️  ${pkg} - VERSION MISMATCH (installed: ${installed}, required: ${version})`);
  } else {
    console.log(`✅ ${pkg} - OK`);
  }
}

if (needsInstall) {
  console.log('\n🔧 Installing missing packages...');
  try {
    execSync(`npm install ${toInstall.join(' ')}`, { stdio: 'inherit', cwd: path.dirname(packageJsonPath) });
    console.log('✅ Packages installed successfully!');
  } catch (error) {
    console.error('❌ Failed to install packages:', error.message);
    process.exit(1);
  }
} else {
  console.log('\n✅ All required packages are installed!');
}

// Check for google-services.json
const googleServicesPath = path.join(__dirname, '..', 'android', 'app', 'google-services.json');
if (fs.existsSync(googleServicesPath)) {
  console.log('✅ google-services.json found (FCM configured)');
} else {
  console.log('⚠️  google-services.json not found - FCM notifications will not work');
  console.log('   Get it from Firebase Console > Project Settings > General > Your apps > google-services.json');
}

// Check for notification sounds
const notificationSoundPath = path.join(__dirname, '..', 'assets', 'sounds', 'notification.wav');
if (fs.existsSync(notificationSoundPath)) {
  console.log('✅ Notification sound found');
} else {
  console.log('⚠️  Notification sound not found at assets/sounds/notification.wav');
}

console.log('\n📱 Next steps:');
console.log('1. Run: npx expo run:android (for Android Dev Build)');
console.log('2. Or: npx expo run:ios (for iOS Dev Build)');
console.log('3. Or: eas build --profile development --platform android');
console.log('\n🔗 Useful commands:');
console.log('- Check permissions: adb shell pm list permissions | grep your.package.name');
console.log('- Clear Expo cache: npx expo start --clear');
console.log('- View device logs: npx expo start --dev-client');

console.log('\n✨ Setup complete! Your app should now have full functionality in Development Builds.');