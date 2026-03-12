/**
 * storageUpload.ts — Thin adapter over PresignedUploadService.
 *
 * Kept for backward-compatibility with consumers that import
 * `uploadFile` / `uploadFileWithProgress` from here.
 * All actual upload work goes through the presigned flow.
 */

import {
    CompleteUploadResponse,
    PresignedUploadService,
    UploadProgress,
} from "@/services/PresignedUploadService";

// Re-export the legacy shape so callers keep compiling
export interface UploadedFileInfo {
  ok: boolean;
  message?: string;
  file?: {
    originalName: string;
    savedAs: string;
    mimeType: string;
    size: number;
    path: string;
  };
}

/** Map a CompleteUploadResponse to the old UploadedFileInfo shape */
function toUploadedFileInfo(r: CompleteUploadResponse): UploadedFileInfo {
  return {
    ok: true,
    file: {
      originalName: r.filename,
      savedAs: r.filename,
      mimeType: r.contentType,
      size: r.fileSize,
      path: r.fileUrl,
    },
  };
}

/**
 * Upload a single file via *presigned* flow.
 * @param form  { uri, name, type } — same signature as before
 */
export async function uploadFile(
  form: { uri: string; name: string; type: string },
  _extraFields?: Record<string, string | number>,
): Promise<UploadedFileInfo> {
  const result = await PresignedUploadService.upload(form.uri, {
    filename: form.name,
    contentType: form.type,
  });
  return toUploadedFileInfo(result);
}

/**
 * Upload with progress callback — same public API, now uses presigned flow.
 */
export async function uploadFileWithProgress(
  form: { uri: string; name: string; type: string },
  _extraFields?: Record<string, string | number>,
  onProgress?: (p: {
    totalBytesSent: number;
    totalBytesExpectedToSend: number;
    progress: number;
  }) => void,
): Promise<UploadedFileInfo> {
  const result = await PresignedUploadService.upload(form.uri, {
    filename: form.name,
    contentType: form.type,
    onProgress: onProgress
      ? (prog: UploadProgress) => {
          onProgress({
            totalBytesSent: prog.bytesUploaded,
            totalBytesExpectedToSend: prog.totalBytes,
            progress: prog.progress / 100,
          });
        }
      : undefined,
  });
  return toUploadedFileInfo(result);
}

export default {
  uploadFile,
  uploadFileWithProgress,
};
