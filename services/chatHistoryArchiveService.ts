/**
 * Chat History Archive Service
 * ============================
 *
 * Quản lý việc trích xuất và lưu trữ lịch sử chat:
 * - Mỗi user có nơi lưu trữ tạm trong database server
 * - Sau 5 ngày, lịch sử được lưu xuống máy người dùng
 * - Bao gồm cả media files với giới hạn:
 *   + Ảnh: max 5MB
 *   + Tài liệu: max 20MB
 *
 * @author ThietKeResort Team
 * @created 2025-01-27
 */

import { apiFetch } from "@/services/api";
import * as FSCompat from "@/utils/FileSystemCompat";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// ============================================
// CONSTANTS
// ============================================

/** Số ngày lưu trữ tạm trên server trước khi chuyển về local */
export const SERVER_RETENTION_DAYS = 5;

/** Giới hạn kích thước file */
export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB cho ảnh
  DOCUMENT: 20 * 1024 * 1024, // 20MB cho tài liệu
  VIDEO: 50 * 1024 * 1024, // 50MB cho video
  AUDIO: 10 * 1024 * 1024, // 10MB cho audio
};

/** Các loại file được hỗ trợ */
export const SUPPORTED_FILE_TYPES = {
  IMAGE: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/heic",
    "image/heif",
  ],
  DOCUMENT: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "application/zip",
    "application/x-rar-compressed",
  ],
  VIDEO: ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"],
  AUDIO: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/aac", "audio/m4a"],
};

/** Storage keys */
const STORAGE_KEYS = {
  ARCHIVE_METADATA: "@chat_archive_metadata",
  ARCHIVE_INDEX: "@chat_archive_index",
  LAST_SYNC: "@chat_archive_last_sync",
  USER_ARCHIVES: (userId: string) => `@chat_archive_user_${userId}`,
};

/** Thư mục lưu trữ local */
export const ARCHIVE_DIRECTORY =
  Platform.OS === "web" ? "" : `${FSCompat.documentDirectory}chat_archives/`;
export const MEDIA_DIRECTORY =
  Platform.OS === "web" ? "" : `${FSCompat.documentDirectory}chat_media/`;

// ============================================
// TYPES
// ============================================

/** Metadata của một archive */
export interface ArchiveMetadata {
  id: string;
  userId: string;
  conversationId: string;
  conversationName?: string;
  startDate: string;
  endDate: string;
  messageCount: number;
  mediaCount: number;
  totalSize: number;
  createdAt: string;
  archivedAt?: string;
  isLocal: boolean;
  localPath?: string;
}

/** Tin nhắn trong archive */
export interface ArchivedMessage {
  id: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE" | "STICKER" | "LOCATION";
  content?: string;
  attachments?: ArchivedAttachment[];
  replyTo?: string;
  timestamp: string;
  editedAt?: string;
}

/** File đính kèm trong archive */
export interface ArchivedAttachment {
  id: string;
  type: "IMAGE" | "VIDEO" | "AUDIO" | "FILE";
  originalUrl: string;
  localPath?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  thumbnail?: string;
  duration?: number; // For video/audio
  width?: number; // For image/video
  height?: number; // For image/video
  isDownloaded: boolean;
}

/** Archive đầy đủ */
export interface ChatArchive {
  metadata: ArchiveMetadata;
  messages: ArchivedMessage[];
}

/** Validation result */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
  fileType?: keyof typeof FILE_SIZE_LIMITS;
  fileSize?: number;
  maxSize?: number;
}

/** Sync status */
export interface ArchiveSyncStatus {
  userId: string;
  lastSync: string;
  pendingArchives: number;
  localArchives: number;
  totalSize: number;
}

// ============================================
// CHAT HISTORY ARCHIVE SERVICE
// ============================================

class ChatHistoryArchiveService {
  private static instance: ChatHistoryArchiveService;
  private initialized = false;

  private constructor() {}

