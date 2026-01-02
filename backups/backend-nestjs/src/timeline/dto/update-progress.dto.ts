import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateProgressDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  progress: number;

  @IsString()
  @IsOptional()
  note?: string;
}
