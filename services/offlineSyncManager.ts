/**
 * Enhanced Offline Sync Manager
 * Coordinates offline storage, queue processing, and real-time sync
 * 
 * Features:
 * - Network state monitoring
 * - Automatic sync when online
 * - Conflict resolution
 * - Background sync support
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { AppState, AppStateStatus, Platform } from 'react-native';

// ============================================================================
// Types
// ============================================================================

export interface SyncItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string; // 'project', 'task', 'message', etc.
  data: any;
  timestamp: number;
  retries: number;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  error?: string;
}

export interface SyncStats {
  pendingCount: number;
  failedCount: number;
  lastSyncTime: number | null;
  isOnline: boolean;
  isSyncing: boolean;
}

type SyncListener = (stats: SyncStats) => void;
type NetworkListener = (isOnline: boolean) => void;

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  SYNC_QUEUE: '@sync_queue',
  LAST_SYNC: '@last_sync_time',
  OFFLINE_DATA: '@offline_data',
};

// ============================================================================
// Sync Manager Class
// ============================================================================

class OfflineSyncManager {
  private queue: SyncItem[] = [];
  private isOnline: boolean = true;
  private isSyncing: boolean = false;
  private lastSyncTime: number | null = null;
  private syncListeners: Set<SyncListener> = new Set();
  private networkListeners: Set<NetworkListener> = new Set();
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private appStateSubscription: any = null;
  private netInfoUnsubscribe: (() => void) | null = null;
  private initialized: boolean = false;

  // ============================================================================
  // Initialization
  // ============================================================================

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('[OfflineSync] Initializing...');

    // Load persisted queue
    await this.loadQueue();
    await this.loadLastSyncTime();

    // Setup network monitoring
    this.setupNetworkMonitoring();

    // Setup app state monitoring
    this.setupAppStateMonitoring();

    // Start background sync
    this.startBackgroundSync();

    this.initialized = true;
    console.log('[OfflineSync] Initialized successfully');
  }

  private setupNetworkMonitoring(): void {
    // Skip on web
    if (Platform.OS === 'web') {
      this.isOnline = navigator.onLine ?? true;
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
      return;
    }

    // Mobile platforms
    this.netInfoUnsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const isConnected = state.isConnected ?? false;
      this.handleNetworkChange(isConnected);
    });

    // Get initial state
    NetInfo.fetch().then((state: NetInfoState) => {
      this.isOnline = state.isConnected ?? false;
    });
  }

  private setupAppStateMonitoring(): void {
    if (Platform.OS === 'web') return;

    this.appStateSubscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          console.log('[OfflineSync] App became active, syncing...');
          this.sync();
        }
      }
    );
  }

  private startBackgroundSync(): void {
    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.queue.length > 0) {
        this.sync();
      }
    }, 30000);
  }

  // ============================================================================
  // Network State
  // ============================================================================

  private handleNetworkChange(isConnected: boolean): void {
    const wasOffline = !this.isOnline;
    this.isOnline = isConnected;

    console.log(`[OfflineSync] Network changed: ${isConnected ? 'online' : 'offline'}`);

    // Notify listeners
    this.networkListeners.forEach(listener => listener(isConnected));

    // Sync when coming back online
    if (wasOffline && isConnected) {
      console.log('[OfflineSync] Back online, syncing pending items...');
      this.sync();
    }

    this.notifySyncListeners();
  }

  // ============================================================================
  // Queue Management
  // ============================================================================

  async addToQueue(item: Omit<SyncItem, 'id' | 'timestamp' | 'retries' | 'status'>): Promise<string> {
    const syncItem: SyncItem = {
      id: this.generateId(),
      ...item,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending',
    };

    this.queue.push(syncItem);
    await this.saveQueue();

    console.log(`[OfflineSync] Added item to queue: ${syncItem.entity} ${syncItem.type}`);

    // Try to sync immediately if online
    if (this.isOnline) {
      this.sync();
    }

    this.notifySyncListeners();
    return syncItem.id;
  }

  async removeFromQueue(id: string): Promise<void> {
    this.queue = this.queue.filter(item => item.id !== id);
    await this.saveQueue();
    this.notifySyncListeners();
  }

  getQueue(): SyncItem[] {
    return [...this.queue];
  }

  getPendingCount(): number {
    return this.queue.filter(item => item.status === 'pending').length;
  }

  getFailedCount(): number {
    return this.queue.filter(item => item.status === 'failed').length;
  }

  // ============================================================================
  // Sync Operations
  // ============================================================================

  async sync(): Promise<void> {
    if (this.isSyncing) {
      console.log('[OfflineSync] Already syncing, skipping...');
      return;
    }

    if (!this.isOnline) {
      console.log('[OfflineSync] Offline, skipping sync');
      return;
    }

    const pendingItems = this.queue.filter(item => item.status === 'pending' || item.status === 'failed');
    if (pendingItems.length === 0) {
      return;
    }

    console.log(`[OfflineSync] Starting sync of ${pendingItems.length} items...`);
    this.isSyncing = true;
    this.notifySyncListeners();

    for (const item of pendingItems) {
      try {
        item.status = 'syncing';
        await this.syncItem(item);
        item.status = 'synced';
        console.log(`[OfflineSync] Synced: ${item.entity} ${item.type}`);
      } catch (error) {
        item.retries++;
        item.status = item.retries >= 3 ? 'failed' : 'pending';
        item.error = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[OfflineSync] Failed to sync: ${item.entity}`, error);
      }
    }

    // Remove synced items
    this.queue = this.queue.filter(item => item.status !== 'synced');
    await this.saveQueue();

    this.lastSyncTime = Date.now();
    await this.saveLastSyncTime();

    this.isSyncing = false;
    this.notifySyncListeners();

    console.log('[OfflineSync] Sync completed');
  }

  private async syncItem(item: SyncItem): Promise<void> {
    // Import API dynamically to avoid circular dependencies
    const { apiFetch } = await import('@/services/api');

    const endpoints: Record<string, string> = {
      project: '/projects',
      task: '/tasks',
      message: '/messages',
      comment: '/comments',
      document: '/documents',
    };

    const endpoint = endpoints[item.entity];
    if (!endpoint) {
      throw new Error(`Unknown entity type: ${item.entity}`);
    }

    switch (item.type) {
      case 'create':
        await apiFetch(endpoint, {
          method: 'POST',
          body: JSON.stringify(item.data),
        });
        break;

      case 'update':
        await apiFetch(`${endpoint}/${item.data.id}`, {
          method: 'PATCH',
          body: JSON.stringify(item.data),
        });
        break;

      case 'delete':
        await apiFetch(`${endpoint}/${item.data.id}`, {
          method: 'DELETE',
        });
        break;
    }
  }

  // ============================================================================
  // Offline Data Cache
  // ============================================================================

  async cacheData(key: string, data: any): Promise<void> {
    try {
      const cacheKey = `${STORAGE_KEYS.OFFLINE_DATA}_${key}`;
      await AsyncStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('[OfflineSync] Failed to cache data:', error);
    }
  }

  async getCachedData<T>(key: string, maxAge: number = 3600000): Promise<T | null> {
    try {
      const cacheKey = `${STORAGE_KEYS.OFFLINE_DATA}_${key}`;
      const raw = await AsyncStorage.getItem(cacheKey);
      
      if (!raw) return null;

      const cached = JSON.parse(raw);
      const age = Date.now() - cached.timestamp;

      if (age > maxAge) {
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }

      return cached.data as T;
    } catch (error) {
      console.error('[OfflineSync] Failed to get cached data:', error);
      return null;
    }
  }

  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.OFFLINE_DATA));
      await AsyncStorage.multiRemove(cacheKeys);
      console.log('[OfflineSync] Cache cleared');
    } catch (error) {
      console.error('[OfflineSync] Failed to clear cache:', error);
    }
  }

  // ============================================================================
  // Persistence
  // ============================================================================

  private async loadQueue(): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      if (raw) {
        this.queue = JSON.parse(raw);
        console.log(`[OfflineSync] Loaded ${this.queue.length} items from queue`);
      }
    } catch (error) {
      console.error('[OfflineSync] Failed to load queue:', error);
      this.queue = [];
    }
  }

  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(this.queue));
    } catch (error) {
      console.error('[OfflineSync] Failed to save queue:', error);
    }
  }

  private async loadLastSyncTime(): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      if (raw) {
        this.lastSyncTime = parseInt(raw, 10);
      }
    } catch (error) {
      console.error('[OfflineSync] Failed to load last sync time:', error);
    }
  }

  private async saveLastSyncTime(): Promise<void> {
    try {
      if (this.lastSyncTime) {
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, this.lastSyncTime.toString());
      }
    } catch (error) {
      console.error('[OfflineSync] Failed to save last sync time:', error);
    }
  }

  // ============================================================================
  // Listeners
  // ============================================================================

  onSyncChange(listener: SyncListener): () => void {
    this.syncListeners.add(listener);
    // Immediately notify with current state
    listener(this.getStats());
    return () => this.syncListeners.delete(listener);
  }

  onNetworkChange(listener: NetworkListener): () => void {
    this.networkListeners.add(listener);
    // Immediately notify with current state
    listener(this.isOnline);
    return () => this.networkListeners.delete(listener);
  }

  private notifySyncListeners(): void {
    const stats = this.getStats();
    this.syncListeners.forEach(listener => listener(stats));
  }

  // ============================================================================
  // Stats & Utilities
  // ============================================================================

  getStats(): SyncStats {
    return {
      pendingCount: this.getPendingCount(),
      failedCount: this.getFailedCount(),
      lastSyncTime: this.lastSyncTime,
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
    };
  }

  isNetworkOnline(): boolean {
    return this.isOnline;
  }

  private generateId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe();
      this.netInfoUnsubscribe = null;
    }

    this.syncListeners.clear();
    this.networkListeners.clear();
    this.initialized = false;

    console.log('[OfflineSync] Destroyed');
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const offlineSyncManager = new OfflineSyncManager();
export default offlineSyncManager;
