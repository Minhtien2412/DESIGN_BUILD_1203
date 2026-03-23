const fs = require("fs");
const path = "/app/dist/health/health.controller.js";
let code = fs.readFileSync(path, "utf8");

// Fix model names in getSystemInfo
code = code.replace(
  `const [users, workers, materials, services, projects, notifications] = await Promise.all([
                this.prisma.user.count(),
                this.prisma.worker.count(),
                this.prisma.material.count(),
                this.prisma.service.count(),
                this.prisma.project.count(),
                this.prisma.notification.count(),
            ]);
            dbCounts = { users, workers, materials, services, projects, notifications };`,
  `const [users, workers, materials, services, projects, notifications, products, orders] = await Promise.all([
                this.prisma.user.count(),
                this.prisma.worker.count(),
                this.prisma.material.count(),
                this.prisma.service.count(),
                this.prisma.project.count(),
                this.prisma.notifications.count(),
                this.prisma.product.count(),
                this.prisma.order.count(),
            ]);
            dbCounts = { users, workers, materials, services, projects, notifications, products, orders };`,
);

fs.writeFileSync(path, code, "utf8");
console.log("Fixed model names in health controller");
