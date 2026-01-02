import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { CreatePhaseTaskDto } from './dto/create-phase-task.dto';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { ReorderPhasesDto } from './dto/reorder-phases.dto';
import { UpdatePhaseTaskDto } from './dto/update-phase-task.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { TimelineService } from './timeline.service';

@Controller('timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  /**
   * GET /timeline/projects/:projectId
   * Get project timeline (Gantt Chart data)
   */
  @Get('projects/:projectId')
  async getProjectTimeline(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.timelineService.getProjectTimeline(projectId);
  }

  /**
   * GET /timeline/projects/:projectId/check-delayed
   * Check delayed phases
   */
  @Get('projects/:projectId/check-delayed')
  async checkDelayedPhases(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.timelineService.getDelayedPhases(projectId);
  }

  /**
   * POST /timeline/phases
   * Create new phase
   */
  @Post('phases')
  async createPhase(@Body() dto: CreatePhaseDto) {
    return this.timelineService.createPhase(dto);
  }

  /**
   * GET /timeline/phases/:id
   * Get phase by ID
   */
  @Get('phases/:id')
  async getPhaseById(@Param('id', ParseIntPipe) id: number) {
    return this.timelineService.getPhaseById(id);
  }

  /**
   * PATCH /timeline/phases/:id
   * Update phase
   */
  @Patch('phases/:id')
  async updatePhase(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePhaseDto,
  ) {
    return this.timelineService.updatePhase(id, dto);
  }

  /**
   * DELETE /timeline/phases/:id
   * Delete phase
   */
  @Delete('phases/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePhase(@Param('id', ParseIntPipe) id: number) {
    await this.timelineService.deletePhase(id);
  }

  /**
   * PATCH /timeline/phases/reorder
   * Reorder phases (drag & drop)
   */
  @Patch('phases/reorder')
  async reorderPhases(
    @Query('projectId', ParseIntPipe) projectId: number,
    @Body() dto: ReorderPhasesDto,
  ) {
    return this.timelineService.reorderPhases(projectId, dto);
  }

  /**
   * PATCH /timeline/phases/:id/progress
   * Update phase progress
   */
  @Patch('phases/:id/progress')
  async updatePhaseProgress(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.timelineService.updatePhaseProgress(id, dto);
  }

  /**
   * POST /timeline/phases/:phaseId/tasks
   * Create task for phase
   */
  @Post('phases/:phaseId/tasks')
  async createPhaseTask(
    @Param('phaseId', ParseIntPipe) phaseId: number,
    @Body() dto: CreatePhaseTaskDto,
  ) {
    return this.timelineService.createPhaseTask(phaseId, dto);
  }

  /**
   * PATCH /timeline/tasks/:id
   * Update phase task
   */
  @Patch('tasks/:id')
  async updatePhaseTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePhaseTaskDto,
  ) {
    return this.timelineService.updatePhaseTask(id, dto);
  }

  /**
   * DELETE /timeline/tasks/:id
   * Delete phase task
   */
  @Delete('tasks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePhaseTask(@Param('id', ParseIntPipe) id: number) {
    await this.timelineService.deletePhaseTask(id);
  }

  /**
   * GET /timeline/projects/:projectId/notifications
   * Get project notifications
   */
  @Get('projects/:projectId/notifications')
  async getProjectNotifications(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query('limit') limit?: number,
  ) {
    return this.timelineService.getProjectNotifications(projectId, limit);
  }

  /**
   * PATCH /timeline/notifications/:id/read
   * Mark notification as read
   */
  @Patch('notifications/:id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markNotificationAsRead(@Param('id', ParseIntPipe) id: number) {
    await this.timelineService.markNotificationAsRead(id);
  }
}
