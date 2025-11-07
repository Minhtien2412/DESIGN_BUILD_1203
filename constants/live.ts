// Live screen user-tunable constants
// Adjust inline frame threshold: e.g., 0.85 or 0.95 depending on actual layout
export const INLINE_FRAME_HEIGHT_THRESHOLD = 0.88;

// Auto-hide overlays after inactivity (ms).
// Set to 0 to DISABLE auto-hide (always show controls),
// or set to a long value like 15000 (15s) or 20000 (20s) if you want slow hiding.
export const OVERLAY_AUTOHIDE_MS = 0;

// Behavior when user long-presses the video surface:
// - 'rate2x': play at 2x while holding (current default per earlier UX decisions)
// - 'pause': temporarily pause while holding (matches alternative skeleton behavior)
export type LongPressBehavior = 'rate2x' | 'pause';
export const LONG_PRESS_BEHAVIOR: LongPressBehavior = 'rate2x';

// Default mute state for videos. Keep false to have sound on by default, or set true for auto-mute.
export const DEFAULT_MUTED = false;
