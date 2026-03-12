/**
 * Bundle Size Analysis Script
 * Analyzes package.json dependencies and identifies optimization opportunities
 */

const fs = require('fs');
const path = require('path');

console.log('📊 Bundle Size Analysis Starting...\n');

// Read package.json
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
);

const deps = packageJson.dependencies || {};
const devDeps = packageJson.devDependencies || {};

console.log('='.repeat(80));
console.log('📦 LARGE DEPENDENCIES ANALYSIS');
console.log('='.repeat(80));

// Known heavy packages categorized by usage
const heavyPackages = {
  'Video & Streaming': [
    '@stream-io/video-react-native-sdk',
    'react-native-webrtc',
    'livekit-react-native',
    'react-native-video',
    'expo-av',
    'expo-video',
  ],
  'Maps & Location': [
    'react-native-maps',
    'expo-location',
  ],
  'Firebase & Push': [
    '@react-native-firebase/app',
    '@react-native-firebase/messaging',
    'expo-notifications',
  ],
  'Authentication': [
    '@react-native-google-signin/google-signin',
    'expo-auth-session',
  ],
  'UI & Animation': [
    '@expo/vector-icons',
    'react-native-reanimated',
    'react-native-gesture-handler',
    'react-native-svg',
  ],
  'Calendar & Scheduling': [
    'react-native-calendars',
  ],
  'Audio Recording': [
    'react-native-audio-recorder-player',
  ],
  'Other': [
    'socket.io-client',
    'axios',
    'react-native-qrcode-svg',
  ],
};

// Check which heavy packages are installed
let totalHeavyPackages = 0;
Object.entries(heavyPackages).forEach(([category, packages]) => {
  const installed = packages.filter(pkg => deps[pkg]);
  if (installed.length > 0) {
    console.log(`\n🏷️  ${category}:`);
    installed.forEach(pkg => {
      console.log(`   ✓ ${pkg} - ${deps[pkg]}`);
      totalHeavyPackages++;
    });
  }
});

console.log('\n' + '='.repeat(80));
console.log('💡 OPTIMIZATION OPPORTUNITIES');
console.log('='.repeat(80));

// Potential duplicates or alternatives
const optimizations = [
  {
    category: 'Video SDK Consolidation',
    issue: 'Multiple video SDKs installed',
    packages: ['@stream-io/video-react-native-sdk', 'livekit-react-native', 'react-native-webrtc'],
    recommendation: 'Choose ONE video SDK. Stream SDK includes WebRTC internally.',
    savings: '~5-8MB',
  },
  {
    category: 'Video Playback Duplication',
    issue: 'Both expo-av and react-native-video installed',
    packages: ['expo-av', 'react-native-video', 'expo-video'],
    recommendation: 'Use only expo-video (newest) or react-native-video. Remove expo-av if not needed.',
    savings: '~2-3MB',
  },
  {
    category: 'Firebase vs Expo Notifications',
    issue: 'Both Firebase and Expo notifications installed',
    packages: ['@react-native-firebase/messaging', 'expo-notifications'],
    recommendation: 'If using Expo Go, keep expo-notifications. For production, choose Firebase OR Expo.',
    savings: '~3-4MB',
  },
  {
    category: 'Icon Library',
    issue: '@expo/vector-icons includes ALL icon sets',
    packages: ['@expo/vector-icons'],
    recommendation: 'Tree-shake icons or use custom icon font with only needed icons.',
    savings: '~1-2MB',
  },
  {
    category: 'Unused Features',
    issue: 'Features that might not be core',
    packages: ['react-native-calendars', 'react-native-audio-recorder-player'],
    recommendation: 'If calendar/audio features are not essential, consider removing or lazy loading.',
    savings: '~1-2MB',
  },
];

optimizations.forEach((opt, index) => {
  const installedPackages = opt.packages.filter(pkg => deps[pkg]);
  if (installedPackages.length > 0) {
    console.log(`\n${index + 1}. ${opt.category}`);
    console.log(`   Issue: ${opt.issue}`);
    console.log(`   Installed: ${installedPackages.join(', ')}`);
    console.log(`   💡 ${opt.recommendation}`);
    console.log(`   💰 Potential Savings: ${opt.savings}`);
  }
});

console.log('\n' + '='.repeat(80));
console.log('📈 SUMMARY');
console.log('='.repeat(80));

const totalDeps = Object.keys(deps).length;
const totalDevDeps = Object.keys(devDeps).length;

console.log(`\n📦 Total Dependencies: ${totalDeps}`);
console.log(`🔧 Total DevDependencies: ${totalDevDeps}`);
console.log(`⚠️  Heavy Packages Installed: ${totalHeavyPackages}`);
console.log(`\n💡 Potential Bundle Size Reduction: 15-25MB (estimated)`);

console.log('\n' + '='.repeat(80));
console.log('🎯 RECOMMENDED ACTIONS');
console.log('='.repeat(80));

console.log(`
1. ✅ Code Splitting (PRIORITY)
   - Lazy load video call screens
   - Lazy load map screens  
   - Lazy load construction/admin features

2. 🔍 Dependency Audit
   - Remove duplicate video SDKs
   - Choose ONE notification system
   - Remove unused packages

3. 🖼️  Image Optimization
   - Convert PNG/JPG to WebP
   - Use expo-image with blurhash
   - Lazy load images in lists

4. 🏗️  Build Optimization  
   - ✅ Metro minification (DONE)
   - ✅ ProGuard enabled (DONE)
   - Enable tree-shaking for icons

5. 📏 Measure & Iterate
   - Build production APK/AAB
   - Measure actual size
   - Compare with targets
`);

console.log('\n✅ Analysis Complete!\n');
