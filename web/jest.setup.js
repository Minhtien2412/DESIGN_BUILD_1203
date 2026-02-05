/**
 * Jest Setup File for React Native + Expo
 * Mock native modules and configure testing environment
 */

// Mock react-native Platform first (before any other imports)
jest.mock("react-native/Libraries/Utilities/Platform", () => ({
  OS: "ios",
  Version: 17,
  select: jest.fn((obj) => obj.ios ?? obj.default),
  isPad: false,
  isTVOS: false,
  isTV: false,
  constants: {
    reactNativeVersion: { major: 0, minor: 73, patch: 0 },
  },
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// Mock expo-secure-store
jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
  WHEN_UNLOCKED: "WHEN_UNLOCKED",
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: "WHEN_UNLOCKED_THIS_DEVICE_ONLY",
  AFTER_FIRST_UNLOCK: "AFTER_FIRST_UNLOCK",
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: "AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY",
  ALWAYS: "ALWAYS",
  ALWAYS_THIS_DEVICE_ONLY: "ALWAYS_THIS_DEVICE_ONLY",
}));

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: () => false,
  }),
  useLocalSearchParams: () => ({}),
  useGlobalSearchParams: () => ({}),
  useSegments: () => [],
  usePathname: () => "/",
  Link: "Link",
  Stack: {
    Screen: "Screen",
  },
  Tabs: {
    Screen: "Screen",
  },
}));

// Mock expo-constants
jest.mock("expo-constants", () => ({
  default: {
    expoConfig: {
      name: "test-app",
      slug: "test-app",
      extra: {
        apiUrl: "http://localhost:3000",
      },
    },
    appOwnership: "standalone",
  },
}));

// Mock expo-device
jest.mock("expo-device", () => ({
  isDevice: true,
  brand: "TestBrand",
  modelName: "TestModel",
  osName: "iOS",
  osVersion: "17.0",
}));

// Mock expo-notifications
jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: "granted" })),
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" }),
  ),
  getExpoPushTokenAsync: jest.fn(() =>
    Promise.resolve({ data: "test-push-token" }),
  ),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
  AndroidImportance: { MAX: 5, HIGH: 4, DEFAULT: 3, LOW: 2, MIN: 1 },
  setNotificationChannelAsync: jest.fn(),
}));

// Mock expo-local-authentication
jest.mock("expo-local-authentication", () => ({
  hasHardwareAsync: jest.fn(() => Promise.resolve(true)),
  isEnrolledAsync: jest.fn(() => Promise.resolve(true)),
  authenticateAsync: jest.fn(() => Promise.resolve({ success: true })),
  supportedAuthenticationTypesAsync: jest.fn(() => Promise.resolve([1, 2])),
  SecurityLevel: { NONE: 0, SECRET: 1, BIOMETRIC: 2 },
  AuthenticationType: { FINGERPRINT: 1, FACIAL_RECOGNITION: 2, IRIS: 3 },
}));

// Mock expo-haptics
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium", Heavy: "heavy" },
  NotificationFeedbackType: {
    Success: "success",
    Warning: "warning",
    Error: "error",
  },
}));

// Mock expo-linking
jest.mock("expo-linking", () => ({
  createURL: jest.fn((path) => `myapp://${path}`),
  openURL: jest.fn(),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  useURL: jest.fn(() => null),
}));

// Mock expo-clipboard
jest.mock("expo-clipboard", () => ({
  setStringAsync: jest.fn(),
  getStringAsync: jest.fn(() => Promise.resolve("")),
  hasStringAsync: jest.fn(() => Promise.resolve(false)),
}));

