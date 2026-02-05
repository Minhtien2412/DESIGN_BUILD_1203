/**
 * File Picker Utility
 * Cross-platform file selection with preview
 */

import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";

// File types
export type FileType = "image" | "video" | "document" | "any";

// Picked file result
export interface PickedFile {
  uri: string;
  name: string;
  type: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
}

// Pick options
export interface FilePickerOptions {
  /** File type to pick */
  fileType?: FileType;
  /** Allow multiple selection */
  multiple?: boolean;
  /** Max file size in bytes */
  maxSize?: number;
  /** Allowed MIME types */
  allowedMimeTypes?: string[];
  /** Quality for images (0-1) */
  imageQuality?: number;
  /** Allow editing for images */
  allowsEditing?: boolean;
  /** Aspect ratio for image editing */
  aspect?: [number, number];
}

// Default MIME types by file type
const MIME_TYPE_GROUPS: Record<FileType, string[]> = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/heic"],
  video: ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"],
  document: [
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
  any: ["*/*"],
};

/**
 * Request camera permissions
 */
export async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === "granted";
}

/**
 * Request media library permissions
 */
export async function requestMediaLibraryPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === "granted";
}

/**
 * Pick image from library
 */
export async function pickImage(
  options: FilePickerOptions = {},
): Promise<PickedFile | null> {
  const {
    multiple = false,
    imageQuality = 0.8,
    allowsEditing = false,
    aspect,
    maxSize,
  } = options;

  const permission = await requestMediaLibraryPermission();
  if (!permission) {
    throw new Error("Media library permission denied");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing,
    aspect,
    quality: imageQuality,
    allowsMultipleSelection: multiple,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];

  // Get file info
  const fileInfo = await FileSystem.getInfoAsync(asset.uri);

  // Check size
  if (maxSize && fileInfo.exists && fileInfo.size && fileInfo.size > maxSize) {
    throw new Error(`File size exceeds limit (${formatBytes(maxSize)})`);
  }

  return {
    uri: asset.uri,
    name: asset.fileName || `image_${Date.now()}.jpg`,
    type: asset.mimeType || "image/jpeg",
    size: fileInfo.exists && fileInfo.size ? fileInfo.size : 0,
    width: asset.width,
    height: asset.height,
  };
}

/**
 * Pick video from library
 */
export async function pickVideo(
  options: FilePickerOptions = {},
): Promise<PickedFile | null> {
  const { imageQuality = 0.8, maxSize } = options;

  const permission = await requestMediaLibraryPermission();
  if (!permission) {
    throw new Error("Media library permission denied");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    quality: imageQuality,
    videoMaxDuration: 300, // 5 minutes max
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];
  const fileInfo = await FileSystem.getInfoAsync(asset.uri);

  if (maxSize && fileInfo.exists && fileInfo.size && fileInfo.size > maxSize) {
    throw new Error(`File size exceeds limit (${formatBytes(maxSize)})`);
  }

  return {
    uri: asset.uri,
    name: asset.fileName || `video_${Date.now()}.mp4`,
    type: asset.mimeType || "video/mp4",
    size: fileInfo.exists && fileInfo.size ? fileInfo.size : 0,
    width: asset.width,
    height: asset.height,
    duration: asset.duration ?? undefined,
  };
}

/**
 * Pick document from file system
 */
export async function pickDocument(
  options: FilePickerOptions = {},
): Promise<PickedFile | null> {
  const {
    fileType = "document",
    multiple = false,
    maxSize,
    allowedMimeTypes,
  } = options;

  const mimeTypes = allowedMimeTypes || MIME_TYPE_GROUPS[fileType] || ["*/*"];

  const result = await DocumentPicker.getDocumentAsync({
    type: mimeTypes,
    multiple,
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];

  if (maxSize && asset.size && asset.size > maxSize) {
    throw new Error(`File size exceeds limit (${formatBytes(maxSize)})`);
  }

  return {
    uri: asset.uri,
    name: asset.name || `document_${Date.now()}`,
    type: asset.mimeType || "application/octet-stream",
    size: asset.size || 0,
  };
}

/**
 * Take photo with camera
 */
export async function takePhoto(
  options: FilePickerOptions = {},
): Promise<PickedFile | null> {
  const {
    imageQuality = 0.8,
    allowsEditing = false,
    aspect,
    maxSize,
  } = options;

  const permission = await requestCameraPermission();
  if (!permission) {
    throw new Error("Camera permission denied");
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing,
    aspect,
    quality: imageQuality,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];
  const fileInfo = await FileSystem.getInfoAsync(asset.uri);

  if (maxSize && fileInfo.exists && fileInfo.size && fileInfo.size > maxSize) {
    throw new Error(`File size exceeds limit (${formatBytes(maxSize)})`);
  }

  return {
    uri: asset.uri,
    name: asset.fileName || `photo_${Date.now()}.jpg`,
    type: asset.mimeType || "image/jpeg",
    size: fileInfo.exists && fileInfo.size ? fileInfo.size : 0,
    width: asset.width,
    height: asset.height,
  };
}

/**
 * Record video with camera
 */
export async function recordVideo(
  options: FilePickerOptions = {},
): Promise<PickedFile | null> {
  const { imageQuality = 0.8, maxSize } = options;

  const permission = await requestCameraPermission();
  if (!permission) {
    throw new Error("Camera permission denied");
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    quality: imageQuality,
    videoMaxDuration: 60, // 1 minute max for recorded video
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];
  const fileInfo = await FileSystem.getInfoAsync(asset.uri);

  if (maxSize && fileInfo.exists && fileInfo.size && fileInfo.size > maxSize) {
    throw new Error(`File size exceeds limit (${formatBytes(maxSize)})`);
  }

  return {
    uri: asset.uri,
    name: asset.fileName || `video_${Date.now()}.mp4`,
    type: asset.mimeType || "video/mp4",
    size: fileInfo.exists && fileInfo.size ? fileInfo.size : 0,
    width: asset.width,
    height: asset.height,
    duration: asset.duration ?? undefined,
  };
}

/**
 * Pick any file type
 */
export async function pickFile(
  options: FilePickerOptions = {},
): Promise<PickedFile | null> {
  const { fileType = "any" } = options;

  switch (fileType) {
    case "image":
      return pickImage(options);
    case "video":
      return pickVideo(options);
    case "document":
      return pickDocument(options);
    default:
      return pickDocument({ ...options, fileType: "any" });
  }
}

/**
 * Pick multiple files of any type
 */
export async function pickMultipleFiles(
  options: FilePickerOptions = {},
): Promise<PickedFile[]> {
  const { fileType = "any", allowedMimeTypes } = options;

  const mimeTypes = allowedMimeTypes || MIME_TYPE_GROUPS[fileType] || ["*/*"];

  const result = await DocumentPicker.getDocumentAsync({
    type: mimeTypes,
    multiple: true,
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets) {
    return [];
  }

  // Map assets to PickedFile format
  const pickedFiles: PickedFile[] = result.assets.map(
    (asset: {
      uri: string;
      name: string;
      mimeType?: string | null;
      size?: number | null;
    }) => ({
      uri: asset.uri,
      name: asset.name || `file_${Date.now()}`,
      type: asset.mimeType || "application/octet-stream",
      size: asset.size || 0,
    }),
  );

  return pickedFiles;
}

// Helper: Format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// Export all
export default {
  pickImage,
  pickVideo,
  pickDocument,
  pickFile,
  pickMultipleFiles,
  takePhoto,
  recordVideo,
  requestCameraPermission,
  requestMediaLibraryPermission,
};
