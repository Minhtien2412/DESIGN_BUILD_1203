/**
 * Detox Global Type Definitions for E2E Testing
 * Provides TypeScript support for Detox globals (device, element, by, waitFor, etc.)
 */

declare global {
  /**
   * The device object provides access to device-specific actions
   */
  const device: {
    /**
     * Launch the app
     */
    launchApp(config?: {
      newInstance?: boolean;
      permissions?: Record<string, string>;
      launchArgs?: Record<string, any>;
      delete?: boolean;
      url?: string;
    }): Promise<void>;

    /**
     * Reload React Native bundle
     */
    reloadReactNative(): Promise<void>;

    /**
     * Terminate the app
     */
    terminateApp(): Promise<void>;

    /**
     * Send app to background
     */
    sendToHome(): Promise<void>;

    /**
     * Open URL
     */
    openURL(config: { url: string; sourceApp?: string }): Promise<void>;

    /**
     * Set device orientation
     */
    setOrientation(orientation: 'portrait' | 'landscape'): Promise<void>;

    /**
     * Take screenshot
     */
    takeScreenshot(name: string): Promise<void>;

    /**
     * Shake device
     */
    shake(): Promise<void>;
  };

  /**
   * Matcher builder - creates matchers to find elements
   */
  const by: {
    /**
     * Match element by testID
     */
    id(id: string): Matcher;

    /**
     * Match element by text
     */
    text(text: string): Matcher;

    /**
     * Match element by label (accessibility label)
     */
    label(label: string): Matcher;

    /**
     * Match element by type (e.g., 'RCTTextInput')
     */
    type(type: string): Matcher;

    /**
     * Match element containing traits
     */
    traits(traits: string[]): Matcher;

    /**
     * Match element by accessibility value
     */
    value(value: string): Matcher;
  };

  /**
   * Element interaction - performs actions on matched elements
   */
  function element(matcher: Matcher): Element;

  /**
   * Wait for element with timeout
   */
  function waitFor(element: Element): WaitForElement;

  /**
   * Expect assertions
   */
  function expect(element: Element): Expect;

  /**
   * Matcher type
   */
  interface Matcher {
    and(matcher: Matcher): Matcher;
    or(matcher: Matcher): Matcher;
    withAncestor(matcher: Matcher): Matcher;
    withDescendant(matcher: Matcher): Matcher;
  }

  /**
   * Element type
   */
  interface Element {
    /**
     * Tap on element
     */
    tap(): Promise<void>;

    /**
     * Long press on element
     */
    longPress(duration?: number): Promise<void>;

    /**
     * Type text into element
     */
    typeText(text: string): Promise<void>;

    /**
     * Replace text in element
     */
    replaceText(text: string): Promise<void>;

    /**
     * Clear text from element
     */
    clearText(): Promise<void>;

    /**
     * Scroll to element
     */
    scroll(
      pixels: number,
      direction: 'up' | 'down' | 'left' | 'right',
      startPositionX?: number,
      startPositionY?: number
    ): Promise<void>;

    /**
     * Swipe element
     */
    swipe(
      direction: 'up' | 'down' | 'left' | 'right',
      speed?: 'fast' | 'slow',
      percentage?: number
    ): Promise<void>;

    /**
     * Multi-tap
     */
    multiTap(taps: number): Promise<void>;

    /**
     * Tap at point
     */
    tapAtPoint(point: { x: number; y: number }): Promise<void>;

    /**
     * Take screenshot
     */
    takeScreenshot(name: string): Promise<void>;

    /**
     * Get attributes
     */
    getAttributes(): Promise<any>;

    /**
     * Index into multiple matching elements
     */
    atIndex(index: number): Element;
  }

  /**
   * WaitFor element type
   */
  interface WaitForElement {
    toBeVisible(): WaitForElement;
    toBeNotVisible(): WaitForElement;
    toExist(): WaitForElement;
    toNotExist(): WaitForElement;
    toHaveText(text: string): WaitForElement;
    toHaveValue(value: string): WaitForElement;
    toHaveLabel(label: string): WaitForElement;
    toHaveId(id: string): WaitForElement;
    withTimeout(timeout: number): Promise<void>;
    whileElement(matcher: Matcher): WaitForElement;
  }

  /**
   * Expect type
   */
  interface Expect {
    toBeVisible(): Promise<void>;
    toBeNotVisible(): Promise<void>;
    toExist(): Promise<void>;
    toNotExist(): Promise<void>;
    toHaveText(text: string): Promise<void>;
    toHaveValue(value: string): Promise<void>;
    toHaveLabel(label: string): Promise<void>;
    toHaveId(id: string): Promise<void>;
  }
}

export { };

