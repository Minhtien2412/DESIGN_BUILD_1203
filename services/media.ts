import ENV from '@/config/env';
import { API_BASE, ApiError, apiFetch, getApiKey } from '@/services/api';
import { loadJWT, saveJWT } from '@/utils/secureStorage';
import { getToken } from '@/utils/storage';

// Categories supported by backend media-upload route
export type UploadCategory = 'images' | 'videos' | 'documents' | 'profiles' | 'projects' | 'temp';

export interface MediaUploadResponse {
  success: boolean;
  message?: string;
  data?: {
    original?: { filename?: string; size?: number; sizeLabel?: string; url?: string; type?: string };
    // For images/videos, processor may add more fields (e.g., thumbnails, hls, poster)
    [key: string]: any;
  };
}

function guessMimeType(filename: string): string {
  const ext = (filename.split('.').pop() || '').toLowerCase();
  switch (ext) {
    // Images
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    // Videos
    case 'mp4':
      return 'video/mp4';
    case 'mov':
      return 'video/quicktime';
    case 'mkv':
      return 'video/x-matroska';
    case 'avi':
      return 'video/x-msvideo';
    // Docs
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xls':
      return 'application/vnd.ms-excel';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'ppt':
      return 'application/vnd.ms-powerpoint';
    case 'pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'txt':
      return 'text/plain';
    default:
      return 'application/octet-stream';
  }
}

function toAbsoluteUrl(path: string | undefined | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:/i.test(path)) return path;
  return `${API_BASE}${path}`;
}

export async function uploadMedia(
  category: UploadCategory,
  uri: string,
  filename?: string,
  fields?: Record<string, string | number | boolean>
): Promise<{ url?: string; response: MediaUploadResponse }> {
  const name = filename || uri.split('/').pop() || `upload`;
  const type = guessMimeType(name);

  const form = new FormData();
  form.append('file', { uri, name, type } as any);
  if (fields) {
    Object.entries(fields).forEach(([k, v]) => form.append(k, String(v)));
  }

  try {
    const res = await apiFetch<MediaUploadResponse>(`/api/media/upload/${category}`, {
      method: 'POST',
      data: form,
      timeoutMs: 60_000,
    });

    const url = toAbsoluteUrl(res?.data?.original?.url || (res as any)?.data?.recommended);
    return { url, response: res };
  } catch (e: any) {
    // Attempt token refresh once on 401 then retry
    if (e instanceof ApiError && e.status === 401) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        const res = await apiFetch<MediaUploadResponse>(`/api/media/upload/${category}`, {
          method: 'POST',
          data: form,
          timeoutMs: 60_000,
        });
        const url = toAbsoluteUrl(res?.data?.original?.url || (res as any)?.data?.recommended);
        return { url, response: res };
      }
    }
    throw e;
  }
}

export const uploadImage = (uri: string, filename?: string, fields?: Record<string, any>) =>
  uploadMedia('images', uri, filename, fields);

export const uploadVideo = (uri: string, filename?: string, fields?: Record<string, any>) =>
  uploadMedia('videos', uri, filename, fields);

export const uploadDocument = (uri: string, filename?: string, fields?: Record<string, any>) =>
  uploadMedia('documents', uri, filename, fields);

// Profile avatar update uses PATCH /profile endpoint
export async function updateAvatarOnly(avatarUri: string): Promise<boolean> {
  const name = avatarUri.split('/').pop() || 'avatar.jpg';
  const type = guessMimeType(name) || 'image/jpeg';
  const form = new FormData();
  form.append('avatar', { uri: avatarUri, name, type } as any);

  try {
    // BE uses PATCH /profile (not POST /profile/update)
    await apiFetch('/profile', { method: 'PATCH', data: form, timeoutMs: 15_000 });
    return true;
  } catch (e) {
    console.error('[updateAvatarOnly] Failed:', e);
    return false;
  }
}

