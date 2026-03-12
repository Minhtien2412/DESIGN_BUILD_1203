/**
 * Media Module - Media Utilities
 * Audio/Video recording, file handling, thumbnails
 * 
 * Features:
 * - Audio recording and playback
 * - Video recording
 * - Image capture from camera
 * - File upload with progress
 * - Thumbnail generation
 * - Media compression
 */

import type { MediaConfig, MediaType } from './types';

// ==================== CONSTANTS ====================

const DEFAULT_MEDIA_CONFIG_VALUE: MediaConfig = {
  audio: {
    sampleRate: 44100,
    channels: 1,
    bitRate: 128000,
    format: 'mp4',
  },
  video: {
    quality: 'high',
    maxDuration: 60,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    codec: 'h264',
  },
  image: {
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080,
    format: 'jpeg',
  },
};

const MIME_TYPES: Record<string, string> = {
  // Images
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  // Audio
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  // Video
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  webm: 'video/webm',
  // Documents
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

// ==================== TYPES ====================

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  fileId?: string;
  error?: string;
}

export interface MediaFile {
  uri: string;
  type: MediaType;
  name: string;
  size: number;
  mimeType: string;
  duration?: number;
  width?: number;
  height?: number;
  thumbnail?: string;
}

export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

interface AudioRecorderOptions {
  onProgress?: (duration: number) => void;
  onFinish?: (uri: string, duration: number) => void;
  maxDuration?: number;
}

// ==================== AUDIO MANAGER ====================

export class AudioManager {
  private recording: any = null;
  private sound: any = null;
  private state: RecordingState = 'idle';
  private recordingUri: string | null = null;
  private progressCallback?: (duration: number) => void;
  private progressInterval?: ReturnType<typeof setInterval>;

  /**
   * Start audio recording
   */
  async startRecording(options: AudioRecorderOptions = {}): Promise<boolean> {
    try {
      // Dynamic import for Audio
      const { Audio } = await import('expo-av');
      
      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        console.error('[Audio] Permission denied');
        return false;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      this.state = 'recording';
      this.progressCallback = options.onProgress;

      // Start progress tracking
      if (options.onProgress) {
        let duration = 0;
        this.progressInterval = setInterval(() => {
          duration += 0.1;
          options.onProgress?.(duration);
          
          // Auto-stop at max duration
          if (options.maxDuration && duration >= options.maxDuration) {
            this.stopRecording();
          }
        }, 100);
      }

      console.log('[Audio] Recording started');
      return true;
    } catch (error) {
      console.error('[Audio] Failed to start recording:', error);
      return false;
    }
  }

  /**
   * Pause audio recording
   */
  async pauseRecording(): Promise<boolean> {
    if (!this.recording || this.state !== 'recording') return false;

    try {
      await this.recording.pauseAsync();
      this.state = 'paused';
      
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
      }
      
      console.log('[Audio] Recording paused');
      return true;
    } catch (error) {
      console.error('[Audio] Failed to pause recording:', error);
      return false;
    }
  }

  /**
   * Resume audio recording
   */
  async resumeRecording(): Promise<boolean> {
    if (!this.recording || this.state !== 'paused') return false;

    try {
      await this.recording.startAsync();
      this.state = 'recording';
      console.log('[Audio] Recording resumed');
      return true;
    } catch (error) {
      console.error('[Audio] Failed to resume recording:', error);
      return false;
    }
  }

  /**
   * Stop audio recording
   */
  async stopRecording(): Promise<string | null> {
    if (!this.recording) return null;

    try {
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      
      this.recordingUri = uri;
      this.state = 'stopped';
      this.recording = null;

      // Reset audio mode
      const { Audio } = await import('expo-av');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      console.log('[Audio] Recording saved to:', uri);
      return uri;
    } catch (error) {
      console.error('[Audio] Failed to stop recording:', error);
      return null;
    }
  }

  /**
   * Play audio file
   */
  async playAudio(uri: string, onFinish?: () => void): Promise<boolean> {
    try {
      // Stop current playback
      await this.stopPlayback();

      const { Audio } = await import('expo-av');
      
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded && status.didJustFinish) {
            onFinish?.();
          }
        }
      );

      this.sound = sound;
      console.log('[Audio] Playing:', uri);
      return true;
    } catch (error) {
      console.error('[Audio] Failed to play audio:', error);
      return false;
    }
  }

  /**
   * Stop audio playback
   */
  async stopPlayback(): Promise<void> {
    if (this.sound) {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
      this.sound = null;
    }
  }

  /**
   * Get recording state
   */
  getState(): RecordingState {
    return this.state;
  }

  /**
   * Get last recording URI
   */
  getRecordingUri(): string | null {
    return this.recordingUri;
  }
}

