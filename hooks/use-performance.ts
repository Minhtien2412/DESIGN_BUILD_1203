import React, { useCallback, useRef } from 'react';

// Hook to throttle function calls
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallRef.current;

    if (timeSinceLastCall >= delay) {
      // Execute immediately if enough time has passed
      lastCallRef.current = now;
      return callback(...args);
    } else {
      // Schedule execution after remaining delay
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        lastCallRef.current = Date.now();
        callback(...args);
      }, delay - timeSinceLastCall);
    }
  }, [callback, delay]) as T;
}

// Hook to debounce function calls
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]) as T;
}

// Hook to limit concurrent async operations
export function useConcurrentLimit<T extends (...args: any[]) => Promise<any>>(
  callback: T,
  limit: number = 3
): T {
  const activePromisesRef = useRef<Set<Promise<any>>>(new Set());

  return useCallback(async (...args: Parameters<T>) => {
    // Wait if we're at the limit
    while (activePromisesRef.current.size >= limit) {
      await Promise.race(activePromisesRef.current);
    }

    const promise = callback(...args);

    activePromisesRef.current.add(promise);

    try {
      const result = await promise;
      return result;
    } finally {
      activePromisesRef.current.delete(promise);
    }
  }, [callback, limit]) as T;
}

// Hook to prevent rapid successive calls (for buttons, etc.)
export function useCooldown<T extends (...args: any[]) => any>(
  callback: T,
  cooldownMs: number
): [T, boolean] {
  const [isOnCooldown, setIsOnCooldown] = React.useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const wrappedCallback = useCallback((...args: Parameters<T>) => {
    if (isOnCooldown) return;

    setIsOnCooldown(true);
    const result = callback(...args);

    timeoutRef.current = setTimeout(() => {
      setIsOnCooldown(false);
    }, cooldownMs);

    return result;
  }, [callback, cooldownMs, isOnCooldown]) as T;

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [wrappedCallback, isOnCooldown];
}
