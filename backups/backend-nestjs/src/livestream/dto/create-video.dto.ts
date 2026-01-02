import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateVideoDto {
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

  @IsString()
  originalFilename: string;

  @IsString()
  filePath: string;
}
