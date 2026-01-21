// Health monitoring service with exponential backoff
// Prevents memory usage from continuous failed API polling

import React from 'react';
import { handleApiError } from '../utils/errorHandler';
import { healthCheck } from './api';

export interface HealthStatus {
  isOnline: boolean;
  lastCheck: Date;
  errorCount: number;
  service: string;
}

class HealthMonitor {
  private status: HealthStatus = {
    isOnline: false,
    lastCheck: new Date(),
    errorCount: 0,
    service: 'api'
  };
  
  private retryMs = 2000; // Start with 2 seconds
  private maxRetryMs = 60000; // Max 1 minute
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private listeners: ((status: HealthStatus) => void)[] = [];
  private isRunning = false;

  // Subscribe to health status changes
  subscribe(callback: (status: HealthStatus) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners of status change
  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback({ ...this.status });
      } catch (error) {
        console.warn('Health monitor listener error:', error);
      }
    });
  }

  // Start health monitoring with exponential backoff
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('[HealthMonitor] Starting health monitoring');
    this.scheduleNext(0); // Start immediately
  }

  // Stop health monitoring
  stop(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.isRunning = false;
    console.log('[HealthMonitor] Stopped health monitoring');
  }

  // Get current health status
  getStatus(): HealthStatus {
    return { ...this.status };
  }

  // Perform health check with error handling
  private async performHealthCheck(): Promise<void> {
    try {
      const result = await healthCheck();
      
      if (result.status === 'ok') {
        // Reset retry interval on success
        this.retryMs = 2000;
        this.updateStatus({
          isOnline: true,
          errorCount: 0,
        });
      } else {
        this.handleHealthError('Health check returned non-ok status');
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      this.handleHealthError(errorMessage.message || 'Unknown error');
    }
  }

  // Handle health check errors with exponential backoff
  private handleHealthError(error: string): void {
    console.warn('[HealthMonitor] Health check failed:', error);
    
    // Increase retry interval (exponential backoff)
    this.retryMs = Math.min(this.retryMs * 2, this.maxRetryMs);
    
    this.updateStatus({
      isOnline: false,
      errorCount: this.status.errorCount + 1,
    });
  }

  // Update internal status and notify listeners
  private updateStatus(updates: Partial<HealthStatus>): void {
    this.status = {
      ...this.status,
      ...updates,
      lastCheck: new Date(),
    };
    
    this.notifyListeners();
  }

  // Schedule next health check
  private scheduleNext(delay: number = this.retryMs): void {
    if (!this.isRunning) return;
    
    this.timeoutId = setTimeout(async () => {
      await this.performHealthCheck();
      
      // Schedule next check if still running
      if (this.isRunning) {
        this.scheduleNext();
      }
    }, delay);
  }

  // Manual health check (doesn't affect automatic scheduling)
  async checkNow(): Promise<HealthStatus> {
    await this.performHealthCheck();
    return this.getStatus();
  }
}

// Export singleton instance
export const healthMonitor = new HealthMonitor();

// Hook for React components
export function useHealthMonitor() {
  const [status, setStatus] = React.useState<HealthStatus>(healthMonitor.getStatus());
  
  React.useEffect(() => {
    const unsubscribe = healthMonitor.subscribe(setStatus);
    return unsubscribe;
  }, []);
  
  return {
    status,
    checkNow: () => healthMonitor.checkNow(),
    start: () => healthMonitor.start(),
    stop: () => healthMonitor.stop(),
  };
}

// Auto-start monitoring in development
if (__DEV__) {
  // Start monitoring after a short delay to avoid startup interference
  setTimeout(() => {
    healthMonitor.start();
  }, 3000);
}
