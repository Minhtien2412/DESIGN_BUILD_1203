/** Camera preset positions for the 3D viewer */
export type CameraPreset = "perspective" | "top" | "front" | "left" | "right";

/** Imperative handle exposed by ModelCanvas */
export interface ModelCanvasHandle {
  resetView: () => void;
  setViewPreset: (preset: CameraPreset) => void;
}

/** Result of file validation */
export interface FileValidationResult {
  ok: boolean;
  error?: string;
}

/** Prepared model data after loading and normalizing */
export interface PreparedModel {
  scene: import("three").Group;
  radius: number;
  size: import("three").Vector3;
  target: import("three").Vector3;
}
