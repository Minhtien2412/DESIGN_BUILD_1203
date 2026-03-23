// Phase 2: Create bookings and wallet modules
const fs = require("fs");
const path = require("path");

// ======================== BOOKINGS MODULE ========================
const bookingsDir = "/app/dist/bookings";
fs.mkdirSync(bookingsDir, { recursive: true });

// bookings.service.js
fs.writeFileSync(
  path.join(bookingsDir, "bookings.service.js"),
  `"use strict";
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
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
let BookingsService = class BookingsService {
    items = new Map();
    idCounter = 1;
    constructor() { this.seed(); }
    seed() {
        const now = new Date().toISOString();
        const tomorrow = new Date(Date.now() + 86400000).toISOString();
        const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString();
        [
            { clientId: 9, workerId: 1, workerType: 'tho_dien', projectId: 1, title: 'Thi công điện tầng 1', description: 'Lắp đặt hệ thống điện tầng 1', scheduledDate: tomorrow, estimatedDuration: 8, estimatedCost: 2500000, location: 'HCM', status: 'confirmed', priority: 'high' },
            { clientId: 9, workerId: 2, workerType: 'tho_son', projectId: 1, title: 'Sơn nội thất phòng khách', description: 'Sơn 2 lớp lót + 2 lớp phủ', scheduledDate: nextWeek, estimatedDuration: 16, estimatedCost: 4000000, location: 'HCM', status: 'pending', priority: 'medium' },
            { clientId: 9, workerId: 3, workerType: 'tho_nuoc', projectId: 1, title: 'Lắp đặt hệ thống nước', description: 'Đường ống nước nóng lạnh tầng 2', scheduledDate: nextWeek, estimatedDuration: 12, estimatedCost: 3500000, location: 'HCM', status: 'pending', priority: 'medium' },
        ].forEach(item => {
            const id = this.idCounter++;
            this.items.set(id, { id, ...item, createdAt: now, updatedAt: now, eta: null, completedAt: null, rating: null, review: null });
        });
    }
    findAll(filters) {
        let arr = [...this.items.values()];
        if (filters?.clientId) arr = arr.filter(x => x.clientId == filters.clientId);
        if (filters?.workerId) arr = arr.filter(x => x.workerId == filters.workerId);
        if (filters?.projectId) arr = arr.filter(x => x.projectId == filters.projectId);
        if (filters?.status) arr = arr.filter(x => x.status === filters.status);
        if (filters?.workerType) arr = arr.filter(x => x.workerType === filters.workerType);
        if (filters?.search) {
            const s = filters.search.toLowerCase();
            arr = arr.filter(x => (x.title || '').toLowerCase().includes(s) || (x.description || '').toLowerCase().includes(s));
        }
        const page = parseInt(filters?.page) || 1;
        const limit = parseInt(filters?.limit) || 20;
        return { data: arr.slice((page - 1) * limit, page * limit), total: arr.length, page, limit };
    }
    findOne(id) {
        const x = this.items.get(id);
        if (!x) throw new common_1.NotFoundException('Booking ' + id + ' not found');
        return { data: x };
    }
    create(data) {
        const id = this.idCounter++;
        const now = new Date().toISOString();
        const x = { id, ...data, status: 'pending', createdAt: now, updatedAt: now, eta: null, completedAt: null, rating: null, review: null };
        this.items.set(id, x);
        return { data: x };
    }
    update(id, data) {
        const x = this.items.get(id);
        if (!x) throw new common_1.NotFoundException('Booking ' + id + ' not found');
        Object.assign(x, data, { updatedAt: new Date().toISOString() });
        return { data: x };
    }
    updateStatus(id, status, extra) {
        const x = this.items.get(id);
        if (!x) throw new common_1.NotFoundException('Booking ' + id + ' not found');
        const validTransitions = {
            pending: ['confirmed', 'cancelled'],
            confirmed: ['in_progress', 'cancelled'],
            in_progress: ['completed', 'cancelled'],
            completed: [],
            cancelled: []
        };
        if (!(validTransitions[x.status] || []).includes(status)) {
            throw new common_1.BadRequestException('Cannot transition from ' + x.status + ' to ' + status);
        }
        x.status = status;
        if (extra) Object.assign(x, extra);
        if (status === 'completed') x.completedAt = new Date().toISOString();
        x.updatedAt = new Date().toISOString();
        return { data: x };
    }
    updateEta(id, eta) {
        const x = this.items.get(id);
        if (!x) throw new common_1.NotFoundException('Booking ' + id + ' not found');
        x.eta = eta;
        x.updatedAt = new Date().toISOString();
        return { data: x };
    }
    addReview(id, rating, review) {
        const x = this.items.get(id);
        if (!x) throw new common_1.NotFoundException('Booking ' + id + ' not found');
        if (x.status !== 'completed') throw new common_1.BadRequestException('Can only review completed bookings');
        if (rating < 1 || rating > 5) throw new common_1.BadRequestException('Rating must be 1-5');
        x.rating = rating;
        x.review = review;
        x.updatedAt = new Date().toISOString();
        return { data: x };
    }
    remove(id) { this.items.delete(id); return { success: true }; }
    getMyBookings(userId) {
        const arr = [...this.items.values()].filter(x => x.clientId == userId);
        return { data: arr, total: arr.length };
    }
    getSummary(projectId) {
        const arr = projectId ? [...this.items.values()].filter(x => x.projectId == projectId) : [...this.items.values()];
        const byStatus = {};
        arr.forEach(x => { byStatus[x.status] = (byStatus[x.status] || 0) + 1; });
        return { data: { total: arr.length, byStatus, totalCost: arr.reduce((s, x) => s + (x.estimatedCost || 0), 0) } };
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], BookingsService);
`,
);