  static getInstance(): ChatHistoryArchiveService {
    if (!ChatHistoryArchiveService.instance) {
      ChatHistoryArchiveService.instance = new ChatHistoryArchiveService();
    }
    return ChatHistoryArchiveService.instance;
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  /**
   * Initialize the archive service
   */
  async initialize(): Promise<void> {
    if (this.initialized || Platform.OS === "web") return;

    try {
      // Create directories if they don't exist
      const archiveDirInfo = await FSCompat.getInfoAsync(ARCHIVE_DIRECTORY);
      if (!archiveDirInfo.exists) {
        await FSCompat.makeDirectoryAsync(ARCHIVE_DIRECTORY, {
          intermediates: true,
        });
      }

      const mediaDirInfo = await FSCompat.getInfoAsync(MEDIA_DIRECTORY);
      if (!mediaDirInfo.exists) {
        await FSCompat.makeDirectoryAsync(MEDIA_DIRECTORY, {
          intermediates: true,
        });
      }

      this.initialized = true;
      console.log("[ChatArchive] Service initialized successfully");
    } catch (error) {
      console.error("[ChatArchive] Failed to initialize:", error);
    }
  }

  // ============================================
  // FILE VALIDATION
  // ============================================

  /**
   * Validate file before upload/archive
   */
  validateFile(
    fileName: string,
    fileSize: number,
    mimeType: string,
  ): FileValidationResult {
    // Determine file type
    let fileType: keyof typeof FILE_SIZE_LIMITS | undefined;

    if (SUPPORTED_FILE_TYPES.IMAGE.includes(mimeType)) {
      fileType = "IMAGE";
    } else if (SUPPORTED_FILE_TYPES.DOCUMENT.includes(mimeType)) {
      fileType = "DOCUMENT";
    } else if (SUPPORTED_FILE_TYPES.VIDEO.includes(mimeType)) {
      fileType = "VIDEO";
    } else if (SUPPORTED_FILE_TYPES.AUDIO.includes(mimeType)) {
      fileType = "AUDIO";
    }

    if (!fileType) {
      return {
        valid: false,
        error: `Loại file không được hỗ trợ: ${mimeType}`,
        fileSize,
      };
    }

    const maxSize = FILE_SIZE_LIMITS[fileType];

    if (fileSize > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
      return {
        valid: false,
        error: `File quá lớn (${fileSizeMB}MB). Giới hạn cho ${fileType.toLowerCase()} là ${maxSizeMB}MB`,
        fileType,
        fileSize,
        maxSize,
      };
    }

    return {
      valid: true,
      fileType,
      fileSize,
      maxSize,
    };
  }

  /**
   * Get formatted file size limit text
   */
  getFileSizeLimitText(type: "IMAGE" | "DOCUMENT" | "VIDEO" | "AUDIO"): string {
    const sizeInMB = FILE_SIZE_LIMITS[type] / (1024 * 1024);
    return `${sizeInMB}MB`;
  }

  // ============================================
  // SERVER SYNC - Fetch from server
  // ============================================

  /**
   * Fetch chat history from server for archiving
   * Server stores messages for 5 days before they should be archived locally
   */
  async fetchServerHistory(
    userId: string,
    conversationId: string,
    fromDate?: Date,
    toDate?: Date,
  ): Promise<ChatArchive | null> {
    try {
      const params = new URLSearchParams({
        conversationId,
      });

      if (fromDate) {
        params.set("fromDate", fromDate.toISOString());
      }
      if (toDate) {
        params.set("toDate", toDate.toISOString());
      }

      const queryString = params.toString();
      const response = await apiFetch<{
        messages: ArchivedMessage[];
        metadata: ArchiveMetadata;
      }>(`/chat/history/archive/${conversationId}?${queryString}`, {
        method: "GET",
      });

      if (!response) return null;

      return {
        metadata: {
          ...response.metadata,
          userId,
          isLocal: false,
        },
        messages: response.messages,
      };
    } catch (error) {
      console.error("[ChatArchive] Failed to fetch server history:", error);
      return null;
    }
  }

  /**
   * Get list of archives ready to be downloaded (older than 5 days)
   */
  async getPendingArchives(userId: string): Promise<ArchiveMetadata[]> {
    try {
      const params = new URLSearchParams({
        userId,
        retentionDays: SERVER_RETENTION_DAYS.toString(),
      });

      const response = await apiFetch<{ archives: ArchiveMetadata[] }>(
        `/chat/history/pending-archives?${params.toString()}`,
        {
          method: "GET",
        },
      );

      return response?.archives || [];
    } catch (error: any) {
      // Silently return empty array for 404 (API not implemented yet)
      if (
        error?.status === 404 ||
        error?.message?.includes("404") ||
        error?.message?.includes("Not Found")
      ) {
        // Don't log error for expected 404 - API endpoint not yet implemented
        return [];
      }
      console.error("[ChatArchive] Failed to get pending archives:", error);
      return [];
    }
  }

  // ============================================
  // LOCAL STORAGE
  // ============================================

  /**
   * Save archive to local storage
   */
  async saveArchiveLocally(archive: ChatArchive): Promise<boolean> {
    if (Platform.OS === "web") {
      console.log("[ChatArchive] Local storage not available on web");
      return false;
    }

    try {
      await this.initialize();

      const archiveId = archive.metadata.id;
      const userId = archive.metadata.userId;

      // Save messages to file
      const archivePath = `${ARCHIVE_DIRECTORY}${archiveId}.json`;
      await FSCompat.writeAsStringAsync(archivePath, JSON.stringify(archive), {
        encoding: FSCompat.EncodingType.UTF8,
      });

      // Update metadata
      archive.metadata.isLocal = true;
      archive.metadata.localPath = archivePath;
      archive.metadata.archivedAt = new Date().toISOString();

      // Update index
      await this.updateArchiveIndex(userId, archive.metadata);

      console.log(`[ChatArchive] Archive saved locally: ${archiveId}`);
      return true;
    } catch (error) {
      console.error("[ChatArchive] Failed to save archive locally:", error);
      return false;
    }
  }

  /**
   * Download and save media files locally
   */
  async downloadArchiveMedia(archive: ChatArchive): Promise<number> {
    if (Platform.OS === "web") return 0;

    let downloadedCount = 0;

    for (const message of archive.messages) {
      if (!message.attachments) continue;

      for (const attachment of message.attachments) {
        if (attachment.isDownloaded && attachment.localPath) continue;

        try {
          // Validate file size before download
          const validation = this.validateFile(
            attachment.fileName,
            attachment.fileSize,
            attachment.mimeType,
          );

          if (!validation.valid) {
            console.warn(`[ChatArchive] Skip download: ${validation.error}`);
            continue;
          }

          // Create directory for this archive's media
          const mediaDir = `${MEDIA_DIRECTORY}${archive.metadata.id}/`;
          const mediaDirInfo = await FSCompat.getInfoAsync(mediaDir);
          if (!mediaDirInfo.exists) {
            await FSCompat.makeDirectoryAsync(mediaDir, {
              intermediates: true,
            });
          }

          // Download file
          const localPath = `${mediaDir}${attachment.id}_${attachment.fileName}`;
          const downloadResult = await FSCompat.downloadAsync(
            attachment.originalUrl,
            localPath,
          );

          if (downloadResult.status === 200) {
            attachment.localPath = localPath;
            attachment.isDownloaded = true;
            downloadedCount++;
          }
        } catch (error) {
          console.error(
            `[ChatArchive] Failed to download media ${attachment.id}:`,
            error,
          );
        }
      }
    }

    // Update archive with new local paths
    if (downloadedCount > 0) {
      await this.saveArchiveLocally(archive);
    }

    return downloadedCount;
  }

  /**
   * Load archive from local storage
   */
  async loadLocalArchive(archiveId: string): Promise<ChatArchive | null> {
    if (Platform.OS === "web") return null;

    try {
      const archivePath = `${ARCHIVE_DIRECTORY}${archiveId}.json`;
      const archiveInfo = await FSCompat.getInfoAsync(archivePath);

      if (!archiveInfo.exists) {
        console.warn(`[ChatArchive] Archive not found: ${archiveId}`);
        return null;
      }

      const content = await FSCompat.readAsStringAsync(archivePath, {
        encoding: FSCompat.EncodingType.UTF8,
      });

      return JSON.parse(content) as ChatArchive;
    } catch (error) {
      console.error("[ChatArchive] Failed to load local archive:", error);
      return null;
    }
  }

  /**
   * Get all local archives for a user
   */
  async getLocalArchives(userId: string): Promise<ArchiveMetadata[]> {
    try {
      const indexKey = STORAGE_KEYS.USER_ARCHIVES(userId);
      const indexData = await AsyncStorage.getItem(indexKey);

      if (!indexData) return [];

      const archives: ArchiveMetadata[] = JSON.parse(indexData);
      return archives.filter((a) => a.isLocal);
    } catch (error) {
      console.error("[ChatArchive] Failed to get local archives:", error);
      return [];
    }
  }

  /**
   * Update archive index
   */
  private async updateArchiveIndex(
    userId: string,
    metadata: ArchiveMetadata,
  ): Promise<void> {
    try {
      const indexKey = STORAGE_KEYS.USER_ARCHIVES(userId);
      const existingData = await AsyncStorage.getItem(indexKey);
      const archives: ArchiveMetadata[] = existingData
        ? JSON.parse(existingData)
        : [];

      // Update or add
      const existingIndex = archives.findIndex((a) => a.id === metadata.id);
      if (existingIndex >= 0) {
        archives[existingIndex] = metadata;
      } else {
        archives.push(metadata);
      }

      // Sort by date (newest first)
      archives.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      await AsyncStorage.setItem(indexKey, JSON.stringify(archives));
    } catch (error) {
      console.error("[ChatArchive] Failed to update archive index:", error);
    }
  }

  // ============================================
  // AUTO-SYNC (Scheduled)
  // ============================================

  /**
   * Sync and archive old messages (should be called periodically)
   */
  async syncAndArchive(userId: string): Promise<number> {
    try {
      // Get pending archives from server (messages older than 5 days)
      const pendingArchives = await this.getPendingArchives(userId);

      if (pendingArchives.length === 0) {
        console.log("[ChatArchive] No pending archives to sync");
        return 0;
      }

      let archivedCount = 0;

      for (const metadata of pendingArchives) {
        // Fetch full archive from server
        const archive = await this.fetchServerHistory(
          userId,
          metadata.conversationId,
        );

        if (!archive) continue;

        // Save locally
        const saved = await this.saveArchiveLocally(archive);
        if (saved) {
          // Download media files
          await this.downloadArchiveMedia(archive);

          // Notify server that archive is saved locally
          await this.confirmArchiveDownload(userId, metadata.id);

          archivedCount++;
        }
      }

      // Update last sync time
      await AsyncStorage.setItem(
        STORAGE_KEYS.LAST_SYNC,
        new Date().toISOString(),
      );

      console.log(`[ChatArchive] Synced ${archivedCount} archives`);
      return archivedCount;
    } catch (error) {
      console.error("[ChatArchive] Sync failed:", error);
      return 0;
    }
  }

  /**
   * Confirm to server that archive is downloaded locally
   */
  private async confirmArchiveDownload(
    userId: string,
    archiveId: string,
  ): Promise<void> {
    try {
      await apiFetch(`/chat/history/archive/${archiveId}/confirm`, {
        method: "POST",
        data: { userId },
      });
    } catch (error) {
      console.error("[ChatArchive] Failed to confirm download:", error);
    }
  }

  // ============================================
  // SEARCH & QUERY
  // ============================================

  /**
   * Search messages in local archives
   */
  async searchLocalArchives(
    userId: string,
    query: string,
    conversationId?: string,
  ): Promise<{ archive: ArchiveMetadata; messages: ArchivedMessage[] }[]> {
    const results: {
      archive: ArchiveMetadata;
      messages: ArchivedMessage[];
    }[] = [];

    try {
      const archives = await this.getLocalArchives(userId);
      const filteredArchives = conversationId
        ? archives.filter((a) => a.conversationId === conversationId)
        : archives;

      for (const metadata of filteredArchives) {
        const archive = await this.loadLocalArchive(metadata.id);
        if (!archive) continue;

        const matchingMessages = archive.messages.filter(
          (msg) =>
            msg.content?.toLowerCase().includes(query.toLowerCase()) ||
            msg.attachments?.some((a) =>
              a.fileName.toLowerCase().includes(query.toLowerCase()),
            ),
        );

        if (matchingMessages.length > 0) {
          results.push({
            archive: metadata,
            messages: matchingMessages,
          });
        }
      }
    } catch (error) {
      console.error("[ChatArchive] Search failed:", error);
    }

    return results;
  }

  /**
   * Get archive statistics
   */
  async getArchiveStats(userId: string): Promise<ArchiveSyncStatus> {
    try {
      const localArchives = await this.getLocalArchives(userId);
      const pendingArchives = await this.getPendingArchives(userId);
      const lastSyncStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);

      const totalSize = localArchives.reduce((sum, a) => sum + a.totalSize, 0);

      return {
        userId,
        lastSync: lastSyncStr || "Never",
        pendingArchives: pendingArchives.length,
        localArchives: localArchives.length,
        totalSize,
      };
    } catch (error) {
      console.error("[ChatArchive] Failed to get stats:", error);
      return {
        userId,
        lastSync: "Unknown",
        pendingArchives: 0,
        localArchives: 0,
        totalSize: 0,
      };
    }
  }

