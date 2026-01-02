import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

// Enums matching Prisma schema
export enum UtilityType {
  CALCULATOR = 'CALCULATOR', // Công cụ tính toán
  AI = 'AI',                 // Trí tuệ nhân tạo
  MEDIA = 'MEDIA',           // Đa phương tiện
  DOCUMENT = 'DOCUMENT',     // Tài liệu
  TOOL = 'TOOL',             // Công cụ khác
}

export class CreateUtilityDto {
  @ApiProperty({
    example: 'Tính toán vật liệu',
    description: 'Tên tiện ích',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Công cụ tính toán lượng vật liệu cần thiết cho công trình',
    description: 'Mô tả tiện ích',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    enum: UtilityType,
    example: UtilityType.CALCULATOR,
    description: 'Loại tiện ích',
  })
  @IsEnum(UtilityType)
  type: UtilityType;

  @ApiProperty({
    example: 'calculator-outline',
    description: 'Tên icon (Ionicons)',
  })
  @IsString()
  @IsNotEmpty()
  icon: string;

  @ApiProperty({
    example: '#3B82F6',
    description: 'Màu sắc (hex)',
  })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({
    example: '/utilities/material-calculator',
    description: 'Route trong ứng dụng',
  })
  @IsString()
  @IsNotEmpty()
  route: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Trạng thái kích hoạt',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}

export class UpdateUtilityDto extends PartialType(CreateUtilityDto) {}

export class UtilityQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Số trang',
    default: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'Số lượng mỗi trang',
    default: 20,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    example: 'tính toán',
    description: 'Tìm kiếm theo tên hoặc mô tả',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    enum: UtilityType,
    example: UtilityType.CALCULATOR,
    description: 'Lọc theo loại tiện ích',
  })
  @IsEnum(UtilityType)
  @IsOptional()
  type?: UtilityType;

  @ApiPropertyOptional({
    example: true,
    description: 'Lọc theo trạng thái kích hoạt',
  })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiPropertyOptional({
    example: 'createdAt',
    description: 'Trường sắp xếp',
    default: 'createdAt',
  })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({
    example: 'desc',
    description: 'Thứ tự sắp xếp',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}
