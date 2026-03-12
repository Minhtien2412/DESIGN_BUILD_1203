import ENV from "@/config/env";
import { API_BASE, ApiError, apiFetch, getApiKey } from "@/services/api";
import { loadJWT, saveJWT } from "@/utils/secureStorage";
import { getToken } from "@/utils/storage";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

// Categories supported by backend media-upload route
export type UploadCategory =
  | "images"
  | "videos"
  | "documents"
  | "profiles"
  | "projects"
  | "temp";

export interface MediaUploadResponse {
  success: boolean;
  message?: string;
  data?: {
    original?: {
      filename?: string;
      size?: number;
      sizeLabel?: string;
      url?: string;
      type?: string;
    };
    // For images/videos, processor may add more fields (e.g., thumbnails, hls, poster)
    [key: string]: any;
  };
}

function guessMimeType(filename: string): string {
  const ext = (filename.split(".").pop() || "").toLowerCase();
  switch (ext) {
    // Images
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    // Videos
    case "mp4":
      return "video/mp4";
    case "mov":
      return "video/quicktime";
    case "mkv":
      return "video/x-matroska";
    case "avi":
      return "video/x-msvideo";
    // Docs
    case "pdf":
      return "application/pdf";
    case "doc":
      return "application/msword";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "xls":
      return "application/vnd.ms-excel";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "ppt":
      return "application/vnd.ms-powerpoint";
    case "pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "txt":
      return "text/plain";
    default:
      return "application/octet-stream";
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
  fields?: Record<string, string | number | boolean>,
): Promise<{ url?: string; response: MediaUploadResponse }> {
  const name = filename || uri.split("/").pop() || `upload`;
  const type = guessMimeType(name);

  const form = new FormData();
  form.append("file", { uri, name, type } as any);
  if (fields) {
    Object.entries(fields).forEach(([k, v]) => form.append(k, String(v)));
  }

  try {
    const res = await apiFetch<MediaUploadResponse>(
      `/api/media/upload/${category}`,
      {
        method: "POST",
        data: form,
        timeoutMs: 60_000,
      },
    );

    const url = toAbsoluteUrl(
      res?.data?.original?.url || (res as any)?.data?.recommended,
    );
    return { url, response: res };
  } catch (e: any) {
    // Attempt token refresh once on 401 then retry
    if (e instanceof ApiError && e.status === 401) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        const res = await apiFetch<MediaUploadResponse>(
          `/api/media/upload/${category}`,
          {
            method: "POST",
            data: form,
            timeoutMs: 60_000,
          },
        );
        const url = toAbsoluteUrl(
          res?.data?.original?.url || (res as any)?.data?.recommended,
        );
        return { url, response: res };
      }
    }
    throw e;
  }
}

export const uploadImage = (
  uri: string,
  filename?: string,
  fields?: Record<string, any>,
) => uploadMedia("images", uri, filename, fields);

export const uploadVideo = (
  uri: string,
  filename?: string,
  fields?: Record<string, any>,
) => uploadMedia("videos", uri, filename, fields);

export const uploadDocument = (
  uri: string,
  filename?: string,
  fields?: Record<string, any>,
) => uploadMedia("documents", uri, filename, fields);

// Profile avatar update uses PATCH /profile endpoint
export async function updateAvatarOnly(avatarUri: string): Promise<boolean> {
  const name = avatarUri.split("/").pop() || "avatar.jpg";
  const type = guessMimeType(name) || "image/jpeg";
  const form = new FormData();
  form.append("avatar", { uri: avatarUri, name, type } as any);

  try {
    // BE uses PATCH /profile (not POST /profile/update)
    await apiFetch("/profile", {
      method: "PATCH",
      data: form,
      timeoutMs: 15_000,
    });
    return true;
  } catch (e) {
    console.error("[updateAvatarOnly] Failed:", e);
    return false;
  }
}

