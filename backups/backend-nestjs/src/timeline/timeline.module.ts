import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhaseTask } from './entities/phase-task.entity';
import { Phase } from './entities/phase.entity';
import { TimelineNotification } from './entities/timeline-notification.entity';
import { TimelineController } from './timeline.controller';
import { TimelineService } from './timeline.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Phase, PhaseTask, TimelineNotification]),
  ],
  controllers: [TimelineController],
  providers: [TimelineService],
  exports: [TimelineService],
})
export class TimelineModule {}
