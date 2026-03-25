
interface LoadingOverlayProps {
  visible: boolean;
  text?: string;
}

/**
 * Translucent overlay with spinner shown while a 3D model is being loaded.
 */
export function LoadingOverlay({
  visible,
  text = "Đang xử lý model 3D...",
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div className="skp-viewer__loading-overlay" aria-live="polite">
      <div className="skp-viewer__loading-card">
        <div className="skp-viewer__spinner" />
        <div className="skp-viewer__loading-text">{text}</div>
      </div>
    </div>
  );
}
