import React, { useRef } from "react";

interface FileUploadPanelProps {
  currentFileName: string | null;
  onFileSelected: (file: File | null) => void;
}

/**
 * Panel with file picker, current-file display, and format guidance.
 */
export function FileUploadPanel({
  currentFileName,
  onFileSelected,
}: FileUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onFileSelected(file);
    // reset so re-selecting the same file still fires onChange
    event.target.value = "";
  };

  return (
    <div className="skp-viewer__panel">
      <div className="skp-viewer__panel-header">
        <h3>Upload Model</h3>
        <p>
          Ưu tiên <code>.glb</code>. Hỗ trợ <code>.gltf</code> nếu file
          self-contained. File <code>.skp</code> sẽ được yêu cầu convert trước.
        </p>
      </div>

      <button
        type="button"
        className="skp-viewer__upload-button"
        onClick={() => inputRef.current?.click()}
      >
        📂 Chọn file model
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".glb,.gltf,.skp"
        onChange={handleChange}
        hidden
      />

      <div className="skp-viewer__file-meta">
        <span className="skp-viewer__meta-label">File hiện tại:</span>{" "}
        <span className="skp-viewer__meta-value">
          {currentFileName || "Chưa chọn file"}
        </span>
      </div>

      <div className="skp-viewer__hint">
        <strong>💡 Lưu ý:</strong> File <code>.skp</code> (SketchUp) cần được
        export sang <code>.glb</code> / <code>.gltf</code> trước khi xem trên
        web. Mở file trong SketchUp → File → Export → 3D Model → chọn .glb.
      </div>
    </div>
  );
}
