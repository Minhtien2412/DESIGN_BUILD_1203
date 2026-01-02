import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Not, Repository } from 'typeorm';
import { CreatePhaseTaskDto } from './dto/create-phase-task.dto';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { ReorderPhasesDto } from './dto/reorder-phases.dto';
import { UpdatePhaseTaskDto } from './dto/update-phase-task.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { PhaseTask } from './entities/phase-task.entity';
import { Phase, PhaseStatus } from './entities/phase.entity';
import { NotificationType, TimelineNotification } from './entities/timeline-notification.entity';

@Injectable()
export class TimelineService {
  constructor(
    @InjectRepository(Phase)
    private phaseRepository: Repository<Phase>,
    @InjectRepository(PhaseTask)
    private phaseTaskRepository: Repository<PhaseTask>,
    @InjectRepository(TimelineNotification)
    private notificationRepository: Repository<TimelineNotification>,
  ) {}

  /**
   * Get project timeline with all phases
   */
  async getProjectTimeline(projectId: number) {
    const phases = await this.phaseRepository.find({
      where: { projectId },
      relations: ['tasks'],
      order: { order: 'ASC' },
    });

    const delayedPhases = await this.getDelayedPhases(projectId);
    const totalProgress = this.calculateTotalProgress(phases);

    return {
      projectId,
      phases,
      totalProgress,
      delayedPhases,
      criticalPath: this.calculateCriticalPath(phases),
    };
  }

  /**
   * Check for delayed phases
   */
  async getDelayedPhases(projectId: number): Promise<Phase[]> {
    const now = new Date();
    return this.phaseRepository.find({
      where: {
        projectId,
        status: Not(PhaseStatus.COMPLETED),
        endDate: LessThan(now),
      },
      order: { endDate: 'ASC' },
    });
  }

  /**
   * Create new phase
   */
  async createPhase(dto: CreatePhaseDto): Promise<Phase> {
    // Validate dates
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Get max order for this project
    const maxOrder = await this.phaseRepository
      .createQueryBuilder('phase')
      .select('MAX(phase.order)', 'max')
      .where('phase.projectId = :projectId', { projectId: dto.projectId })
      .getRawOne();

    const phase = this.phaseRepository.create({
      ...dto,
      startDate,
      endDate,
      order: (maxOrder?.max || 0) + 1,
    });

    return this.phaseRepository.save(phase);
  }

  /**
   * Get phase by ID
   */
  async getPhaseById(id: number): Promise<Phase> {
    const phase = await this.phaseRepository.findOne({
      where: { id },
      relations: ['tasks'],
    });

    if (!phase) {
      throw new NotFoundException(`Phase with ID ${id} not found`);
    }

    return phase;
  }

