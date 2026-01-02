import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  OTHER = 'other',
}

export enum FileCategory {
  TIMELINE = 'timeline',
  CONSTRUCTION = 'construction',
  PROFILE = 'profile',
  PROJECT = 'project',
  TASK = 'task',
  OTHER = 'other',
}

@Entity('uploaded_files')
@Index(['userId'])
@Index(['category'])
@Index(['resourceType', 'resourceId'])
export class UploadedFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  originalName: string;

  @Column()
  filename: string;

  @Column()
  filepath: string;

  @Column()
  mimetype: string;

  @Column()
  size: number;

  @Column({
    type: 'enum',
    enum: FileType,
    default: FileType.OTHER,
  })
  type: FileType;

  @Column({
    type: 'enum',
    enum: FileCategory,
    default: FileCategory.OTHER,
  })
  category: FileCategory;

  @Column({ nullable: true })
  userId: number;

  @Column({ nullable: true })
  resourceType: string; // 'project', 'task', 'timeline', etc.

  @Column({ nullable: true })
  resourceId: number;

  @Column({ type: 'simple-json', nullable: true })
  metadata: {
    width?: number;
    height?: number;
    gps?: {
      latitude: number;
      longitude: number;
      altitude?: number;
    };
    exif?: any;
    thumbnail?: string;
  };

  @Column({ nullable: true })
  url: string; // Public URL if using cloud storage

  @Column({ default: false })
  isPublic: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
