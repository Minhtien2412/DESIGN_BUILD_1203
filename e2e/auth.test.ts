/**
 * E2E Test - Authentication Flow
 */

describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES', camera: 'YES', photos: 'YES' },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show login screen on app launch', async () => {
    await expect(element(by.text('Welcome Back'))).toBeVisible();
    await expect(element(by.id('email-input'))).toBeVisible();
    await expect(element(by.id('password-input'))).toBeVisible();
    await expect(element(by.id('login-button'))).toBeVisible();
  });

  it('should show validation errors for empty fields', async () => {
    await element(by.id('login-button')).tap();
    await expect(element(by.text('Email is required'))).toBeVisible();
    await expect(element(by.text('Password is required'))).toBeVisible();
  });

  it('should show error for invalid credentials', async () => {
    await element(by.id('email-input')).typeText('invalid@test.com');
    await element(by.id('password-input')).typeText('wrongpassword');
    await element(by.id('login-button')).tap();
    
    await waitFor(element(by.text('Invalid credentials')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should login successfully with valid credentials', async () => {
    await element(by.id('email-input')).typeText('demo@baotienweb.cloud');
    await element(by.id('password-input')).typeText('Demo123!');
    await element(by.id('login-button')).tap();
    
    // Wait for navigation to home screen
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(10000);
    
    await expect(element(by.text('Projects'))).toBeVisible();
  });

  it('should navigate to register screen', async () => {
    await element(by.id('register-link')).tap();
    await expect(element(by.text('Create Account'))).toBeVisible();
    await expect(element(by.id('name-input'))).toBeVisible();
    await expect(element(by.id('email-input'))).toBeVisible();
    await expect(element(by.id('password-input'))).toBeVisible();
  });

  it('should logout successfully', async () => {
    // Login first
    await element(by.id('email-input')).typeText('demo@baotienweb.cloud');
    await element(by.id('password-input')).typeText('Demo123!');
    await element(by.id('login-button')).tap();
    await waitFor(element(by.id('home-screen'))).toBeVisible().withTimeout(10000);
    
    // Navigate to profile
    await element(by.id('profile-tab')).tap();
    await element(by.id('logout-button')).tap();
    
    // Confirm logout
    await element(by.text('Logout')).tap();
    
    // Should return to login screen
    await waitFor(element(by.text('Welcome Back')))
      .toBeVisible()
      .withTimeout(5000);
  });
});
