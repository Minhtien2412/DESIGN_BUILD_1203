const fs = require("fs");

// Enhance health controller with /health/system-info endpoint
const path = "/app/dist/health/health.controller.js";
let code = fs.readFileSync(path, "utf8");

// Add a comprehensive system info method before the closing of the class
const systemInfoMethod = `
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
    }`;

function addSystemInfo(code) {
  // Add the method before the class export
  const classEndMarker = "exports.HealthController = HealthController;";
  const firstOccurrence = code.indexOf(classEndMarker);

  // Add the route decorator for system-info
  const decoratorBlock = `__decorate([
    (0, common_1.Get)('system-info'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getSystemInfo", null);
`;

  // Find where the metrics decorator ends and add system-info decorator
  const metricsDecoratorEnd =
    '], HealthController.prototype, "getMetrics", null);';
  if (code.includes(metricsDecoratorEnd) && !code.includes("getSystemInfo")) {
    code = code.replace(
      metricsDecoratorEnd,
      metricsDecoratorEnd + "\n" + decoratorBlock,
    );
  }

  // Add the method to the class prototype
  // Find the getMetrics method closing and add after it
  const getMetricsEnd = "    getMetrics() {";
  if (code.includes(getMetricsEnd) && !code.includes("getSystemInfo")) {
    // Find the getMetrics method and add system-info after it
    const idx = code.indexOf(getMetricsEnd);
    // Find the closing brace of getMetrics
    let braceCount = 0;
    let i = idx;
    let foundStart = false;
    for (; i < code.length; i++) {
      if (code[i] === "{") {
        braceCount++;
        foundStart = true;
      }
      if (code[i] === "}") {
        braceCount--;
      }
      if (foundStart && braceCount === 0) break;
    }
    code =
      code.slice(0, i + 1) + "\n" + systemInfoMethod + "\n" + code.slice(i + 1);
  }

  return code;
}

// Add formatBytes and formatUptime helpers at the top
const helpers = `
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
`;

if (!code.includes("formatBytes")) {
  code = code.replace(
    "Object.defineProperty(exports,",
    helpers + "\nObject.defineProperty(exports,",
  );
}

code = addSystemInfo(code);

fs.writeFileSync(path, code, "utf8");
console.log("Enhanced health controller with /health/system-info endpoint");
console.log("Has getSystemInfo:", code.includes("getSystemInfo"));
console.log("Has formatBytes:", code.includes("formatBytes"));
