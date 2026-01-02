import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Comment } from './comment.entity';

export enum ReactionType {
  LIKE = 'like',
  LOVE = 'love',
  LAUGH = 'laugh',
  WOW = 'wow',
  SAD = 'sad',
  ANGRY = 'angry',
}

@Entity('comment_reactions')
@Index(['commentId', 'userId'], { unique: true })
export class CommentReaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  commentId: number;

  @ManyToOne(() => Comment, (comment) => comment.reactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'commentId' })
  comment: Comment;

  @Column()
  userId: number;

  @Column({ type: 'enum', enum: ReactionType })
  type: ReactionType;

  @CreateDateColumn()
  createdAt: Date;
}
