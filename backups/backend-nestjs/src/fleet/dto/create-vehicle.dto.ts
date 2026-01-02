import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { VehicleType } from '../entities/vehicle.entity';

export class CreateVehicleDto {
  @IsOptional()
  @IsInt()
  projectId?: number;

  @IsString()
  name: string;

  @IsString()
  licensePlate: string;

  @IsEnum(VehicleType)
  type: VehicleType;

  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsOptional()
  @IsInt()
  year?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsNumber()
  fuelCapacity?: number;

  @IsOptional()
  specifications?: Record<string, any>;
}
