/**
 * useFileDownload Hook
 * Handles file download with progress tracking, preview via Sharing/WebBrowser.
 * Uses expo-file-system v19 (class-based API) for storage and expo-sharing for preview.
 *
 * @created 2026-03-16 — Round 4 workflow standardization
 */

import type { DownloadState, FileMetadata } from "@/types/workflow";
import { encode as btoa } from "base64-arraybuffer";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useCallback, useRef, useState } from "react";

export function useFileDownload() {
  const [state, setState] = useState<DownloadState>({
    status: "idle",
    progress: 0,
  });
  const abortRef = useRef<AbortController | null>(null);

  const download = useCallback(
    async (file: FileMetadata): Promise<string | null> => {
      const target = new File(Paths.cache, file.filename);
      setState({ status: "requesting", progress: 0 });
      try {
        // Check if already downloaded
        if (target.exists) {
          setState({ status: "ready", progress: 100, localPath: target.uri });
          return target.uri;
        }
        setState({ status: "downloading", progress: 0 });
        const controller = new AbortController();
        abortRef.current = controller;
        const response = await fetch(file.url, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const contentLength = Number(
          response.headers.get("content-length") ?? 0,
        );
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No readable stream");
        }
        const chunks: Uint8Array[] = [];
        let received = 0;
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.length;
          if (contentLength > 0) {
            const pct = Math.round((received / contentLength) * 100);
            setState((prev) => ({ ...prev, progress: pct }));
          }
        }
        // Combine chunks and write as base64 (binary-safe)
        const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
        const combined = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          combined.set(chunk, offset);
          offset += chunk.length;
        }
        const base64Data = btoa(combined.buffer);
        target.create();
        target.write(base64Data, { encoding: "base64" });

        setState({ status: "ready", progress: 100, localPath: target.uri });
        return target.uri;
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          setState({ status: "idle", progress: 0 });
          return null;
        }
        const message =
          error instanceof Error ? error.message : "Download failed";
        setState({ status: "failed", progress: 0, error: message });
        console.error("[useFileDownload] Error:", error);
        return null;
      }
    },
    [],
  );

  const preview = useCallback(async (localPath: string) => {
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(localPath);
      } else {
        console.warn("[useFileDownload] Sharing not available on this device");
      }
    } catch (error) {
      console.error("[useFileDownload] Preview error:", error);
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setState({ status: "idle", progress: 0 });
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle", progress: 0 });
  }, []);

  return {
    ...state,
    download,
    preview,
    cancel,
    reset,
  };
}