  // ============================================
  // CLEANUP
  // ============================================

  /**
   * Delete old local archives (older than retention period)
   */
  async cleanupOldArchives(
    userId: string,
    retentionDays: number = 365,
  ): Promise<number> {
    if (Platform.OS === "web") return 0;

    let deletedCount = 0;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    try {
      const archives = await this.getLocalArchives(userId);

      for (const metadata of archives) {
        const archiveDate = new Date(metadata.endDate);

        if (archiveDate < cutoffDate) {
          // Delete archive file
          if (metadata.localPath) {
            await FSCompat.deleteAsync(metadata.localPath, {
              idempotent: true,
            });
          }

          // Delete media directory
          const mediaDir = `${MEDIA_DIRECTORY}${metadata.id}/`;
          await FSCompat.deleteAsync(mediaDir, { idempotent: true });

          deletedCount++;
        }
      }

      // Update index
      const remainingArchives = archives.filter(
        (a) => new Date(a.endDate) >= cutoffDate,
      );
      const indexKey = STORAGE_KEYS.USER_ARCHIVES(userId);
      await AsyncStorage.setItem(indexKey, JSON.stringify(remainingArchives));

      console.log(`[ChatArchive] Cleaned up ${deletedCount} old archives`);
    } catch (error) {
      console.error("[ChatArchive] Cleanup failed:", error);
    }

    return deletedCount;
  }

