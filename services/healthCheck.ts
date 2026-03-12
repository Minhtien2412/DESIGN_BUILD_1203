/**
 * Health Check Service - Sử dụng @nestjs/terminus
 * Kiểm tra tình trạng hệ thống, database, services
 */

import { apiFetch } from './api';

export interface HealthStatus {
  status: 'ok' | 'error' | 'degraded';
  timestamp: string;
  services: ServiceHealth[];
  database: DatabaseHealth;
  memory: MemoryHealth;
  disk: DiskHealth;
  uptime: number;
}

export interface ServiceHealth {
  name: string;
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  lastCheck: string;
  details?: any;
}

export interface DatabaseHealth {
  status: 'connected' | 'disconnected' | 'degraded';
  connections: {
    active: number;
    idle: number;
    total: number;
  };
  responseTime?: number;
}

export interface MemoryHealth {
  used: number;
  total: number;
  percentage: number;
  status: 'ok' | 'warning' | 'critical';
}

export interface DiskHealth {
  used: number;
  total: number;
  percentage: number;
  status: 'ok' | 'warning' | 'critical';
}

/**
 * Lấy health status tổng thể
 */
export async function getSystemHealth(): Promise<HealthStatus | null> {
  try {
    const response = await apiFetch('/health');
    return response.data;
  } catch (error) {
    console.error('[HealthCheck] Get system health failed:', error);
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      services: [],
      database: {
        status: 'disconnected',
        connections: { active: 0, idle: 0, total: 0 },
      },
      memory: { used: 0, total: 0, percentage: 0, status: 'critical' },
      disk: { used: 0, total: 0, percentage: 0, status: 'critical' },
      uptime: 0,
    };
  }
}

/**
 * Kiểm tra database connection
 */
export async function checkDatabase(): Promise<ServiceHealth> {
  try {
    const response = await apiFetch('/health/database');
    return response.data;
  } catch (error) {
    return {
      name: 'database',
      status: 'down',
      lastCheck: new Date().toISOString(),
    };
  }
}

/**
 * Kiểm tra specific service
 */
export async function checkService(serviceName: string): Promise<ServiceHealth> {
  try {
    const response = await apiFetch(`/health/service/${serviceName}`);
    return response.data;
  } catch (error) {
    return {
      name: serviceName,
      status: 'down',
      lastCheck: new Date().toISOString(),
    };
  }
}

/**
 * Ping service để check availability
 */
export async function pingService(serviceName: string): Promise<boolean> {
  try {
    const startTime = Date.now();
    await apiFetch(`/health/ping/${serviceName}`);
    const responseTime = Date.now() - startTime;
    console.log(`[HealthCheck] ${serviceName} ping: ${responseTime}ms`);
    return true;
  } catch (error) {
    console.error(`[HealthCheck] ${serviceName} ping failed:`, error);
    return false;
  }
}

/**
 * Lấy metrics chi tiết
 */
export async function getMetrics(): Promise<any> {
  try {
    const response = await apiFetch('/health/metrics');
    return response.data;
  } catch (error) {
    console.error('[HealthCheck] Get metrics failed:', error);
    return null;
  }
}

/**
 * Subscribe vào health updates qua WebSocket
 */
export function subscribeToHealthUpdates(
  onUpdate: (health: HealthStatus) => void
): () => void {
  const socket = require('./socket').default;
  
  socket.on('health:update', onUpdate);

  return () => {
    socket.off('health:update', onUpdate);
  };
}

/**
 * Kiểm tra app có đang online không
 */
export async function isAppOnline(): Promise<boolean> {
  try {
    const health = await getSystemHealth();
    return health?.status === 'ok';
  } catch (error) {
    return false;
  }
}

/**
 * Lấy server uptime
 */
export async function getServerUptime(): Promise<number> {
  try {
    const health = await getSystemHealth();
    return health?.uptime || 0;
  } catch (error) {
    return 0;
  }
}

/**
 * Format uptime thành readable string
 */
export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  
  return parts.join(' ') || '0m';
}

/**
 * Check và cảnh báo nếu hệ thống có vấn đề
 */
export async function checkAndAlert(): Promise<void> {
  const health = await getSystemHealth();
  
  if (!health) {
    console.error('[HealthCheck] ❌ Cannot connect to server');
    return;
  }

  if (health.status === 'error') {
    console.error('[HealthCheck] ❌ System is in error state');
  } else if (health.status === 'degraded') {
    console.warn('[HealthCheck] ⚠️ System is degraded');
  }

  // Check memory
  if (health.memory.status === 'critical') {
    console.error(`[HealthCheck] ❌ Memory critical: ${health.memory.percentage}%`);
  } else if (health.memory.status === 'warning') {
    console.warn(`[HealthCheck] ⚠️ Memory warning: ${health.memory.percentage}%`);
  }

  // Check disk
  if (health.disk.status === 'critical') {
    console.error(`[HealthCheck] ❌ Disk critical: ${health.disk.percentage}%`);
  } else if (health.disk.status === 'warning') {
    console.warn(`[HealthCheck] ⚠️ Disk warning: ${health.disk.percentage}%`);
  }

  // Check services
  health.services.forEach(service => {
    if (service.status === 'down') {
      console.error(`[HealthCheck] ❌ Service down: ${service.name}`);
    } else if (service.status === 'degraded') {
      console.warn(`[HealthCheck] ⚠️ Service degraded: ${service.name}`);
    }
  });
}

export default {
  getSystemHealth,
  checkDatabase,
  checkService,
  pingService,
  getMetrics,
  subscribeToHealthUpdates,
  isAppOnline,
  getServerUptime,
  formatUptime,
  checkAndAlert,
};
