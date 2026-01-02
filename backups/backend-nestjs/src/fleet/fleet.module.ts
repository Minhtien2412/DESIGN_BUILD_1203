import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from './entities/driver.entity';
import { FuelRecord } from './entities/fuel-record.entity';
import { Inspection } from './entities/inspection.entity';
import { Maintenance } from './entities/maintenance.entity';
import { Trip } from './entities/trip.entity';
import { Vehicle } from './entities/vehicle.entity';
import { FleetController } from './fleet.controller';
import { FleetService } from './fleet.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vehicle,
      Maintenance,
      Trip,
      FuelRecord,
      Driver,
      Inspection,
    ]),
  ],
  controllers: [FleetController],
  providers: [FleetService],
  exports: [FleetService],
})
export class FleetModule {}
