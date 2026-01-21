/**
 * Token Refresh System - Integration Tests
 * 
 * Tests the automatic token refresh mechanism in apiClient.ts
 * Run: npm test token-refresh.test.ts
 */

import { apiClient, clearAuthTokens, getAccessToken, getRefreshToken, setAuthTokens } from '@/services/apiClient';
import axios from 'axios';

// Mock axios for testing
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Token Refresh System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await clearAuthTokens();
  });

  describe('Auto-Refresh on 401', () => {
    it('should automatically refresh token when access token expires', async () => {
      // Setup: User logged in with expired access token
      await setAuthTokens('EXPIRED_ACCESS_TOKEN', 'VALID_REFRESH_TOKEN');

      // Mock original request failing with 401
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Token expired' },
          statusText: 'Unauthorized',
        },
        config: {
          url: '/users/me',
          headers: {},
        },
      };

      mockedAxios.request.mockRejectedValueOnce(mockError);

      // Mock successful token refresh
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          accessToken: 'NEW_ACCESS_TOKEN_12345',
          refreshToken: 'NEW_REFRESH_TOKEN_67890',
          user: {
            id: 123,
            email: 'test@example.com',
            name: 'Test User',
            role: 'CLIENT',
          },
        },
      });

      // Mock successful retry of original request
      mockedAxios.request.mockResolvedValueOnce({
        data: {
          id: 123,
          email: 'test@example.com',
          name: 'Test User',
        },
      });

      // Execute: Make API call that will trigger refresh
      const result = await apiClient.get('/users/me');

      // Verify: Refresh endpoint was called
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/refresh'),
        { refreshToken: 'VALID_REFRESH_TOKEN' },
        expect.objectContaining({
          timeout: expect.any(Number),
          headers: expect.any(Object),
        }),
      );

      // Verify: Original request was retried
      expect(result).toEqual({
        id: 123,
        email: 'test@example.com',
        name: 'Test User',
      });

      // Verify: Tokens were updated in memory
      const newAccessToken = await getAccessToken();
      const newRefreshToken = await getRefreshToken();
      expect(newAccessToken).toBe('NEW_ACCESS_TOKEN_12345');
      expect(newRefreshToken).toBe('NEW_REFRESH_TOKEN_67890');
    });

    it('should handle refresh token failure by clearing tokens', async () => {
      // Setup: Both tokens expired
      await setAuthTokens('EXPIRED_ACCESS', 'EXPIRED_REFRESH');

      // Mock original request failing with 401
      const mockError = {
        response: { status: 401, data: { message: 'Token expired' } },
        config: { url: '/users/me', headers: {} },
      };
      mockedAxios.request.mockRejectedValueOnce(mockError);

      // Mock refresh request also failing
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { message: 'Invalid refresh token' },
        },
      });

      // Execute: Try to make API call
      await expect(apiClient.get('/users/me')).rejects.toThrow();

      // Verify: Tokens were cleared
      const accessToken = await getAccessToken();
      const refreshToken = await getRefreshToken();
      expect(accessToken).toBeNull();
      expect(refreshToken).toBeNull();
    });
  });

  describe('Request Queuing', () => {
    it('should queue multiple concurrent requests and refresh only once', async () => {
      // Setup: Expired access token
      await setAuthTokens('EXPIRED', 'VALID_REFRESH');

      // Mock all initial requests failing with 401
      const mockError = {
        response: { status: 401, data: { message: 'Token expired' } },
        config: { url: '/test', headers: {} },
      };
      mockedAxios.request
        .mockRejectedValueOnce(mockError) // Request 1 fails
        .mockRejectedValueOnce(mockError) // Request 2 fails
        .mockRejectedValueOnce(mockError); // Request 3 fails

      // Mock successful refresh (should only be called once)
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          accessToken: 'NEW_ACCESS',
          refreshToken: 'NEW_REFRESH',
        },
      });

      // Mock successful retries
      mockedAxios.request
        .mockResolvedValueOnce({ data: { result: 1 } }) // Request 1 retry succeeds
        .mockResolvedValueOnce({ data: { result: 2 } }) // Request 2 retry succeeds
        .mockResolvedValueOnce({ data: { result: 3 } }); // Request 3 retry succeeds

      // Execute: Send 3 concurrent requests
      const promises = [
        apiClient.get('/test1'),
        apiClient.get('/test2'),
        apiClient.get('/test3'),
      ];

      const results = await Promise.all(promises);

      // Verify: Only 1 refresh call was made
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);

      // Verify: All requests eventually succeeded
      expect(results).toHaveLength(3);
    });

    it('should handle queued requests when refresh fails', async () => {
      await setAuthTokens('EXPIRED', 'INVALID_REFRESH');

      // All requests fail with 401
      const mockError = {
        response: { status: 401 },
        config: { url: '/test', headers: {} },
      };
      mockedAxios.request
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError);

      // Refresh fails
      mockedAxios.post.mockRejectedValueOnce({
        response: { status: 401, data: { message: 'Invalid refresh token' } },
      });

      // Execute: Multiple concurrent requests
      const promises = [apiClient.get('/test1'), apiClient.get('/test2')];

      // Verify: All requests fail
      await expect(Promise.all(promises)).rejects.toThrow();

      // Verify: Tokens cleared
      expect(await getAccessToken()).toBeNull();
      expect(await getRefreshToken()).toBeNull();
    });
  });

  describe('Rate Limiting (429)', () => {
    it('should retry after rate limit delay', async () => {
      // Mock 429 response
      mockedAxios.request.mockRejectedValueOnce({
        response: {
          status: 429,
          data: { message: 'Too many requests', retryAfter: 2 },
        },
        config: { url: '/test', headers: {} },
      });

      // Mock successful retry
      mockedAxios.request.mockResolvedValueOnce({
        data: { success: true },
      });

      // Execute
      const startTime = Date.now();
      const result = await apiClient.get('/test');
      const elapsedTime = Date.now() - startTime;

      // Verify: Request succeeded
      expect(result).toEqual({ success: true });

      // Verify: Waited at least 2 seconds (2000ms)
      expect(elapsedTime).toBeGreaterThanOrEqual(2000);
    });
  });

  describe('Token Management Helpers', () => {
    it('should set and retrieve access token', async () => {
      await setAuthTokens('ACCESS_123', 'REFRESH_456');

      const accessToken = await getAccessToken();
      expect(accessToken).toBe('ACCESS_123');
    });

    it('should set and retrieve refresh token', async () => {
      await setAuthTokens('ACCESS_123', 'REFRESH_456');

      const refreshToken = await getRefreshToken();
      expect(refreshToken).toBe('REFRESH_456');
    });

    it('should clear both tokens', async () => {
      await setAuthTokens('ACCESS_123', 'REFRESH_456');
      await clearAuthTokens();

      const accessToken = await getAccessToken();
      const refreshToken = await getRefreshToken();

      expect(accessToken).toBeNull();
      expect(refreshToken).toBeNull();
    });

    it('should persist tokens to storage', async () => {
      const mockSetItem = jest.fn();
      const mockGetItem = jest.fn().mockResolvedValue('STORED_ACCESS');

      jest.mock('@/utils/storage', () => ({
        setToken: mockSetItem,
        getToken: mockGetItem,
        setItem: mockSetItem,
        getItem: mockGetItem,
      }));

      await setAuthTokens('ACCESS_123', 'REFRESH_456');

      // Verify: Tokens were stored
      expect(mockSetItem).toHaveBeenCalledWith('ACCESS_123');
      expect(mockSetItem).toHaveBeenCalledWith('refresh_token', 'REFRESH_456');
    });
  });

  describe('Error Handling', () => {
    it('should transform axios errors to ApiError', async () => {
      const mockError = {
        response: {
          status: 404,
          statusText: 'Not Found',
          data: {
            message: 'User not found',
            code: 'USER_NOT_FOUND',
          },
        },
        config: { url: '/users/999' },
      };

      mockedAxios.request.mockRejectedValueOnce(mockError);

      try {
        await apiClient.get('/users/999');
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.name).toBe('ApiError');
        expect(error.status).toBe(404);
        expect(error.message).toBe('User not found');
        expect(error.code).toBe('USER_NOT_FOUND');
        expect(error.url).toBe('/users/999');
      }
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      (networkError as any).code = 'ECONNREFUSED';

      mockedAxios.request.mockRejectedValueOnce(networkError);

      try {
        await apiClient.get('/test');
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.name).toBe('ApiError');
        expect(error.code).toBe('ECONNREFUSED');
      }
    });
  });
});

