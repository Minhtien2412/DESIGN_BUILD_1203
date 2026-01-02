import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('analytics_events')
@Index(['category', 'createdAt'])
@Index(['userId', 'createdAt'])
export class AnalyticsEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  category: string; // 'user_action', 'screen_view', 'error', 'performance', 'business_event'

  @Column()
  action: string; // 'button_click', 'form_submit', 'api_error', etc.

  @Column({ nullable: true })
  label: string; // Additional context

  @Column({ type: 'float', nullable: true })
  value: number; // Numeric value (e.g., duration, count)

  @Column({ type: 'jsonb', nullable: true })
  metadata: any; // Additional data

  @Column({ nullable: true })
  userId: number;

  @Column({ nullable: true })
  sessionId: string;

  @Column({ nullable: true })
  screen: string; // Current screen/page

  @Column({ nullable: true })
  platform: string; // 'ios', 'android', 'web'

  @Column({ nullable: true })
  appVersion: string;

  @CreateDateColumn()
  createdAt: Date;
}
