import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as redisStore from 'cache-manager-redis-store';
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

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database - PostgreSQL/TypeORM
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

    // Cache - Redis
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

    // Bull Queue - Redis
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

    // HTTP Module for health checks
    HttpModule,

    // Feature Modules
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
  ],
})
export class AppModule {}
