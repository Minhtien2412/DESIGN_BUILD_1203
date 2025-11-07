import { buildApiUrl } from '@/config';
import { VideoItem, VIDEOS } from '@/data/videos';
import * as ExpoConstants from 'expo-constants';
import { api } from './api';
import { serverFetch } from './enhancedServerClient';

// Detect if running in Expo Go
const isExpoGo = ExpoConstants.default?.appOwnership === 'expo';

export interface VideoMetadata {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  thumbnail?: string;
  category: string;
  tags: string[];
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isLive: boolean;
  isPublic: boolean;
  fileSize?: number;
  mimeType?: string;
  resolution?: string;
  bitrate?: number;
}

export interface VideoFile {
  id: string;
  videoId: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  resolution: string;
  bitrate: number;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  createdAt: Date;
}

export interface LiveStream {
  id: string;
  title: string;
  description?: string;
  streamerId: string;
  streamerName: string;
  category: string;
  tags: string[];
  isLive: boolean;
  startedAt?: Date;
  endedAt?: Date;
  viewerCount: number;
  thumbnail?: string;
  streamKey?: string;
  rtmpUrl?: string;
  hlsUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

class VideoService {
  private videos: Map<string, VideoMetadata> = new Map();
  private videoFiles: Map<string, VideoFile[]> = new Map();
  private liveStreams: Map<string, LiveStream> = new Map();
  private videoSequence: string[] = [];

  constructor() {
    this.initializeDefaultVideos();
    // Load videos from database on initialization
    this.loadVideosFromDatabase().catch(console.error);
  }

  private initializeDefaultVideos() {
    // Initialize with existing videos from data/videos.ts
    const existingVideos: VideoItem[] = VIDEOS;

    existingVideos.forEach(video => {
      const metadata: VideoMetadata = {
        id: video.id,
        title: video.title,
        description: '',
        category: video.category || 'general',
        tags: video.hashtags || [],
        authorId: video.authorSlug || 'unknown',
        authorName: video.author || 'Unknown',
        createdAt: new Date(),
        updatedAt: new Date(),
        viewCount: 0,
        likeCount: video.likes || 0,
        commentCount: video.comments || 0,
        isLive: video.type === 'live',
        isPublic: true,
      };

      this.videos.set(video.id, metadata);
      this.videoSequence.push(video.id);

      // Add video file
      const videoFile: VideoFile = {
        id: `${video.id}_file`,
        videoId: video.id,
        filePath: typeof video.url === 'string' ? video.url : `local://${video.id}`,
        fileName: video.title,
        fileSize: 0,
        mimeType: 'video/mp4',
        resolution: '1080p',
        bitrate: 2000,
        quality: 'high',
        createdAt: new Date(),
      };

      this.videoFiles.set(video.id, [videoFile]);
    });
  }

  // Generate unique ID for new videos
  generateVideoId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `vid_${timestamp}_${random}`;
  }

  // Get video by ID
  getVideo(id: string): VideoMetadata | null {
    return this.videos.get(id) || null;
  }

  // Get videos by category with pagination
  getVideosByCategory(
    category: string,
    page: number = 1,
    limit: number = 20
  ): { videos: VideoMetadata[]; total: number; hasMore: boolean } {
    const categoryVideos = Array.from(this.videos.values())
      .filter(video => video.category === category && video.isPublic)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const videos = categoryVideos.slice(startIndex, endIndex);

    return {
      videos,
      total: categoryVideos.length,
      hasMore: endIndex < categoryVideos.length,
    };
  }

  // Get videos in sequence (for ordered playback)
  getVideosInSequence(startId?: string, count: number = 10): VideoMetadata[] {
    if (!startId) {
      return this.videoSequence.slice(0, count).map(id => this.videos.get(id)!).filter(Boolean);
    }

    const startIndex = this.videoSequence.indexOf(startId);
    if (startIndex === -1) return [];

    const endIndex = Math.min(startIndex + count, this.videoSequence.length);
    return this.videoSequence.slice(startIndex, endIndex)
      .map(id => this.videos.get(id)!)
      .filter(Boolean);
  }

  // Get video files for different qualities
  getVideoFiles(videoId: string): VideoFile[] {
    return this.videoFiles.get(videoId) || [];
  }

