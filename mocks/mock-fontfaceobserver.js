/**
 * Mock fontfaceobserver for web platform
 * Prevents 6000ms timeout errors when loading fonts
 * 
 * This mock immediately resolves all font loading requests
 * to prevent timeout issues on web. Fonts are handled via CSS.
 */

class FontFaceObserver {
  constructor(family, options = {}) {
    this.family = family;
    this.options = options;
  }

  load(text, timeout) {
    // Return a resolved promise immediately
    // Fonts are loaded by browser via CSS @font-face
    // No need to wait or observe font loading
    return Promise.resolve(this);
  }

  // Add check method for compatibility
  check() {
    return true;
  }
}

// Export for CommonJS
module.exports = FontFaceObserver;

// Export for ES6
export default FontFaceObserver;

// Named export for flexibility
export { FontFaceObserver };
