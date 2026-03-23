/**
 * Media Upload Service
 * Handle image, video, audio, and file uploads for messages.
 * All uploads now go through the unified presigned flow.
 */

import {
    CompleteUploadResponse,
    PresignedUploadService,
} from "@/services/PresignedUploadService";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

// ============================================================================
// TYPES
// ============================================================================

export interface UploadedMedia {
  url: string;
  thumbnailUrl?: string;
  size: number;
  duration?: number;
  type: "image" | "video" | "audio" | "file";
}

// ============================================================================
// HELPERS
// ============================================================================

function inferContentType(uri: string, fallback: string): string {
  const filename = uri.split("/").pop() || "";
  const match = /\.(\w+)$/.exec(filename);
  if (!match) return fallback;
  const ext = match[1].toLowerCase();
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    heic: "image/heic",
    mp4: "video/mp4",
    mov: "video/quicktime",
    m4v: "video/x-m4v",
    m4a: "audio/x-m4a",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    pdf: "application/pdf",
  };
  return map[ext] || fallback;
}

function toUploadedMedia(
  r: CompleteUploadResponse,
  type: "image" | "video" | "audio" | "file",
): UploadedMedia {
  return {
    url: r.fileUrl,
    thumbnailUrl: r.thumbnailUrl,
    size: r.fileSize,
    type,
  };
}

async function uploadViaPresigned(
  uri: string,
  type: "image" | "video" | "audio" | "file",
  fallbackMime: string,
): Promise<UploadedMedia> {
  const filename = uri.split("/").pop() || `${type}_${Date.now()}`;
  const contentType = inferContentType(uri, fallbackMime);
  const result = await PresignedUploadService.upload(uri, {
    filename,
    contentType,
    context: {
      type:
        type === "image"
          ? "project"
          : type === "file"
            ? "document"
            : type === "audio"
              ? "document"
              : type,
    },
  });
  return toUploadedMedia(result, type);
}

// ============================================================================
// UPLOAD FUNCTIONS
// ============================================================================

export async function uploadImage(uri: string): Promise<UploadedMedia> {
  return uploadViaPresigned(uri, "image", "image/jpeg");
}

export async function uploadVideo(uri: string): Promise<UploadedMedia> {
  return uploadViaPresigned(uri, "video", "video/mp4");
}

export async function uploadAudio(uri: string): Promise<UploadedMedia> {
  return uploadViaPresigned(uri, "audio", "audio/m4a");
}

export async function uploadFile(
  uri: string,
  _fileName?: string,
): Promise<UploadedMedia> {
  return uploadViaPresigned(uri, "file", "application/octet-stream");
}

// ============================================================================
// PICK + UPLOAD COMBOS
// ============================================================================

export async function pickAndUploadImage(): Promise<UploadedMedia | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") throw new Error("Permission denied");

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 0.8,
    aspect: [4, 3],
  });
  if (result.canceled || !result.assets[0]) return null;
  return uploadImage(result.assets[0].uri);
}

export async function pickAndUploadVideo(): Promise<UploadedMedia | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") throw new Error("Permission denied");

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["videos"],
    allowsEditing: true,
    quality: 0.8,
  });
  if (result.canceled || !result.assets[0]) return null;
  return uploadVideo(result.assets[0].uri);
}

export async function takePhotoAndUpload(): Promise<UploadedMedia | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") throw new Error("Camera permission denied");

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    quality: 0.8,
    aspect: [4, 3],
  });
  if (result.canceled || !result.assets[0]) return null;
  return uploadImage(result.assets[0].uri);
}

export async function pickAndUploadDocument(): Promise<UploadedMedia | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: "*/*",
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  return uploadFile(asset.uri, asset.name);
}

// ============================================================================
// FORMATTING HELPERS
// ============================================================================

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
