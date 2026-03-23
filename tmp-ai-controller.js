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
exports.AIController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const ai_service_1 = require("./ai.service");
const dto_1 = require("./dto");
let AIController = class AIController {
    aiService;
    constructor(aiService) {
        this.aiService = aiService;
    }
    async healthCheck() {
        return {
            status: 'healthy',
            module: 'AI Agent',
            timestamp: new Date().toISOString(),
            features: ['analyze', 'report', 'monitor', 'chat', 'materials-check'],
        };
    }
    async analyzeConstructionSite(req, dto) {
        return this.aiService.analyzeConstructionSite(req.user.userId, dto);
    }
    async generateProgressReport(req, dto) {
        return this.aiService.generateProgressReport(req.user.userId, dto);
    }
    async monitorProject(req, projectId, imageUrl) {
        return this.aiService.monitorProject(req.user.userId, projectId, imageUrl);
    }
    async getAnalysisHistory(req, projectId) {
        return this.aiService.getAnalysisHistory(req.user.userId, projectId ? parseInt(projectId, 10) : undefined);
    }
    async getReports(req, projectId) {
        return this.aiService.getReports(req.user.userId, projectId ? parseInt(projectId, 10) : undefined);
    }
    async deleteAnalysis(req, id) {
        await this.aiService.deleteAnalysis(req.user.userId, id);
        return { message: 'Analysis deleted successfully' };
    }
    async analyzeProgress(req, dto) {
        return this.aiService.analyzeProgressFromImages(req.user.userId, dto);
    }
    async getProgressAnalyses(projectId, phaseId) {
        return this.aiService.getProgressAnalyses(projectId, phaseId);
    }
    async generateDailyReport(req, dto) {
        return this.aiService.generateDailyReport(req.user.userId, dto);
    }
    async getDailyReports(projectId, startDate, endDate) {
        return this.aiService.getDailyReports(projectId, startDate, endDate);
    }
    async generateWeeklyReport(req, dto) {
        return this.aiService.generateWeeklyReport(req.user.userId, dto);
    }
    async getWeeklyReports(projectId, year) {
        return this.aiService.getWeeklyReports(projectId, year);
    }
    async chatWithAI(req, dto) {
        return this.aiService.chatWithAssistant(req.user.userId, dto);
    }
    async getChatHistory(req, projectId, limit) {
        return this.aiService.getChatHistory(projectId, req.user.userId, limit);
    }
    async checkMaterials(req, dto) {
        return this.aiService.checkMaterials(req.user.userId, dto);
    }
    async getMaterialReports(projectId) {
        return this.aiService.getMaterialReports(projectId);
    }
};
exports.AIController = AIController;
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Health check for AI module' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'AI module is healthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AIController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Post)('analyze'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Ph├ón t├¡ch c├┤ng tr├¼nh bß║▒ng AI (vß╗¢i/kh├┤ng h├¼nh ß║únh)',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, type: dto_1.AIAnalysisResponseDto }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateAIAnalysisDto]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "analyzeConstructionSite", null);
__decorate([
    (0, common_1.Post)('report'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Tß║ío b├ío c├ío tiß║┐n ─æß╗Ö tß╗▒ ─æß╗Öng bß║▒ng AI' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: dto_1.AIReportResponseDto }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateAIReportDto]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "generateProgressReport", null);
__decorate([
    (0, common_1.Post)('monitor/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Gi├ím s├ít c├┤ng tr├¼nh real-time vß╗¢i h├¼nh ß║únh' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: dto_1.AIMonitoringResultDto }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)('imageUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "monitorProject", null);
__decorate([
    (0, common_1.Get)('analyses'),
    (0, swagger_1.ApiOperation)({ summary: 'Lß║Ñy lß╗ïch sß╗¡ ph├ón t├¡ch AI' }),
    (0, swagger_1.ApiQuery)({ name: 'projectId', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [dto_1.AIAnalysisResponseDto] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "getAnalysisHistory", null);
__decorate([
    (0, common_1.Get)('reports'),
    (0, swagger_1.ApiOperation)({ summary: 'Lß║Ñy danh s├ích b├ío c├ío AI' }),
    (0, swagger_1.ApiQuery)({ name: 'projectId', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [dto_1.AIReportResponseDto] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "getReports", null);
__decorate([
    (0, common_1.Delete)('analyses/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'X├│a ph├ón t├¡ch AI' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "deleteAnalysis", null);
__decorate([
    (0, common_1.Post)('progress/analyze'),
    (0, swagger_1.ApiOperation)({ summary: 'AI: Ph├ón t├¡ch tiß║┐n ─æß╗Ö tß╗½ h├¼nh ß║únh c├┤ng tr╞░ß╗¥ng' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Progress analysis completed' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.AnalyzeProgressDto]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "analyzeProgress", null);
__decorate([
    (0, common_1.Get)('progress/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Lß║Ñy danh s├ích ph├ón t├¡ch tiß║┐n ─æß╗Ö' }),
    (0, swagger_1.ApiQuery)({ name: 'phaseId', required: false, type: Number }),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('phaseId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "getProgressAnalyses", null);
__decorate([
    (0, common_1.Post)('reports/daily'),
    (0, swagger_1.ApiOperation)({ summary: 'AI: Tß║ío b├ío c├ío ng├áy tß╗▒ ─æß╗Öng' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Daily report generated' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.GenerateDailyReportDto]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "generateDailyReport", null);
__decorate([
    (0, common_1.Get)('reports/daily/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Lß║Ñy danh s├ích b├ío c├ío ng├áy' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "getDailyReports", null);
__decorate([
    (0, common_1.Post)('reports/weekly'),
    (0, swagger_1.ApiOperation)({ summary: 'AI: Tß║ío b├ío c├ío tuß║ºn tß╗▒ ─æß╗Öng' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Weekly report generated' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.GenerateWeeklyReportDto]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "generateWeeklyReport", null);
__decorate([
    (0, common_1.Get)('reports/weekly/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Lß║Ñy danh s├ích b├ío c├ío tuß║ºn' }),
    (0, swagger_1.ApiQuery)({ name: 'year', required: false, type: Number }),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "getWeeklyReports", null);
__decorate([
    (0, common_1.Post)('chat'),
    (0, swagger_1.ApiOperation)({ summary: 'AI: Chat vß╗¢i AI Construction Assistant' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'AI response generated' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.ChatWithAIDto]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "chatWithAI", null);
__decorate([
    (0, common_1.Get)('chat/:projectId/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Lß║Ñy lß╗ïch sß╗¡ chat vß╗¢i AI' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "getChatHistory", null);
__decorate([
    (0, common_1.Post)('materials/check'),
    (0, swagger_1.ApiOperation)({ summary: 'AI: Kiß╗âm tra vß║¡t liß╗çu x├óy dß╗▒ng' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Material check completed' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CheckMaterialsDto]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "checkMaterials", null);
__decorate([
    (0, common_1.Get)('materials/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Lß║Ñy danh s├ích b├ío c├ío kiß╗âm tra vß║¡t liß╗çu' }),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "getMaterialReports", null);
exports.AIController = AIController = __decorate([
    (0, swagger_1.ApiTags)('AI Agent'),
    (0, common_1.Controller)({ path: 'ai', version: '1' }),
    __metadata("design:paramtypes", [ai_service_1.AIService])
], AIController);
//# sourceMappingURL=ai.controller.js.map
