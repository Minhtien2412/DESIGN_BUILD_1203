import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post
} from '@nestjs/common';
import { ProgressTrackingService } from './progress-tracking.service';

@Controller('progress-tracking')
export class ProgressTrackingController {
  constructor(private readonly progressService: ProgressTrackingService) {}

  @Post('background-tasks')
  async createTask(
    @Body() body: { type: string; parameters?: any; userId?: number; projectId?: number },
  ) {
    return this.progressService.createBackgroundTask(
      body.type,
      body.parameters || {},
      body.userId,
      body.projectId,
    );
  }

  @Get('background-tasks/:id')
  getTaskStatus(@Param('id', ParseIntPipe) id: number) {
    return this.progressService.getTaskStatus(id);
  }

  @Get('users/:userId/tasks')
  getUserTasks(@Param('userId', ParseIntPipe) userId: number) {
    return this.progressService.getUserTasks(userId);
  }

  @Get('projects/:projectId/tasks')
  getProjectTasks(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.progressService.getProjectTasks(projectId);
  }
}
