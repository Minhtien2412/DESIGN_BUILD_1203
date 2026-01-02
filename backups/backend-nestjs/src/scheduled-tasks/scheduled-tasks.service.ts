import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CronJob } from 'cron';
import { LessThan, Repository } from 'typeorm';
import { CreateScheduledTaskDto } from './dto/create-scheduled-task.dto';
import { UpdateScheduledTaskDto } from './dto/update-scheduled-task.dto';
import {
    ScheduledTask,
    TaskScheduleType,
    TaskStatus,
} from './entities/scheduled-task.entity';
import {
    ExecutionStatus,
    TaskExecution,
} from './entities/task-execution.entity';

@Injectable()
export class ScheduledTasksService {
  constructor(
    @InjectRepository(ScheduledTask)
    private tasksRepository: Repository<ScheduledTask>,
    @InjectRepository(TaskExecution)
    private executionsRepository: Repository<TaskExecution>,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async onModuleInit() {
    // Load and register all active scheduled tasks on startup
    await this.loadScheduledTasks();
  }

  private async loadScheduledTasks() {
    const activeTasks = await this.tasksRepository.find({
      where: { status: TaskStatus.ACTIVE },
    });

    for (const task of activeTasks) {
      await this.registerCronJob(task);
    }
  }

  async create(createDto: CreateScheduledTaskDto): Promise<ScheduledTask> {
    const task = this.tasksRepository.create(createDto);

    // Calculate next execution time
    task.nextExecutionAt = this.calculateNextExecution(
      task.scheduleType,
      task.scheduledDate,
      task.cronExpression,
    );

    const savedTask = await this.tasksRepository.save(task);

    // Register cron job if active
    if (savedTask.status === TaskStatus.ACTIVE) {
      await this.registerCronJob(savedTask);
    }

    return savedTask;
  }

  async findAll(): Promise<ScheduledTask[]> {
    return this.tasksRepository.find({
      relations: ['executions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<ScheduledTask> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['executions'],
    });

    if (!task) {
      throw new NotFoundException(`Scheduled task #${id} not found`);
    }

    return task;
  }

  async update(
    id: number,
    updateDto: UpdateScheduledTaskDto,
  ): Promise<ScheduledTask> {
    const task = await this.findOne(id);

    // Update task
    Object.assign(task, updateDto);

    // Recalculate next execution if schedule changed
    if (
      updateDto.scheduleType ||
      updateDto.scheduledDate ||
      updateDto.cronExpression
    ) {
      task.nextExecutionAt = this.calculateNextExecution(
        task.scheduleType,
        task.scheduledDate,
        task.cronExpression,
      );
    }

    const savedTask = await this.tasksRepository.save(task);

    // Re-register cron job
    await this.unregisterCronJob(id);
    if (savedTask.status === TaskStatus.ACTIVE) {
      await this.registerCronJob(savedTask);
    }

    return savedTask;
  }

  async remove(id: number): Promise<void> {
    const task = await this.findOne(id);
    await this.unregisterCronJob(id);
    await this.tasksRepository.remove(task);
  }

  async toggle(id: number): Promise<ScheduledTask> {
    const task = await this.findOne(id);

    if (task.status === TaskStatus.ACTIVE) {
      task.status = TaskStatus.PAUSED;
      await this.unregisterCronJob(id);
    } else {
      task.status = TaskStatus.ACTIVE;
      await this.registerCronJob(task);
    }

    return this.tasksRepository.save(task);
  }

  async runNow(id: number): Promise<TaskExecution> {
    const task = await this.findOne(id);
    return this.executeTask(task);
  }

  private async registerCronJob(task: ScheduledTask) {
    try {
      const cronExpression = this.getCronExpression(task);
      if (!cronExpression) return;

      const job = new CronJob(cronExpression, async () => {
        await this.executeTask(task);
      });

      this.schedulerRegistry.addCronJob(`task_${task.id}`, job as any);
      job.start();
    } catch (error) {
      console.error(`Failed to register cron job for task #${task.id}:`, error);
    }
  }

  private async unregisterCronJob(id: number) {
    try {
      const jobName = `task_${id}`;
      if (this.schedulerRegistry.doesExist('cron', jobName)) {
        this.schedulerRegistry.deleteCronJob(jobName);
      }
    } catch (error) {
      console.error(`Failed to unregister cron job for task #${id}:`, error);
    }
  }

  private getCronExpression(task: ScheduledTask): string | null {
    switch (task.scheduleType) {
      case TaskScheduleType.DAILY:
        return '0 0 * * *'; // Every day at midnight
      case TaskScheduleType.WEEKLY:
        return '0 0 * * 0'; // Every Sunday at midnight
      case TaskScheduleType.MONTHLY:
        return '0 0 1 * *'; // First day of month at midnight
      case TaskScheduleType.CUSTOM:
        return task.cronExpression;
      case TaskScheduleType.ONCE:
        return null; // One-time tasks handled differently
      default:
        return null;
    }
  }

  private calculateNextExecution(
    scheduleType: TaskScheduleType,
    scheduledDate: Date,
    cronExpression: string,
  ): Date {
    const now = new Date();

    switch (scheduleType) {
      case TaskScheduleType.ONCE:
        return scheduledDate || now;

      case TaskScheduleType.DAILY:
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow;

      case TaskScheduleType.WEEKLY:
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + (7 - nextWeek.getDay()));
        nextWeek.setHours(0, 0, 0, 0);
        return nextWeek;

      case TaskScheduleType.MONTHLY:
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setDate(1);
        nextMonth.setHours(0, 0, 0, 0);
        return nextMonth;

      default:
        return now;
    }
  }

  private async executeTask(task: ScheduledTask): Promise<TaskExecution> {
    const execution = this.executionsRepository.create({
      taskId: task.id,
      status: ExecutionStatus.RUNNING,
      startedAt: new Date(),
    });

    await this.executionsRepository.save(execution);

    try {
      // Execute the task action
      const result = await this.performAction(task.action, task.parameters);

      execution.status = ExecutionStatus.SUCCESS;
      execution.completedAt = new Date();
      execution.duration =
        execution.completedAt.getTime() - execution.startedAt.getTime();
      execution.result = JSON.stringify(result);

      // Update task
      task.executionCount++;
      task.lastExecutionAt = new Date();
      task.nextExecutionAt = this.calculateNextExecution(
        task.scheduleType,
        task.scheduledDate,
        task.cronExpression,
      );

      await this.tasksRepository.save(task);
    } catch (error) {
      execution.status = ExecutionStatus.FAILED;
      execution.completedAt = new Date();
      execution.duration =
        execution.completedAt.getTime() - execution.startedAt.getTime();
      execution.error = error.message;
    }

    return this.executionsRepository.save(execution);
  }

  private async performAction(action: string, parameters: any): Promise<any> {
    // This is where you implement actual task actions
    // You can inject services and call their methods based on action type

    switch (action) {
      case 'send_reminder':
        return this.sendReminder(parameters);
      case 'generate_report':
        return this.generateReport(parameters);
      case 'backup_data':
        return this.backupData(parameters);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async sendReminder(parameters: any): Promise<any> {
    // TODO: Implement reminder logic
    console.log('Sending reminder:', parameters);
    return { success: true, message: 'Reminder sent' };
  }

  private async generateReport(parameters: any): Promise<any> {
    // TODO: Implement report generation
    console.log('Generating report:', parameters);
    return { success: true, report: 'generated' };
  }

  private async backupData(parameters: any): Promise<any> {
    // TODO: Implement backup logic
    console.log('Backing up data:', parameters);
    return { success: true, backup: 'completed' };
  }

  // Cleanup old executions (run daily)
  @Cron('0 0 * * *')
  async cleanupOldExecutions() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await this.executionsRepository.delete({
      createdAt: LessThan(thirtyDaysAgo),
    });
  }
}
