import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Vehicle } from './vehicle.entity';

@Entity('fuel_records')
@Index(['vehicleId'])
@Index(['date'])
export class FuelRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  vehicleId: number;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.fuelRecords, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number; // liters

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pricePerLiter: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  mileage: number;

  @Column({ nullable: true })
  station: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
