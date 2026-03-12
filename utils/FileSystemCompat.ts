/**
 * FileSystem Compatibility Layer
 * Provides backward-compatible API for expo-file-system v19+
 *
 * expo-file-system v19 changed from functional API to class-based API:
 * - FileSystem.documentDirectory → Paths.document.uri
 * - FileSystem.cacheDirectory → Paths.cache.uri
 * - FileSystem.EncodingType → no longer exported
 */

import { Platform } from "react-native";

// Web polyfill check - expo-file-system doesn't work on web
const isWeb = Platform.OS === "web";

// Conditional imports - only load expo-file-system on native
let Directory: any;
let File: any;
let Paths: any;

if (!isWeb) {
  try {
    const expofs = require("expo-file-system");
    Directory = expofs.Directory;
    File = expofs.File;
    Paths = expofs.Paths;
  } catch {
    console.warn("[FileSystemCompat] expo-file-system not available");
  }
}

// Directory paths (backward compatible) - fallback for web
export const documentDirectory = isWeb ? "/" : (Paths?.document?.uri ?? "/");
export const cacheDirectory = isWeb
  ? "/cache/"
  : (Paths?.cache?.uri ?? "/cache/");
export const bundleDirectory = isWeb ? "/" : (Paths?.bundle?.uri ?? "/");

// Encoding types (constants)
export const EncodingType = {
  UTF8: "utf8" as const,
  Base64: "base64" as const,
};

// Storage info
export const getFreeDiskStorageAsync = async (): Promise<number> => {
  if (isWeb) return Number.MAX_SAFE_INTEGER;
  return Paths?.availableDiskSpace ?? 0;
};

export const getTotalDiskCapacityAsync = async (): Promise<number> => {
  if (isWeb) return Number.MAX_SAFE_INTEGER;
  return Paths?.totalDiskSpace ?? 0;
};

// File operations
export const readAsStringAsync = async (
  fileUri: string,
  options?: {
    encoding?: "utf8" | "base64";
    position?: number;
    length?: number;
  },
): Promise<string> => {
  if (isWeb) {
    console.warn("[FileSystemCompat] readAsStringAsync not supported on web");
    return "";
  }
  const file = new File(fileUri);
  return file.text();
};

export const writeAsStringAsync = async (
  fileUri: string,
  contents: string,
  options?: { encoding?: "utf8" | "base64" },
): Promise<void> => {
  if (isWeb) {
    console.warn("[FileSystemCompat] writeAsStringAsync not supported on web");
    return;
  }
  const file = new File(fileUri);
  await file.write(contents);
};

export const deleteAsync = async (
  fileUri: string,
  options?: { idempotent?: boolean },
): Promise<void> => {
  if (isWeb) {
    console.warn("[FileSystemCompat] deleteAsync not supported on web");
    return;
  }
  try {
    const file = new File(fileUri);
    if (file.exists) {
      await file.delete();
    }
  } catch (error) {
    if (!options?.idempotent) throw error;
  }
};

export const getInfoAsync = async (
  fileUri: string,
  options?: { md5?: boolean; size?: boolean },
): Promise<{
  exists: boolean;
  uri: string;
  size?: number;
  isDirectory: boolean;
  modificationTime?: number;
  md5?: string;
}> => {
  if (isWeb) {
    return { exists: false, uri: fileUri, isDirectory: false };
  }
  try {
    const info = Paths.info(fileUri);
    const file = new File(fileUri);
    return {
      exists: file.exists,
      uri: fileUri,
      size: file.exists ? file.size : undefined,
      isDirectory: info.isDirectory ?? false,
      modificationTime: undefined, // Not available in new API
      md5: undefined, // Would need manual calculation
    };
  } catch {
    return {
      exists: false,
      uri: fileUri,
      isDirectory: false,
    };
  }
};

export const makeDirectoryAsync = async (
  fileUri: string,
  options?: { intermediates?: boolean },
): Promise<void> => {
  if (isWeb) {
    console.warn("[FileSystemCompat] makeDirectoryAsync not supported on web");
    return;
  }
  const dir = new Directory(fileUri);
  await dir.create();
};

export const copyAsync = async (options: {
  from: string;
  to: string;
}): Promise<void> => {
  if (isWeb) {
    console.warn("[FileSystemCompat] copyAsync not supported on web");
    return;
  }
  const fromFile = new File(options.from);
  const toFile = new File(options.to);
  await fromFile.copy(toFile);
};

export const moveAsync = async (options: {
  from: string;
  to: string;
}): Promise<void> => {
  if (isWeb) {
    console.warn("[FileSystemCompat] moveAsync not supported on web");
    return;
  }
  const fromFile = new File(options.from);
  const toFile = new File(options.to);
  await fromFile.move(toFile);
};

export const readDirectoryAsync = async (
  fileUri: string,
): Promise<string[]> => {
  if (isWeb) {
    console.warn("[FileSystemCompat] readDirectoryAsync not supported on web");
    return [];
  }
  const dir = new Directory(fileUri);
  const contents = dir.list();
  return contents.map((item: any) => {
    if (item?.name) return item.name;
    if (item?.uri) return item.uri.split("/").pop() || "";
    return "";
  });
};

// Download operations
export interface DownloadProgressData {
  totalBytesWritten: number;
  totalBytesExpectedToWrite: number;
}

