/**
 * useSignatureFlow Hook
 * Manages signature capture via a drawing canvas (via image), upload, and submission.
 * The actual signature pad component would render a canvas and export an image URI.
 *
 * @created 2026-03-16 — Round 4 workflow standardization
 */

import { useFileUpload } from "@/hooks/useFileUpload";
import type { FileMetadata, UploadState } from "@/types/workflow";
import { useCallback, useState } from "react";

export interface UseSignatureFlowResult {
  signatureUri: string | null;
  signatureFile: FileMetadata | null;
  uploadState: UploadState;
  setSignature: (uri: string) => void;
  uploadSignature: () => Promise<FileMetadata | null>;
  clear: () => void;
}

export function useSignatureFlow(): UseSignatureFlowResult {
  const [signatureUri, setSignatureUri] = useState<string | null>(null);
  const [signatureFile, setSignatureFile] = useState<FileMetadata | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
    progress: 0,
  });
  const { uploadFile } = useFileUpload();

  const setSignature = useCallback((uri: string) => {
    setSignatureUri(uri);
    setSignatureFile(null);
    setUploadState({ status: "idle", progress: 0 });
  }, []);

  const uploadSignature =
    useCallback(async (): Promise<FileMetadata | null> => {
      if (!signatureUri) return null;

      setUploadState({ status: "uploading", progress: 0 });

      try {
        const result = await uploadFile(signatureUri, {
          category: "documents",
          description: "Chữ ký xác nhận",
          tags: ["signature"],
        });

        if (!result) {
          setUploadState({
            status: "failed",
            progress: 0,
            error: "Upload failed",
          });
          return null;
        }

        const meta: FileMetadata = {
          id: String(result.id),
          filename: result.filename,
          originalName: result.originalName,
          contentType: result.mimetype,
          size: result.size,
          url: result.publicUrl,
          createdAt: result.uploadedAt,
          createdBy: "", // Will be filled by BE
        };

        setSignatureFile(meta);
        setUploadState({ status: "uploaded", progress: 100, file: meta });
        return meta;
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Upload failed";
        setUploadState({ status: "failed", progress: 0, error: msg });
        return null;
      }
    }, [signatureUri, uploadFile]);

  const clear = useCallback(() => {
    setSignatureUri(null);
    setSignatureFile(null);
    setUploadState({ status: "idle", progress: 0 });
  }, []);

  return {
    signatureUri,
    signatureFile,
    uploadState,
    setSignature,
    uploadSignature,
    clear,
  };
}
