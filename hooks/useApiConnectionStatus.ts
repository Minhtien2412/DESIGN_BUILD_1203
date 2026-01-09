/**
 * Enhanced API Connection Status Monitor
 * Provides real-time feedback about API connectivity and fallback status
 */

import { apiFetch } from '@/services/api';
import { useEffect, useState } from 'react';

export interface ApiConnectionStatus {
  isConnected: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  error: string | null;
  fallbackActive: boolean;
}

export const useApiConnectionStatus = () => {
  const [status, setStatus] = useState<ApiConnectionStatus>({
    isConnected: false,
    isChecking: true,
    lastChecked: null,
    error: null,
    fallbackActive: false
  });

  const checkConnection = async () => {
    setStatus(prev => ({ ...prev, isChecking: true, error: null }));
    
    try {
      console.log('[ApiConnectionMonitor] Checking API connection...');
      
      // Test the health endpoint
      const response = await apiFetch('/health') as any;
      
      if (response?.ok || response?.body?.ok) {
        const degraded = response?.mode === 'degraded' || response?.body?.mode === 'degraded';
        setStatus({
          isConnected: !degraded,
          isChecking: false,
          lastChecked: new Date(),
          error: null,
          fallbackActive: !!degraded
        });
        console.log('[ApiConnectionMonitor] ✅ API check:', degraded ? 'degraded (fallback active)' : 'connected');
      } else {
        throw new Error('Health check failed');
      }
      
    } catch (error: any) {
      console.log('[ApiConnectionMonitor] ⚠️ API unavailable, fallback active');
      
      setStatus({
        isConnected: false,
        isChecking: false,
        lastChecked: new Date(),
        error: error.message || 'API connection failed',
        fallbackActive: true
      });
    }
  };

  useEffect(() => {
    // Initial check
    checkConnection();
    
    // Periodic health checks every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    status,
    checkConnection,
    retry: checkConnection
  };
};

export default useApiConnectionStatus;
