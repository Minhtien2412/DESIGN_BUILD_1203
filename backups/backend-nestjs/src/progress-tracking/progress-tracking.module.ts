import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackgroundTask } from './entities/background-task.entity';
import { ProgressTrackingController } from './progress-tracking.controller';
import { ProgressTrackingProcessor } from './progress-tracking.processor';
import { ProgressTrackingService } from './progress-tracking.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'progress-tracking',
    }),
    TypeOrmModule.forFeature([BackgroundTask]),
  ],
  controllers: [ProgressTrackingController],
  providers: [ProgressTrackingService, ProgressTrackingProcessor],
  exports: [ProgressTrackingService],
})
export class ProgressTrackingModule {}
