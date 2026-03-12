import { apiFetch } from "@/services/api";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

type UploadMethod = "put" | "post";

type PresignBase = {
  url: string;
  key: string;
  headers?: Record<string, string>;
};

type PresignPutResponse = PresignBase & {
  method: "put";
};

type PresignPostResponse = PresignBase & {
  method: "post";
  fields: Record<string, string>;
};

export type PresignResponse = PresignPutResponse | PresignPostResponse;

export type PresignRequest = {
  method: UploadMethod;
  mime: string;
  size: number;
  folder?: string; // maps to server 'prefix'
  ext?: string; // used to construct filename if not provided elsewhere
};

type RawPresignResponse =
  | {
      url: string;
      key: string;
      headers?: Record<string, string>;
      fields?: Record<string, string>;
    }
  | {
      success: boolean;
      data?: {
        method?: string;
        uploadUrl?: string;
        headers?: Record<string, string>;
        key: string;
        remoteUrl?: string;
        expiresIn?: number;
      };
    };

export async function requestPresignUpload(
  request: PresignRequest,
): Promise<PresignResponse> {
  // Map client request to server expectations
  const filename = `upload${request.ext || ""}`;
  const body = {
    filename,
    contentType: request.mime,
    size: request.size,
    // expiresSeconds: undefined, // use server default
  };

  const resp = await apiFetch<RawPresignResponse>("/api/v1/upload/presign", {
    method: "POST",
    data: body,
    timeoutMs: 20000,
  });

  // If server returned wrapped shape { success, data }
  if (typeof resp === "object" && resp && "success" in resp) {
    const data = (resp as any).data || {};
    const method = String(
      data.method || request.method || "put",
    ).toLowerCase() as UploadMethod;
    if (method === "post") {
      // Our current server returns PUT only; future-proof branch
      const fields = (data.fields || {}) as Record<string, string>;
      return {
        method: "post",
        url: String(data.uploadUrl || data.url || ""),
        key: String(data.key || ""),
        headers: (data.headers || {}) as Record<string, string>,
        fields,
      };
    }
    return {
      method: "put",
      url: String(data.uploadUrl || data.url || ""),
      key: String(data.key || ""),
      headers: (data.headers || {}) as Record<string, string>,
    };
  }

  // Flat shape fallback
  const flat = resp as any;
  if (request.method === "post") {
    return {
      url: flat.url,
      key: flat.key,
      headers: flat.headers,
      method: "post",
      fields: flat.fields ?? {},
    };
  }

  return {
    url: flat.url,
    key: flat.key,
    headers: flat.headers,
    method: "put",
  };
}

type UploadParams = {
  presign: PresignResponse;
  fileUri: string;
  mime: string;
  fileName: string;
  signal?: AbortSignal;
  onProgress?: (p: {
    totalBytesSent: number;
    totalBytesExpectedToSend: number;
    progress: number;
  }) => void;
};

export async function uploadToPresignedUrl({
  presign,
  fileUri,
  mime,
  fileName,
  signal,
  onProgress,
}: UploadParams) {
  if (presign.method === "post") {
    // Prefer native resumable upload with progress if available
    if (
      Platform.OS !== "web" &&
      typeof (FileSystem as any).createUploadResumable === "function"
    ) {
      const task = (FileSystem as any).createUploadResumable(
        fileUri,
        presign.url,
        {
          httpMethod: "POST",
          uploadType: (FileSystem as any).FileSystemUploadType.MULTIPART,
          fieldName: "file",
          parameters: presign.fields,
          headers: presign.headers ?? {},
        },
        (data: any) => {
          const total = data.totalBytesExpectedToSend ?? 0;
          const sent = data.totalBytesSent ?? 0;
          if (onProgress && total > 0)
            onProgress({
              totalBytesSent: sent,
              totalBytesExpectedToSend: total,
              progress: sent / total,
            });
        },
      );
      const result = await task.uploadAsync();
      if ((result?.status || 0) < 200 || (result?.status || 0) >= 300) {
        throw new Error(`Upload thất bại (${result?.status})`);
      }
      return;
    }

    // Fallback (web): standard multipart upload without progress
    const form = new FormData();
    Object.keys(presign.fields).forEach((key) => {
      form.append(key, presign.fields[key]);
    });
    form.append("file", {
      uri: fileUri,
      name: fileName,
      type: mime || "application/octet-stream",
    } as any);
    const response = await fetch(presign.url, {
      method: "POST",
      body: form,
      signal,
    });
    if (!response.ok) throw new Error(`Upload thất bại (${response.status})`);
    return;
  }

  const headers: Record<string, string> = {
    "Content-Type": mime || "application/octet-stream",
    ...(presign.headers ?? {}),
  };

  if (
    Platform.OS !== "web" &&
    typeof (FileSystem as any).createUploadResumable === "function"
  ) {
    const task = (FileSystem as any).createUploadResumable(
      fileUri,
      presign.url,
      {
        httpMethod: "PUT",
        headers,
        uploadType: (FileSystem as any).FileSystemUploadType.BINARY_CONTENT,
      },
      (data: any) => {
        const total = data.totalBytesExpectedToSend ?? 0;
        const sent = data.totalBytesSent ?? 0;
        if (onProgress && total > 0)
          onProgress({
            totalBytesSent: sent,
            totalBytesExpectedToSend: total,
            progress: sent / total,
          });
      },
    );
    const result = await task.uploadAsync();
    if ((result?.status || 0) < 200 || (result?.status || 0) >= 300) {
      throw new Error(`Upload thất bại (${result?.status})`);
    }
    return;
  }

  // Fallback (web): simple fetch without progress
  const response = await fetch(presign.url, {
    method: "PUT",
    headers,
    body: await (await fetch(fileUri)).blob(),
    signal,
  });
  if (!response.ok) throw new Error(`Upload thất bại (${response.status})`);
}

export function resolvePresignedRemoteUrl(presign: PresignResponse): string {
  if (presign.method === "post") {
    const key = (presign as any).fields?.key || presign.key;
    const base = presign.url.replace(/\/+$/, "");
    return `${base}/${key}`;
  }
  // For PUT, server also provides remote URL (without query) but we only have url here; strip query params.
  return presign.url.split("?")[0];
}
