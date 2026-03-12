/**
 * useFileUpload Hook
 * Handles file uploads via presigned URL flow with progress tracking.
 * Uses PresignedUploadService for secure, resumable uploads.
 */

import { del } from "@/services/api";
import {
  PresignedUploadService,
  type UploadProgress as PresignProgress,
  type UploadContext,
} from "@/services/PresignedUploadService";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";

export interface UploadOptions {
  category?: "general" | "projects" | "profiles" | "documents";
  description?: string;
  tags?: string[];
}

export interface UploadedFile {
  id: number | string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  category: string;
  publicUrl: string;
  storageType: string;
  uploadedAt: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

const CATEGORY_TO_CONTEXT: Record<string, UploadContext["type"]> = {
  general: "document",
  projects: "project",
  profiles: "profile",
  documents: "document",
};

function guessContentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    heic: "image/heic",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    mp4: "video/mp4",
    mov: "video/quicktime",
    zip: "application/zip",
  };
  return map[ext || ""] || "application/octet-stream";
}

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        throw new Error("Permission to access gallery is required");
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return null;
      return result.assets[0].uri;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to pick image");
      return null;
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        throw new Error("Permission to access camera is required");
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return null;
      return result.assets[0].uri;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to take photo");
      return null;
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "image/*",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.*",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return null;
      return result.assets[0].uri;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to pick document");
      return null;
    }
  };

  const uploadFile = async (
    uri: string,
    options: UploadOptions = {},
  ): Promise<UploadedFile | null> => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const filename = uri.split("/").pop() || "upload.jpg";
      const contentType = guessContentType(filename);
      const contextType =
        CATEGORY_TO_CONTEXT[options.category || "general"] || "document";

      const result = await PresignedUploadService.upload(uri, {
        filename,
        contentType,
        context: { type: contextType },
        metadata: {
          description: options.description,
          tags: options.tags,
        },
        onProgress: (p: PresignProgress) => {
          setProgress(p.progress);
        },
      });

      setProgress(100);

      return {
        id: result.fileId,
        filename: result.filename,
        originalName: result.filename,
        mimetype: result.contentType,
        size: result.fileSize,
        category: options.category || "general",
        publicUrl: result.fileUrl,
        storageType: "presigned",
        uploadedAt: result.createdAt,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      console.error("[useFileUpload] Upload error:", err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadMultiple = async (
    uris: string[],
    options: UploadOptions = {},
  ): Promise<UploadedFile[]> => {
    const results: UploadedFile[] = [];
    for (const uri of uris) {
      const result = await uploadFile(uri, options);
      if (result) results.push(result);
    }
    return results;
  };

  const deleteFile = async (fileId: number | string): Promise<boolean> => {
    try {
      await del(`/api/v1/files/${fileId}`);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete file");
      return false;
    }
  };

  return {
    uploading,
    progress,
    error,
    pickImage,
    takePhoto,
    pickDocument,
    uploadFile,
    uploadMultiple,
    deleteFile,
    clearError: () => setError(null),
  };
}
