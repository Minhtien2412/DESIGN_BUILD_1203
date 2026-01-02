import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum StreamStatus {
  IDLE = 'idle',
  LIVE = 'live',
  ENDED = 'ended',
  ERROR = 'error',
}

export enum StreamProtocol {
  RTMP = 'rtmp',
  HLS = 'hls',
  WEBRTC = 'webrtc',
}

@Entity('streams')
@Index(['userId'])
@Index(['projectId'])
@Index(['status'])
@Index(['startTime'])
export class Stream {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ nullable: true })
  projectId: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ unique: true })
  streamKey: string;

  @Column({
    type: 'enum',
    enum: StreamStatus,
    default: StreamStatus.IDLE,
  })
  status: StreamStatus;

  @Column({
    type: 'enum',
    enum: StreamProtocol,
    default: StreamProtocol.RTMP,
  })
  protocol: StreamProtocol;

  @Column({ nullable: true })
  rtmpUrl: string;

  @Column({ nullable: true })
  hlsUrl: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'int', default: 0 })
  viewerCount: number;

  @Column({ type: 'timestamp', nullable: true })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'int', nullable: true })
  duration: number; // seconds

  @Column({ type: 'simple-json', nullable: true })
  metadata: {
    resolution?: string;
    bitrate?: number;
    codec?: string;
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
