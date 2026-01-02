import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { CreateStreamDto } from './dto/create-stream.dto';
import { CreateVideoDto } from './dto/create-video.dto';
import { VideoStatus } from './entities/video.entity';
import { LivestreamService } from './livestream.service';

@Controller('livestream')
export class LivestreamController {
  constructor(private readonly livestreamService: LivestreamService) {}

  // Streams
  @Post('streams')
  async createStream(@Body() dto: CreateStreamDto) {
    return this.livestreamService.createStream(dto);
  }

  @Get('streams')
  async findAllStreams(@Query('projectId', ParseIntPipe) projectId?: number) {
    return this.livestreamService.findAllStreams(projectId);
  }

  @Get('streams/live')
  async getLiveStreams() {
    return this.livestreamService.getLiveStreams();
  }

  @Get('streams/:id')
  async findStream(@Param('id', ParseIntPipe) id: number) {
    return this.livestreamService.findStream(id);
  }

  @Post('streams/:id/start')
  @HttpCode(HttpStatus.OK)
  async startStream(@Param('id', ParseIntPipe) id: number) {
    return this.livestreamService.startStream(id);
  }

  @Post('streams/:id/end')
  @HttpCode(HttpStatus.OK)
  async endStream(@Param('id', ParseIntPipe) id: number) {
    return this.livestreamService.endStream(id);
  }

  @Patch('streams/:id/viewers')
  async updateViewerCount(
    @Param('id', ParseIntPipe) id: number,
    @Body('count') count: number,
  ) {
    return this.livestreamService.updateViewerCount(id, count);
  }

  // Videos
  @Post('videos')
  async createVideo(@Body() dto: CreateVideoDto) {
    return this.livestreamService.createVideo(dto);
  }

  @Get('videos')
  async findAllVideos(@Query('projectId', ParseIntPipe) projectId?: number) {
    return this.livestreamService.findAllVideos(projectId);
  }

  @Get('videos/:id')
  async findVideo(@Param('id', ParseIntPipe) id: number) {
    return this.livestreamService.findVideo(id);
  }

  @Patch('videos/:id/status')
  async updateVideoStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: VideoStatus,
  ) {
    return this.livestreamService.updateVideoStatus(id, status);
  }

  @Post('videos/:id/view')
  @HttpCode(HttpStatus.OK)
  async incrementVideoViews(@Param('id', ParseIntPipe) id: number) {
    return this.livestreamService.incrementVideoViews(id);
  }

  @Post('videos/:id/thumbnail')
  @HttpCode(HttpStatus.OK)
  async extractThumbnail(@Param('id', ParseIntPipe) id: number) {
    return this.livestreamService.extractThumbnail(id);
  }

  @Post('videos/:id/transcode')
  @HttpCode(HttpStatus.ACCEPTED)
  async transcodeVideo(
    @Param('id', ParseIntPipe) id: number,
    @Body('qualities') qualities: string[],
  ) {
    return this.livestreamService.transcodeVideo(id, qualities);
  }

  // Schedules
  @Post('schedules')
  async scheduleStream(@Body() data: any) {
    return this.livestreamService.scheduleStream(data);
  }

  @Get('schedules/user/:userId')
  async getUpcomingSchedules(@Param('userId', ParseIntPipe) userId: number) {
    return this.livestreamService.getUpcomingSchedules(userId);
  }
}
