import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { CommentReaction } from './comment-reaction.entity';

@Entity('comments')
@Index(['entityType', 'entityId'])
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  entityType: string; // 'project', 'task', 'timeline', etc.

  @Column()
  entityId: number; // ID of the entity being commented on

  @Column({ type: 'text' })
  content: string;

  @Column()
  userId: number;

  @Column({ nullable: true })
  userName: string;

  @Column({ nullable: true })
  userAvatar: string;

  @Column({ nullable: true })
  parentId: number; // For nested/threaded comments

  @ManyToOne(() => Comment, (comment) => comment.replies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies: Comment[];

  @OneToMany(() => CommentReaction, (reaction) => reaction.comment)
  reactions: CommentReaction[];

  @Column({ type: 'int', default: 0 })
  likesCount: number;

  @Column({ type: 'boolean', default: false })
  isEdited: boolean;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ type: 'jsonb', nullable: true })
  mentions: string[]; // Array of @mentioned usernames

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
