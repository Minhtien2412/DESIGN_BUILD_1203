import type { FileValidationResult } from "../types";

const VIEWABLE_EXTENSIONS = new Set(["glb", "gltf"]);
const KNOWN_EXTENSIONS = new Set(["glb", "gltf", "skp"]);

/**
 * Get file extension in lowercase from a filename.
 */
export function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

/**
 * Validate whether an uploaded file can be rendered by the web viewer.
 *
 * - .glb / .gltf → OK, render directly
 * - .skp → Known but NOT renderable in-browser; user must convert first
 * - anything else → Unsupported
 */
export function validateModelFile(file: File): FileValidationResult {
  const ext = getFileExtension(file.name);

  if (!KNOWN_EXTENSIONS.has(ext)) {
    return {
      ok: false,
      error:
        "Định dạng file không được hỗ trợ. Vui lòng dùng .glb hoặc .gltf.\n" +
        "Với file SketchUp (.skp), hãy export sang .glb/.gltf từ SketchUp trước khi upload.",
    };
  }

  if (ext === "skp") {
    return {
      ok: false,
      error:
        "File .skp (SketchUp) không thể render trực tiếp ổn định trên trình duyệt.\n" +
        "Vui lòng mở file trong SketchUp → Export → 3D Model → chọn .glb hoặc .gltf, rồi upload lại.",
    };
  }

  if (!VIEWABLE_EXTENSIONS.has(ext)) {
    return { ok: false, error: "File không hợp lệ cho web viewer." };
  }

  // Size guard: warn if file > 100 MB (still allow, just slow)
  const MAX_WARN_BYTES = 100 * 1024 * 1024;
  if (file.size > MAX_WARN_BYTES) {
    console.warn(
      `[SketchUpViewer] File lớn (${(file.size / 1024 / 1024).toFixed(1)} MB) — load có thể chậm.`,
    );
  }

  return { ok: true };
}
