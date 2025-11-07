/**
 * Client-only initialization
 * Prevents SSR issues by only running in browser/client environment
 */

import { Platform } from 'react-native';
import { initApp, RUNTIME } from '../services/runtimeConfig';

const isSSR = typeof window === 'undefined';
const isWeb = Platform.OS === 'web';

// Lazy services initialization
let _healthMonitorStarted = false;
let _productionApiService: any = null;

export async function initializeApp() {
  // Skip initialization during SSR
  if (isSSR) {
    console.log('[Init] Skipping initialization during SSR');
    return;
  }

  try {
    console.log('[Init] Starting client-side app initialization...');
    
    // Load runtime configuration
    await initApp();
    console.log('[Init] Runtime config loaded:', RUNTIME?.appName);

    // Initialize health monitoring only in client
    if (!_healthMonitorStarted && isWeb) {
      // Delay health monitoring start to avoid blocking
      setTimeout(startHealthMonitor, 2000);
      _healthMonitorStarted = true;
    }

    console.log('[Init] App initialization complete');
  } catch (error) {
    console.warn('[Init] App initialization failed:', error);
  }
}

function startHealthMonitor() {
  // Import and start health monitor only when needed
  import('../services/healthMonitor').then(({ healthMonitor }) => {
    if (healthMonitor?.start) {
      healthMonitor.start();
      console.log('[Init] Health monitor started');
    }
  }).catch(error => {
    console.warn('[Init] Failed to start health monitor:', error);
  });
}

export function getProductionApiService() {
  if (isSSR) {
    console.warn('[Init] Cannot access ProductionApiService during SSR');
    return null;
  }

  if (!_productionApiService) {
    const { getProductionApiService } = require('../services/productionApiService');
    _productionApiService = getProductionApiService();
  }
  
  return _productionApiService;
}

// Export initialization status
export const getInitStatus = () => ({
  isSSR,
  isWeb,
  hasWindow: typeof window !== 'undefined',
  runtimeLoaded: !!RUNTIME,
  healthMonitorStarted: _healthMonitorStarted,
});