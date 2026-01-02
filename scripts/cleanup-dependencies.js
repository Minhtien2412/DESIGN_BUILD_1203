#!/usr/bin/env node

/**
 * Bundle Cleanup Script
 * Safely removes duplicate heavy dependencies
 * 
 * Run: node scripts/cleanup-dependencies.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n═══════════════════════════════════════════════════════════');
console.log('📦 BUNDLE CLEANUP - Remove Duplicate Dependencies');
console.log('═══════════════════════════════════════════════════════════\n');

// Read package.json
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const deps = packageJson.dependencies || {};

// Define cleanup options
const cleanupOptions = {
  videoPlayers: {
    title: '🎥 Video Players (Keep expo-video)',
    keep: 'expo-video',
    remove: ['expo-av', 'react-native-video'],
    savings: '2-3MB',
  },
  videoSDKs: {
    title: '📹 Video SDKs (Choose one)',
    options: [
      {
        name: 'Keep @stream-io/video (best for social)',
        keep: '@stream-io/video-react-native-sdk',
        remove: ['livekit-react-native', 'react-native-webrtc'],
      },
      {
        name: 'Keep livekit (best for generic calls)',
        keep: 'livekit-react-native',
        remove: ['@stream-io/video-react-native-sdk', 'react-native-webrtc'],
      },
      {
        name: 'Keep webrtc (most control)',
        keep: 'react-native-webrtc',
        remove: ['@stream-io/video-react-native-sdk', 'livekit-react-native'],
      },
    ],
    savings: '5-8MB',
  },
  notifications: {
    title: '🔔 Notification Systems (Keep expo-notifications)',
    keep: 'expo-notifications',
    remove: ['@react-native-firebase/app', '@react-native-firebase/messaging'],
    savings: '3-4MB',
    warning: 'Remove Firebase only if not using other Firebase services',
  },
};

// Check which packages are installed
function isInstalled(packageName) {
  return deps.hasOwnProperty(packageName);
}

// Safely uninstall packages
function uninstallPackages(packages) {
  const installed = packages.filter(isInstalled);
  if (installed.length === 0) {
    console.log('   ℹ️  Packages already removed');
    return;
  }

  console.log(`   🗑️  Removing: ${installed.join(', ')}`);
  
  try {
    execSync(`npm uninstall ${installed.join(' ')}`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
    console.log('   ✅ Successfully removed\n');
  } catch (error) {
    console.error('   ❌ Failed to remove packages:', error.message);
  }
}

// Interactive mode
function promptUser(question) {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    readline.question(question, (answer) => {
      readline.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function cleanup() {
  console.log('⚠️  This will uninstall duplicate packages to reduce bundle size.\n');
  console.log('📊 Estimated total savings: 10-15MB\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  // 1. Video Players
  console.log(cleanupOptions.videoPlayers.title);
  console.log(`   Keep: ${cleanupOptions.videoPlayers.keep}`);
  console.log(`   Remove: ${cleanupOptions.videoPlayers.remove.join(', ')}`);
  console.log(`   💰 Savings: ${cleanupOptions.videoPlayers.savings}`);
  
  const answer1 = await promptUser('\n   Proceed? (y/n): ');
  if (answer1 === 'y') {
    uninstallPackages(cleanupOptions.videoPlayers.remove);
  } else {
    console.log('   ⏭️  Skipped\n');
  }

  // 2. Video SDKs
  console.log(cleanupOptions.videoSDKs.title);
  console.log(`   💰 Savings: ${cleanupOptions.videoSDKs.savings}\n`);
  
  cleanupOptions.videoSDKs.options.forEach((opt, i) => {
    console.log(`   ${i + 1}. ${opt.name}`);
    console.log(`      Keep: ${opt.keep}`);
    console.log(`      Remove: ${opt.remove.join(', ')}\n`);
  });

  const answer2 = await promptUser('   Choose option (1/2/3) or skip (n): ');
  const optIndex = parseInt(answer2) - 1;
  
  if (optIndex >= 0 && optIndex < cleanupOptions.videoSDKs.options.length) {
    const option = cleanupOptions.videoSDKs.options[optIndex];
    console.log(`\n   Selected: ${option.name}`);
    uninstallPackages(option.remove);
  } else {
    console.log('   ⏭️  Skipped\n');
  }

  // 3. Notifications
  console.log(cleanupOptions.notifications.title);
  console.log(`   Keep: ${cleanupOptions.notifications.keep}`);
  console.log(`   Remove: ${cleanupOptions.notifications.remove.join(', ')}`);
  console.log(`   💰 Savings: ${cleanupOptions.notifications.savings}`);
  console.log(`   ⚠️  ${cleanupOptions.notifications.warning}`);
  
  const answer3 = await promptUser('\n   Proceed? (y/n): ');
  if (answer3 === 'y') {
    uninstallPackages(cleanupOptions.notifications.remove);
  } else {
    console.log('   ⏭️  Skipped\n');
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✅ CLEANUP COMPLETE');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('📋 Next Steps:');
  console.log('   1. Test your app to ensure nothing broke');
  console.log('   2. Clear Metro cache: npx expo start --clear');
  console.log('   3. Check bundle size: npm run analyze:bundle');
  console.log('   4. Commit changes if all works\n');
  console.log('📊 Expected Results:');
  console.log('   - Bundle reduction: 10-15MB');
  console.log('   - Faster builds');
  console.log('   - Smaller APK/IPA files\n');
}

// Auto mode (non-interactive)
function autoCleanup() {
  console.log('🤖 AUTO MODE - Removing safe duplicates only\n');

  // Safe to remove: expo-av, react-native-video (keep expo-video)
  console.log('1. Removing duplicate video players...');
  uninstallPackages(['expo-av', 'react-native-video']);

  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ AUTO CLEANUP COMPLETE');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('⚠️  Manual review needed for:');
  console.log('   - Video SDKs (3 installed, choose 1)');
  console.log('   - Notification systems (check if Firebase needed)\n');
  console.log('Run "node scripts/cleanup-dependencies.js" for interactive mode\n');
}

// Main
const args = process.argv.slice(2);
if (args.includes('--auto')) {
  autoCleanup();
} else {
  cleanup().catch(console.error);
}
