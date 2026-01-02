import { IsArray, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateMapStateDto {
  @IsNumber()
  @Min(0.1)
  @Max(5.0)
  @IsOptional()
  zoom?: number;

  @IsNumber()
  @IsOptional()
  offsetX?: number;

  @IsNumber()
  @IsOptional()
  offsetY?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  selectedTaskIds?: string[];
}