// bookings.controller.js
fs.writeFileSync(
  path.join(bookingsDir, "bookings.controller.js"),
  `"use strict";
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
exports.BookingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const bookings_service_1 = require("./bookings.service");
let BookingsController = class BookingsController {
    svc;
    constructor(svc) { this.svc = svc; }
    findAll(q) { return this.svc.findAll(q); }
    findOne(id) { return this.svc.findOne(id); }
    getMyBookings(req) { return this.svc.getMyBookings(req.user?.id || 0); }
    getSummary(projectId) { return this.svc.getSummary(projectId ? parseInt(projectId) : undefined); }
    create(d) {
        if (!d || typeof d.title !== 'string' || !d.title.trim()) { throw new common_1.BadRequestException('Booking title is required'); }
        if (!d.workerType || typeof d.workerType !== 'string') { throw new common_1.BadRequestException('workerType is required'); }
        if (!d.scheduledDate) { throw new common_1.BadRequestException('scheduledDate is required'); }
        return this.svc.create(d);
    }
    update(id, d) { return this.svc.update(id, d); }
    updateStatus(id, d) {
        if (!d || !d.status) { throw new common_1.BadRequestException('status is required'); }
        return this.svc.updateStatus(id, d.status, d);
    }
    updateEta(id, d) {
        if (!d || !d.eta) { throw new common_1.BadRequestException('eta (ISO date string) is required'); }
        return this.svc.updateEta(id, d.eta);
    }
    addReview(id, d) {
        if (!d || typeof d.rating !== 'number') { throw new common_1.BadRequestException('rating (1-5) is required'); }
        return this.svc.addReview(id, d.rating, d.review || '');
    }
    remove(id) { return this.svc.remove(id); }
};
exports.BookingsController = BookingsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all bookings' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get booking summary/stats' }),
    __param(0, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my bookings' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "getMyBookings", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get booking detail' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a booking' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a booking' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update booking status' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/eta'),
    (0, swagger_1.ApiOperation)({ summary: 'Update booking ETA' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "updateEta", null);
__decorate([
    (0, common_1.Post)(':id/review'),
    (0, swagger_1.ApiOperation)({ summary: 'Add review to completed booking' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "addReview", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a booking' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "remove", null);
exports.BookingsController = BookingsController = __decorate([
    (0, swagger_1.ApiTags)('Bookings'),
    (0, common_1.Controller)('bookings'),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService])
], BookingsController);
`,
);

// bookings.module.js
fs.writeFileSync(
  path.join(bookingsDir, "bookings.module.js"),
  `"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsModule = void 0;
const common_1 = require("@nestjs/common");
const bookings_service_1 = require("./bookings.service");
const bookings_controller_1 = require("./bookings.controller");
let BookingsModule = class BookingsModule {};
exports.BookingsModule = BookingsModule;
exports.BookingsModule = BookingsModule = __decorate([
    (0, common_1.Module)({
        controllers: [bookings_controller_1.BookingsController],
        providers: [bookings_service_1.BookingsService],
        exports: [bookings_service_1.BookingsService],
    })
], BookingsModule);
`,
);

console.log("Bookings module created");

// ======================== WALLET MODULE ========================
const walletDir = "/app/dist/wallet";
fs.mkdirSync(walletDir, { recursive: true });

