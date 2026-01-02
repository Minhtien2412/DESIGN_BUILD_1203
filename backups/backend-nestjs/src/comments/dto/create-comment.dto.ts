import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  entityType: string;

  @IsNumber()
  entityId: number;

  @IsString()
  content: string;

  @IsNumber()
  userId: number;

  @IsOptional()
  @IsString()
  userName?: string;

  @IsOptional()
  @IsString()
  userAvatar?: string;

  @IsOptional()
  @IsNumber()
  parentId?: number;

  @IsOptional()
  @IsArray()
  mentions?: string[];
}
