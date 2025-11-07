import { API_BASE, apiFetch } from '@/services/api';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

export interface UploadedFileInfo {
  ok: boolean;
  message?: string;
  file?: {
    originalName: string;
    savedAs: string;
    mimeType: string;
    size: number;
    path: string; // e.g. /uploads/<filename>
  }
}

/**
 * Upload a single file to self-hosted storage via /v1/storage/upload (multer backend)
 * @param file An object with uri, name, type compatible with React Native fetch/FormData
 * @returns UploadedFileInfo from server
 */
export async function uploadFile(form: { uri: string; name: string; type: string }, extraFields?: Record<string, string | number>): Promise<UploadedFileInfo> {
  const body = new FormData();
  // RN FormData requires file as { uri, name, type }
  body.append('file', {
    // @ts-ignore FormData React Native type
    uri: form.uri,
    name: form.name,
    type: form.type,
  } as any);

  if (extraFields) {
    Object.entries(extraFields).forEach(([k, v]) => body.append(k, String(v)));
  }

  // Use apiFetch which will preserve multipart headers (we remove JSON header if FormData)
  const res = await apiFetch<UploadedFileInfo>('/v1/storage/upload', {
    method: 'POST',
    data: body,
    timeoutMs: 30000,
  });
  return res;
}

export async function uploadFileWithProgress(
  form: { uri: string; name: string; type: string },
  extraFields?: Record<string, string | number>,
  onProgress?: (p: { totalBytesSent: number; totalBytesExpectedToSend: number; progress: number }) => void,
) {
  if (Platform.OS !== 'web' && typeof (FileSystem as any).createUploadResumable === 'function') {
    const url = `${API_BASE}/v1/storage/upload`;
    const task = (FileSystem as any).createUploadResumable(
      form.uri,
      url,
      {
        httpMethod: 'POST',
        uploadType: (FileSystem as any).FileSystemUploadType.MULTIPART,
        fieldName: 'file',
        parameters: { ...(extraFields || {}), filename: form.name, mimeType: form.type },
        headers: {},
      },
      (data: any) => {
        const total = data.totalBytesExpectedToSend ?? 0;
        const sent = data.totalBytesSent ?? 0;
        if (onProgress && total > 0) onProgress({ totalBytesSent: sent, totalBytesExpectedToSend: total, progress: sent / total });
      }
    );
    const result = await task.uploadAsync();
    const status = result?.status || 0;
    if (status < 200 || status >= 300) throw new Error(`Upload thất bại (${status})`);
    try {
      return JSON.parse(result.body) as UploadedFileInfo;
    } catch {
      return { ok: true } as UploadedFileInfo;
    }
  }

  // Fallback: no progress
  return uploadFile(form, extraFields);
}

export default {
  uploadFile,
  uploadFileWithProgress,
};
