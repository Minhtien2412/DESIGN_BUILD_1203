"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_gateway_1 = require("./notifications.gateway");
const push_service_1 = require("./push.service");
let NotificationsService = class NotificationsService {
    prisma;
    notificationsGateway;
    pushService;
    constructor(prisma, notificationsGateway, pushService) {
        this.prisma = prisma;
        this.notificationsGateway = notificationsGateway;
        this.pushService = pushService;
    }
    async findAll(userId, query) {
        const { page = 1, limit = 20, type, read, priority, sortBy = 'createdAt', sortOrder = 'desc', } = query;
        const skip = (page - 1) * limit;
        const where = { userId };
        if (type) {
            where.type = type;
        }
        if (read !== undefined) {
            where.isRead = read;
        }
        if (priority) {
            where.priority = priority;
        }
        const [notifications, total] = await Promise.all([
            this.prisma.notifications.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
            }),
            this.prisma.notifications.count({ where }),
        ]);
        const transformed = notifications.map((n) => ({
            id: n.id,
            userId: n.userId,
            title: n.title,
            message: n.body,
            type: n.type,
            priority: n.priority,
            read: n.isRead,
            readAt: n.readAt,
            data: n.data,
            createdAt: n.createdAt,
            updatedAt: n.updatedAt,
        }));
        return {
            data: transformed,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getUnreadCount(userId) {
        const count = await this.prisma.notifications.count({
            where: { userId, isRead: false },
        });
        return { count };
    }
    async findOne(id, userId) {
        const notification = await this.prisma.notifications.findFirst({
            where: { id, userId },
        });
        if (!notification) {
            throw new common_1.NotFoundException(`Notification with ID ${id} not found`);
        }
        return {
            id: notification.id,
            userId: notification.userId,
            title: notification.title,
            message: notification.body,
            type: notification.type,
            priority: notification.priority,
            read: notification.isRead,
            readAt: notification.readAt,
            data: notification.data,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt,
        };
    }
    mapToPrismaType(frontendType) {
        const typeMap = {
            INFO: 'SYSTEM',
            SUCCESS: 'SYSTEM',
            WARNING: 'SYSTEM',
            ERROR: 'SYSTEM',
            CALL: 'MESSAGE',
            MESSAGE: 'MESSAGE',
            TASK: 'TASK_ASSIGNED',
            PROJECT: 'PROJECT_UPDATE',
            PAYMENT: 'PAYMENT',
            SYSTEM: 'SYSTEM',
        };
        return typeMap[frontendType?.toUpperCase()] || 'SYSTEM';
    }
    async create(dto) {
        console.log('[NotificationsService] Creating notification with DTO:', JSON.stringify(dto));
        console.log('[NotificationsService] dto.message:', dto.message);
        const prismaType = this.mapToPrismaType(dto.type);
        console.log('[NotificationsService] Mapped type:', dto.type, '->', prismaType);
        const notification = await this.prisma.notifications.create({
            data: {
                userId: dto.userId,
                title: dto.title,
                body: dto.message,
                type: prismaType,
                priority: (dto.priority || 'MEDIUM'),
                data: dto.data,
                updatedAt: new Date(),
            },
        });
        const transformed = {
            id: notification.id,
            userId: notification.userId,
            title: notification.title,
            message: notification.body,
            type: dto.type,
            priority: notification.priority,
            read: notification.isRead,
            readAt: notification.readAt,
            data: notification.data,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt,
        };
        try {
            const sent = this.notificationsGateway.sendToUser(notification.userId, transformed);
            if (sent) {
                console.log(`[NotificationsService] Sent real-time notification to user ${notification.userId}`);
            }
            else {
                console.log(`[NotificationsService] User ${notification.userId} offline - notification saved to DB only`);
            }
        }
        catch (error) {
            console.error('[NotificationsService] Error sending real-time notification:', error);
        }
        try {
            const pushData = {
                notificationId: notification.id,
                type: transformed.type,
                ...(typeof transformed.data === 'object' && transformed.data !== null
                    ? transformed.data
                    : {}),
            };
            const pushResult = await this.pushService.sendToUser(notification.userId, transformed.title, transformed.message, pushData);
            if (pushResult.sent > 0) {
                console.log(`[NotificationsService] Sent push notification to ${pushResult.sent} device(s)`);
                await this.prisma.notifications.update({
                    where: { id: notification.id },
                    data: { isSent: true, sentAt: new Date() },
                });
            }
        }
        catch (error) {
            console.error('[NotificationsService] Error sending push notification:', error);
        }
        return transformed;
    }
    async markAsRead(id, userId) {
        await this.findOne(id, userId);
        const notification = await this.prisma.notifications.update({
            where: { id },
            data: {
                isRead: true,
                readAt: new Date(),
                updatedAt: new Date(),
            },
        });
        return {
            id: notification.id,
            userId: notification.userId,
            title: notification.title,
            message: notification.body,
            type: notification.type,
            priority: notification.priority,
            read: notification.isRead,
            readAt: notification.readAt,
            data: notification.data,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt,
        };
    }
    async markAllAsRead(userId) {
        const result = await this.prisma.notifications.updateMany({
            where: { userId, isRead: false },
            data: {
                isRead: true,
                readAt: new Date(),
                updatedAt: new Date(),
            },
        });
        return { updatedCount: result.count };
    }
    async delete(id, userId) {
        await this.findOne(id, userId);
        await this.prisma.notifications.delete({
            where: { id },
        });
    }
    async broadcast(dto) {
        const users = await this.prisma.user.findMany({
            select: { id: true },
        });
        const notifications = users.map((user) => ({
            userId: user.id,
            title: dto.title,
            body: dto.message,
            type: dto.type,
            priority: (dto.priority || 'MEDIUM'),
            data: dto.data,
            updatedAt: new Date(),
        }));
        await this.prisma.notifications.createMany({
            data: notifications,
        });
        return { sent: notifications.length };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => notifications_gateway_1.NotificationsGateway))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => push_service_1.PushService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_gateway_1.NotificationsGateway,
        push_service_1.PushService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map
