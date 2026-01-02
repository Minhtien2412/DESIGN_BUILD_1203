import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum VideoStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
}

export enum VideoQuality {
  SD = '360p',
  HD = '720p',
  FULL_HD = '1080p',
  QUAD_HD = '1440p',
  ULTRA_HD = '4k',
}

@Entity('videos')
@Index(['userId'])
@Index(['projectId'])
@Index(['status'])
@Index(['createdAt'])
export class Video {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ nullable: true })
  projectId: number;

  @Column({ nullable: true })
  streamId: number; // If video is from a recorded stream

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  originalFilename: string;

  @Column()
  filePath: string;

  @Column({ nullable: true })
  thumbnailPath: string;

  @Column({
    type: 'enum',
    enum: VideoStatus,
    default: VideoStatus.UPLOADING,
  })
  status: VideoStatus;

  @Column({ type: 'bigint', default: 0 })
  fileSize: number; // bytes

  @Column({ type: 'int', nullable: true })
  duration: number; // seconds

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'simple-json', nullable: true })
  qualities: VideoQuality[];

  @Column({ type: 'simple-json', nullable: true })
  metadata: {
    width?: number;
    height?: number;
    bitrate?: number;
    codec?: string;
    fps?: number;
    [key: string]: any;
  };

  @Column({ type: 'simple-json', nullable: true })
  processedFiles: {
    quality: VideoQuality;
    path: string;
    size: number;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
