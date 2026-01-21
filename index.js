// ============================================================================
// CRITICAL POLYFILLS - MUST LOAD FIRST
// ============================================================================

// DISABLE FONTFACEOBSERVER - Must be FIRST to prevent timeout errors
if (typeof window !== 'undefined') {
  window.FontFaceObserver = function(family, options) {
    return {
      load: function(text, timeout) {
        return Promise.resolve({ family });
      },
      check: function() {
        return true;
      }
    };
  };
  Object.defineProperty(window, 'FontFaceObserver', {
    value: window.FontFaceObserver,
    writable: false,
    configurable: false
  });
}

// Random values polyfill for crypto operations
import 'react-native-get-random-values';

// URL polyfill for URL parsing
import 'react-native-url-polyfill/auto';

// ============================================================================
// EXPO ROUTER ENTRY POINT
// ============================================================================

// Import Expo Router entry - this must come AFTER all polyfills
import 'expo-router/entry';

// ============================================================================
// GLOBAL RUNTIME POLYFILLS - FIX "require is not defined"
// ============================================================================

// Fix global.require before any other code runs
if (typeof global !== 'undefined') {
  // 1. Setup proper require function
  const originalRequire = global.require || function() { return {}; };
  
  global.require = function(moduleName) {
    try {
      // Try original require first (if available)
      if (typeof originalRequire === 'function' && originalRequire !== global.require) {
        return originalRequire(moduleName);
      }
      
      // Try webpack require
      if (typeof __webpack_require__ !== 'undefined') {
        return __webpack_require__(moduleName);
      }
      
      // Fallback for unknown modules
      console.warn('[Polyfill] Module not found:', moduleName);
      return {};
    } catch (e) {
      console.warn('[Polyfill] Error requiring:', moduleName, e.message);
      return {};
    }
  };

  // Make require writable and enumerable
  Object.defineProperty(global, 'require', {
    value: global.require,
    writable: true,
    enumerable: true,
    configurable: true
  });

  // 2. Reanimated worklet runtime init
  if (typeof global.__reanimatedWorkletInit === 'undefined') {
    global.__reanimatedWorkletInit = function() {
      // Silent init - no errors
    };
  }

  // 3. Module system polyfills
  if (!global.module) {
    global.module = { exports: {} };
  }

  if (!global.exports) {
    global.exports = global.module.exports;
  }

  // 4. Process polyfill (some packages expect this)
  if (!global.process) {
    global.process = { env: {} };
  }
}

