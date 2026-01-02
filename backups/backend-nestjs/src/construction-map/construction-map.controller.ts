import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Put
} from '@nestjs/common';
import { ConstructionMapService } from './construction-map.service';
import { CreateStageDto, UpdateStageDto } from './dto/create-stage.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateMapStateDto } from './dto/update-map-state.dto';
import { UpdateTaskDto, UpdateTaskPositionDto, UpdateTaskStatusDto } from './dto/update-task.dto';

@Controller('construction-map')
export class ConstructionMapController {
  constructor(private readonly service: ConstructionMapService) {}

  // ==================== PROJECT ====================

  @Get(':projectId')
  async getProject(@Param('projectId') projectId: string) {
    return this.service.getProject(projectId);
  }

  @Get(':projectId/progress')
  async getProjectProgress(@Param('projectId') projectId: string) {
    return this.service.getProjectProgress(projectId);
  }

  // ==================== TASKS ====================

  @Get(':projectId/tasks')
  async getTasks(@Param('projectId') projectId: string) {
    return this.service.getTasks(projectId);
  }

  @Get('tasks/:id')
  async getTask(@Param('id') id: string) {
    return this.service.getTask(id);
  }

  @Post('tasks')
  @HttpCode(HttpStatus.CREATED)
  async createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.service.createTask(createTaskDto);
  }

  @Put('tasks/:id')
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.service.updateTask(id, updateTaskDto);
  }

  @Patch('tasks/:id/position')
  async updateTaskPosition(
    @Param('id') id: string,
    @Body() updatePositionDto: UpdateTaskPositionDto,
  ) {
    return this.service.updateTaskPosition(id, updatePositionDto);
  }

  @Patch('tasks/:id/status')
  async updateTaskStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateTaskStatusDto,
  ) {
    return this.service.updateTaskStatus(id, updateStatusDto);
  }

  @Delete('tasks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTask(@Param('id') id: string) {
    await this.service.deleteTask(id);
  }

  // ==================== STAGES ====================

  @Get(':projectId/stages')
  async getStages(@Param('projectId') projectId: string) {
    return this.service.getStages(projectId);
  }

  @Get('stages/:id')
  async getStage(@Param('id') id: string) {
    return this.service.getStage(id);
  }

  @Post('stages')
  @HttpCode(HttpStatus.CREATED)
  async createStage(@Body() createStageDto: CreateStageDto) {
    return this.service.createStage(createStageDto);
  }

  @Put('stages/:id')
  async updateStage(
    @Param('id') id: string,
    @Body() updateStageDto: UpdateStageDto,
  ) {
    return this.service.updateStage(id, updateStageDto);
  }

  @Delete('stages/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteStage(@Param('id') id: string) {
    await this.service.deleteStage(id);
  }

  // ==================== MAP STATE ====================

  @Get(':projectId/state')
  async getMapState(@Param('projectId') projectId: string) {
    return this.service.getMapState(projectId);
  }

  @Put(':projectId/state')
  async updateMapState(
    @Param('projectId') projectId: string,
    @Body() updateStateDto: UpdateMapStateDto,
  ) {
    return this.service.updateMapState(projectId, updateStateDto);
  }

  // ==================== DEMO DATA ====================

  @Post(':projectId/seed-demo')
  @HttpCode(HttpStatus.OK)
  async seedDemoData(@Param('projectId') projectId: string) {
    return this.service.seedDemoData(projectId);
  }

  // ==================== HEALTH CHECK ====================

  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
