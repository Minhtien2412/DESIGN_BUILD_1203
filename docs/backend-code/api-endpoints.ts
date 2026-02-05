/**
 * Backend API Endpoints Documentation
 * Các endpoint API cần thiết cho ứng dụng
 * @created 2026-01-24
 */

// =============================================================================
// HOME MODULE - Dữ liệu trang chủ
// =============================================================================

// home.module.ts
export const HOME_MODULE = `
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { Banner } from './entities/banner.entity';
import { FeaturedService } from './entities/featured-service.entity';
import { Category } from './entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Banner, FeaturedService, Category]),
  ],
  controllers: [HomeController],
  providers: [HomeService],
  exports: [HomeService],
})
export class HomeModule {}
`;

// home.controller.ts
export const HOME_CONTROLLER = `
import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { HomeService } from './home.service';

@ApiTags('Home')
@Controller('home')
@UseInterceptors(CacheInterceptor)
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('data')
  @CacheTTL(300) // 5 minutes cache
  @ApiOperation({ summary: 'Get all home screen data' })
  @ApiResponse({ status: 200, description: 'Home data retrieved successfully' })
  async getHomeData() {
    return this.homeService.getHomeData();
  }

  @Get('banners')
  @CacheTTL(600) // 10 minutes cache
  @ApiOperation({ summary: 'Get banners for home screen' })
  async getBanners(@Query('placement') placement?: string) {
    return this.homeService.getBanners(placement);
  }

  @Get('featured-services')
  @CacheTTL(300)
  @ApiOperation({ summary: 'Get featured services' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFeaturedServices(
    @Query('category') category?: string,
    @Query('limit') limit?: number,
  ) {
    return this.homeService.getFeaturedServices(category, limit);
  }

  @Get('quick-stats')
  @CacheTTL(60) // 1 minute cache for real-time stats
  @ApiOperation({ summary: 'Get quick statistics for dashboard' })
  async getQuickStats() {
    return this.homeService.getQuickStats();
  }

  @Get('recent-activities')
  @CacheTTL(30)
  @ApiOperation({ summary: 'Get recent activities' })
  async getRecentActivities(@Query('limit') limit?: number) {
    return this.homeService.getRecentActivities(limit || 10);
  }
}
`;

// home.service.ts
export const HOME_SERVICE = `
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { FeaturedService } from './entities/featured-service.entity';
import { Category } from './entities/category.entity';

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(Banner)
    private bannerRepository: Repository<Banner>,
    @InjectRepository(FeaturedService)
    private featuredServiceRepository: Repository<FeaturedService>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async getHomeData() {
    const [banners, services, designServices, categories, equipmentItems, libraryItems] = await Promise.all([
      this.getBanners('home'),
      this.getFeaturedServices('main', 8),
      this.getFeaturedServices('design', 8),
      this.getCategories(),
      this.getFeaturedServices('equipment', 8),
      this.getLibraryCategories(),
    ]);

    return {
      success: true,
      data: {
        banners: banners.data,
        services: services.data,
        designServices: designServices.data,
        categories,
        equipmentItems: equipmentItems.data,
        libraryItems,
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getBanners(placement?: string) {
    const query = this.bannerRepository
      .createQueryBuilder('banner')
      .where('banner.isActive = :isActive', { isActive: true })
      .orderBy('banner.order', 'ASC');

    if (placement) {
      query.andWhere('banner.placement = :placement', { placement });
    }

    const banners = await query.getMany();

    return {
      success: true,
      data: banners.map(b => ({
        id: b.id,
        image: b.imageUrl,
        title: b.title,
        subtitle: b.subtitle,
        route: b.route,
        link: b.link,
      })),
    };
  }

  async getFeaturedServices(category?: string, limit?: number) {
    const query = this.featuredServiceRepository
      .createQueryBuilder('service')
      .where('service.isActive = :isActive', { isActive: true })
      .orderBy('service.order', 'ASC');

    if (category) {
      query.andWhere('service.category = :category', { category });
    }

    if (limit) {
      query.limit(limit);
    }

    const services = await query.getMany();

    return {
      success: true,
      data: services.map(s => ({
        id: s.id,
        label: s.name,
        icon: s.icon,
        route: s.route,
        price: s.price,
        location: s.location,
        description: s.description,
        rating: s.rating,
        reviewCount: s.reviewCount,
      })),
    };
  }

  async getCategories() {
    const categories = await this.categoryRepository.find({
      where: { isActive: true, type: 'main' },
      order: { order: 'ASC' },
    });

    return categories.map(c => ({
      id: c.id,
      label: c.name,
      icon: c.icon,
      route: c.route,
      count: c.itemCount,
    }));
  }

  async getLibraryCategories() {
    const categories = await this.categoryRepository.find({
      where: { isActive: true, type: 'library' },
      order: { order: 'ASC' },
    });

    return categories.map(c => ({
      id: c.id,
      label: c.name,
      icon: c.icon,
      route: c.route,
      count: c.itemCount,
    }));
  }

  async getQuickStats() {
    return {
      success: true,
      data: {
        activeProjects: 0,
        pendingTasks: 0,
        unreadMessages: 0,
        missedCalls: 0,
        notifications: 0,
      },
    };
  }

  async getRecentActivities(limit: number) {
    return { success: true, data: [] };
  }
}
`;

