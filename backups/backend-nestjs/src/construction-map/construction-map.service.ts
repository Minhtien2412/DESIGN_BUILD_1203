import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { CreateStageDto, UpdateStageDto } from './dto/create-stage.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateMapStateDto } from './dto/update-map-state.dto';
import { UpdateTaskDto, UpdateTaskPositionDto, UpdateTaskStatusDto } from './dto/update-task.dto';
import { Link } from './entities/link.entity';
import { MapState } from './entities/map-state.entity';
import { Stage } from './entities/stage.entity';
import { Task } from './entities/task.entity';

@Injectable()
export class ConstructionMapService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Stage)
    private stageRepository: Repository<Stage>,
    @InjectRepository(Link)
    private linkRepository: Repository<Link>,
    @InjectRepository(MapState)
    private mapStateRepository: Repository<MapState>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  // ==================== PROJECT ====================

  async getProject(projectId: string) {
    const cacheKey = `project:${projectId}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const [stages, tasks, links] = await Promise.all([
      this.stageRepository.find({ where: { projectId } }),
      this.taskRepository.find({ where: { projectId } }),
      this.linkRepository.find({ where: { projectId } }),
    ]);

    const project = {
      id: projectId,
      stages,
      tasks,
      links,
    };

    await this.cacheManager.set(cacheKey, project, 300); // Cache 5 minutes
    return project;
  }

  // ==================== TASKS ====================

  async createTask(createTaskDto: CreateTaskDto, userId?: string): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      createdBy: userId,
    });

    const saved = await this.taskRepository.save(task);
    await this.invalidateProjectCache(createTaskDto.projectId);
    
    return saved;
  }

  async getTasks(projectId: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { projectId },
      relations: ['stage'],
    });
  }

  async getTask(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['stage'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async updateTask(id: string, updateTaskDto: UpdateTaskDto, userId?: string): Promise<Task> {
    const task = await this.getTask(id);
    
    Object.assign(task, updateTaskDto);
    task.updatedBy = userId;

    const updated = await this.taskRepository.save(task);
    await this.invalidateProjectCache(task.projectId);
    
    return updated;
  }

  async updateTaskPosition(id: string, updatePositionDto: UpdateTaskPositionDto, userId?: string): Promise<Task> {
    const task = await this.getTask(id);
    
    task.x = updatePositionDto.x;
    task.y = updatePositionDto.y;
    task.updatedBy = userId;

    const updated = await this.taskRepository.save(task);
    await this.invalidateProjectCache(task.projectId);
    
    return updated;
  }

  async updateTaskStatus(id: string, updateStatusDto: UpdateTaskStatusDto, userId?: string): Promise<Task> {
    const task = await this.getTask(id);
    
    task.status = updateStatusDto.status;
    task.updatedBy = userId;

    const updated = await this.taskRepository.save(task);
    await this.invalidateProjectCache(task.projectId);
    
    return updated;
  }

  async deleteTask(id: string): Promise<void> {
    const task = await this.getTask(id);
    await this.taskRepository.remove(task);
    await this.invalidateProjectCache(task.projectId);
  }

  // ==================== STAGES ====================

  async createStage(createStageDto: CreateStageDto, userId?: string): Promise<Stage> {
    const stage = this.stageRepository.create({
      ...createStageDto,
      createdBy: userId,
    });

    const saved = await this.stageRepository.save(stage);
    await this.invalidateProjectCache(createStageDto.projectId);
    
    return saved;
  }

  async getStages(projectId: string): Promise<Stage[]> {
    return this.stageRepository.find({
      where: { projectId },
      relations: ['tasks'],
    });
  }

  async getStage(id: string): Promise<Stage> {
    const stage = await this.stageRepository.findOne({
      where: { id },
      relations: ['tasks'],
    });

    if (!stage) {
      throw new NotFoundException(`Stage with ID ${id} not found`);
    }

    return stage;
  }

  async updateStage(id: string, updateStageDto: UpdateStageDto, userId?: string): Promise<Stage> {
    const stage = await this.getStage(id);
    
    Object.assign(stage, updateStageDto);
    stage.updatedBy = userId;

    const updated = await this.stageRepository.save(stage);
    await this.invalidateProjectCache(stage.projectId);
    
    return updated;
  }

  async deleteStage(id: string): Promise<void> {
    const stage = await this.getStage(id);
    await this.stageRepository.remove(stage);
    await this.invalidateProjectCache(stage.projectId);
  }

  // ==================== MAP STATE ====================

  async getMapState(projectId: string): Promise<MapState> {
    let state = await this.mapStateRepository.findOne({
      where: { projectId },
    });

    if (!state) {
      // Create default state
      state = this.mapStateRepository.create({
        projectId,
        zoom: 1.0,
        offsetX: 0,
        offsetY: 0,
        selectedTaskIds: [],
        version: 1,
      });
      await this.mapStateRepository.save(state);
    }

    return state;
  }

  async updateMapState(projectId: string, updateStateDto: UpdateMapStateDto, userId?: string): Promise<MapState> {
    let state = await this.mapStateRepository.findOne({
      where: { projectId },
    });

    if (!state) {
      state = this.mapStateRepository.create({
        projectId,
        ...updateStateDto,
        lastModifiedBy: userId,
      });
    } else {
      Object.assign(state, updateStateDto);
      state.version += 1;
      state.lastModifiedBy = userId;
    }

    return this.mapStateRepository.save(state);
  }

  // ==================== HELPERS ====================

  private async invalidateProjectCache(projectId: string): Promise<void> {
    await this.cacheManager.del(`project:${projectId}`);
  }

  async getProjectProgress(projectId: string): Promise<{ overall: number; byStage: Record<string, number> }> {
    const tasks = await this.getTasks(projectId);
    
    if (tasks.length === 0) {
      return { overall: 0, byStage: {} };
    }

    const overall = tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length;
    
    const byStage: Record<string, number> = {};
    const tasksByStage = tasks.reduce((acc, task) => {
      if (task.stageId) {
        if (!acc[task.stageId]) acc[task.stageId] = [];
        acc[task.stageId].push(task);
      }
      return acc;
    }, {} as Record<string, Task[]>);

    for (const [stageId, stageTasks] of Object.entries(tasksByStage)) {
      byStage[stageId] = stageTasks.reduce((sum, task) => sum + task.progress, 0) / stageTasks.length;
    }

    return { overall, byStage };
  }

  // ==================== DEMO DATA SEEDING ====================

  async seedDemoData(projectId: string): Promise<{ message: string; data: any }> {
    // Clear existing data
    await this.taskRepository.delete({ projectId });
    await this.stageRepository.delete({ projectId });
    await this.linkRepository.delete({ projectId });

    // Create demo stages
    const stages = [
      {
        id: 'stage-1',
        projectId,
        number: '1',
        label: 'Móng & Nền',
        description: 'Xây dựng móng và nền công trình',
        x: 100,
        y: 100,
        color: '#3B82F6',
        status: 'completed' as const,
        order: 1,
      },
      {
        id: 'stage-2',
        projectId,
        number: '2',
        label: 'Kết cấu',
        description: 'Thi công kết cấu bê tông cốt thép',
        x: 400,
        y: 100,
        color: '#10B981',
        status: 'active' as const,
        order: 2,
      },
      {
        id: 'stage-3',
        projectId,
        number: '3',
        label: 'Hoàn thiện',
        description: 'Hoàn thiện nội ngoại thất',
        x: 700,
        y: 100,
        color: '#F59E0B',
        status: 'active' as const,
        order: 3,
      },
    ];

    const savedStages = await this.stageRepository.save(stages);

    // Create demo tasks
    const tasks = [
      // Stage 1 tasks
      {
        id: 'task-1',
        stageId: 'stage-1',
        projectId,
        label: 'Đào móng',
        description: 'Đào móng chiều sâu 2m',
        x: 150,
        y: 200,
        status: 'completed' as any,
        progress: 100,
        priority: 'high' as const,
      },
      {
        id: 'task-2',
        stageId: 'stage-1',
        projectId,
        label: 'Đổ bê tông móng',
        description: 'Đổ bê tông móng M200',
        x: 250,
        y: 200,
        status: 'completed' as any,
        progress: 100,
        priority: 'high' as const,
      },
      // Stage 2 tasks
      {
        id: 'task-3',
        stageId: 'stage-2',
        projectId,
        label: 'Dựng cột tầng 1',
        description: 'Thi công cột BTCT tầng 1',
        x: 450,
        y: 200,
        status: 'in-progress' as any,
        progress: 60,
        priority: 'high' as const,
      },
      {
        id: 'task-4',
        stageId: 'stage-2',
        projectId,
        label: 'Đổ sàn tầng 1',
        description: 'Đổ sàn BTCT tầng 1',
        x: 550,
        y: 200,
        status: 'pending' as any,
        progress: 0,
        priority: 'medium' as const,
      },
      // Stage 3 tasks
      {
        id: 'task-5',
        stageId: 'stage-3',
        projectId,
        label: 'Sơn tường',
        description: 'Sơn tường nội thất',
        x: 750,
        y: 200,
        status: 'pending' as any,
        progress: 0,
        priority: 'low' as const,
      },
      {
        id: 'task-6',
        stageId: 'stage-3',
        projectId,
        label: 'Lắp thiết bị',
        description: 'Lắp thiết bị điện nước',
        x: 850,
        y: 200,
        status: 'pending' as any,
        progress: 0,
        priority: 'medium' as const,
      },
    ];

    const savedTasks = await this.taskRepository.save(tasks);

    // Create demo links
    const links = [
      {
        id: 'link-1',
        projectId,
        sourceId: 'task-1',
        targetId: 'task-2',
        type: 'task-task' as any,
        label: 'Phụ thuộc',
      },
      {
        id: 'link-2',
        projectId,
        sourceId: 'task-2',
        targetId: 'task-3',
        type: 'task-task' as any,
        label: 'Phụ thuộc',
      },
      {
        id: 'link-3',
        projectId,
        sourceId: 'task-3',
        targetId: 'task-4',
        type: 'task-task' as any,
        label: 'Phụ thuộc',
      },
      {
        id: 'link-4',
        projectId,
        sourceId: 'task-4',
        targetId: 'task-5',
        type: 'task-task' as any,
        label: 'Phụ thuộc',
      },
    ];

    const savedLinks = await this.linkRepository.save(links);

    await this.invalidateProjectCache(projectId);

    return {
      message: `Demo data seeded successfully for project ${projectId}`,
      data: {
        stages: savedStages.length,
        tasks: savedTasks.length,
        links: savedLinks.length,
      },
    };
  }
}
