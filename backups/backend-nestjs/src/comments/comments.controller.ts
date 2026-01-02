import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ReactionType } from './entities/comment-reaction.entity';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@Body() createDto: CreateCommentDto) {
    return this.commentsService.create(createDto);
  }

  @Get()
  findAll(
    @Query('entityType') entityType: string,
    @Query('entityId', ParseIntPipe) entityId: number,
  ) {
    return this.commentsService.findAll(entityType, entityId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.commentsService.remove(id);
  }

  @Post(':id/reactions')
  addReaction(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { userId: number; type: ReactionType },
  ) {
    return this.commentsService.addReaction(id, body.userId, body.type);
  }

  @Delete(':id/reactions/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeReaction(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    await this.commentsService.removeReaction(id, userId);
  }

  @Get(':id/reactions')
  getReactions(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.getReactions(id);
  }

  @Get('users/:userId')
  getCommentsByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.commentsService.getCommentsByUser(userId);
  }
}
