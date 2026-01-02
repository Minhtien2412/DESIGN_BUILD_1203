import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { CreateTripDto } from './dto/create-trip.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { VehicleStatus } from './entities/vehicle.entity';
import { FleetService } from './fleet.service';

@Controller('fleet')
export class FleetController {
  constructor(private readonly fleetService: FleetService) {}

  // Vehicles
  @Post('vehicles')
  async createVehicle(@Body() dto: CreateVehicleDto) {
    return this.fleetService.createVehicle(dto);
  }

  @Get('vehicles')
  async findAllVehicles(@Query('projectId', ParseIntPipe) projectId?: number) {
    return this.fleetService.findAllVehicles(projectId);
  }

  @Get('vehicles/:id')
  async findVehicle(@Param('id', ParseIntPipe) id: number) {
    return this.fleetService.findVehicle(id);
  }

  @Patch('vehicles/:id/status')
  async updateVehicleStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: VehicleStatus,
  ) {
    return this.fleetService.updateVehicleStatus(id, status);
  }

  // Maintenance
  @Post('maintenance')
  async scheduleMaintenance(@Body() dto: CreateMaintenanceDto) {
    return this.fleetService.scheduleMaintenance(dto);
  }

  @Get('vehicles/:id/maintenance')
  async getMaintenanceHistory(@Param('id', ParseIntPipe) id: number) {
    return this.fleetService.getMaintenanceHistory(id);
  }

  @Patch('maintenance/:id/complete')
  @HttpCode(HttpStatus.OK)
  async completeMaintenance(@Param('id', ParseIntPipe) id: number) {
    return this.fleetService.completeMaintenance(id);
  }

  // Trips
  @Post('trips/start')
  async startTrip(@Body() dto: CreateTripDto) {
    return this.fleetService.startTrip(dto);
  }

  @Post('trips/:id/end')
  async endTrip(
    @Param('id', ParseIntPipe) id: number,
    @Body('endMileage') endMileage: number,
  ) {
    return this.fleetService.endTrip(id, endMileage);
  }

  @Get('vehicles/:id/trips')
  async getTripHistory(@Param('id', ParseIntPipe) id: number) {
    return this.fleetService.getTripHistory(id);
  }

  // Fuel
  @Post('vehicles/:id/fuel')
  async addFuelRecord(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { quantity: number; cost: number; date: Date; mileage?: number },
  ) {
    return this.fleetService.addFuelRecord(
      id,
      body.quantity,
      body.cost,
      body.date,
      body.mileage,
    );
  }

  @Get('vehicles/:id/fuel')
  async getFuelHistory(@Param('id', ParseIntPipe) id: number) {
    return this.fleetService.getFuelHistory(id);
  }

  @Get('vehicles/:id/fuel/analytics')
  async getFuelAnalytics(@Param('id', ParseIntPipe) id: number) {
    return this.fleetService.getFuelAnalytics(id);
  }

  // Drivers
  @Post('drivers')
  async createDriver(@Body() data: any) {
    return this.fleetService.createDriver(data);
  }

  @Get('drivers')
  async findAllDrivers() {
    return this.fleetService.findAllDrivers();
  }

  // Inspections
  @Post('vehicles/:id/inspections')
  async createInspection(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.fleetService.createInspection({ ...data, vehicleId: id });
  }

  @Get('vehicles/:id/inspections')
  async getInspectionHistory(@Param('id', ParseIntPipe) id: number) {
    return this.fleetService.getInspectionHistory(id);
  }
}