// Upload with progress via native FileSystem upload (useful for large media and UX feedback)
export async function uploadMediaWithProgress(
  category: UploadCategory,
  uri: string,
  filename?: string,
  fields?: Record<string, string | number | boolean>,
  onProgress?: (progress: {
    loaded: number;
    total: number;
    percent: number;
  }) => void,
): Promise<{ url?: string; response: MediaUploadResponse }> {
  const name = filename || uri.split("/")?.pop() || `upload`;
  const type = guessMimeType(name);

  let token = await ensureAuthToken();
  const apiKey = getApiKey?.();

  const endpoint = `${API_BASE}/api/media/upload/${category}`;

  // Convert fields to string parameters for FileSystem
  const parameters: Record<string, string> = {};
  if (fields) {
    Object.entries(fields).forEach(([k, v]) => {
      parameters[k] = String(v);
    });
  }

  const doUpload = async (
    authToken: string,
    hasRetried = false,
  ): Promise<{ url?: string; response: MediaUploadResponse }> => {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${authToken}`,
    };
    if (apiKey) headers["X-API-Key"] = apiKey;
    else console.warn("[media] No API key present for upload request");

    let status: number;
    let body: string;

    // Native upload with progress tracking
    if (
      Platform.OS !== "web" &&
      typeof (FileSystem as any).createUploadResumable === "function"
    ) {
      const task = (FileSystem as any).createUploadResumable(
        uri,
        endpoint,
        {
          httpMethod: "POST",
          uploadType: (FileSystem as any).FileSystemUploadType.MULTIPART,
          fieldName: "file",
          mimeType: type,
          headers,
          parameters,
        },
        (data: any) => {
          const total = data.totalBytesExpectedToSend ?? 0;
          const sent = data.totalBytesSent ?? 0;
          if (onProgress && total > 0) {
            onProgress({ loaded: sent, total, percent: (sent / total) * 100 });
          }
        },
      );
      task.timeout = 300000; // 5 minutes
      const result = await task.uploadAsync();
      if (!result) throw new Error("Upload cancelled");
      status = result.status;
      body = result.body;
    } else {
      // Web fallback (no progress)
      const form = new FormData();
      form.append("file", { uri, name, type } as any);
      if (fields) {
        Object.entries(fields).forEach(([k, v]) => form.append(k, String(v)));
      }
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: form,
      });
      status = response.status;
      body = await response.text();
    }

    // Retry once on 401 by attempting token refresh
    if (status === 401 && !hasRetried) {
      const refreshed = await tryRefreshToken();
      if (refreshed) return doUpload(refreshed, true);
    }

    if (status < 200 || status >= 300) {
      let detail: any;
      try {
        detail = JSON.parse(body);
      } catch {}
      const baseMsg =
        detail?.message ||
        detail?.error ||
        `Upload failed with status ${status}`;
      const err: any = new Error(baseMsg);
      err.status = status;
      err.detail = detail;
      throw err;
    }

    const json: MediaUploadResponse = JSON.parse(body);
    const url = toAbsoluteUrl(
      json?.data?.original?.url || (json as any)?.data?.recommended,
    );
    return { url, response: json };
  };

  // If we don't have a token initially, try to refresh once
  if (!token) {
    token = await tryRefreshToken();
  }
  if (!token) {
    throw Object.assign(new Error("Missing auth token"), {
      code: "AUTH_MISSING",
    });
  }
  return doUpload(token);
}

// Attempt to refresh JWT via known refresh endpoints. Returns new token or null.
async function tryRefreshToken(): Promise<string | null> {
  const candidates = [
    "/api/auth/refresh",
    "/auth/refresh",
    `${ENV.AUTH_GOOGLE_PATH || "/auth/google"}/refresh`,
  ];
  for (const path of candidates) {
    try {
      const res = await apiFetch<{ token?: string }>(path, {
        method: "POST",
        timeoutMs: 10000,
      });
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