  // Create new video
  async createVideo(metadata: Omit<VideoMetadata, 'id' | 'createdAt' | 'updatedAt'>): Promise<VideoMetadata> {
    const id = this.generateVideoId();
    const video: VideoMetadata = {
      ...metadata,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.videos.set(id, video);
    this.videoSequence.push(id);

    // Save to database
    await this.saveVideoToDatabase(video);

    return video;
  }

  // Update video metadata
  async updateVideo(id: string, updates: Partial<VideoMetadata>): Promise<VideoMetadata | null> {
    const video = this.videos.get(id);
    if (!video) return null;

    const updatedVideo = {
      ...video,
      ...updates,
      updatedAt: new Date(),
    };

    this.videos.set(id, updatedVideo);

    // Update in database
    await this.updateVideoInDatabase(id, updates);

    return updatedVideo;
  }

  // Delete video
  async deleteVideo(id: string): Promise<boolean> {
    const deleted = this.videos.delete(id);
    if (deleted) {
      this.videoFiles.delete(id);
      const index = this.videoSequence.indexOf(id);
      if (index > -1) {
        this.videoSequence.splice(index, 1);
      }

      // Delete from database
      await this.deleteVideoFromDatabase(id);
    }
    return deleted;
  }

  // Increment view count
  async incrementViewCount(id: string): Promise<void> {
    const video = this.videos.get(id);
    if (video) {
      video.viewCount += 1;
      video.updatedAt = new Date();
    }
  }

  // Like/Unlike video
  async toggleLike(id: string, userId: string): Promise<boolean> {
    // In a real implementation, this would track per-user likes
    const video = this.videos.get(id);
    if (video) {
      video.likeCount += 1; // Simplified
      video.updatedAt = new Date();
      return true;
    }
    return false;
  }

  // Live Stream Management
  createLiveStream(metadata: Omit<LiveStream, 'id' | 'createdAt' | 'updatedAt' | 'isLive' | 'viewerCount'>): LiveStream {
    const id = this.generateVideoId();
    const stream: LiveStream = {
      ...metadata,
      id,
      isLive: false,
      viewerCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.liveStreams.set(id, stream);
    return stream;
  }

  startLiveStream(id: string): LiveStream | null {
    const stream = this.liveStreams.get(id);
    if (stream && !stream.isLive) {
      stream.isLive = true;
      stream.startedAt = new Date();
      stream.updatedAt = new Date();
    }
    return stream || null;
  }

  endLiveStream(id: string): LiveStream | null {
    const stream = this.liveStreams.get(id);
    if (stream && stream.isLive) {
      stream.isLive = false;
      stream.endedAt = new Date();
      stream.updatedAt = new Date();
    }
    return stream || null;
  }

  getLiveStreams(activeOnly: boolean = false): LiveStream[] {
    const streams = Array.from(this.liveStreams.values());
    if (activeOnly) {
      return streams.filter(stream => stream.isLive);
    }
    return streams.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  updateViewerCount(streamId: string, count: number): void {
    const stream = this.liveStreams.get(streamId);
    if (stream) {
      stream.viewerCount = count;
      stream.updatedAt = new Date();
    }
  }

  // Search videos
  searchVideos(query: string, category?: string): VideoMetadata[] {
    const videos = Array.from(this.videos.values());
    return videos.filter(video => {
      const matchesQuery = video.title.toLowerCase().includes(query.toLowerCase()) ||
                          video.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
      const matchesCategory = !category || video.category === category;
      return matchesQuery && matchesCategory && video.isPublic;
    });
  }

  // Get trending videos
  getTrendingVideos(limit: number = 10): VideoMetadata[] {
    return Array.from(this.videos.values())
      .filter(video => video.isPublic)
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit);
  }

  // Database operations
  async saveVideoToDatabase(video: VideoMetadata): Promise<void> {
    try {
      await serverFetch('/videos', {
        method: 'POST',
        body: JSON.stringify(video),
      });
    } catch (error) {
      console.error('Failed to save video to database:', error);
      // Fallback to local storage
      this.videos.set(video.id, video);
    }
  }

  async loadVideosFromDatabase(): Promise<void> {
    console.log('[VideoService] Starting video load process...');
    
    // Always initialize local videos first as fallback
    if (this.videos.size === 0) {
      this.initializeDefaultVideos();
      console.log('[VideoService] Initialized with local defaults');
    }

    // Try to load from remote API (optional enhancement)
    try {
      const fullUrl = buildApiUrl('/videos');
      console.log(`[VideoService] Attempting to fetch from ${fullUrl}?limit=100`);
      const response = await api.get(fullUrl, { params: { limit: 100 } });
      
      let videos: any[] | null = null;
      if (Array.isArray(response.data?.data)) {
        videos = response.data.data;
      } else if (Array.isArray(response.data)) {
        videos = response.data;
      } else if (response.data?.data?.videos && Array.isArray(response.data.data.videos)) {
        videos = response.data.data.videos;
      }

      if (videos && videos.length > 0) {
        console.log(`[VideoService] Successfully loaded ${videos.length} videos from API, replacing local data`);
        
        // Only replace local data if we got valid remote data
        this.videos.clear();
        this.videoSequence = [];

        videos.forEach((video: any) => {
          const metadata: VideoMetadata = {
            id: video.id,
            title: video.title,
            description: video.description,
            duration: video.duration,
            thumbnail: video.thumbnail,
            category: video.category,
            tags: video.tags || [],
            authorId: video.authorId || video.author_id,
            authorName: video.authorName || video.author_name,
            createdAt: new Date(video.createdAt || video.created_at),
            updatedAt: new Date(video.updatedAt || video.updated_at),
            viewCount: video.viewCount || video.view_count || 0,
            likeCount: video.likeCount || video.like_count || 0,
            commentCount: video.commentCount || video.comment_count || 0,
            isLive: video.isLive || video.is_live || false,
            isPublic: video.isPublic !== false,
            fileSize: video.fileSize || video.file_size,
            mimeType: video.mimeType || video.mime_type,
            resolution: video.resolution,
            bitrate: video.bitrate,
          };

          this.videos.set(video.id, metadata);
          this.videoSequence.push(video.id);
        });

        console.log(`[VideoService] Successfully processed ${videos.length} remote videos`);
      } else {
        console.log('[VideoService] No valid remote videos found, keeping local defaults');
      }
    } catch (err: any) {
      // Check if this is an expected error (404, no video endpoint, etc.)
      const isExpectedError = err?.message?.includes('status code 404') || 
                             err?.message?.includes('Request failed with status code 404') ||
                             err?.message?.includes('Response shape not recognized') ||
                             err?.response?.status === 404;
      
      if (isExpectedError) {
        console.log('[VideoService] Video endpoint not available or incompatible, using local defaults');
      } else {
        console.warn('[VideoService] Unexpected API error, continuing with local defaults:', err?.message || err);
      }
      
      // Local data is already initialized, so we're good to go
    }

    console.log(`[VideoService] Video loading complete. Total videos: ${this.videos.size}`);
  }

  async updateVideoInDatabase(id: string, updates: Partial<VideoMetadata>): Promise<void> {
    try {
      await serverFetch(`/videos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Failed to update video in database:', error);
      // Fallback to local update
      const video = this.videos.get(id);
      if (video) {
        Object.assign(video, updates);
        video.updatedAt = new Date();
      }
    }
  }

  async deleteVideoFromDatabase(id: string): Promise<void> {
    try {
      await serverFetch(`/videos/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete video from database:', error);
      // Fallback to local delete
      this.videos.delete(id);
      const index = this.videoSequence.indexOf(id);
      if (index > -1) {
        this.videoSequence.splice(index, 1);
      }
    }
  }

  // Generate video URL
  getVideoUrl(videoId: string, quality: 'low' | 'medium' | 'high' | 'ultra' = 'high'): string {
    return buildApiUrl(`/videos/${videoId}/stream?quality=${quality}`);
  }

  // Get video thumbnail URL
  getVideoThumbnailUrl(videoId: string): string {
    return buildApiUrl(`/videos/${videoId}/thumbnail`);
  }

  /**
   * Reorder videos (front-end only) and optionally sync ordering to backend.
   * Backend can accept PATCH /videos/order with { sequence: string[] } for persistence (not implemented here).
   */
  async reorderVideos(newSequence: string[], syncRemote: boolean = false): Promise<void> {
    // Validate IDs
    const allValid = newSequence.every(id => this.videos.has(id));
    if (!allValid) throw new Error('Invalid video ID in sequence');
    this.videoSequence = [...newSequence];
    if (syncRemote) {
      try {
        await api.patch(buildApiUrl('/videos/order'), { sequence: this.videoSequence });
      } catch (e) {
        console.warn('[VideoService] Failed to sync order, keeping local only');
      }
    }
  }

  /** Lightweight AJAX-style fetch for partial pagination (front-end consumption). */
  async fetchPage(page: number, limit: number = 20): Promise<VideoMetadata[]> {
    try {
      const res = await api.get(buildApiUrl('/videos'), { params: { page, limit } });
      const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : res.data?.data?.videos || [];
      return list.map((video: any) => this.videos.get(video.id) || {
        id: video.id,
        title: video.title,
        description: video.description || '',
        category: video.category || 'general',
        tags: video.tags || [],
        authorId: video.authorId || video.author_id || 'unknown',
        authorName: video.authorName || video.author_name || 'Unknown',
        createdAt: new Date(video.createdAt || video.created_at || Date.now()),
        updatedAt: new Date(video.updatedAt || video.updated_at || Date.now()),
        viewCount: video.viewCount || 0,
        likeCount: video.likeCount || 0,
        commentCount: video.commentCount || 0,
        isLive: video.isLive || false,
        isPublic: video.isPublic !== false,
      });
    } catch (e) {
      console.warn('[VideoService] fetchPage failed, returning local slice');
      const start = (page - 1) * limit;
      return this.videoSequence.slice(start, start + limit).map(id => this.videos.get(id)!).filter(Boolean);
    }
  }

  // Convert VideoMetadata to VideoItem with URL
  videoMetadataToVideoItem(video: VideoMetadata): VideoItem {
    return {
      id: video.id,
      title: video.title,
      url: this.getVideoUrl(video.id), // Use generated URL
      author: video.authorName,
      likes: video.likeCount,
      comments: video.commentCount,
      category: video.category,
      hashtags: video.tags,
      type: video.isLive ? 'live' : 'vod',
      authorSlug: video.authorId,
    };
  }

  // Get all videos as VideoItem array
  getAllVideosAsVideoItems(): VideoItem[] {
    return Array.from(this.videos.values()).map(video => this.videoMetadataToVideoItem(video));
  }

  // Get video by ID as VideoItem
  getVideoAsVideoItem(id: string): VideoItem | null {
    const video = this.getVideo(id);
    return video ? this.videoMetadataToVideoItem(video) : null;
  }
}

export const videoService = new VideoService();