// =============================================================================
// ENTITIES
// =============================================================================

export const BANNER_ENTITY = `
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  subtitle: string;

  @Column({ name: 'image_url' })
  imageUrl: string;

  @Column({ nullable: true })
  route: string;

  @Column({ nullable: true })
  link: string;

  @Column({ default: 'home' })
  placement: string;

  @Column({ default: 0 })
  order: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'start_date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', nullable: true })
  endDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
`;

export const FEATURED_SERVICE_ENTITY = `
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('featured_services')
export class FeaturedService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column()
  route: string;

  @Column({ nullable: true })
  price: string;

  @Column({ nullable: true })
  location: string;

  @Column({ default: 'main' })
  category: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ name: 'review_count', default: 0 })
  reviewCount: number;

  @Column({ default: 0 })
  order: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
`;

export const CATEGORY_ENTITY = `
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  icon: string;

  @Column()
  route: string;

  @Column({ default: 'main' })
  type: string;

  @Column({ name: 'item_count', default: 0 })
  itemCount: number;

  @Column({ default: 0 })
  order: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
`;

// =============================================================================
// WORKERS MODULE - Quản lý thợ/nhân công
// =============================================================================

export const WORKERS_MODULE = `
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkersController } from './workers.controller';
import { WorkersService } from './workers.service';
import { Worker } from './entities/worker.entity';
import { WorkerCategory } from './entities/worker-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Worker, WorkerCategory]),
  ],
  controllers: [WorkersController],
  providers: [WorkersService],
  exports: [WorkersService],
})
export class WorkersModule {}
`;

export const WORKERS_CONTROLLER = `
import { Controller, Get, Post, Body, Param, Query, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { WorkersService } from './workers.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Workers')
@Controller('workers')
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all workers with filters' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category (construction, finishing, etc)' })
  @ApiQuery({ name: 'available', required: false, type: Boolean })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'minRating', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('category') category?: string,
    @Query('available') available?: boolean,
    @Query('location') location?: string,
    @Query('minRating') minRating?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.workersService.findAll({ category, available, location, minRating, page, limit });
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get worker categories' })
  async getCategories() {
    return this.workersService.getCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get worker by ID' })
  async findOne(@Param('id') id: string) {
    return this.workersService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new worker profile' })
  async create(@Body() createWorkerDto: CreateWorkerDto) {
    return this.workersService.create(createWorkerDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update worker profile' })
  async update(@Param('id') id: string, @Body() updateWorkerDto: UpdateWorkerDto) {
    return this.workersService.update(id, updateWorkerDto);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Get worker reviews' })
  async getReviews(@Param('id') id: string) {
    return this.workersService.getReviews(id);
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Get worker availability schedule' })
  async getAvailability(@Param('id') id: string) {
    return this.workersService.getAvailability(id);
  }
}
`;

