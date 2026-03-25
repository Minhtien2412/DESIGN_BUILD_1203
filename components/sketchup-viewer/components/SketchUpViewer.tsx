import { useCallback, useEffect, useRef, useState } from "react";
import "../styles/sketchup-viewer.css";
import type { CameraPreset, ModelCanvasHandle } from "../types";
import { validateModelFile } from "../utils/fileValidation";
import { ErrorMessage } from "./ErrorMessage";
import { FileUploadPanel } from "./FileUploadPanel";
import { LoadingOverlay } from "./LoadingOverlay";
import { ModelCanvas } from "./ModelCanvas";
import { ViewerToolbar } from "./ViewerToolbar";

/**
 * SketchUpViewer — top-level orchestrator.
 *
 * Renders the sidebar (upload, toolbar, status) and the 3D canvas.
 * Manages state for file, loading, error, camera preset, and auto-rotate.
 */
export function SketchUpViewer() {
  const canvasRef = useRef<ModelCanvasHandle | null>(null);

  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>("perspective");

  // Revoke previous object URL when replaced or on unmount
  const replaceModelUrl = useCallback((next: string | null) => {
    setModelUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return next;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (modelUrl) URL.revokeObjectURL(modelUrl);
    };
  }, []); // cleanup on unmount only

  // -------------------------------------------------------------------------
  // File selected handler
  // -------------------------------------------------------------------------
  const handleFileSelected = useCallback(
    (file: File | null) => {
      setError(null);
      setCurrentFile(file);

      if (!file) {
        setLoading(false);
        replaceModelUrl(null);
        return;
      }

      const result = validateModelFile(file);
      if (!result.ok) {
        setLoading(false);
        replaceModelUrl(null);
        setError(result.error ?? "File không hợp lệ.");
        return;
      }

      const url = URL.createObjectURL(file);
      setLoading(true);
      setCameraPreset("perspective");
      replaceModelUrl(url);
    },
    [replaceModelUrl],
  );

  // -------------------------------------------------------------------------
  // Camera actions
  // -------------------------------------------------------------------------
  const handleResetView = useCallback(() => {
    setCameraPreset("perspective");
    canvasRef.current?.resetView();
  }, []);

  const handleChangePreset = useCallback((preset: CameraPreset) => {
    setCameraPreset(preset);
    canvasRef.current?.setViewPreset(preset);
  }, []);

  const handleModelLoaded = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  const handleModelError = useCallback((msg: string) => {
    setLoading(false);
    setError(msg);
  }, []);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="skp-viewer">
      {/* ---- Sidebar ---- */}
      <aside className="skp-viewer__sidebar">
        <div className="skp-viewer__brand">
          <h2>🏗 3D Model Viewer</h2>
          <p>
            Xem model 3D trên web. Tối ưu cho <code>.glb</code>, hỗ trợ{" "}
            <code>.gltf</code>, và cảnh báo rõ với <code>.skp</code>.
          </p>
        </div>

        <FileUploadPanel
          currentFileName={currentFile?.name ?? null}
          onFileSelected={handleFileSelected}
        />

        <ViewerToolbar
          autoRotate={autoRotate}
          currentPreset={cameraPreset}
          hasModel={!!modelUrl && !loading}
          onResetView={handleResetView}
          onChangePreset={handleChangePreset}
          onToggleAutoRotate={() => setAutoRotate((prev) => !prev)}
        />

        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        <div className="skp-viewer__status-card">
          <div>
            <span className="skp-viewer__meta-label">Preset:</span>{" "}
            <strong>{cameraPreset}</strong>
          </div>
          <div>
            <span className="skp-viewer__meta-label">Auto rotate:</span>{" "}
            <strong>{autoRotate ? "Bật" : "Tắt"}</strong>
          </div>
          <div>
            <span className="skp-viewer__meta-label">File:</span>{" "}
            <strong>{currentFile?.name ?? "Chưa chọn"}</strong>
          </div>
        </div>
      </aside>

      {/* ---- Main viewer area ---- */}
      <main className="skp-viewer__main">
        <div className="skp-viewer__viewer-frame">
          <ModelCanvas
            ref={canvasRef}
            modelUrl={modelUrl}
            autoRotate={autoRotate}
            cameraPreset={cameraPreset}
            onModelLoaded={handleModelLoaded}
            onError={handleModelError}
          />
          <LoadingOverlay
            visible={loading}
            text="Đang load model 3D, vui lòng chờ..."
          />
        </div>
      </main>
    </div>
  );
}
