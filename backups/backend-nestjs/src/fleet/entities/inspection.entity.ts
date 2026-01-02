import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
} from 'typeorm';

export enum InspectionStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  PENDING = 'pending',
}

@Entity('inspections')
@Index(['vehicleId'])
@Index(['inspectionDate'])
export class Inspection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  vehicleId: number;

  @Column({ type: 'timestamp' })
  inspectionDate: Date;

  @Column()
  inspector: string;

  @Column({
    type: 'enum',
    enum: InspectionStatus,
  })
  status: InspectionStatus;

  @Column({ type: 'simple-json' })
  checkList: {
    item: string;
    status: 'ok' | 'issue' | 'critical';
    notes?: string;
  }[];

  @Column({ type: 'text', nullable: true })
  overallNotes: string;

  @Column({ type: 'simple-json', nullable: true })
  issuesFound: string[];

  @CreateDateColumn()
  createdAt: Date;
}
