/**
 * Disable FontFaceObserver Before App Initialization
 * ==================================================
 * This script MUST run before any other code to prevent fontfaceobserver timeout.
 * 
 * Place this at the TOP of index.js or app entry point.
 */

// Override FontFaceObserver globally BEFORE it gets imported
if (typeof window !== 'undefined') {
  // Mock FontFaceObserver constructor
  window.FontFaceObserver = function(family, options) {
    console.log('[FontFaceObserver] Mocked - skipping font loading for:', family);
    return {
      load: function(text, timeout) {
        // Return immediately resolved promise
        console.log('[FontFaceObserver] Mock load() called - returning resolved promise');
        return Promise.resolve({ family });
      },
      check: function() {
        return true;
      }
    };
  };
  
  // Also set as a property to prevent re-assignment
  Object.defineProperty(window, 'FontFaceObserver', {
    value: window.FontFaceObserver,
    writable: false,
    configurable: false
  });
  
  console.log('[FontFaceObserver] ✅ Successfully disabled globally');
}

export { };

