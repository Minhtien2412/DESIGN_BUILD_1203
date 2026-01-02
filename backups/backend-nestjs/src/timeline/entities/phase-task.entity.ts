import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Phase } from './phase.entity';

export enum PhaseTaskStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

@Entity('phase_tasks')
@Index(['phaseId'])
export class PhaseTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  phaseId: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PhaseTaskStatus,
    default: PhaseTaskStatus.NOT_STARTED,
  })
  status: PhaseTaskStatus;

  @Column({ nullable: true })
  assignedTo: number;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress: number;

  @ManyToOne(() => Phase, (phase) => phase.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'phaseId' })
  phase: Phase;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
