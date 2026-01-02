import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Stage } from './stage.entity';

export type TaskStatus = 'pending' | 'in-progress' | 'done' | 'late';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @Column({ nullable: true })
  stageId: string;

  @ManyToOne(() => Stage, (stage) => stage.tasks, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'stageId' })
  stage: Stage;

  @Column()
  label: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'in-progress', 'done', 'late'],
    default: 'pending',
  })
  status: TaskStatus;

  @Column({ type: 'int', default: 0 })
  progress: number; // 0-100

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  x: number; // Canvas position

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  y: number; // Canvas position

  @Column({ type: 'int', nullable: true })
  width: number;

  @Column({ type: 'int', nullable: true })
  height: number;

  @Column({ type: 'simple-array', nullable: true })
  assignedWorkers: string[]; // Worker IDs

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ type: 'simple-array', nullable: true })
  dependencies: string[]; // Task IDs

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'simple-array', nullable: true })
  photos: string[]; // URLs

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;
}
