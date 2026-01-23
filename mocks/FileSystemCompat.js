/**
 * Mock for FileSystemCompat
 * Used by Jest to avoid native module issues in tests
 *
 * Tests can customize behavior using:
 * - (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({...})
 * - (FileSystem.deleteAsync as jest.Mock).mockRejectedValue(new Error('...'))
 */

// Create configurable mock functions
const getInfoAsync = jest.fn(() =>
  Promise.resolve({ exists: true, size: 1024, isDirectory: false }),
);

const readAsStringAsync = jest.fn(() => Promise.resolve("base64data"));

const writeAsStringAsync = jest.fn(() => Promise.resolve());

const deleteAsync = jest.fn(() => Promise.resolve());

const copyAsync = jest.fn(() => Promise.resolve());

const moveAsync = jest.fn(() => Promise.resolve());

const makeDirectoryAsync = jest.fn(() => Promise.resolve());

const readDirectoryAsync = jest.fn(() => Promise.resolve([]));

const downloadAsync = jest.fn(() =>
  Promise.resolve({ uri: "file:///cache/downloaded.file", status: 200 }),
);

const uploadAsync = jest.fn(() => Promise.resolve({ status: 200, body: "{}" }));

const createDownloadResumable = jest.fn(() => ({
  downloadAsync: jest.fn(() =>
    Promise.resolve({ uri: "file:///cache/test.pdf" }),
  ),
  pauseAsync: jest.fn(() => Promise.resolve()),
  resumeAsync: jest.fn(() => Promise.resolve()),
  savable: jest.fn(() => ({})),
  cancelAsync: jest.fn(() => Promise.resolve()),
}));

const getFreeDiskStorageAsync = jest.fn(() => Promise.resolve(1000000000));
const getTotalDiskCapacityAsync = jest.fn(() => Promise.resolve(5000000000));
const isFileAsync = jest.fn(() => Promise.resolve(true));
const createDirectoryAsync = jest.fn(() => Promise.resolve());

const createUploadTask = jest.fn(() => ({
  uploadAsync: jest.fn(() => Promise.resolve({ status: 200, body: "{}" })),
  cancelAsync: jest.fn(() => Promise.resolve()),
}));

module.exports = {
  // Directory paths
  documentDirectory: "file:///documents/",
  cacheDirectory: "file:///cache/",
  bundleDirectory: "file:///bundle/",

  // Encoding types
  EncodingType: {
    UTF8: "utf8",
    Base64: "base64",
  },

  // Upload types - used by PresignedUploadService
  FileSystemUploadType: {
    BINARY_CONTENT: 0,
    MULTIPART: 1,
  },

  // Storage info
  getFreeDiskStorageAsync,
  getTotalDiskCapacityAsync,

  // File operations - exported as named functions for test mocking
  readAsStringAsync,
  writeAsStringAsync,
  getInfoAsync,
  deleteAsync,
  copyAsync,
  moveAsync,
  makeDirectoryAsync,
  readDirectoryAsync,
  downloadAsync,
  createDownloadResumable,
  uploadAsync,
  createDirectoryAsync,
  isFileAsync,
  createUploadTask,
};