export const WORKER_ENTITY = `
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { WorkerCategory } from './worker-category.entity';

@Entity('workers')
export class Worker {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  skills: string[];

  @Column({ nullable: true })
  price: string;

  @Column({ name: 'price_unit', default: 'day' })
  priceUnit: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ name: 'review_count', default: 0 })
  reviewCount: number;

  @Column({ name: 'completed_jobs', default: 0 })
  completedJobs: number;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @ManyToOne(() => WorkerCategory, category => category.workers)
  category: WorkerCategory;

  @Column({ name: 'category_id', nullable: true })
  categoryId: string;

  @Column({ name: 'experience_years', default: 0 })
  experienceYears: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
`;

// =============================================================================
// NOTIFICATIONS MODULE - Thông báo
// =============================================================================

export const NOTIFICATIONS_MODULE = `
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { Notification } from './entities/notification.entity';
import { NotificationSetting } from './entities/notification-setting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationSetting]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway],
  exports: [NotificationsService],
})
export class NotificationsModule {}
`;

export const NOTIFICATIONS_CONTROLLER = `
import { Controller, Get, Post, Body, Param, Query, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiQuery({ name: 'type', required: false, description: 'system, message, call, task, etc' })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Request() req,
    @Query('type') type?: string,
    @Query('unreadOnly') unreadOnly?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.notificationsService.findAll(req.user.id, { type, unreadOnly, page, limit });
  }

  @Get('count')
  @ApiOperation({ summary: 'Get notification counts by type' })
  async getCounts(@Request() req) {
    return this.notificationsService.getCounts(req.user.id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get total unread count' })
  async getUnreadCount(@Request() req) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@Request() req, @Query('type') type?: string) {
    return this.notificationsService.markAllAsRead(req.user.id, type);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.notificationsService.remove(id, req.user.id);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get notification settings' })
  async getSettings(@Request() req) {
    return this.notificationsService.getSettings(req.user.id);
  }

  @Put('settings')
  @ApiOperation({ summary: 'Update notification settings' })
  async updateSettings(@Request() req, @Body() settings: any) {
    return this.notificationsService.updateSettings(req.user.id, settings);
  }
}
`;

export const NOTIFICATION_ENTITY = `
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Index } from 'typeorm';

export enum NotificationType {
  SYSTEM = 'system',
  MESSAGE = 'message',
  CALL = 'call',
  MISSED_CALL = 'missed_call',
  TASK = 'task',
  PROJECT = 'project',
  PAYMENT = 'payment',
  ALERT = 'alert',
  PROMOTION = 'promotion',
}

@Entity('notifications')
@Index(['userId', 'createdAt'])
@Index(['userId', 'isRead'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ type: 'enum', enum: NotificationType, default: NotificationType.SYSTEM })
  type: NotificationType;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  body: string;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  image: string;

  @Column({ name: 'action_url', nullable: true })
  actionUrl: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', nullable: true })
  readAt: Date;

  @Column({ name: 'sender_id', nullable: true })
  senderId: string;

  @Column({ name: 'sender_name', nullable: true })
  senderName: string;

  @Column({ name: 'sender_avatar', nullable: true })
  senderAvatar: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
`;

// =============================================================================
// MESSAGES/CHAT MODULE - Tin nhắn
// =============================================================================

export const MESSAGES_MODULE = `
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { ChatGateway } from './chat.gateway';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { ConversationParticipant } from './entities/conversation-participant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message, ConversationParticipant]),
  ],
  controllers: [MessagesController],
  providers: [MessagesService, ChatGateway],
  exports: [MessagesService],
})
export class MessagesModule {}
`;

