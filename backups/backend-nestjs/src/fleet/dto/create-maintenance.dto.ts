import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { MaintenanceType } from '../entities/maintenance.entity';

export class CreateMaintenanceDto {
  @IsInt()
  vehicleId: number;

  @IsEnum(MaintenanceType)
  type: MaintenanceType;

  @IsString()
  description: string;

  @IsDateString()
  scheduledDate: string;

  @IsOptional()
  @IsNumber()
  cost?: number;

  @IsOptional()
  @IsString()
  performedBy?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
