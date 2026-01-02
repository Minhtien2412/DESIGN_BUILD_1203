import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreatePhaseDto {
  @IsInt()
  @IsNotEmpty()
  projectId: number;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Color must be a valid hex color (e.g., #4AA14A)' })
  color?: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  icon?: string;
}
