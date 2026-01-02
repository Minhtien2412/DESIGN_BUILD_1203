import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { TaskExecution } from './task-execution.entity';

export enum TaskScheduleType {
  ONCE = 'once',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

export enum TaskStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  DISABLED = 'disabled',
}

@Entity('scheduled_tasks')
export class ScheduledTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TaskScheduleType,
    default: TaskScheduleType.ONCE,
  })
  scheduleType: TaskScheduleType;

  @Column({ type: 'timestamp', nullable: true })
  scheduledDate: Date;

  @Column({ nullable: true })
  cronExpression: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.ACTIVE })
  status: TaskStatus;

  @Column()
  action: string; // e.g., 'send_reminder', 'generate_report', 'backup_data'

  @Column({ type: 'jsonb', nullable: true })
  parameters: any;

  @Column({ type: 'int', default: 0 })
  executionCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastExecutionAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextExecutionAt: Date;

  @OneToMany(() => TaskExecution, (execution) => execution.task)
  executions: TaskExecution[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
