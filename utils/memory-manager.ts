/**
 * Advanced Memory Management & Caching
 * Quản lý bộ nhớ và cache thông minh
 */

import { storage } from '@/services/storage';
import { useCallback, useEffect, useRef, useState } from 'react';

// =================
// MEMORY CACHE MANAGER
// =================

interface CacheConfig {
  maxSize: number; // Max items in cache
  maxAge: number; // Max age in milliseconds
  gcInterval: number; // Garbage collection interval
}

class MemoryCache {
  private cache = new Map<string, { data: any; timestamp: number; accessCount: number }>();
  private config: CacheConfig;
  private gcTimer: any = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: config.maxSize || 100,
      maxAge: config.maxAge || 30 * 60 * 1000, // 30 minutes
      gcInterval: config.gcInterval || 5 * 60 * 1000, // 5 minutes
    };

    this.startGarbageCollection();
  }

  set(key: string, data: any): void {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      accessCount: 1,
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.config.maxAge) {
      this.cache.delete(key);
      return null;
    }

    // Update access count
    entry.accessCount++;
    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() - entry.timestamp > this.config.maxAge) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private evictLeastRecentlyUsed(): void {
    let lruKey = '';
    let lruAccessCount = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessCount < lruAccessCount) {
        lruAccessCount = entry.accessCount;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  private startGarbageCollection(): void {
    this.gcTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > this.config.maxAge) {
          this.cache.delete(key);
        }
      }
    }, this.config.gcInterval);
  }

  destroy(): void {
    if (this.gcTimer) {
      clearInterval(this.gcTimer);
      this.gcTimer = null;
    }
    this.clear();
  }

  getStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0, // Implement hit rate tracking if needed
    };
  }
}

// Global cache instances
export const imageCache = new MemoryCache({ maxSize: 50, maxAge: 60 * 60 * 1000 }); // 1 hour
export const dataCache = new MemoryCache({ maxSize: 100, maxAge: 30 * 60 * 1000 }); // 30 minutes
export const apiCache = new MemoryCache({ maxSize: 200, maxAge: 10 * 60 * 1000 }); // 10 minutes

// =================
// PERSISTENT CACHE MANAGER
// =================

class PersistentCache {
  private prefix: string;

  constructor(prefix: string = 'app_cache_') {
    this.prefix = prefix;
  }

  async set(key: string, data: any, expiry?: number): Promise<void> {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        expiry: expiry || 24 * 60 * 60 * 1000, // 24 hours default
      };

      await storage.set(`${this.prefix}${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('PersistentCache set error:', error);
    }
  }

  async get(key: string): Promise<any | null> {
    try {
  const cached = await storage.get(`${this.prefix}${key}`);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const now = Date.now();

      if (now - cacheData.timestamp > cacheData.expiry) {
        await this.delete(key);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.warn('PersistentCache get error:', error);
      return null;
    }
  }

  async has(key: string): Promise<boolean> {
    const data = await this.get(key);
    return data !== null;
  }

  async delete(key: string): Promise<void> {
    try {
  await storage.remove(`${this.prefix}${key}`);
    } catch (error) {
      console.warn('PersistentCache delete error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
  const keys = await storage.keys();
  const cacheKeys = keys.filter(k => k.startsWith(this.prefix));
  await storage.multiRemove(cacheKeys);
    } catch (error) {
      console.warn('PersistentCache clear error:', error);
    }
  }

  async cleanup(): Promise<void> {
    try {
  const keys = await storage.keys();
  const cacheKeys = keys.filter(k => k.startsWith(this.prefix));
      
      for (const key of cacheKeys) {
        const data = await this.get(key.replace(this.prefix, ''));
        // Cleanup will be handled by get() if expired
      }
    } catch (error) {
      console.warn('PersistentCache cleanup error:', error);
    }
  }
}

export const persistentCache = new PersistentCache();

// =================
// MEMORY MANAGEMENT HOOKS
// =================

export const useMemoryOptimization = () => {
  const [memoryWarning, setMemoryWarning] = useState(false);
  const cleanupRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    // Setup memory warning handler
    const handleMemoryWarning = () => {
      setMemoryWarning(true);
      
      // Clear memory caches
      imageCache.clear();
      dataCache.clear();
      
      // Run registered cleanup functions
      cleanupRef.current.forEach(cleanup => cleanup());
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      setTimeout(() => setMemoryWarning(false), 5000);
    };

    // Register memory warning listener (platform specific)
    if (__DEV__) {
      console.log('Memory optimization hooks initialized');
    }

    return () => {
      // Cleanup on unmount
      cleanupRef.current.forEach(cleanup => cleanup());
    };
  }, []);

  const registerCleanup = useCallback((cleanup: () => void) => {
    cleanupRef.current.push(cleanup);
    
    return () => {
      const index = cleanupRef.current.indexOf(cleanup);
      if (index > -1) {
        cleanupRef.current.splice(index, 1);
      }
    };
  }, []);

  const forceCleanup = useCallback(() => {
    // Clear all caches
    imageCache.clear();
    dataCache.clear();
    apiCache.clear();
    
    // Run cleanup functions
    cleanupRef.current.forEach(cleanup => cleanup());
    
    if (global.gc) {
      global.gc();
    }
  }, []);

  return {
    memoryWarning,
    registerCleanup,
    forceCleanup,
  };
};

// =================
// CACHE HOOKS
// =================

export const useCachedData = <T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    cacheType?: 'memory' | 'persistent' | 'both';
    expiry?: number;
    enableRefresh?: boolean;
  } = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    cacheType = 'memory',
    expiry = 30 * 60 * 1000, // 30 minutes
    enableRefresh = true,
  } = options;

  const fetchData = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);

    try {
      // Check cache first (unless forced)
      if (!force) {
        let cachedData: T | null = null;

        if (cacheType === 'memory' || cacheType === 'both') {
          cachedData = dataCache.get(key);
        }

        if (!cachedData && (cacheType === 'persistent' || cacheType === 'both')) {
          cachedData = await persistentCache.get(key);
        }

        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return cachedData;
        }
      }

      // Fetch fresh data
      const freshData = await fetcher();
      setData(freshData);

      // Cache the data
      if (cacheType === 'memory' || cacheType === 'both') {
        dataCache.set(key, freshData);
      }

      if (cacheType === 'persistent' || cacheType === 'both') {
        await persistentCache.set(key, freshData, expiry);
      }

      return freshData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, cacheType, expiry]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const clearCache = useCallback(async () => {
    if (cacheType === 'memory' || cacheType === 'both') {
      dataCache.delete(key);
    }

    if (cacheType === 'persistent' || cacheType === 'both') {
      await persistentCache.delete(key);
    }
  }, [key, cacheType]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh: enableRefresh ? refresh : undefined,
    clearCache,
  };
};

// =================
// CLEANUP UTILITIES
// =================

export const cleanupCaches = async () => {
  // Clear memory caches
  imageCache.clear();
  dataCache.clear();
  apiCache.clear();

  // Cleanup persistent cache
  await persistentCache.cleanup();
};

export const getCacheStats = () => {
  return {
    imageCache: imageCache.getStats(),
    dataCache: dataCache.getStats(),
    apiCache: apiCache.getStats(),
  };
};
