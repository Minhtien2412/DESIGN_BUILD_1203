import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentReaction, ReactionType } from './entities/comment-reaction.entity';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(CommentReaction)
    private reactionsRepository: Repository<CommentReaction>,
  ) {}

  async create(createDto: CreateCommentDto): Promise<Comment> {
    const comment = this.commentsRepository.create(createDto);
    return this.commentsRepository.save(comment);
  }

  async findAll(entityType: string, entityId: number): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: {
        entityType,
        entityId,
        isDeleted: false,
      },
      relations: ['replies', 'reactions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['replies', 'reactions'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment #${id} not found`);
    }

    return comment;
  }

  async update(id: number, updateDto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.findOne(id);

    Object.assign(comment, updateDto);
    comment.isEdited = true;

    return this.commentsRepository.save(comment);
  }

  async remove(id: number): Promise<void> {
    const comment = await this.findOne(id);

    // Soft delete
    comment.isDeleted = true;
    comment.content = '[Comment deleted]';

    await this.commentsRepository.save(comment);
  }

  async addReaction(
    commentId: number,
    userId: number,
    type: ReactionType,
  ): Promise<CommentReaction> {
    // Check if user already reacted
    const existing = await this.reactionsRepository.findOne({
      where: { commentId, userId },
    });

    if (existing) {
      // Update reaction type
      existing.type = type;
      return this.reactionsRepository.save(existing);
    }

    // Create new reaction
    const reaction = this.reactionsRepository.create({
      commentId,
      userId,
      type,
    });

    const saved = await this.reactionsRepository.save(reaction);

    // Update likes count
    if (type === ReactionType.LIKE) {
      await this.commentsRepository.increment({ id: commentId }, 'likesCount', 1);
    }

    return saved;
  }

  async removeReaction(commentId: number, userId: number): Promise<void> {
    const reaction = await this.reactionsRepository.findOne({
      where: { commentId, userId },
    });

    if (reaction) {
      await this.reactionsRepository.remove(reaction);

      // Update likes count
      if (reaction.type === ReactionType.LIKE) {
        await this.commentsRepository.decrement({ id: commentId }, 'likesCount', 1);
      }
    }
  }

  async getReactions(commentId: number): Promise<CommentReaction[]> {
    return this.reactionsRepository.find({
      where: { commentId },
      order: { createdAt: 'DESC' },
    });
  }

  async getCommentsByUser(userId: number): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { userId, isDeleted: false },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }
}
