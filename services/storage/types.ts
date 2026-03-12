/**
 * Storage Types & Interfaces
 * Common types for all storage providers
 */

export type StorageProvider =
  | "supabase"
  | "s3"
  | "cloudinary"
  | "local"
  | "backend";

export interface StorageConfig {
  provider: StorageProvider;
  supabase?: {
    url: string;
    anonKey: string;
    bucket: string;
  };
  s3?: {
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  cloudinary?: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    uploadPreset?: string;
  };
}

export interface UploadOptions {
  /** Target folder path (e.g., "documents/user123/") */
  folder?: string;
  /** Custom filename (auto-generated if not provided) */
  filename?: string;
  /** File access level */
  accessLevel?: "private" | "public" | "shared";
  /** Allowed MIME types */
  allowedMimeTypes?: string[];
  /** Max file size in bytes */
  maxSize?: number;
  /** Storage provider to use */
  provider?: StorageProvider;
  /** Enable image optimization (Cloudinary) */
  optimize?: boolean;
  /** Generate thumbnail */
  generateThumbnail?: boolean;
  /** Metadata to attach */
  metadata?: Record<string, string>;
  /** Progress callback */
  onProgress?: (progress: number) => void;
  /** User ID for per-user folder */
  userId?: string;
}

export interface UploadResult {
  /** Unique file ID */
  id: string;
  /** Public URL to access the file */
  url: string;
  /** Signed URL (for private files) */
  signedUrl?: string;
  /** Original filename */
  filename: string;
  /** Storage path */
  path: string;
  /** File size in bytes */
  size: number;
  /** MIME type */
  mimeType: string;
  /** Storage provider used */
  provider: StorageProvider;
  /** Thumbnail URL (if generated) */
  thumbnailUrl?: string;
  /** Upload timestamp */
  createdAt: Date;
  /** File metadata */
  metadata?: Record<string, string>;
  /** Cloudinary public ID (for Cloudinary uploads) */
  publicId?: string;
  /** ETag/hash for integrity check */
  etag?: string;
}

export interface FileInfo {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  url: string;
  signedUrl?: string;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
  owner?: {
    id: string;
    name: string;
  };
  shared?: {
    users: string[];
    teams: string[];
    public: boolean;
  };
}

export interface FolderInfo {
  id: string;
  name: string;
  path: string;
  parentId?: string;
  fileCount: number;
  totalSize: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  usedQuota: number;
  maxQuota: number;
  byType: Record<string, { count: number; size: number }>;
  recentUploads: number;
}

export interface ListFilesOptions {
  folder?: string;
  limit?: number;
  offset?: number;
  sortBy?: "name" | "size" | "created_at" | "updated_at";
  sortOrder?: "asc" | "desc";
  search?: string;
  mimeTypes?: string[];
}

export interface ListFilesResult {
  files: FileInfo[];
  folders: FolderInfo[];
  total: number;
  hasMore: boolean;
  nextOffset?: number;
}

export interface DownloadOptions {
  /** Download as blob */
  asBlob?: boolean;
  /** Transform options (Cloudinary) */
  transform?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "auto" | "webp" | "jpg" | "png";
  };
}

export interface ShareOptions {
  /** Users to share with */
  userIds?: string[];
  /** Teams to share with */
  teamIds?: string[];
  /** Make publicly accessible */
  public?: boolean;
  /** Share expiration date */
  expiresAt?: Date;
  /** Permission level */
  permission?: "view" | "download" | "edit";
}

export interface ShareResult {
  shareId: string;
  shareUrl: string;
  expiresAt?: Date;
  password?: string;
}

// Storage event types for real-time updates
export type StorageEventType =
  | "file:created"
  | "file:updated"
  | "file:deleted"
  | "file:moved"
  | "folder:created"
  | "folder:deleted"
  | "share:created"
  | "share:revoked";

export interface StorageEvent {
  type: StorageEventType;
  fileId?: string;
  folderId?: string;
  userId: string;
  path: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export type StorageEventCallback = (event: StorageEvent) => void;

// Interface for all storage providers
export interface IStorageProvider {
  readonly name: StorageProvider;

  // File operations
  upload(
    file: File | Blob | string,
    options?: UploadOptions,
  ): Promise<UploadResult>;
  download(path: string, options?: DownloadOptions): Promise<Blob | string>;
  delete(path: string): Promise<void>;
  move(fromPath: string, toPath: string): Promise<FileInfo>;
  copy(fromPath: string, toPath: string): Promise<FileInfo>;

  // Folder operations
  createFolder(path: string): Promise<FolderInfo>;
  deleteFolder(path: string, recursive?: boolean): Promise<void>;
  listFiles(options?: ListFilesOptions): Promise<ListFilesResult>;

  // URL generation
  getPublicUrl(path: string): string;
  getSignedUrl(path: string, expiresIn?: number): Promise<string>;

  // Metadata
  getFileInfo(path: string): Promise<FileInfo>;
  updateMetadata(
    path: string,
    metadata: Record<string, string>,
  ): Promise<FileInfo>;

  // Sharing
  share(path: string, options: ShareOptions): Promise<ShareResult>;
  revokeShare(shareId: string): Promise<void>;

  // Stats
  getStats(userId?: string): Promise<StorageStats>;

  // Real-time
  subscribe(callback: StorageEventCallback): () => void;
}
