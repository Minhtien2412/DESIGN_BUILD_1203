/**
 * Metro Performance Optimization Module
 * ======================================
 *
 * Giải quyết các vấn đề hiệu suất Metro bundler:
 * 1. JavaScript heap out of memory
 * 2. Metro cache corruption
 * 3. Slow bundling với nhiều files/dependencies
 *
 * @author ThietKeResort Team
 * @created 2025-01-20
 */

/**
 * Recommended NODE_OPTIONS for different scenarios
 */
export const NODE_MEMORY_OPTIONS = {
  // Development (standard machines)
  development: "--max-old-space-size=4096",

  // Large projects (nhiều dependencies)
  largeProject: "--max-old-space-size=8192",

  // Build/Production (CI/CD)
  production: "--max-old-space-size=16384",

  // Low memory machines
  lowMemory: "--max-old-space-size=2048",
};

/**
 * Metro cache management utilities
 */
export const MetroCacheUtils = {
  /**
   * Paths to clear for full Metro reset
   */
  cachePaths: [
    "node_modules/.cache",
    ".expo",
    ".metro-health-check-*",
    "android/.gradle",
    "android/build",
    "android/app/build",
    "ios/build",
    "ios/Pods",
    "%TEMP%/metro-*",
    "%TEMP%/haste-map-*",
  ],

  /**
   * Commands to clear Metro cache
   */
  clearCommands: {
    windows: [
      "rd /s /q node_modules\\.cache 2>nul",
      "rd /s /q .expo 2>nul",
      "del /s /q metro-*.cache 2>nul",
      "npx expo start --clear",
    ],
    unix: [
      "rm -rf node_modules/.cache",
      "rm -rf .expo",
      "rm -rf metro-*.cache",
      "npx expo start --clear",
    ],
  },
};

/**
 * Performance tips for large React Native projects
 */
export const PerformanceTips = {
  metro: [
    "Sử dụng blockList trong metro.config.js để loại trừ files không cần thiết",
    "Giảm số lượng node_modules bằng cách audit dependencies",
    "Sử dụng lazy imports cho screens ít dùng",
    "Enable Metro cache persistence",
  ],

  bundling: [
    "Split large screens thành smaller components",
    "Sử dụng React.lazy() cho heavy components",
    "Tránh barrel exports (index.ts re-exports) quá lớn",
    "Inline require() cho assets lớn",
  ],

  memory: [
    "Tăng NODE_OPTIONS --max-old-space-size",
    "Đóng các ứng dụng khác khi bundling",
    "Sử dụng SSD thay vì HDD",
    "Clear cache định kỳ",
  ],
};

/**
 * Package.json scripts recommendations
 */
export const RecommendedScripts = {
  // Standard start với increased memory
  start: "cross-env NODE_OPTIONS=--max-old-space-size=8192 expo start",

  // Start với full cache clear
  "start:clear":
    "cross-env NODE_OPTIONS=--max-old-space-size=8192 expo start --clear",

  // Quick start (không check dependencies)
  "start:fast": "expo start",

  // Development với turbo mode
  "start:turbo":
    "cross-env NODE_OPTIONS=--max-old-space-size=8192 EXPO_USE_FAST_RESOLVER=1 expo start",

  // Full reset
  "reset:full":
    "npm run clean:cache && npm run clean:native && npm install && npm start",

  // Clean all caches
  "clean:all":
    "npx expo start -c && rm -rf node_modules/.cache .expo android/.gradle android/build ios/build",
};

export default {
  NODE_MEMORY_OPTIONS,
  MetroCacheUtils,
  PerformanceTips,
  RecommendedScripts,
};
