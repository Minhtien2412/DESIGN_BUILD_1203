import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreatePhaseTaskDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  assignedTo?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
