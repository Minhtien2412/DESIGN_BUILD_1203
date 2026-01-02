import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Task } from './task.entity';

export type StageStatus = 'upcoming' | 'active' | 'completed';

@Entity('stages')
export class Stage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @Column()
  number: string; // "01", "02", "03", "04"

  @Column()
  label: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['upcoming', 'active', 'completed'],
    default: 'upcoming',
  })
  status: StageStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  x: number; // Canvas position

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  y: number; // Canvas position

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @OneToMany(() => Task, (task) => task.stage)
  tasks: Task[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;
}
