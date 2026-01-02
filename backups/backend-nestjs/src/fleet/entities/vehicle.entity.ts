import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { FuelRecord } from './fuel-record.entity';
import { Maintenance } from './maintenance.entity';
import { Trip } from './trip.entity';

export enum VehicleStatus {
  ACTIVE = 'active',
  MAINTENANCE = 'maintenance',
  INACTIVE = 'inactive',
  RETIRED = 'retired',
}

export enum VehicleType {
  TRUCK = 'truck',
  VAN = 'van',
  CAR = 'car',
  EXCAVATOR = 'excavator',
  CRANE = 'crane',
  MIXER = 'mixer',
  OTHER = 'other',
}

@Entity('vehicles')
@Index(['projectId'])
@Index(['status'])
@Index(['type'])
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  projectId: number;

  @Column()
  name: string;

  @Column({ unique: true })
  licensePlate: string;

  @Column({
    type: 'enum',
    enum: VehicleType,
  })
  type: VehicleType;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column({ nullable: true })
  year: number;

  @Column({ nullable: true })
  color: string;

  @Column({
    type: 'enum',
    enum: VehicleStatus,
    default: VehicleStatus.ACTIVE,
  })
  status: VehicleStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  mileage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fuelCapacity: number;

  @Column({ nullable: true })
  lastMaintenanceDate: Date;

  @Column({ nullable: true })
  nextMaintenanceDate: Date;

  @Column({ type: 'simple-json', nullable: true })
  specifications: {
    engine?: string;
    transmission?: string;
    capacity?: string;
    [key: string]: any;
  };

  @OneToMany(() => Maintenance, (maintenance) => maintenance.vehicle)
  maintenanceRecords: Maintenance[];

  @OneToMany(() => Trip, (trip) => trip.vehicle)
  trips: Trip[];

  @OneToMany(() => FuelRecord, (fuel) => fuel.vehicle)
  fuelRecords: FuelRecord[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