  /**
   * Update phase
   */
  async updatePhase(id: number, dto: UpdatePhaseDto): Promise<Phase> {
    const phase = await this.getPhaseById(id);

    // Validate dates if provided
    if (dto.startDate && dto.endDate) {
      const startDate = new Date(dto.startDate);
      const endDate = new Date(dto.endDate);

      if (endDate <= startDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    // Update phase
    Object.assign(phase, {
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : phase.startDate,
      endDate: dto.endDate ? new Date(dto.endDate) : phase.endDate,
    });

    const updated = await this.phaseRepository.save(phase);

    // Check if phase is now completed
    if (dto.status === PhaseStatus.COMPLETED && phase.status !== PhaseStatus.COMPLETED) {
      await this.createNotification({
        projectId: phase.projectId,
        phaseId: phase.id,
        type: NotificationType.PHASE_COMPLETED,
        title: 'Phase Completed',
        message: `Phase "${phase.name}" has been completed`,
      });
    }

    return updated;
  }

  /**
   * Delete phase
   */
  async deletePhase(id: number): Promise<void> {
    const phase = await this.getPhaseById(id);
    await this.phaseRepository.remove(phase);
  }

  /**
   * Reorder phases (drag & drop)
   */
  async reorderPhases(projectId: number, dto: ReorderPhasesDto): Promise<Phase[]> {
    // Update all phase orders
    for (const { id, order } of dto.phaseOrders) {
      await this.phaseRepository.update({ id, projectId }, { order });
    }

    // Return updated phases
    return this.phaseRepository.find({
      where: { projectId },
      order: { order: 'ASC' },
    });
  }

  /**
   * Update phase progress
   */
  async updatePhaseProgress(id: number, dto: UpdateProgressDto): Promise<Phase> {
    const phase = await this.getPhaseById(id);

    phase.progress = dto.progress;

    // Auto-update status based on progress
    if (dto.progress === 0 && phase.status === PhaseStatus.NOT_STARTED) {
      // Keep NOT_STARTED
    } else if (dto.progress > 0 && dto.progress < 100) {
      phase.status = PhaseStatus.IN_PROGRESS;
    } else if (dto.progress === 100) {
      phase.status = PhaseStatus.COMPLETED;
    }

    const updated = await this.phaseRepository.save(phase);

    // Create notification
    await this.createNotification({
      projectId: phase.projectId,
      phaseId: phase.id,
      type: NotificationType.PROGRESS_UPDATE,
      title: 'Progress Updated',
      message: `Phase "${phase.name}" is now ${dto.progress}% complete${dto.note ? ': ' + dto.note : ''}`,
    });

    return updated;
  }

  /**
   * Create phase task
   */
  async createPhaseTask(phaseId: number, dto: CreatePhaseTaskDto): Promise<PhaseTask> {
    const phase = await this.getPhaseById(phaseId);

    const task = this.phaseTaskRepository.create({
      ...dto,
      phaseId,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
    });

    return this.phaseTaskRepository.save(task);
  }

  /**
   * Update phase task
   */
  async updatePhaseTask(id: number, dto: UpdatePhaseTaskDto): Promise<PhaseTask> {
    const task = await this.phaseTaskRepository.findOne({
      where: { id },
      relations: ['phase'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Update task
    Object.assign(task, {
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : task.startDate,
      endDate: dto.endDate ? new Date(dto.endDate) : task.endDate,
    });

    const updated = await this.phaseTaskRepository.save(task);

    // Recalculate phase progress based on tasks
    await this.recalculatePhaseProgress(task.phaseId);

    return updated;
  }

  /**
   * Delete phase task
   */
  async deletePhaseTask(id: number): Promise<void> {
    const task = await this.phaseTaskRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    const phaseId = task.phaseId;
    await this.phaseTaskRepository.remove(task);

    // Recalculate phase progress
    await this.recalculatePhaseProgress(phaseId);
  }

  /**
   * Get project notifications
   */
  async getProjectNotifications(
    projectId: number,
    limit: number = 20,
  ): Promise<TimelineNotification[]> {
    return this.notificationRepository.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(id: number): Promise<void> {
    await this.notificationRepository.update(id, { isRead: true });
  }

  // ==================== PRIVATE HELPERS ====================

  private calculateTotalProgress(phases: Phase[]): number {
    if (phases.length === 0) return 0;

    const total = phases.reduce((sum, phase) => sum + Number(phase.progress), 0);
    return Math.round(total / phases.length);
  }

  private calculateCriticalPath(phases: Phase[]): Phase[] {
    // Simple critical path: phases that are delayed or have highest priority
    return phases
      .filter((p) => p.isDelayed || p.status === PhaseStatus.IN_PROGRESS)
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
      .slice(0, 3);
  }

  private async recalculatePhaseProgress(phaseId: number): Promise<void> {
    const tasks = await this.phaseTaskRepository.find({ where: { phaseId } });

    if (tasks.length === 0) return;

    const totalProgress = tasks.reduce((sum, task) => sum + Number(task.progress), 0);
    const averageProgress = Math.round(totalProgress / tasks.length);

    await this.phaseRepository.update(phaseId, { progress: averageProgress });
  }

  private async createNotification(data: {
    projectId: number;
    phaseId?: number;
    type: NotificationType;
    title: string;
    message: string;
  }): Promise<TimelineNotification> {
    const notification = this.notificationRepository.create(data);
    return this.notificationRepository.save(notification);
  }
}