// Mock expo-file-system
jest.mock("expo-file-system", () => ({
  documentDirectory: "file:///documents/",
  cacheDirectory: "file:///cache/",
  downloadAsync: jest.fn(() =>
    Promise.resolve({ uri: "file:///cache/downloaded.file", status: 200 }),
  ),
  getInfoAsync: jest.fn(() =>
    Promise.resolve({ exists: true, size: 1024, isDirectory: false }),
  ),
  readAsStringAsync: jest.fn(() => Promise.resolve("base64data")),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  readDirectoryAsync: jest.fn(() => Promise.resolve([])),
  copyAsync: jest.fn(() => Promise.resolve()),
  moveAsync: jest.fn(() => Promise.resolve()),
  EncodingType: { UTF8: "utf8", Base64: "base64" },
  FileSystemUploadType: { BINARY_CONTENT: 0, MULTIPART: 1 },
  createUploadTask: jest.fn(() => ({
    uploadAsync: jest.fn(() => Promise.resolve({ status: 200, body: "{}" })),
    cancelAsync: jest.fn(() => Promise.resolve()),
  })),
  Directory: jest.fn().mockImplementation(() => ({
    create: jest.fn(() => Promise.resolve()),
    exists: jest.fn(() => true),
    delete: jest.fn(() => Promise.resolve()),
  })),
  File: jest.fn().mockImplementation(() => ({
    text: jest.fn(() => Promise.resolve("mock content")),
    arrayBuffer: jest.fn(() => Promise.resolve(new ArrayBuffer(0))),
    write: jest.fn(() => Promise.resolve()),
    exists: jest.fn(() => true),
    delete: jest.fn(() => Promise.resolve()),
  })),
  Paths: {
    document: { uri: "file:///documents/" },
    cache: { uri: "file:///cache/" },
    bundle: { uri: "file:///bundle/" },
    availableDiskSpace: 1000000000,
    totalDiskSpace: 5000000000,
  },
}));

// Mock FileSystemCompat utility (wraps expo-file-system)
jest.mock("./utils/FileSystemCompat", () => ({
  documentDirectory: "file:///documents/",
  cacheDirectory: "file:///cache/",
  bundleDirectory: "file:///bundle/",
  EncodingType: { UTF8: "utf8", Base64: "base64" },
  getFreeDiskStorageAsync: jest.fn(() => Promise.resolve(1000000000)),
  getTotalDiskCapacityAsync: jest.fn(() => Promise.resolve(5000000000)),
  readAsStringAsync: jest.fn(() => Promise.resolve("base64data")),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  getInfoAsync: jest.fn(() =>
    Promise.resolve({ exists: true, size: 1024, isDirectory: false }),
  ),
  deleteAsync: jest.fn(() => Promise.resolve()),
  copyAsync: jest.fn(() => Promise.resolve()),
  moveAsync: jest.fn(() => Promise.resolve()),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  readDirectoryAsync: jest.fn(() => Promise.resolve([])),
  downloadAsync: jest.fn(() =>
    Promise.resolve({ uri: "file:///test.pdf", status: 200 }),
  ),
  createDownloadResumable: jest.fn(() => ({
    downloadAsync: jest.fn(() => Promise.resolve({ uri: "file:///test.pdf" })),
    pauseAsync: jest.fn(() => Promise.resolve()),
    resumeAsync: jest.fn(() => Promise.resolve()),
    savable: jest.fn(() => ({})),
  })),
  uploadAsync: jest.fn(() => Promise.resolve({ status: 200, body: "{}" })),
  createDirectoryAsync: jest.fn(() => Promise.resolve()),
  isFileAsync: jest.fn(() => Promise.resolve(true)),
  FileUploadType: { BINARY_CONTENT: 0, MULTIPART: 1 },
}));

// Mock @react-native-community/netinfo
jest.mock("@react-native-community/netinfo", () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
      type: "wifi",
    }),
  ),
  useNetInfo: () => ({
    isConnected: true,
    isInternetReachable: true,
    type: "wifi",
  }),
}));

// Mock expo-av
jest.mock("expo-av", () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(() =>
        Promise.resolve({
          sound: { playAsync: jest.fn(), unloadAsync: jest.fn() },
          status: { isLoaded: true },
        }),
      ),
    },
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
    Recording: jest.fn(),
    getPermissionsAsync: jest.fn(() =>
      Promise.resolve({ status: "granted", granted: true }),
    ),
    requestPermissionsAsync: jest.fn(() =>
      Promise.resolve({ status: "granted", granted: true }),
    ),
  },
  Video: "Video",
}));

// Mock Animated - for jest-expo preset
// NativeAnimatedHelper mock handled by jest-expo

// Mock expo-image
jest.mock("expo-image", () => ({
  Image: "Image",
}));

// Mock Sentry
jest.mock("@sentry/react-native", () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
  addBreadcrumb: jest.fn(),
  wrap: (component) => component,
}));

// Silence console.warn and console.error in tests
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeAll(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});

// Global test timeout
jest.setTimeout(10000);
