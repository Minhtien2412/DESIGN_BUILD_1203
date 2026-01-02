import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { StageStatus } from '../entities/stage.entity';

export class CreateStageDto {
  @IsString()
  projectId: string;

  @IsString()
  number: string;

  @IsString()
  label: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['upcoming', 'active', 'completed'])
  @IsOptional()
  status?: StageStatus;

  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}

export class UpdateStageDto {
  @IsString()
  @IsOptional()
  number?: string;

  @IsString()
  @IsOptional()
  label?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['upcoming', 'active', 'completed'])
  @IsOptional()
  status?: StageStatus;

  @IsNumber()
  @IsOptional()
  x?: number;

  @IsNumber()
  @IsOptional()
  y?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
