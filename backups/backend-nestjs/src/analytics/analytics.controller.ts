import {
    Body,
    Controller,
    Get,
    ParseIntPipe,
    Post,
    Query,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { TrackEventDto } from './dto/track-event.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track')
  trackEvent(@Body() dto: TrackEventDto) {
    return this.analyticsService.trackEvent(dto);
  }

  @Post('track-batch')
  trackBatch(@Body() events: TrackEventDto[]) {
    return this.analyticsService.trackBatch(events);
  }

  @Get('summary')
  getSummary(
    @Query('userId', ParseIntPipe) userId?: number,
    @Query('days', ParseIntPipe) days?: number,
  ) {
    return this.analyticsService.getSummary(userId, days || 30);
  }

  @Get('user-flow')
  getUserFlow(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('sessionId') sessionId?: string,
  ) {
    return this.analyticsService.getUserFlow(userId, sessionId);
  }

  @Get('top-features')
  getTopFeatures(
    @Query('days', ParseIntPipe) days?: number,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    return this.analyticsService.getTopFeatures(days || 30, limit || 10);
  }

  @Get('performance')
  getPerformanceMetrics(@Query('days', ParseIntPipe) days?: number) {
    return this.analyticsService.getPerformanceMetrics(days || 7);
  }

  @Get('errors')
  getErrorStats(@Query('days', ParseIntPipe) days?: number) {
    return this.analyticsService.getErrorStats(days || 7);
  }

  @Get('active-users')
  getActiveUsers(@Query('days', ParseIntPipe) days?: number) {
    return this.analyticsService.getActiveUsers(days || 30);
  }
}
