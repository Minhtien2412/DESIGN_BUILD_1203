import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum BackgroundTaskStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('background_tasks')
export class BackgroundTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string; // 'report_generation', 'data_export', etc.

  @Column({ type: 'enum', enum: BackgroundTaskStatus, default: BackgroundTaskStatus.PENDING })
  status: BackgroundTaskStatus;

  @Column({ type: 'int', default: 0 })
  progress: number; // 0-100

  @Column({ type: 'jsonb', nullable: true })
  parameters: any;

  @Column({ type: 'jsonb', nullable: true })
  result: any;

  @Column({ type: 'text', nullable: true })
  error: string;

  @Column({ nullable: true })
  userId: number;

  @Column({ nullable: true })
  projectId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;
}
