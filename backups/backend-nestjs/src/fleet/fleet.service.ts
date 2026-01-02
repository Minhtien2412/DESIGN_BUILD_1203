import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { CreateTripDto } from './dto/create-trip.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { Driver } from './entities/driver.entity';
import { FuelRecord } from './entities/fuel-record.entity';
import { Inspection } from './entities/inspection.entity';
import { Maintenance, MaintenanceStatus } from './entities/maintenance.entity';
import { Trip, TripStatus } from './entities/trip.entity';
import { Vehicle, VehicleStatus } from './entities/vehicle.entity';

@Injectable()
export class FleetService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Maintenance)
    private readonly maintenanceRepository: Repository<Maintenance>,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    @InjectRepository(FuelRecord)
    private readonly fuelRepository: Repository<FuelRecord>,
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    @InjectRepository(Inspection)
    private readonly inspectionRepository: Repository<Inspection>,
  ) {}

  // Vehicles
  async createVehicle(dto: CreateVehicleDto): Promise<Vehicle> {
    const vehicle = this.vehicleRepository.create(dto);
    return this.vehicleRepository.save(vehicle);
  }

  async findAllVehicles(projectId?: number): Promise<Vehicle[]> {
    const where = projectId ? { projectId } : {};
    return this.vehicleRepository.find({
      where,
      relations: ['maintenanceRecords', 'trips', 'fuelRecords'],
      order: { createdAt: 'DESC' },
    });
  }

  async findVehicle(id: number): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id },
      relations: ['maintenanceRecords', 'trips', 'fuelRecords'],
    });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }
    return vehicle;
  }

  async updateVehicleStatus(id: number, status: VehicleStatus): Promise<Vehicle> {
    const vehicle = await this.findVehicle(id);
    vehicle.status = status;
    return this.vehicleRepository.save(vehicle);
  }

  // Maintenance
  async scheduleMaintenance(dto: CreateMaintenanceDto): Promise<Maintenance> {
    const vehicle = await this.findVehicle(dto.vehicleId);
    const maintenance = this.maintenanceRepository.create(dto);
    const saved = await this.maintenanceRepository.save(maintenance);

    // Update vehicle status if needed
    if (vehicle.status === VehicleStatus.ACTIVE) {
      vehicle.status = VehicleStatus.MAINTENANCE;
      await this.vehicleRepository.save(vehicle);
    }

    return saved;
  }

  async getMaintenanceHistory(vehicleId: number): Promise<Maintenance[]> {
    return this.maintenanceRepository.find({
      where: { vehicleId },
      order: { scheduledDate: 'DESC' },
    });
  }

  async completeMaintenance(id: number): Promise<Maintenance> {
    const maintenance = await this.maintenanceRepository.findOne({ where: { id } });
    if (!maintenance) {
      throw new NotFoundException(`Maintenance record ${id} not found`);
    }

    maintenance.status = MaintenanceStatus.COMPLETED;
    maintenance.completedDate = new Date();

    const saved = await this.maintenanceRepository.save(maintenance);

    // Update vehicle
    const vehicle = await this.findVehicle(maintenance.vehicleId);
    vehicle.lastMaintenanceDate = new Date();
    vehicle.status = VehicleStatus.ACTIVE;
    await this.vehicleRepository.save(vehicle);

    return saved;
  }

  // Trips
  async startTrip(dto: CreateTripDto): Promise<Trip> {
    const vehicle = await this.findVehicle(dto.vehicleId);
    const trip = this.tripRepository.create({
      ...dto,
      status: TripStatus.IN_PROGRESS,
      startMileage: vehicle.mileage,
    });
    return this.tripRepository.save(trip);
  }

  async endTrip(id: number, endMileage: number): Promise<Trip> {
    const trip = await this.tripRepository.findOne({ where: { id } });
    if (!trip) {
      throw new NotFoundException(`Trip ${id} not found`);
    }

    trip.endTime = new Date();
    trip.endMileage = endMileage;
    trip.distance = endMileage - (trip.startMileage || 0);
    trip.status = TripStatus.COMPLETED;

    const saved = await this.tripRepository.save(trip);

    // Update vehicle mileage
    const vehicle = await this.findVehicle(trip.vehicleId);
    vehicle.mileage = endMileage;
    await this.vehicleRepository.save(vehicle);

    return saved;
  }

  async getTripHistory(vehicleId: number): Promise<Trip[]> {
    return this.tripRepository.find({
      where: { vehicleId },
      relations: ['driver'],
      order: { startTime: 'DESC' },
    });
  }

  // Fuel
  async addFuelRecord(
    vehicleId: number,
    quantity: number,
    cost: number,
    date: Date,
    mileage?: number,
  ): Promise<FuelRecord> {
    const vehicle = await this.findVehicle(vehicleId);
    const record = this.fuelRepository.create({
      vehicleId,
      quantity,
      cost,
      date,
      mileage: mileage || vehicle.mileage,
      pricePerLiter: cost / quantity,
    });
    return this.fuelRepository.save(record);
  }

  async getFuelHistory(vehicleId: number): Promise<FuelRecord[]> {
    return this.fuelRepository.find({
      where: { vehicleId },
      order: { date: 'DESC' },
    });
  }

  async getFuelAnalytics(vehicleId: number): Promise<any> {
    const records = await this.getFuelHistory(vehicleId);
    const totalCost = records.reduce((sum, r) => sum + Number(r.cost), 0);
    const totalQuantity = records.reduce((sum, r) => sum + Number(r.quantity), 0);
    const avgPricePerLiter = totalQuantity > 0 ? totalCost / totalQuantity : 0;

    return {
      totalRecords: records.length,
      totalCost,
      totalQuantity,
      avgPricePerLiter: Math.round(avgPricePerLiter * 100) / 100,
    };
  }

  // Drivers
  async createDriver(data: Partial<Driver>): Promise<Driver> {
    const driver = this.driverRepository.create(data);
    return this.driverRepository.save(driver);
  }

  async findAllDrivers(): Promise<Driver[]> {
    return this.driverRepository.find({ order: { name: 'ASC' } });
  }

  // Inspections
  async createInspection(data: Partial<Inspection>): Promise<Inspection> {
    const inspection = this.inspectionRepository.create(data);
    return this.inspectionRepository.save(inspection);
  }

  async getInspectionHistory(vehicleId: number): Promise<Inspection[]> {
    return this.inspectionRepository.find({
      where: { vehicleId },
      order: { inspectionDate: 'DESC' },
    });
  }
}
