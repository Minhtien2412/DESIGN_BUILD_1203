import { IsDateString, IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';
import { PhaseStatus } from '../entities/phase.entity';

export class UpdatePhaseDto {
  @IsString()
  @IsOptional()
  @Length(1, 255)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(PhaseStatus)
  @IsOptional()
  status?: PhaseStatus;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Color must be a valid hex color (e.g., #4AA14A)' })
  color?: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  icon?: string;
}
