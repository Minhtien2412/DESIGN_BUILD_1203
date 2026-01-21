/**
 * useOfflineSync Hook Tests
 */

import { act, renderHook } from '@testing-library/react-native';

import { useNetworkStatus, useOfflineSync } from '@/hooks/useOfflineSync';

// Mock the offlineSyncManager
jest.mock('@/services/offlineSyncManager', () => ({
  offlineSyncManager: {
    initialize: jest.fn().mockResolvedValue(undefined),
    onSyncChange: jest.fn((callback) => {
      callback({
        pendingCount: 0,
        failedCount: 0,
        lastSyncTime: null,
        isOnline: true,
        isSyncing: false,
      });
      return jest.fn(); // unsubscribe
    }),
    onNetworkChange: jest.fn((callback) => {
      callback(true);
      return jest.fn();
    }),
    sync: jest.fn().mockResolvedValue(undefined),
    addToQueue: jest.fn().mockResolvedValue('sync_123'),
    cacheData: jest.fn().mockResolvedValue(undefined),
    getCachedData: jest.fn().mockResolvedValue(null),
  },
}));

describe('useOfflineSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useOfflineSync());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.isSyncing).toBe(false);
    expect(result.current.pendingCount).toBe(0);
    expect(result.current.failedCount).toBe(0);
    expect(result.current.lastSyncTime).toBeNull();
  });

  it('should expose sync function', async () => {
    const { result } = renderHook(() => useOfflineSync());
    const { offlineSyncManager } = require('@/services/offlineSyncManager');

    await act(async () => {
      await result.current.sync();
    });

    expect(offlineSyncManager.sync).toHaveBeenCalled();
  });

  it('should expose addToQueue function', async () => {
    const { result } = renderHook(() => useOfflineSync());
    const { offlineSyncManager } = require('@/services/offlineSyncManager');

    let id: string;
    await act(async () => {
      id = await result.current.addToQueue('create', 'task', { title: 'Test' });
    });

    expect(offlineSyncManager.addToQueue).toHaveBeenCalledWith({
      type: 'create',
      entity: 'task',
      data: { title: 'Test' },
    });
    expect(id!).toBe('sync_123');
  });

  it('should expose cacheData function', async () => {
    const { result } = renderHook(() => useOfflineSync());
    const { offlineSyncManager } = require('@/services/offlineSyncManager');

    await act(async () => {
      await result.current.cacheData('projects', [{ id: '1' }]);
    });

    expect(offlineSyncManager.cacheData).toHaveBeenCalledWith('projects', [{ id: '1' }]);
  });

  it('should expose getCachedData function', async () => {
    const { result } = renderHook(() => useOfflineSync());
    const { offlineSyncManager } = require('@/services/offlineSyncManager');
    
    offlineSyncManager.getCachedData.mockResolvedValueOnce([{ id: '1' }]);

    let data: any;
    await act(async () => {
      data = await result.current.getCachedData('projects');
    });

    expect(data).toEqual([{ id: '1' }]);
  });
});

describe('useNetworkStatus', () => {
  it('should return network status', () => {
    const { result } = renderHook(() => useNetworkStatus());

    expect(typeof result.current).toBe('boolean');
    expect(result.current).toBe(true);
  });
});
