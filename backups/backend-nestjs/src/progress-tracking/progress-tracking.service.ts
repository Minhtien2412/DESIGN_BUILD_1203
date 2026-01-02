import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { Repository } from 'typeorm';
import { BackgroundTask, BackgroundTaskStatus } from './entities/background-task.entity';

@Injectable()
export class ProgressTrackingService {
  constructor(
    @InjectRepository(BackgroundTask)
    private tasksRepository: Repository<BackgroundTask>,
    @InjectQueue('progress-tracking')
    private progressQueue: Queue,
  ) {}

  async createBackgroundTask(
    type: string,
    parameters: any,
    userId?: number,
    projectId?: number,
  ): Promise<BackgroundTask> {
    const task = this.tasksRepository.create({
      type,
      parameters,
      userId,
      projectId,
      status: BackgroundTaskStatus.PENDING,
      progress: 0,
    });

    const savedTask = await this.tasksRepository.save(task);

    // Add to Bull queue
    await this.progressQueue.add(type, {
      taskId: savedTask.id,
      parameters,
    });

    return savedTask;
  }

  async getTaskStatus(id: number): Promise<BackgroundTask> {
    return this.tasksRepository.findOne({ where: { id } });
  }

  async updateTaskProgress(
    id: number,
    progress: number,
    status?: BackgroundTaskStatus,
  ): Promise<BackgroundTask> {
    const task = await this.getTaskStatus(id);
    
    task.progress = Math.min(100, Math.max(0, progress));
    if (status) {
      task.status = status;
    }

    if (progress >= 100) {
      task.status = BackgroundTaskStatus.COMPLETED;
      task.completedAt = new Date();
    }

    return this.tasksRepository.save(task);
  }

  async completeTask(id: number, result: any): Promise<BackgroundTask> {
    const task = await this.getTaskStatus(id);
    
    task.status = BackgroundTaskStatus.COMPLETED;
    task.progress = 100;
    task.result = result;
    task.completedAt = new Date();

    return this.tasksRepository.save(task);
  }

  async failTask(id: number, error: string): Promise<BackgroundTask> {
    const task = await this.getTaskStatus(id);
    
    task.status = BackgroundTaskStatus.FAILED;
    task.error = error;
    task.completedAt = new Date();

    return this.tasksRepository.save(task);
  }

  async getUserTasks(userId: number): Promise<BackgroundTask[]> {
    return this.tasksRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getProjectTasks(projectId: number): Promise<BackgroundTask[]> {
    return this.tasksRepository.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
    });
  }
}