describe('Integration: Token Refresh with AuthContext', () => {
  it('should maintain user session after token refresh', async () => {
    // This is an integration test placeholder
    // Actual test would require running AuthContext provider

    // Setup: User logged in
    await setAuthTokens('EXPIRED_ACCESS', 'VALID_REFRESH');

    // Mock refresh
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        accessToken: 'NEW_ACCESS',
        refreshToken: 'NEW_REFRESH',
        user: { id: 1, email: 'test@test.com' },
      },
    });

    // Verify: Tokens updated
    // In real app: AuthContext should remain authenticated
    // User should NOT be logged out
    // Navigation should NOT change
  });
});

describe('Performance', () => {
  it('should complete refresh within reasonable time', async () => {
    await setAuthTokens('EXPIRED', 'VALID');

    mockedAxios.request.mockRejectedValueOnce({
      response: { status: 401 },
      config: { url: '/test', headers: {} },
    });

    mockedAxios.post.mockResolvedValueOnce({
      data: { accessToken: 'NEW', refreshToken: 'NEW_REFRESH' },
    });

    mockedAxios.request.mockResolvedValueOnce({ data: { success: true } });

    const startTime = Date.now();
    await apiClient.get('/test');
    const duration = Date.now() - startTime;

    // Should complete within 5 seconds (generous for testing)
    expect(duration).toBeLessThan(5000);
  });
});
