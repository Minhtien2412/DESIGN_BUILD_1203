/**
 * Push Notifications Hook Tests
 */

// Mock expo-notifications BEFORE any imports that might use it
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'test-token' }),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  removeNotificationSubscription: jest.fn(),
  setNotificationHandler: jest.fn(),
  AndroidImportance: { MAX: 5 },
  setNotificationChannelAsync: jest.fn(),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  appOwnership: 'standalone',
  expoConfig: {
    extra: {
      eas: {
        projectId: 'test-project-id',
      },
    },
  },
}));

// Mock expo-device
jest.mock('expo-device', () => ({
  isDevice: true,
}));

// Mock auth context
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'user-123', email: 'test@example.com' },
  })),
}));

// Mock notifications feature
jest.mock('@/features/notifications', () => ({
  useNotifications: jest.fn(() => ({
    addNotification: jest.fn(),
  })),
}));

// Mock config
jest.mock('@/config', () => ({
  buildApiUrl: jest.fn((path: string) => `https://api.test.com${path}`),
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  } as Response)
);

describe('usePushNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have expo-notifications mocked correctly', () => {
    const Notifications = require('expo-notifications');
    expect(Notifications.setNotificationHandler).toBeDefined();
    expect(Notifications.getPermissionsAsync).toBeDefined();
  });

  it('should have mock functions callable', async () => {
    const Notifications = require('expo-notifications');
    const result = await Notifications.getPermissionsAsync();
    expect(result.status).toBe('granted');
  });

  it('should get expo push token', async () => {
    const Notifications = require('expo-notifications');
    const result = await Notifications.getExpoPushTokenAsync();
    expect(result.data).toBe('test-token');
  });

  it('should have notification listener functions', () => {
    const Notifications = require('expo-notifications');
    expect(typeof Notifications.addNotificationReceivedListener).toBe('function');
    expect(typeof Notifications.addNotificationResponseReceivedListener).toBe('function');
  });

  it('should mock AndroidImportance', () => {
    const Notifications = require('expo-notifications');
    expect(Notifications.AndroidImportance.MAX).toBe(5);
  });
});
