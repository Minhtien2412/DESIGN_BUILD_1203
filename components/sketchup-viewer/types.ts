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
  scene: any; // three.Group
  radius: number;
  size: any; // three.Vector3
  target: any; // three.Vector3
}
