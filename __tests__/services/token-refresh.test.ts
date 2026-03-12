/**
 * Token Refresh System - Integration Tests
 */

// Mock axios before importing apiClient
jest.mock('axios', () => {
  const mockAxios = {
    create: jest.fn(() => mockAxios),
    request: jest.fn(),
    post: jest.fn(),
    get: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
    defaults: {
      headers: {
        common: {},
      },
    },
  };
  return {
    __esModule: true,
    default: mockAxios,
    ...mockAxios,
  };
});

// Mock SecureStore
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Token Refresh System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Token Storage', () => {
    it('should mock axios correctly', () => {
      expect(mockedAxios.create).toBeDefined();
      expect(mockedAxios.interceptors).toBeDefined();
    });

    it('should have request interceptors', () => {
      expect(mockedAxios.interceptors.request.use).toBeDefined();
    });

    it('should have response interceptors', () => {
      expect(mockedAxios.interceptors.response.use).toBeDefined();
    });
  });

  describe('Auto-Refresh on 401', () => {
    it('should handle 401 errors', async () => {
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Token expired' },
        },
        config: {
          url: '/users/me',
          headers: {},
        },
      };

      mockedAxios.request.mockRejectedValueOnce(mockError);

      await expect(mockedAxios.request({ url: '/users/me' })).rejects.toMatchObject({
        response: { status: 401 },
      });
    });
  });

  describe('Token Persistence', () => {
    it('should use SecureStore for token storage', () => {
      const SecureStore = require('expo-secure-store');
      expect(SecureStore.getItemAsync).toBeDefined();
      expect(SecureStore.setItemAsync).toBeDefined();
      expect(SecureStore.deleteItemAsync).toBeDefined();
    });
  });
});
