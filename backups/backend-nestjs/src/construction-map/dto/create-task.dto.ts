import { IsArray, IsDateString, IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { TaskStatus } from '../entities/task.entity';

export class CreateTaskDto {
  @IsString()
  projectId: string;

  @IsString()
  @IsOptional()
  stageId?: string;

  @IsString()
  label: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['pending', 'in-progress', 'done', 'late'])
  @IsOptional()
  status?: TaskStatus;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;

  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsNumber()
  @IsOptional()
  width?: number;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assignedWorkers?: string[];

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  dependencies?: string[];

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];
}
