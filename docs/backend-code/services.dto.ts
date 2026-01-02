import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

// ==================== ENUMS ====================
export enum ServiceCategory {
  DESIGN = 'DESIGN',
  CONSTRUCTION = 'CONSTRUCTION',
  FINISHING = 'FINISHING',
  CONSULTING = 'CONSULTING',
  INSPECTION = 'INSPECTION',
  MAINTENANCE = 'MAINTENANCE',
}

export enum ServiceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
}

// ==================== CREATE DTO ====================
export class CreateServiceDto {
  @ApiProperty({ example: 'Thiết kế kiến trúc' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Thiết kế bản vẽ kiến trúc 2D/3D chuyên nghiệp' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: ServiceCategory, example: ServiceCategory.DESIGN })
  @IsEnum(ServiceCategory)
  category: ServiceCategory;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'm²' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiPropertyOptional({ example: '2-3 tháng' })
  @IsString()
  @IsOptional()
  duration?: string;

  @ApiPropertyOptional({ example: ['Bản vẽ 3D', 'File CAD', 'Tư vấn miễn phí'] })
  @IsArray()
  @IsOptional()
  features?: string[];

  @ApiPropertyOptional({ example: ['https://example.com/image1.jpg'] })
  @IsArray()
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({ enum: ServiceStatus, default: ServiceStatus.ACTIVE })
  @IsEnum(ServiceStatus)
  @IsOptional()
  status?: ServiceStatus;
}

// ==================== UPDATE DTO ====================
export class UpdateServiceDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: ServiceCategory })
  @IsEnum(ServiceCategory)
  @IsOptional()
  category?: ServiceCategory;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  duration?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  features?: string[];

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({ enum: ServiceStatus })
  @IsEnum(ServiceStatus)
  @IsOptional()
  status?: ServiceStatus;
}

// ==================== QUERY DTO ====================
export class ServiceQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ServiceCategory })
  @IsOptional()
  @IsEnum(ServiceCategory)
  category?: ServiceCategory;

  @ApiPropertyOptional({ enum: ServiceStatus })
  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;

  @ApiPropertyOptional({ default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ default: 'desc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