  /**
   * Delete specific archive
   */
  async deleteArchive(userId: string, archiveId: string): Promise<boolean> {
    if (Platform.OS === "web") return false;

    try {
      // Delete files
      const archivePath = `${ARCHIVE_DIRECTORY}${archiveId}.json`;
      await FSCompat.deleteAsync(archivePath, { idempotent: true });

      const mediaDir = `${MEDIA_DIRECTORY}${archiveId}/`;
      await FSCompat.deleteAsync(mediaDir, { idempotent: true });

      // Update index
      const archives = await this.getLocalArchives(userId);
      const updatedArchives = archives.filter((a) => a.id !== archiveId);
      const indexKey = STORAGE_KEYS.USER_ARCHIVES(userId);
      await AsyncStorage.setItem(indexKey, JSON.stringify(updatedArchives));

      console.log(`[ChatArchive] Deleted archive: ${archiveId}`);
      return true;
    } catch (error) {
      console.error("[ChatArchive] Failed to delete archive:", error);
      return false;
    }
  }

  /**
   * Get total local storage used by archives
   */
  async getLocalStorageUsed(userId: string): Promise<number> {
    if (Platform.OS === "web") return 0;

    try {
      let totalSize = 0;

      // Archive files size
      const archiveDir = await FSCompat.getInfoAsync(ARCHIVE_DIRECTORY);
      if (archiveDir.exists) {
        const files = await FSCompat.readDirectoryAsync(ARCHIVE_DIRECTORY);
        for (const file of files) {
          const fileInfo = await FSCompat.getInfoAsync(
            `${ARCHIVE_DIRECTORY}${file}`,
          );
          if (fileInfo.exists && "size" in fileInfo) {
            totalSize += fileInfo.size || 0;
          }
        }
      }

      // Media files size
      const mediaDir = await FSCompat.getInfoAsync(MEDIA_DIRECTORY);
      if (mediaDir.exists) {
        const folders = await FSCompat.readDirectoryAsync(MEDIA_DIRECTORY);
        for (const folder of folders) {
          const folderPath = `${MEDIA_DIRECTORY}${folder}/`;
          const folderInfo = await FSCompat.getInfoAsync(folderPath);
          if (folderInfo.exists) {
            const mediaFiles = await FSCompat.readDirectoryAsync(folderPath);
            for (const mediaFile of mediaFiles) {
              const fileInfo = await FSCompat.getInfoAsync(
                `${folderPath}${mediaFile}`,
              );
              if (fileInfo.exists && "size" in fileInfo) {
                totalSize += fileInfo.size || 0;
              }
            }
          }
        }
      }

      return totalSize;
    } catch (error) {
      console.error("[ChatArchive] Failed to calculate storage:", error);
      return 0;
    }
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const chatHistoryArchiveService =
  ChatHistoryArchiveService.getInstance();
export default chatHistoryArchiveService;

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format bytes to human readable size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Check if file type is image
 */
export function isImageFile(mimeType: string): boolean {
  return SUPPORTED_FILE_TYPES.IMAGE.includes(mimeType);
}

/**
 * Check if file type is document
 */
export function isDocumentFile(mimeType: string): boolean {
  return SUPPORTED_FILE_TYPES.DOCUMENT.includes(mimeType);
}

/**
 * Get file type category
 */
export function getFileCategory(
  mimeType: string,
): keyof typeof FILE_SIZE_LIMITS | null {
  if (SUPPORTED_FILE_TYPES.IMAGE.includes(mimeType)) return "IMAGE";
  if (SUPPORTED_FILE_TYPES.DOCUMENT.includes(mimeType)) return "DOCUMENT";
  if (SUPPORTED_FILE_TYPES.VIDEO.includes(mimeType)) return "VIDEO";
  if (SUPPORTED_FILE_TYPES.AUDIO.includes(mimeType)) return "AUDIO";
  return null;
}
