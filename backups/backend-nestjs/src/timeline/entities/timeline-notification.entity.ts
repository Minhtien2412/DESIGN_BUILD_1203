import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
} from 'typeorm';

export enum NotificationType {
  PROGRESS_UPDATE = 'PROGRESS_UPDATE',
  PHASE_DELAYED = 'PHASE_DELAYED',
  PHASE_COMPLETED = 'PHASE_COMPLETED',
  MILESTONE_REACHED = 'MILESTONE_REACHED',
}

@Entity('timeline_notifications')
@Index(['projectId', 'createdAt'])
export class TimelineNotification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  projectId: number;

  @Column({ nullable: true })
  phaseId: number;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
