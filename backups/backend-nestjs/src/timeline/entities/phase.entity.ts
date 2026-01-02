import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { PhaseTask } from './phase-task.entity';

export enum PhaseStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DELAYED = 'DELAYED',
  ON_HOLD = 'ON_HOLD',
}

@Entity('phases')
@Index(['projectId', 'order'])
export class Phase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  projectId: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PhaseStatus,
    default: PhaseStatus.NOT_STARTED,
  })
  status: PhaseStatus;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress: number;

  @Column({ length: 7, nullable: true })
  color: string;

  @Column({ length: 50, nullable: true })
  icon: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @OneToMany(() => PhaseTask, (task) => task.phase, { cascade: true })
  tasks: PhaseTask[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual field for delayed status
  get isDelayed(): boolean {
    const now = new Date();
    return (
      this.status !== PhaseStatus.COMPLETED &&
      this.endDate < now
    );
  }
}
