import { Controller, Get } from '@nestjs/common';
import {
    DiskHealthIndicator,
    HealthCheck,
    HealthCheckService,
    MemoryHealthIndicator,
    TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Database health check
      () => this.db.pingCheck('database'),
      
      // Memory health check - Max 1GB heap
      () => this.memory.checkHeap('memory_heap', 1024 * 1024 * 1024),
      
      // Memory health check - Max 1GB RSS
      () => this.memory.checkRSS('memory_rss', 1024 * 1024 * 1024),
      
      // Disk storage check - 90% threshold
      () => this.disk.checkStorage('storage', { 
        path: '/', 
        thresholdPercent: 0.9 
      }),
    ]);
  }

  @Get('database')
  @HealthCheck()
  checkDatabase() {
    return this.health.check([
      () => this.db.pingCheck('database', { timeout: 3000 }),
    ]);
  }

  @Get('memory')
  @HealthCheck()
  checkMemory() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 1024 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 1024 * 1024 * 1024),
    ]);
  }

  @Get('disk')
  @HealthCheck()
  checkDisk() {
    return this.health.check([
      () => this.disk.checkStorage('storage', { 
        path: '/', 
        thresholdPercent: 0.9 
      }),
    ]);
  }

  @Get('metrics')
  getMetrics() {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      memory: {
        used: Math.floor(memoryUsage.heapUsed / 1024 / 1024), // MB
        total: Math.floor(memoryUsage.heapTotal / 1024 / 1024), // MB
        percentage: Math.floor((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
        rss: Math.floor(memoryUsage.rss / 1024 / 1024), // MB
      },
      process: {
        pid: process.pid,
        version: process.version,
        platform: process.platform,
      },
    };
  }
}
