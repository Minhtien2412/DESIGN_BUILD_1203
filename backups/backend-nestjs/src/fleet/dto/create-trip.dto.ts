import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateTripDto {
  @IsInt()
  vehicleId: number;

  @IsOptional()
  @IsInt()
  driverId?: number;

  @IsString()
  startLocation: string;

  @IsString()
  endLocation: string;

  @IsDateString()
  startTime: string;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
