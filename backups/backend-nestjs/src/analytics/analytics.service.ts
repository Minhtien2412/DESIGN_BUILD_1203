import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrackEventDto } from './dto/track-event.dto';
import { AnalyticsEvent } from './entities/analytics-event.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEvent)
    private eventsRepository: Repository<AnalyticsEvent>,
  ) {}

  async trackEvent(dto: TrackEventDto): Promise<AnalyticsEvent> {
    const event = this.eventsRepository.create(dto);
    return this.eventsRepository.save(event);
  }

  async trackBatch(events: TrackEventDto[]): Promise<AnalyticsEvent[]> {
    const entities = events.map((dto) => this.eventsRepository.create(dto));
    return this.eventsRepository.save(entities);
  }

  async getSummary(userId?: number, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const queryBuilder = this.eventsRepository.createQueryBuilder('event');

    if (userId) {
      queryBuilder.where('event.userId = :userId', { userId });
    }

    queryBuilder.andWhere('event.createdAt >= :startDate', { startDate });

    const totalEvents = await queryBuilder.getCount();

    const eventsByCategory = await queryBuilder
      .select('event.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('event.category')
      .getRawMany();

    const eventsByAction = await queryBuilder
      .select('event.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('event.action')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      totalEvents,
      period: `Last ${days} days`,
      eventsByCategory,
      topActions: eventsByAction,
    };
  }

  async getUserFlow(userId: number, sessionId?: string) {
    const query: any = { userId };
    if (sessionId) {
      query.sessionId = sessionId;
    }

    const events = await this.eventsRepository.find({
      where: query,
      order: { createdAt: 'ASC' },
      take: 100,
    });

    return {
      userId,
      sessionId,
      totalEvents: events.length,
      flow: events.map((e) => ({
        screen: e.screen,
        action: e.action,
        timestamp: e.createdAt,
      })),
    };
  }

  async getTopFeatures(days: number = 30, limit: number = 10) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const topFeatures = await this.eventsRepository
      .createQueryBuilder('event')
      .select('event.action', 'feature')
      .addSelect('event.screen', 'screen')
      .addSelect('COUNT(*)', 'count')
      .where('event.createdAt >= :startDate', { startDate })
      .andWhere("event.category = 'user_action'")
      .groupBy('event.action')
      .addGroupBy('event.screen')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    return topFeatures;
  }

  async getPerformanceMetrics(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await this.eventsRepository
      .createQueryBuilder('event')
      .select('event.action', 'metric')
      .addSelect('AVG(event.value)', 'average')
      .addSelect('MIN(event.value)', 'min')
      .addSelect('MAX(event.value)', 'max')
      .where('event.createdAt >= :startDate', { startDate })
      .andWhere("event.category = 'performance'")
      .andWhere('event.value IS NOT NULL')
      .groupBy('event.action')
      .getRawMany();

    return metrics;
  }

  async getErrorStats(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const errors = await this.eventsRepository
      .createQueryBuilder('event')
      .select('event.action', 'errorType')
      .addSelect('event.label', 'errorMessage')
      .addSelect('COUNT(*)', 'count')
      .where('event.createdAt >= :startDate', { startDate })
      .andWhere("event.category = 'error'")
      .groupBy('event.action')
      .addGroupBy('event.label')
      .orderBy('count', 'DESC')
      .limit(20)
      .getRawMany();

    const totalErrors = errors.reduce((sum, e) => sum + parseInt(e.count), 0);

    return {
      totalErrors,
      period: `Last ${days} days`,
      topErrors: errors,
    };
  }

  async getActiveUsers(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activeUsers = await this.eventsRepository
      .createQueryBuilder('event')
      .select('COUNT(DISTINCT event.userId)', 'count')
      .where('event.createdAt >= :startDate', { startDate })
      .andWhere('event.userId IS NOT NULL')
      .getRawOne();

    return {
      period: `Last ${days} days`,
      activeUsers: parseInt(activeUsers.count) || 0,
    };
  }
}
