import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ScheduledTask } from './scheduled-task.entity';

export enum ExecutionStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  RUNNING = 'running',
}

@Entity('task_executions')
export class TaskExecution {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  taskId: number;

  @ManyToOne(() => ScheduledTask, (task) => task.executions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'taskId' })
  task: ScheduledTask;

  @Column({ type: 'enum', enum: ExecutionStatus })
  status: ExecutionStatus;

  @Column({ type: 'timestamp' })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'int', nullable: true })
  duration: number; // milliseconds

  @Column({ type: 'text', nullable: true })
  result: string;

  @Column({ type: 'text', nullable: true })
  error: string;

  @CreateDateColumn()
  createdAt: Date;
}
