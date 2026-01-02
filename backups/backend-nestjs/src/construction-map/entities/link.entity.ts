import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export type LinkType = 'dependency' | 'stage-task';

@Entity('links')
export class Link {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @Column()
  sourceId: string; // Source task or stage ID

  @Column()
  targetId: string; // Target task or stage ID

  @Column({
    type: 'enum',
    enum: ['dependency', 'stage-task'],
  })
  type: LinkType;

  @Column({ type: 'jsonb', nullable: true })
  style: {
    color?: string;
    width?: number;
    dashArray?: number[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