export interface DownloadResult {
  uri: string;
  status: number;
  headers: Record<string, string>;
  md5?: string;
}

export const downloadAsync = async (
  uri: string,
  fileUri: string,
  options?: {
    headers?: Record<string, string>;
    md5?: boolean;
  },
): Promise<DownloadResult> => {
  if (isWeb) {
    // Web fallback - just fetch and return
    const response = await fetch(uri, { headers: options?.headers });
    return {
      uri: uri,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
    };
  }

  const file = new File(fileUri);

  const response = await fetch(uri, {
    headers: options?.headers,
  });

  if (!response.ok) {
    throw new Error(`Download failed with status ${response.status}`);
  }

  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  await file.write(new Uint8Array(arrayBuffer));

  return {
    uri: fileUri,
    status: response.status,
    headers: Object.fromEntries(response.headers.entries()),
  };
};

// Upload types (for compatibility)
export const FileSystemUploadType = {
  BINARY_CONTENT: 0,
  MULTIPART: 1,
};

// Upload file to server
export interface UploadOptions {
  uploadType?: number;
  fieldName?: string;
  mimeType?: string;
  headers?: Record<string, string>;
  httpMethod?: string;
  parameters?: Record<string, string>;
}

export interface UploadResult {
  status: number;
  headers: Record<string, string>;
  body: string;
}

export const uploadAsync = async (
  url: string,
  fileUri: string,
  options?: UploadOptions,
): Promise<UploadResult> => {
  if (isWeb) {
    // Web fallback - simple fetch upload
    const response = await fetch(url, {
      method: options?.httpMethod || "POST",
      headers: options?.headers,
    });
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: await response.text(),
    };
  }

  const file = new File(fileUri);

  if (options?.uploadType === FileSystemUploadType.MULTIPART) {
    // Multipart form upload
    const formData = new FormData();
    const blob = await file.arrayBuffer();
    const fileName = fileUri.split("/").pop() || "file";

    // Add file to form data
    formData.append(
      options.fieldName || "file",
      new Blob([blob], {
        type: options.mimeType || "application/octet-stream",
      }),
      fileName,
    );

    // Add extra parameters
    if (options.parameters) {
      Object.entries(options.parameters).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const response = await fetch(url, {
      method: options.httpMethod || "POST",
      headers: {
        ...options.headers,
        // Don't set Content-Type for FormData, browser will set it with boundary
      },
      body: formData,
    });

    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: await response.text(),
    };
  } else {
    // Binary upload
    const blob = await file.arrayBuffer();

    const response = await fetch(url, {
      method: options?.httpMethod || "POST",
      headers: {
        "Content-Type": options?.mimeType || "application/octet-stream",
        ...options?.headers,
      },
      body: blob,
    });

    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: await response.text(),
    };
  }
};

// DownloadResumable stub for compatibility (simplified implementation)
export class DownloadResumable {
  private _url: string;
  private _fileUri: string;
  private _options: any;
  private _callback?: (data: DownloadProgressData) => void;
  private _abortController?: AbortController;

  constructor(
    url: string,
    fileUri: string,
    options?: any,
    callback?: (data: DownloadProgressData) => void,
  ) {
    this._url = url;
    this._fileUri = fileUri;
    this._options = options;
    this._callback = callback;
  }

  async downloadAsync(): Promise<DownloadResult> {
    this._abortController = new AbortController();
    const file = new File(this._fileUri);

    const response = await fetch(this._url, {
      headers: this._options?.headers,
      signal: this._abortController.signal,
    });

    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`);
    }

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    await file.write(new Uint8Array(arrayBuffer));

    return {
      uri: this._fileUri,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
    };
  }

  async pauseAsync(): Promise<void> {
    this._abortController?.abort();
  }

  async resumeAsync(): Promise<DownloadResult> {
    return this.downloadAsync();
  }
}

export const createDownloadResumable = (
  url: string,
  fileUri: string,
  options?: any,
  callback?: (data: DownloadProgressData) => void,
): DownloadResumable => {
  return new DownloadResumable(url, fileUri, options, callback);
};

// Upload task stub for compatibility
export const createUploadTask = (
  url: string,
  fileUri: string,
  options?: any,
  callback?: (data: any) => void,
) => {
  let abortController: AbortController | undefined;

  return {
    uploadAsync: async () => {
      abortController = new AbortController();
      const file = new File(fileUri);
      const blob = await file.arrayBuffer();

      const response = await fetch(url, {
        method: options?.httpMethod || "POST",
        headers: options?.headers,
        body: blob,
        signal: abortController.signal,
      });

      return {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: await response.text(),
      };
    },
    cancelAsync: async () => {
      abortController?.abort();
    },
  };
};

// Re-export new API classes
export { Directory, File, Paths };

// Default export with all utilities
const FileSystemCompat = {
  documentDirectory,
  cacheDirectory,
  bundleDirectory,
  EncodingType,
  FileSystemUploadType,
  getFreeDiskStorageAsync,
  getTotalDiskCapacityAsync,
  readAsStringAsync,
  writeAsStringAsync,
  deleteAsync,
  getInfoAsync,
  makeDirectoryAsync,
  copyAsync,
  moveAsync,
  readDirectoryAsync,
  downloadAsync,
  File,
  Directory,
  Paths,
};

export default FileSystemCompat;