export const MESSAGES_CONTROLLER = `
import { Controller, Get, Post, Body, Param, Query, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMessageDto } from './dto/create-message.dto';

@ApiTags('Messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get user conversations' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getConversations(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.messagesService.getConversations(req.user.id, { page, limit });
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get conversation details' })
  async getConversation(@Param('id') id: string, @Request() req) {
    return this.messagesService.getConversation(id, req.user.id);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get messages in conversation' })
  @ApiQuery({ name: 'before', required: false, description: 'Get messages before this ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMessages(
    @Param('id') id: string,
    @Request() req,
    @Query('before') before?: string,
    @Query('limit') limit?: number,
  ) {
    return this.messagesService.getMessages(id, req.user.id, { before, limit });
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send message in conversation' })
  async sendMessage(
    @Param('id') id: string,
    @Request() req,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.messagesService.sendMessage(id, req.user.id, createMessageDto);
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Create new conversation' })
  async createConversation(@Request() req, @Body() body: { participantIds: string[], name?: string }) {
    return this.messagesService.createConversation(req.user.id, body.participantIds, body.name);
  }

  @Put('conversations/:id/read')
  @ApiOperation({ summary: 'Mark conversation as read' })
  async markAsRead(@Param('id') id: string, @Request() req) {
    return this.messagesService.markAsRead(id, req.user.id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get total unread messages count' })
  async getUnreadCount(@Request() req) {
    return this.messagesService.getUnreadCount(req.user.id);
  }
}
`;

// =============================================================================
// CALLS MODULE - Cuộc gọi
// =============================================================================

export const CALLS_MODULE = `
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallsController } from './calls.controller';
import { CallsService } from './calls.service';
import { CallsGateway } from './calls.gateway';
import { Call } from './entities/call.entity';
import { CallParticipant } from './entities/call-participant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Call, CallParticipant]),
  ],
  controllers: [CallsController],
  providers: [CallsService, CallsGateway],
  exports: [CallsService],
})
export class CallsModule {}
`;

export const CALLS_CONTROLLER = `
import { Controller, Get, Post, Body, Param, Query, Put, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CallsService } from './calls.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Calls')
@Controller('calls')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Get('history')
  @ApiOperation({ summary: 'Get call history' })
  @ApiQuery({ name: 'type', required: false, description: 'all, incoming, outgoing, missed' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getHistory(
    @Request() req,
    @Query('type') type?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.callsService.getHistory(req.user.id, { type, page, limit });
  }

  @Get('missed-count')
  @ApiOperation({ summary: 'Get missed calls count' })
  async getMissedCount(@Request() req) {
    return this.callsService.getMissedCount(req.user.id);
  }

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate a call' })
  async initiateCall(
    @Request() req,
    @Body() body: { recipientId: string, type: 'voice' | 'video' },
  ) {
    return this.callsService.initiateCall(req.user.id, body.recipientId, body.type);
  }

  @Put(':id/answer')
  @ApiOperation({ summary: 'Answer a call' })
  async answerCall(@Param('id') id: string, @Request() req) {
    return this.callsService.answerCall(id, req.user.id);
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Reject a call' })
  async rejectCall(@Param('id') id: string, @Request() req) {
    return this.callsService.rejectCall(id, req.user.id);
  }

  @Put(':id/end')
  @ApiOperation({ summary: 'End a call' })
  async endCall(@Param('id') id: string, @Request() req) {
    return this.callsService.endCall(id, req.user.id);
  }

  @Put(':id/mark-seen')
  @ApiOperation({ summary: 'Mark missed call as seen' })
  async markAsSeen(@Param('id') id: string, @Request() req) {
    return this.callsService.markAsSeen(id, req.user.id);
  }

  @Get('token')
  @ApiOperation({ summary: 'Get LiveKit/WebRTC token for call' })
  async getToken(@Request() req, @Query('roomId') roomId: string) {
    return this.callsService.generateToken(req.user.id, roomId);
  }
}
`;

