import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { StreamProtocol } from '../entities/stream.entity';

export class CreateStreamDto {
  @IsInt()
  userId: number;

  @IsOptional()
  @IsInt()
  projectId?: number;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(StreamProtocol)
  protocol?: StreamProtocol;
}
