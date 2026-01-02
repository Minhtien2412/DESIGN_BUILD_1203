import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('stream_schedules')
@Index(['userId'])
@Index(['scheduledTime'])
export class StreamSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ nullable: true })
  projectId: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp' })
  scheduledTime: Date;

  @Column({ default: false })
  notificationSent: boolean;

  @Column({ nullable: true })
  streamId: number; // Linked to actual stream when it goes live

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
