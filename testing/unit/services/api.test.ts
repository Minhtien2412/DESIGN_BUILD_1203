/**
 * @jest-environment jsdom
 */
import { ApiError, apiFetch } from '@/services/api';

// Mock fetch globally
global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('makes successful API calls', async () => {
    const mockData = { id: 1, name: 'Test' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => mockData,
    });

    const result = await apiFetch('/test');
    
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.any(Object)
    );
  });

  it('handles API errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ message: 'Resource not found' }),
      url: 'http://example.com/test',
    });

    await expect(apiFetch('/test')).rejects.toThrow(ApiError);
  });

  it('handles network errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await expect(apiFetch('/test')).rejects.toThrow();
  });

  it('includes custom headers', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({}),
    });

    await apiFetch('/test', {
      headers: { 'X-Custom-Header': 'test-value' },
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Custom-Header': 'test-value',
        }),
      })
    );
  });

  it('handles timeout', async () => {
    jest.useFakeTimers();
    
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 20000))
    );

    const promise = apiFetch('/test', { timeoutMs: 1000 });
    
    jest.advanceTimersByTime(1000);
    
    await expect(promise).rejects.toThrow();
    
    jest.useRealTimers();
  });
});
