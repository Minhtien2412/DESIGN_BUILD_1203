import { IsBoolean, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { FileCategory } from '../entities/uploaded-file.entity';

export class UploadFileDto {
  @IsOptional()
  @IsEnum(FileCategory)
  category?: FileCategory;

  @IsOptional()
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsString()
  resourceType?: string;

  @IsOptional()
  @IsInt()
  resourceId?: number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  extractMetadata?: boolean; // Extract EXIF, GPS, etc.

  @IsOptional()
  @IsBoolean()
  createThumbnail?: boolean; // Generate thumbnail for images
}
