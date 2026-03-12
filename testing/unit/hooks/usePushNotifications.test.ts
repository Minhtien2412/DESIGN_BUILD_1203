/**
 * Push Notifications Hook Tests
 */

// Mock expo-constants
// Import after all mocks are set up
import { usePushNotifications } from '@/features/notifications/hooks/usePushNotifications';
import { act, renderHook, waitFor } from '@testing-library/react-native';

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

// Mock expo-notifications
const mockGetPermissionsAsync = jest.fn();
const mockRequestPermissionsAsync = jest.fn();
const mockGetExpoPushTokenAsync = jest.fn();
const mockAddNotificationReceivedListener = jest.fn();
const mockAddNotificationResponseReceivedListener = jest.fn();
const mockRemoveNotificationSubscription = jest.fn();
const mockSetNotificationHandler = jest.fn();

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: mockGetPermissionsAsync,
  requestPermissionsAsync: mockRequestPermissionsAsync,
  getExpoPushTokenAsync: mockGetExpoPushTokenAsync,
  addNotificationReceivedListener: mockAddNotificationReceivedListener,
  addNotificationResponseReceivedListener: mockAddNotificationResponseReceivedListener,
  removeNotificationSubscription: mockRemoveNotificationSubscription,
  setNotificationHandler: mockSetNotificationHandler,
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
    json: () => Promise.resolve({}),
  })
) as jest.Mock;

describe('usePushNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
    mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockGetExpoPushTokenAsync.mockResolvedValue({ data: 'ExponentPushToken[xxx]' });
    mockAddNotificationReceivedListener.mockReturnValue({ remove: jest.fn() });
    mockAddNotificationResponseReceivedListener.mockReturnValue({ remove: jest.fn() });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => usePushNotifications());

    expect(result.current.permission).toBe('undetermined');
    expect(result.current.expoPushToken).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should request permission', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
    mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });

    const { result } = renderHook(() => usePushNotifications());

    let granted: boolean;
    await act(async () => {
      granted = await result.current.requestPermission();
    });

    expect(granted!).toBe(true);
    expect(result.current.permission).toBe('granted');
  });

  it('should handle permission denied', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
    mockRequestPermissionsAsync.mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => usePushNotifications());

    let granted: boolean;
    await act(async () => {
      granted = await result.current.requestPermission();
    });

    expect(granted!).toBe(false);
    expect(result.current.permission).toBe('denied');
  });

  it('should register push token', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockGetExpoPushTokenAsync.mockResolvedValue({ data: 'ExponentPushToken[test123]' });

    const { result } = renderHook(() => usePushNotifications());

    let token: string | null;
    await act(async () => {
      token = await result.current.registerToken();
    });

    expect(token!).toBe('ExponentPushToken[test123]');
    expect(result.current.expoPushToken).toBe('ExponentPushToken[test123]');
  });

  it('should send token to backend', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockGetExpoPushTokenAsync.mockResolvedValue({ data: 'ExponentPushToken[test123]' });

    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      await result.current.registerToken();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.test.com/users/push-token',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ token: 'ExponentPushToken[test123]' }),
      })
    );
  });

  it('should setup notification listeners', async () => {
    renderHook(() => usePushNotifications());

    // Wait for useEffect to run
    await waitFor(() => {
      expect(mockAddNotificationReceivedListener).toHaveBeenCalled();
      expect(mockAddNotificationResponseReceivedListener).toHaveBeenCalled();
    });
  });

  it('should cleanup listeners on unmount', () => {
    const mockRemove = jest.fn();
    mockAddNotificationReceivedListener.mockReturnValue({ remove: mockRemove });
    mockAddNotificationResponseReceivedListener.mockReturnValue({ remove: mockRemove });

    const { unmount } = renderHook(() => usePushNotifications());

    unmount();

    // Cleanup should call remove on listeners
    expect(mockRemove).toHaveBeenCalled();
  });
});