// wallet.service.js
fs.writeFileSync(
  path.join(walletDir, "wallet.service.js"),
  `"use strict";
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
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
let WalletService = class WalletService {
    wallets = new Map();
    transactions = [];
    promoCodes = new Map();
    txIdCounter = 1;
    constructor() { this.seedPromos(); }
    seedPromos() {
        const now = new Date().toISOString();
        const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString();
        [
            { code: 'WELCOME50', discountType: 'percentage', discountValue: 50, maxDiscount: 500000, minOrder: 1000000, maxUses: 100, usedCount: 12, expiresAt: nextMonth, description: 'Giảm 50% cho đơn đầu tiên (tối đa 500K)' },
            { code: 'XAYDUNG100K', discountType: 'fixed', discountValue: 100000, maxDiscount: 100000, minOrder: 500000, maxUses: 50, usedCount: 5, expiresAt: nextMonth, description: 'Giảm 100K cho dịch vụ xây dựng' },
            { code: 'VIP200K', discountType: 'fixed', discountValue: 200000, maxDiscount: 200000, minOrder: 2000000, maxUses: 20, usedCount: 0, expiresAt: nextMonth, description: 'Giảm 200K cho đơn trên 2 triệu' },
        ].forEach(p => this.promoCodes.set(p.code, { ...p, isActive: true, createdAt: now }));
    }
    getOrCreateWallet(userId) {
        if (!this.wallets.has(userId)) {
            this.wallets.set(userId, { userId, balance: 0, currency: 'VND', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        }
        return this.wallets.get(userId);
    }
    getBalance(userId) {
        const w = this.getOrCreateWallet(userId);
        return { data: { balance: w.balance, currency: w.currency } };
    }
    topUp(userId, amount, method) {
        if (amount <= 0) throw new common_1.BadRequestException('Amount must be positive');
        const w = this.getOrCreateWallet(userId);
        w.balance += amount;
        w.updatedAt = new Date().toISOString();
        const tx = { id: this.txIdCounter++, userId, type: 'topup', amount, balanceAfter: w.balance, method: method || 'bank_transfer', description: 'Nạp tiền vào ví', createdAt: new Date().toISOString() };
        this.transactions.push(tx);
        return { data: { balance: w.balance, transaction: tx } };
    }
    pay(userId, amount, description, bookingId) {
        if (amount <= 0) throw new common_1.BadRequestException('Amount must be positive');
        const w = this.getOrCreateWallet(userId);
        if (w.balance < amount) throw new common_1.BadRequestException('Insufficient balance. Current: ' + w.balance + ', Required: ' + amount);
        w.balance -= amount;
        w.updatedAt = new Date().toISOString();
        const tx = { id: this.txIdCounter++, userId, type: 'payment', amount: -amount, balanceAfter: w.balance, bookingId, description: description || 'Thanh toán', createdAt: new Date().toISOString() };
        this.transactions.push(tx);
        return { data: { balance: w.balance, transaction: tx } };
    }
    getTransactions(userId, filters) {
        let arr = this.transactions.filter(t => t.userId == userId);
        if (filters?.type) arr = arr.filter(t => t.type === filters.type);
        const page = parseInt(filters?.page) || 1;
        const limit = parseInt(filters?.limit) || 20;
        arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return { data: arr.slice((page - 1) * limit, page * limit), total: arr.length, page, limit };
    }
    // Promo codes
    getPromos() {
        const active = [...this.promoCodes.values()].filter(p => p.isActive && new Date(p.expiresAt) > new Date());
        return { data: active };
    }
    validatePromo(code, orderAmount) {
        const p = this.promoCodes.get(code);
        if (!p) throw new common_1.NotFoundException('Promo code not found');
        if (!p.isActive) throw new common_1.BadRequestException('Promo code is inactive');
        if (new Date(p.expiresAt) < new Date()) throw new common_1.BadRequestException('Promo code has expired');
        if (p.usedCount >= p.maxUses) throw new common_1.BadRequestException('Promo code usage limit reached');
        if (orderAmount < p.minOrder) throw new common_1.BadRequestException('Minimum order amount is ' + p.minOrder);
        let discount = 0;
        if (p.discountType === 'percentage') {
            discount = Math.min(orderAmount * p.discountValue / 100, p.maxDiscount);
        } else {
            discount = Math.min(p.discountValue, p.maxDiscount);
        }
        return { data: { code, valid: true, discount, discountType: p.discountType, description: p.description } };
    }
    applyPromo(code, userId, orderAmount) {
        const result = this.validatePromo(code, orderAmount);
        const p = this.promoCodes.get(code);
        p.usedCount++;
        return result;
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], WalletService);
`,
);

