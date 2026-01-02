import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { PhaseTaskStatus } from '../entities/phase-task.entity';

export class UpdatePhaseTaskDto {
  @IsString()
  @IsOptional()
  @Length(1, 255)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(PhaseTaskStatus)
  @IsOptional()
  status?: PhaseTaskStatus;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