export const CALL_ENTITY = `
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CallParticipant } from './call-participant.entity';

export enum CallType {
  VOICE = 'voice',
  VIDEO = 'video',
}

export enum CallStatus {
  INITIATING = 'initiating',
  RINGING = 'ringing',
  ONGOING = 'ongoing',
  ENDED = 'ended',
  MISSED = 'missed',
  REJECTED = 'rejected',
  FAILED = 'failed',
}

@Entity('calls')
export class Call {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'caller_id' })
  callerId: string;

  @Column({ name: 'caller_name', nullable: true })
  callerName: string;

  @Column({ name: 'caller_avatar', nullable: true })
  callerAvatar: string;

  @Column({ type: 'enum', enum: CallType })
  type: CallType;

  @Column({ type: 'enum', enum: CallStatus, default: CallStatus.INITIATING })
  status: CallStatus;

  @Column({ name: 'room_id', nullable: true })
  roomId: string;

  @Column({ name: 'started_at', nullable: true })
  startedAt: Date;

  @Column({ name: 'ended_at', nullable: true })
  endedAt: Date;

  @Column({ name: 'duration_seconds', default: 0 })
  durationSeconds: number;

  @Column({ name: 'end_reason', nullable: true })
  endReason: string;

  @OneToMany(() => CallParticipant, participant => participant.call)
  participants: CallParticipant[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
`;

// =============================================================================
// SQL MIGRATIONS
// =============================================================================

export const SQL_MIGRATIONS = `
-- Banners table
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  image_url VARCHAR(500) NOT NULL,
  route VARCHAR(255),
  link VARCHAR(500),
  placement VARCHAR(50) DEFAULT 'home',
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Featured services table  
CREATE TABLE IF NOT EXISTS featured_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  route VARCHAR(255) NOT NULL,
  price VARCHAR(100),
  location VARCHAR(255),
  category VARCHAR(50) DEFAULT 'main',
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(100),
  route VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'main',
  item_count INTEGER DEFAULT 0,
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workers table
CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  avatar VARCHAR(500),
  phone VARCHAR(20),
  email VARCHAR(255),
  location VARCHAR(255),
  description TEXT,
  skills TEXT[],
  price VARCHAR(100),
  price_unit VARCHAR(20) DEFAULT 'day',
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  category_id UUID,
  experience_years INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Worker categories table
CREATE TABLE IF NOT EXISTS worker_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(100),
  description TEXT,
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type VARCHAR(50) DEFAULT 'system',
  title VARCHAR(255) NOT NULL,
  body TEXT,
  data JSONB,
  icon VARCHAR(100),
  image VARCHAR(500),
  action_url VARCHAR(500),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  sender_id UUID,
  sender_name VARCHAR(255),
  sender_avatar VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  type VARCHAR(20) DEFAULT 'direct', -- direct, group
  avatar VARCHAR(500),
  last_message_id UUID,
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversation participants
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role VARCHAR(20) DEFAULT 'member', -- admin, member
  unread_count INTEGER DEFAULT 0,
  last_read_at TIMESTAMP,
  is_muted BOOLEAN DEFAULT false,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(conversation_id, user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  type VARCHAR(20) DEFAULT 'text', -- text, image, video, audio, file, location
  content TEXT,
  metadata JSONB,
  reply_to_id UUID REFERENCES messages(id),
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);

-- Calls table
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_id UUID NOT NULL,
  caller_name VARCHAR(255),
  caller_avatar VARCHAR(500),
  type VARCHAR(10) NOT NULL, -- voice, video
  status VARCHAR(20) DEFAULT 'initiating',
  room_id VARCHAR(100),
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  duration_seconds INTEGER DEFAULT 0,
  end_reason VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Call participants
CREATE TABLE IF NOT EXISTS call_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, joined, left, rejected
  joined_at TIMESTAMP,
  left_at TIMESTAMP,
  is_seen BOOLEAN DEFAULT false,
  seen_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_call_participants_user ON call_participants(user_id, created_at DESC);

-- Seed data for categories
INSERT INTO categories (name, icon, route, type, "order") VALUES
  ('Thiết kế kiến trúc', 'home-outline', '/design/architecture', 'main', 1),
  ('Thiết kế nội thất', 'bed-outline', '/design/interior', 'main', 2),
  ('Thiết kế cảnh quan', 'leaf-outline', '/design/landscape', 'main', 3),
  ('Thi công xây dựng', 'construct-outline', '/construction', 'main', 4),
  ('Vật liệu xây dựng', 'cube-outline', '/materials', 'main', 5),
  ('Thiết bị & Nội thất', 'desktop-outline', '/equipment', 'main', 6),
  ('Biệt thự', 'home-outline', '/library/villa', 'library', 1),
  ('Resort', 'business-outline', '/library/resort', 'library', 2),
  ('Nhà phố', 'storefront-outline', '/library/townhouse', 'library', 3),
  ('Văn phòng', 'briefcase-outline', '/library/office', 'library', 4)
ON CONFLICT DO NOTHING;

-- Seed data for worker categories
INSERT INTO worker_categories (name, slug, icon, "order") VALUES
  ('Thợ xây dựng', 'construction', 'hammer-outline', 1),
  ('Thợ hoàn thiện', 'finishing', 'brush-outline', 2),
  ('Thợ điện', 'electrical', 'flash-outline', 3),
  ('Thợ nước', 'plumbing', 'water-outline', 4),
  ('Thợ sơn', 'painting', 'color-palette-outline', 5),
  ('Thợ mộc', 'carpentry', 'construct-outline', 6),
  ('Thợ hàn', 'welding', 'flame-outline', 7),
  ('Thợ ốp lát', 'tiling', 'grid-outline', 8)
ON CONFLICT DO NOTHING;
`;