// ==================== FILE UTILITIES ====================

/**
 * Get MIME type from file extension
 */
export function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return MIME_TYPES[ext] || 'application/octet-stream';
}

/**
 * Get media type from MIME type
 */
export function getMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'file';
}

/**
 * Get file info
 */
export async function getFileInfo(uri: string): Promise<MediaFile | null> {
  try {
    const FileSystem = await import('expo-file-system');
    const info = await FileSystem.getInfoAsync(uri);
    
    if (!info.exists) {
      return null;
    }

    const name = uri.split('/').pop() || 'file';
    const mimeType = getMimeType(name);
    const type = getMediaType(mimeType);

    return {
      uri,
      type,
      name,
      size: (info as { size?: number }).size || 0,
      mimeType,
    };
  } catch (error) {
    console.error('[Media] Failed to get file info:', error);
    return null;
  }
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format duration
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ==================== UPLOAD UTILITIES ====================

/**
 * Upload file to server
 */
export async function uploadFile(
  uri: string,
  uploadUrl: string,
  options: {
    fieldName?: string;
    headers?: Record<string, string>;
    onProgress?: (progress: UploadProgress) => void;
  } = {}
): Promise<UploadResult> {
  try {
    const { fieldName = 'file', headers = {}, onProgress } = options;
    const FileSystem = await import('expo-file-system');

    // Get file info
    const fileInfo = await getFileInfo(uri);
    if (!fileInfo) {
      return { success: false, error: 'File not found' };
    }

    // Use FileSystem upload task
    const uploadTask = FileSystem.createUploadTask(
      uploadUrl,
      uri,
      {
        fieldName,
        httpMethod: 'POST',
        uploadType: 1, // MULTIPART = 1
        headers: {
          'Content-Type': 'multipart/form-data',
          ...headers,
        },
      },
      (data: { totalBytesSent: number; totalBytesExpectedToSend: number }) => {
        onProgress?.({
          loaded: data.totalBytesSent,
          total: data.totalBytesExpectedToSend,
          percent: Math.round(
            (data.totalBytesSent / data.totalBytesExpectedToSend) * 100
          ),
        });
      }
    );

    const response = await uploadTask.uploadAsync();

    if (response?.status !== 200) {
      return { success: false, error: `Upload failed: ${response?.status}` };
    }

    const body = response.body ? JSON.parse(response.body) : {};
    
    return {
      success: true,
      url: body.url,
      fileId: body.id,
    };
  } catch (error) {
    console.error('[Media] Upload failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    };
  }
}

/**
 * Download file from URL
 */
export async function downloadFile(
  url: string,
  filename: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string | null> {
  try {
    const FileSystem = await import('expo-file-system');
    // @ts-expect-error - documentDirectory exists at runtime
    const docDir: string = FileSystem.default?.documentDirectory || FileSystem.documentDirectory || '';
    const directory = docDir + 'downloads/';
    
    // Create directory if needed
    const dirInfo = await FileSystem.getInfoAsync(directory);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
    }

    const fileUri = directory + filename;
    
    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      fileUri,
      {},
      (data: { totalBytesWritten: number; totalBytesExpectedToWrite: number }) => {
        onProgress?.({
          loaded: data.totalBytesWritten,
          total: data.totalBytesExpectedToWrite,
          percent: Math.round(
            (data.totalBytesWritten / data.totalBytesExpectedToWrite) * 100
          ),
        });
      }
    );

    const result = await downloadResumable.downloadAsync();
    return result?.uri || null;
  } catch (error) {
    console.error('[Media] Download failed:', error);
    return null;
  }
}

// ==================== IMAGE UTILITIES ====================

/**
 * Resize image
 */
export async function resizeImage(
  uri: string,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.8
): Promise<string | null> {
  try {
    // Note: expo-image-manipulator required
    // npx expo install expo-image-manipulator
    const ImageManipulator = await import('expo-image-manipulator');
    
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth, height: maxHeight } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    return result.uri;
  } catch (error) {
    console.error('[Media] Image resize failed:', error);
    return null;
  }
}

