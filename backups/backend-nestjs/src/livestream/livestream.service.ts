import { InjectQueue } from '@nestjs/bull';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { CreateStreamDto } from './dto/create-stream.dto';
import { CreateVideoDto } from './dto/create-video.dto';
import { StreamSchedule } from './entities/stream-schedule.entity';
import { Stream, StreamStatus } from './entities/stream.entity';
import { Video, VideoStatus } from './entities/video.entity';

@Injectable()
export class LivestreamService {
  constructor(
    @InjectRepository(Stream)
    private readonly streamRepository: Repository<Stream>,
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    @InjectRepository(StreamSchedule)
    private readonly scheduleRepository: Repository<StreamSchedule>,
    @InjectQueue('video-processing')
    private readonly videoQueue: Queue,
  ) {}

  // Streams
  async createStream(dto: CreateStreamDto): Promise<Stream> {
    const streamKey = this.generateStreamKey();
    const stream = this.streamRepository.create({
      ...dto,
      streamKey,
      rtmpUrl: `rtmp://your-server.com/live/${streamKey}`,
      hlsUrl: `https://your-server.com/hls/${streamKey}/index.m3u8`,
    });
    return this.streamRepository.save(stream);
  }

  async findAllStreams(projectId?: number): Promise<Stream[]> {
    const where = projectId ? { projectId } : {};
    return this.streamRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findStream(id: number): Promise<Stream> {
    const stream = await this.streamRepository.findOne({ where: { id } });
    if (!stream) {
      throw new NotFoundException(`Stream ${id} not found`);
    }
    return stream;
  }

  async startStream(id: number): Promise<Stream> {
    const stream = await this.findStream(id);
    stream.status = StreamStatus.LIVE;
    stream.startTime = new Date();
    return this.streamRepository.save(stream);
  }

  async endStream(id: number): Promise<Stream> {
    const stream = await this.findStream(id);
    stream.status = StreamStatus.ENDED;
    stream.endTime = new Date();
    if (stream.startTime) {
      stream.duration = Math.floor(
        (stream.endTime.getTime() - stream.startTime.getTime()) / 1000,
      );
    }
    return this.streamRepository.save(stream);
  }

  async updateViewerCount(id: number, count: number): Promise<Stream> {
    const stream = await this.findStream(id);
    stream.viewerCount = count;
    return this.streamRepository.save(stream);
  }

  async getLiveStreams(): Promise<Stream[]> {
    return this.streamRepository.find({
      where: { status: StreamStatus.LIVE },
      order: { viewerCount: 'DESC' },
    });
  }

  // Videos
  async createVideo(dto: CreateVideoDto): Promise<Video> {
    const video = this.videoRepository.create(dto);
    const saved = await this.videoRepository.save(video);

    // Queue video processing job
    await this.videoQueue.add('process-video', {
      videoId: saved.id,
      filePath: saved.filePath,
    });

    return saved;
  }

  async findAllVideos(projectId?: number): Promise<Video[]> {
    const where = projectId ? { projectId } : {};
    return this.videoRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findVideo(id: number): Promise<Video> {
    const video = await this.videoRepository.findOne({ where: { id } });
    if (!video) {
      throw new NotFoundException(`Video ${id} not found`);
    }
    return video;
  }

  async updateVideoStatus(id: number, status: VideoStatus): Promise<Video> {
    const video = await this.findVideo(id);
    video.status = status;
    return this.videoRepository.save(video);
  }

  async incrementVideoViews(id: number): Promise<Video> {
    const video = await this.findVideo(id);
    video.views += 1;
    return this.videoRepository.save(video);
  }

  async extractThumbnail(videoId: number): Promise<Video> {
    const video = await this.findVideo(videoId);
    // TODO: Implement thumbnail extraction with FFmpeg
    video.thumbnailPath = `/thumbnails/${videoId}.jpg`;
    return this.videoRepository.save(video);
  }

  async transcodeVideo(videoId: number, qualities: string[]): Promise<Video> {
    const video = await this.findVideo(videoId);
    // TODO: Implement transcoding with FFmpeg
    video.status = VideoStatus.PROCESSING;
    await this.videoRepository.save(video);

    await this.videoQueue.add('transcode', {
      videoId,
      qualities,
    });

    return video;
  }

  // Stream Schedules
  async scheduleStream(data: Partial<StreamSchedule>): Promise<StreamSchedule> {
    const schedule = this.scheduleRepository.create(data);
    return this.scheduleRepository.save(schedule);
  }

  async getUpcomingSchedules(userId: number): Promise<StreamSchedule[]> {
    return this.scheduleRepository.find({
      where: { userId },
      order: { scheduledTime: 'ASC' },
    });
  }

  // Utilities
  private generateStreamKey(): string {
    return randomBytes(16).toString('hex');
  }
}