// =============================================================================
// UPDATED APP MODULE
// =============================================================================

export const UPDATED_APP_MODULE = `
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as redisStore from 'cache-manager-redis-store';

// Existing modules
import { AnalyticsModule } from './analytics/analytics.module';
import { CommentsModule } from './comments/comments.module';
import { ConstructionMapModule } from './construction-map/construction-map.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { FleetModule } from './fleet/fleet.module';
import { HealthModule } from './health/health.module';
import { LivestreamModule } from './livestream/livestream.module';
import { PaymentModule } from './payment/payment.module';
import { ProgressTrackingModule } from './progress-tracking/progress-tracking.module';
import { ScheduledTasksModule } from './scheduled-tasks/scheduled-tasks.module';
import { TimelineModule } from './timeline/timeline.module';

// New modules for home data
import { HomeModule } from './home/home.module';
import { WorkersModule } from './workers/workers.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MessagesModule } from './messages/messages.module';
import { CallsModule } from './calls/calls.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('DB_SYNCHRONIZE') === 'true',
        logging: configService.get('DB_LOGGING') === 'true',
        ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),

    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await (redisStore.redisStore as any)({
          socket: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
          },
          password: configService.get('REDIS_PASSWORD'),
          ttl: configService.get('REDIS_TTL'),
        }),
      }),
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
    }),

    HttpModule,

    // Existing Feature Modules
    ConstructionMapModule,
    TimelineModule,
    FileUploadModule,
    PaymentModule,
    FleetModule,
    LivestreamModule,
    HealthModule,
    ScheduledTasksModule,
    ProgressTrackingModule,
    AnalyticsModule,
    CommentsModule,

    // New Feature Modules
    HomeModule,
    WorkersModule,
    NotificationsModule,
    MessagesModule,
    CallsModule,
  ],
})
export class AppModule {}
`;

export default {
  HOME_MODULE,
  HOME_CONTROLLER,
  HOME_SERVICE,
  BANNER_ENTITY,
  FEATURED_SERVICE_ENTITY,
  CATEGORY_ENTITY,
  WORKERS_MODULE,
  WORKERS_CONTROLLER,
  WORKER_ENTITY,
  NOTIFICATIONS_MODULE,
  NOTIFICATIONS_CONTROLLER,
  NOTIFICATION_ENTITY,
  MESSAGES_MODULE,
  MESSAGES_CONTROLLER,
  CALLS_MODULE,
  CALLS_CONTROLLER,
  CALL_ENTITY,
  SQL_MIGRATIONS,
  UPDATED_APP_MODULE,
};