// wallet.controller.js
fs.writeFileSync(
  path.join(walletDir, "wallet.controller.js"),
  `"use strict";
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
exports.WalletController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const wallet_service_1 = require("./wallet.service");
let WalletController = class WalletController {
    svc;
    constructor(svc) { this.svc = svc; }
    getBalance(req) { return this.svc.getBalance(req.user?.id || 0); }
    getTransactions(req, q) { return this.svc.getTransactions(req.user?.id || 0, q); }
    topUp(req, d) {
        if (!d || typeof d.amount !== 'number' || d.amount <= 0) { throw new common_1.BadRequestException('amount (positive number) is required'); }
        return this.svc.topUp(req.user?.id || 0, d.amount, d.method);
    }
    pay(req, d) {
        if (!d || typeof d.amount !== 'number' || d.amount <= 0) { throw new common_1.BadRequestException('amount (positive number) is required'); }
        return this.svc.pay(req.user?.id || 0, d.amount, d.description, d.bookingId);
    }
    getPromos() { return this.svc.getPromos(); }
    validatePromo(d) {
        if (!d || typeof d.code !== 'string' || !d.code.trim()) { throw new common_1.BadRequestException('code is required'); }
        if (typeof d.orderAmount !== 'number' || d.orderAmount <= 0) { throw new common_1.BadRequestException('orderAmount (positive number) is required'); }
        return this.svc.validatePromo(d.code.trim().toUpperCase(), d.orderAmount);
    }
    applyPromo(req, d) {
        if (!d || typeof d.code !== 'string' || !d.code.trim()) { throw new common_1.BadRequestException('code is required'); }
        if (typeof d.orderAmount !== 'number' || d.orderAmount <= 0) { throw new common_1.BadRequestException('orderAmount (positive number) is required'); }
        return this.svc.applyPromo(d.code.trim().toUpperCase(), req.user?.id || 0, d.orderAmount);
    }
};
exports.WalletController = WalletController;
__decorate([
    (0, common_1.Get)('balance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get wallet balance' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WalletController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction history' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WalletController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Post)('topup'),
    (0, swagger_1.ApiOperation)({ summary: 'Top up wallet' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WalletController.prototype, "topUp", null);
__decorate([
    (0, common_1.Post)('pay'),
    (0, swagger_1.ApiOperation)({ summary: 'Pay from wallet' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WalletController.prototype, "pay", null);
__decorate([
    (0, common_1.Get)('promos'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active promo codes' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WalletController.prototype, "getPromos", null);
__decorate([
    (0, common_1.Post)('promo/validate'),
    (0, swagger_1.ApiOperation)({ summary: 'Validate a promo code' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WalletController.prototype, "validatePromo", null);
__decorate([
    (0, common_1.Post)('promo/apply'),
    (0, swagger_1.ApiOperation)({ summary: 'Apply a promo code to order' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WalletController.prototype, "applyPromo", null);
exports.WalletController = WalletController = __decorate([
    (0, swagger_1.ApiTags)('Wallet'),
    (0, common_1.Controller)('wallet'),
    __metadata("design:paramtypes", [wallet_service_1.WalletService])
], WalletController);
`,
);

// wallet.module.js
fs.writeFileSync(
  path.join(walletDir, "wallet.module.js"),
  `"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletModule = void 0;
const common_1 = require("@nestjs/common");
const wallet_service_1 = require("./wallet.service");
const wallet_controller_1 = require("./wallet.controller");
let WalletModule = class WalletModule {};
exports.WalletModule = WalletModule;
exports.WalletModule = WalletModule = __decorate([
    (0, common_1.Module)({
        controllers: [wallet_controller_1.WalletController],
        providers: [wallet_service_1.WalletService],
        exports: [wallet_service_1.WalletService],
    })
], WalletModule);
`,
);

console.log("Wallet module created");

// ======================== REGISTER MODULES IN APP ========================
// We need to add BookingsModule and WalletModule to app.module imports
const appModuleFile = "/app/dist/app.module.js";
let appCode = fs.readFileSync(appModuleFile, "utf8");

// Check if already registered
if (appCode.includes("BookingsModule")) {
  console.log("BookingsModule already registered");
} else {
  // Add require
  const requireInsert =
    'const bookings_module_1 = require("./bookings/bookings.module");\n';
  appCode = appCode.replace(
    'Object.defineProperty(exports, "__esModule", { value: true });',
    'Object.defineProperty(exports, "__esModule", { value: true });\n' +
      requireInsert,
  );
  // Add to imports array
  appCode = appCode.replace(
    /(\bimports:\s*\[)/,
    "$1\n            bookings_module_1.BookingsModule,",
  );
  console.log("BookingsModule registered in app.module");
}

if (appCode.includes("WalletModule")) {
  console.log("WalletModule already registered");
} else {
  const requireInsert =
    'const wallet_module_1 = require("./wallet/wallet.module");\n';
  appCode = appCode.replace(
    'Object.defineProperty(exports, "__esModule", { value: true });',
    'Object.defineProperty(exports, "__esModule", { value: true });\n' +
      requireInsert,
  );
  appCode = appCode.replace(
    /(\bimports:\s*\[)/,
    "$1\n            wallet_module_1.WalletModule,",
  );
  console.log("WalletModule registered in app.module");
}

fs.writeFileSync(appModuleFile, appCode, "utf8");
console.log("app.module.js updated");
console.log("\nAll Phase 2 modules created. Restart container to activate.");
