const fs = require("fs");
const path = "/app/dist/health/health.controller.js";
let code = fs.readFileSync(path, "utf8");

// The issue: we need to add the method INSIDE the class definition, before exports
// In compiled NestJS, the class is defined with methods, THEN decorators are applied

// Strategy:
// 1. Add helper functions at the top
// 2. Add method to class prototype BEFORE decorators run
// 3. Add decorator call AFTER other decorator calls

// First, let's remove the broken patch and start fresh from the original
// Check if already has getSystemInfo - if so, it's broken, let's rewrite the whole file

if (code.includes("getSystemInfo")) {
  console.log("Removing broken previous patch...");
  // Revert: read the original from docker image
  // Actually let's just fix it properly by rewriting
}

// Let's write the patched file from scratch based on original structure
const newCode = `"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const error_helpers_1 = require("../utils/error-helpers");
const prisma_service_1 = require("../prisma/prisma.service");

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
}
function formatUptime(seconds) {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const parts = [];
    if (d > 0) parts.push(d + 'd');
    if (h > 0) parts.push(h + 'h');
    if (m > 0) parts.push(m + 'm');
    parts.push(s + 's');
    return parts.join(' ');
}

let HealthController = class HealthController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async check() {
        try {
            await this.prisma.$queryRaw\`SELECT 1\`;
            return {
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                info: {
                    database: { status: 'up' },
                    memory: {
                        status: 'up',
                        heap: process.memoryUsage(),
                    },
                    disk: { status: 'up' },
                },
            };
        }
        catch (error) {
            return {
                status: 'error',
                timestamp: new Date().toISOString(),
                error: (0, error_helpers_1.getErrorMessage)(error),
            };
        }
    }
    async checkDatabase() {
        try {
            await this.prisma.$queryRaw\`SELECT 1\`;
            return { status: 'ok', database: 'connected' };
        }
        catch (error) {
            return { status: 'error', error: (0, error_helpers_1.getErrorMessage)(error) };
        }
    }
    getMetrics() {
        return {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            timestamp: new Date().toISOString(),
            node: process.version,
        };
    }
    async getSystemInfo() {
        const os = require('os');
        const mem = process.memoryUsage();
        let dbStatus = 'unknown';
        let dbCounts = {};
        try {
            await this.prisma.$queryRaw\`SELECT 1\`;
            dbStatus = 'connected';
            const [users, workers, materials, services, projects, notifications] = await Promise.all([
                this.prisma.user.count(),
                this.prisma.worker.count(),
                this.prisma.material.count(),
                this.prisma.service.count(),
                this.prisma.project.count(),
                this.prisma.notification.count(),
            ]);
            dbCounts = { users, workers, materials, services, projects, notifications };
        } catch (e) {
            dbStatus = 'error: ' + e.message;
        }
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            server: {
                hostname: os.hostname(),
                platform: os.platform(),
                arch: os.arch(),
                nodeVersion: process.version,
                uptime: Math.floor(process.uptime()),
                uptimeHuman: formatUptime(process.uptime()),
            },
            memory: {
                heapUsed: formatBytes(mem.heapUsed),
                heapTotal: formatBytes(mem.heapTotal),
                rss: formatBytes(mem.rss),
                external: formatBytes(mem.external),
                systemTotal: formatBytes(os.totalmem()),
                systemFree: formatBytes(os.freemem()),
                systemUsagePercent: ((1 - os.freemem() / os.totalmem()) * 100).toFixed(1) + '%',
            },
            cpu: {
                cores: os.cpus().length,
                model: os.cpus()[0]?.model || 'unknown',
                loadAvg: os.loadavg().map(l => l.toFixed(2)),
            },
            database: {
                status: dbStatus,
                counts: dbCounts,
            },
            env: {
                NODE_ENV: process.env.NODE_ENV || 'development',
                port: process.env.PORT || 3000,
            },
        };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "check", null);
__decorate([
    (0, common_1.Get)('db'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "checkDatabase", null);
__decorate([
    (0, common_1.Get)('metrics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)('system-info'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getSystemInfo", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.Controller)({ path: 'health', version: [common_1.VERSION_NEUTRAL, '1'] }),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HealthController);
`;

fs.writeFileSync(path, newCode, "utf8");
console.log("Rewrote health controller with system-info endpoint");
