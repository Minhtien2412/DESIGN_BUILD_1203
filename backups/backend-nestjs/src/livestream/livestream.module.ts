import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StreamSchedule } from './entities/stream-schedule.entity';
import { Stream } from './entities/stream.entity';
import { Video } from './entities/video.entity';
import { LivestreamController } from './livestream.controller';
import { LivestreamService } from './livestream.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stream, Video, StreamSchedule]),
    BullModule.registerQueue({
      name: 'video-processing',
    }),
  ],
  controllers: [LivestreamController],
  providers: [LivestreamService],
  exports: [LivestreamService],
})
export class LivestreamModule {}
