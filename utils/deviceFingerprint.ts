// Device fingerprinting utilities for client-side
export interface ClientDeviceFingerprint {
  deviceId: string;
  userAgent: string;
  platform: string;
  screenResolution: string;
  timezone: string;
  language: string;
}

export function getDeviceFingerprint(): ClientDeviceFingerprint {
  const deviceId = getDeviceId();

  return {
    deviceId,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language
  };
}

function getDeviceId(): string {
  // Try to get from localStorage first
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    // Generate a new device ID
    deviceId = `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
}

// CAPTCHA utilities
export async function getCaptchaToken(): Promise<string | null> {
  // In development, return a simple token
  if (__DEV__) {
    return 'dev-captcha-token';
  }

  // For production, integrate with CAPTCHA service
  // This would typically involve loading a CAPTCHA widget
  // and returning the token from the widget

  // For now, return null (CAPTCHA not implemented on client)
  return null;
}

export function isCaptchaRequired(error: any): boolean {
  return error?.code === 'CAPTCHA_REQUIRED';
}

export function getCaptchaErrorMessage(error: any): string {
  if (error?.details?.suspiciousActivities?.length > 0) {
    return `Yêu cầu xác minh bổ sung: ${error.details.suspiciousActivities.join(', ')}`;
  }
  return error?.message || 'Yêu cầu xác minh CAPTCHA';
}
