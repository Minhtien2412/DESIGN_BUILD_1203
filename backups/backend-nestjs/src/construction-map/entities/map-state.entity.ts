import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('map_states')
export class MapState {
  @PrimaryColumn()
  projectId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1.0 })
  zoom: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  offsetX: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  offsetY: number;

  @Column({ type: 'simple-array', nullable: true })
  selectedTaskIds: string[];

  @Column({ type: 'int', default: 1 })
  version: number; // For conflict resolution

  @UpdateDateColumn()
  lastModified: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  lastModifiedBy: string;
}