/**
 * Generate thumbnail from video
 */
export async function generateVideoThumbnail(
  videoUri: string,
  time: number = 0
): Promise<string | null> {
  try {
    // Note: expo-video-thumbnails required
    // npx expo install expo-video-thumbnails
    const VideoThumbnails = await import('expo-video-thumbnails');
    
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time,
      quality: 0.5,
    });
    
    return uri;
  } catch (error) {
    console.error('[Media] Thumbnail generation failed:', error);
    return null;
  }
}

// ==================== CAMERA UTILITIES ====================

/**
 * Take photo with camera
 */
export async function takePhoto(): Promise<MediaFile | null> {
  try {
    const ImagePicker = await import('expo-image-picker');
    
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: DEFAULT_MEDIA_CONFIG.image.quality,
      allowsEditing: true,
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      type: 'image',
      name: `photo_${Date.now()}.jpg`,
      size: asset.fileSize || 0,
      mimeType: asset.mimeType || 'image/jpeg',
      width: asset.width,
      height: asset.height,
    };
  } catch (error) {
    console.error('[Media] Camera capture failed:', error);
    return null;
  }
}

/**
 * Record video with camera
 */
export async function recordVideo(): Promise<MediaFile | null> {
  try {
    const ImagePicker = await import('expo-image-picker');
    
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['videos'],
      quality: 1,
      videoMaxDuration: DEFAULT_MEDIA_CONFIG_VALUE.video.maxDuration,
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      type: 'video',
      name: `video_${Date.now()}.mp4`,
      size: asset.fileSize || 0,
      mimeType: asset.mimeType || 'video/mp4',
      duration: asset.duration ?? undefined,
      width: asset.width,
      height: asset.height,
    };
  } catch (error) {
    console.error('[Media] Video recording failed:', error);
    return null;
  }
}

/**
 * Pick media from library
 */
export async function pickMedia(type: 'images' | 'videos' | 'all' = 'all'): Promise<MediaFile[] | null> {
  try {
    const ImagePicker = await import('expo-image-picker');
    
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return null;
    }

    type MediaTypeArray = ('images' | 'videos')[];
    const mediaTypes: MediaTypeArray = 
      type === 'images' ? ['images'] :
      type === 'videos' ? ['videos'] :
      ['images', 'videos'];

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets.map(asset => ({
      uri: asset.uri,
      type: (asset.type === 'video' ? 'video' : 'image') as MediaType,
      name: asset.fileName || `media_${Date.now()}`,
      size: asset.fileSize || 0,
      mimeType: asset.mimeType || 'image/jpeg',
      duration: asset.duration ?? undefined,
      width: asset.width,
      height: asset.height,
    }));
  } catch (error) {
    console.error('[Media] Media picker failed:', error);
    return null;
  }
}

// ==================== SINGLETON INSTANCES ====================

let audioManagerInstance: AudioManager | null = null;

export function getAudioManager(): AudioManager {
  if (!audioManagerInstance) {
    audioManagerInstance = new AudioManager();
  }
  return audioManagerInstance;
}

// ==================== EXPORTS ====================

export const DEFAULT_MEDIA_CONFIG = DEFAULT_MEDIA_CONFIG_VALUE;
