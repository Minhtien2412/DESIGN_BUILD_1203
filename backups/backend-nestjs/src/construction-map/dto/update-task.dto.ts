import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsOptional } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}

export class UpdateTaskPositionDto {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;
}

export class UpdateTaskStatusDto {
  @IsOptional()
  status: 'pending' | 'in-progress' | 'done' | 'late';
}

export class UpdateTaskProgressDto {
  @IsNumber()
  progress: number;
}
