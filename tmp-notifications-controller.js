"use strict";
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const notification_query_dto_1 = require("./dto/notification-query.dto");
const notifications_service_1 = require("./notifications.service");
let NotificationsController = class NotificationsController {
  notificationsService;
  constructor(notificationsService) {
    this.notificationsService = notificationsService;
  }
  async create(req, body) {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      throw new common_1.BadRequestException("User not authenticated");
    }
    if (!body || typeof body !== "object") {
      throw new common_1.BadRequestException("Request body is required");
    }
    const { type, title, message, body: legacyBody, priority, metadata } = body;
    if (!title || typeof title !== "string" || !title.trim()) {
      throw new common_1.BadRequestException(
        "title is required and must be a non-empty string",
      );
    }
    const notificationMessage = message || legacyBody;
    if (!notificationMessage || typeof notificationMessage !== "string") {
      throw new common_1.BadRequestException(
        "message is required and must be a string",
      );
    }
    let parsedMetadata = metadata;
    if (typeof metadata === "string") {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch (e) {
        parsedMetadata = {};
      }
    }
    return this.notificationsService.create({
      userId,
      type: type || "IN_APP",
      title: title.trim(),
      message: notificationMessage,
      priority: priority || "MEDIUM",
      data: parsedMetadata,
    });
  }
  async findAll(req, query) {
    const userId = req.user.id;
    return this.notificationsService.findAll(userId, query);
  }
  async getUnreadCount(req) {
    const userId = req.user.id;
    return this.notificationsService.getUnreadCount(userId);
  }
  async markAsRead(req, id) {
    const userId = req.user.id;
    return this.notificationsService.markAsRead(id, userId);
  }
  async markAllAsRead(req) {
    const userId = req.user.id;
    return this.notificationsService.markAllAsRead(userId);
  }
  async archive(req, id) {
    const userId = req.user.id;
    await this.notificationsService.delete(id, userId);
  }
};
exports.NotificationsController = NotificationsController;
__decorate(
  [
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise),
  ],
  NotificationsController.prototype,
  "create",
  null,
);
__decorate(
  [
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [
      Object,
      notification_query_dto_1.NotificationQueryDto,
    ]),
    __metadata("design:returntype", Promise),
  ],
  NotificationsController.prototype,
  "findAll",
  null,
);
__decorate(
  [
    (0, common_1.Get)("unread-count"),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise),
  ],
  NotificationsController.prototype,
  "getUnreadCount",
  null,
);
__decorate(
  [
    (0, common_1.Patch)(":id/read"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise),
  ],
  NotificationsController.prototype,
  "markAsRead",
  null,
);
__decorate(
  [
    (0, common_1.Patch)("read-all"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise),
  ],
  NotificationsController.prototype,
  "markAllAsRead",
  null,
);
__decorate(
  [
    (0, common_1.Patch)(":id/archive"),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise),
  ],
  NotificationsController.prototype,
  "archive",
  null,
);
exports.NotificationsController = NotificationsController = __decorate(
  [
    (0, common_1.Controller)("notifications"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [
      notifications_service_1.NotificationsService,
    ]),
  ],
  NotificationsController,
);
//# sourceMappingURL=notifications.controller.js.map
