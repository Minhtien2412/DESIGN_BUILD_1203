import type { CameraPreset } from "../types";

interface ViewerToolbarProps {
  autoRotate: boolean;
  currentPreset: CameraPreset;
  hasModel: boolean;
  onResetView: () => void;
  onChangePreset: (preset: CameraPreset) => void;
  onToggleAutoRotate: () => void;
}

const PRESETS: Array<{ key: CameraPreset; label: string; icon: string }> = [
  { key: "perspective", label: "Perspective", icon: "🎥" },
  { key: "top", label: "Top", icon: "⬆" },
  { key: "front", label: "Front", icon: "🔲" },
  { key: "left", label: "Left", icon: "◀" },
  { key: "right", label: "Right", icon: "▶" },
];

/**
 * Toolbar row with camera preset buttons, reset, and auto-rotate toggle.
 * Buttons are disabled when no model is loaded.
 */
export function ViewerToolbar({
  autoRotate,
  currentPreset,
  hasModel,
  onResetView,
  onChangePreset,
  onToggleAutoRotate,
}: ViewerToolbarProps) {
  return (
    <div className="skp-viewer__toolbar">
      <button
        type="button"
        className="skp-viewer__toolbar-button"
        disabled={!hasModel}
        onClick={onResetView}
        title="Reset về góc Perspective mặc định"
      >
        🔄 Reset
      </button>

      <div className="skp-viewer__toolbar-divider" />

      {PRESETS.map((p) => (
        <button
          key={p.key}
          type="button"
          className={[
            "skp-viewer__toolbar-button",
            currentPreset === p.key && hasModel ? "is-active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          disabled={!hasModel}
          onClick={() => onChangePreset(p.key)}
          title={p.label}
        >
          {p.icon} {p.label}
        </button>
      ))}

      <div className="skp-viewer__toolbar-divider" />

      <button
        type="button"
        className={["skp-viewer__toolbar-button", autoRotate ? "is-active" : ""]
          .filter(Boolean)
          .join(" ")}
        disabled={!hasModel}
        onClick={onToggleAutoRotate}
        title="Bật/tắt tự động xoay model"
      >
        {autoRotate ? "⏸ Auto Rotate: ON" : "▶ Auto Rotate: OFF"}
      </button>
    </div>
  );
}
