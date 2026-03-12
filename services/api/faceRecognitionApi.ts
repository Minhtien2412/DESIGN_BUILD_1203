import { apiFetch } from "../api";

export interface FaceVerifyResult {
  passed: boolean;
  embedding?: number[];
  reason?: string;
  livenessOk?: boolean;
  duplicateDetected?: boolean;
}

export interface FaceIdentityResult {
  passed: boolean;
  reason?: string;
}

/**
 * Verify face for registration: liveness + duplicate check
 * Sends 3-5 base64-encoded face images captured during liveness challenge
 */
export async function verifyFaceForRegistration(
  base64Images: string[],
  email?: string,
): Promise<FaceVerifyResult> {
  const response = await apiFetch("/face-recognition/verify-registration", {
    method: "POST",
    body: JSON.stringify({
      images: base64Images,
      ...(email ? { email } : {}),
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Face verification failed");
  }

  return response.json();
}

/**
 * Verify face identity for suspicious login
 */
export async function verifyFaceIdentity(
  base64Images: string[],
): Promise<FaceIdentityResult> {
  const response = await apiFetch("/face-recognition/verify-identity", {
    method: "POST",
    body: JSON.stringify({ images: base64Images }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Identity verification failed");
  }

  return response.json();
}