// Upload with progress via XMLHttpRequest (useful for large media and UX feedback)
export async function uploadMediaWithProgress(
  category: UploadCategory,
  uri: string,
  filename?: string,
  fields?: Record<string, string | number | boolean>,
  onProgress?: (progress: { loaded: number; total: number; percent: number }) => void
): Promise<{ url?: string; response: MediaUploadResponse }>
{
  const name = filename || uri.split('/')?.pop() || `upload`;
  const type = guessMimeType(name);

  // Try primary token source; fallback to secure storage used elsewhere
  let token = await ensureAuthToken();
  const apiKey = getApiKey?.();

  const form = new FormData();
  form.append('file', { uri, name, type } as any);
  if (fields) {
    Object.entries(fields).forEach(([k, v]) => form.append(k, String(v)));
  }

  const endpoint = `${API_BASE}/api/media/upload/${category}`;

  const result: { resolve?: (v: { url?: string; response: MediaUploadResponse }) => void; reject?: (e: any) => void } = {};
  const promise = new Promise<{ url?: string; response: MediaUploadResponse }>((resolve, reject) => {
    result.resolve = resolve;
    result.reject = reject;
  });

  const sendRequest = (authToken: string | null, hasRetried = false) => {
    const xhr = new XMLHttpRequest();
    // Set a generous timeout to accommodate server-side processing (images/videos)
    xhr.timeout = 300000; // 5 minutes

    xhr.upload.onprogress = (e: ProgressEvent) => {
      if (e.lengthComputable && onProgress) {
        const percent = e.total ? (e.loaded / e.total) * 100 : 0;
        onProgress({ loaded: e.loaded, total: e.total, percent });
      }
    };

    xhr.onload = async () => {
      try {
        // Retry once on 401 by attempting token refresh
        if (xhr.status === 401 && !hasRetried) {
          const refreshed = await tryRefreshToken();
          if (refreshed) {
            return sendRequest(refreshed, true);
          }
        }
        // Reject non-2xx responses early
        if (xhr.status < 200 || xhr.status >= 300) {
          let detail: any = undefined;
          try { detail = JSON.parse(xhr.responseText); } catch {}
          const baseMsg = detail?.message || detail?.error || `Upload failed with status ${xhr.status}`;
          const err: any = new Error(baseMsg);
          err.status = xhr.status;
          err.detail = detail;
          return result.reject?.(err);
        }
        const json: MediaUploadResponse = JSON.parse(xhr.responseText);
        const url = toAbsoluteUrl(json?.data?.original?.url || (json as any)?.data?.recommended);
        result.resolve?.({ url, response: json });
      } catch (err) {
        result.reject?.(err);
      }
    };

    xhr.onerror = () => {
      result.reject?.(new Error('Upload failed'));
    };
    xhr.ontimeout = () => {
      result.reject?.(new Error('Upload timeout'));
    };
    // Ensure we have token before attempting request
    if (!authToken) {
      result.reject?.(Object.assign(new Error('Missing auth token'), { code: 'AUTH_MISSING' }));
      return;
    }
    xhr.open('POST', endpoint);
    xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
    if (apiKey) xhr.setRequestHeader('X-API-Key', apiKey);
    else console.warn('[media] No API key present for upload request');
    // Let RN set multipart boundary automatically
    // xhr.setRequestHeader('Content-Type', 'multipart/form-data');
    xhr.send(form as any);
  };

  // If we don't have a token initially, try to refresh once
  if (!token) {
    token = await tryRefreshToken();
  }
  sendRequest(token);

  return promise;
}

// Attempt to refresh JWT via known refresh endpoints. Returns new token or null.
async function tryRefreshToken(): Promise<string | null> {
  const candidates = [
    '/api/auth/refresh',
    '/auth/refresh',
    `${ENV.AUTH_GOOGLE_PATH || '/auth/google'}/refresh`,
  ];
  for (const path of candidates) {
    try {
      const res = await apiFetch<{ token?: string }>(path, { method: 'POST', timeoutMs: 10000 });
      const token = res?.token;
      if (token) {
        await saveJWT(token);
        return token;
      }
    } catch (err) {
      // Continue to next candidate on failure
    }
  }
  return null;
}

// Ensure token from either primary storage or secure storage; does not refresh.
async function ensureAuthToken(): Promise<string | null> {
  let token = await getToken();
  if (!token) token = await loadJWT();
  return token;
}
