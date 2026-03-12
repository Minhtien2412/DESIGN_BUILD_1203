/**
 * Two-Factor Authentication Types
 * Backend: baotienweb-api/TWO_FACTOR_AUTH_GUIDE.md
 */

export interface TwoFactorSetupResponse {
  secret: string;
  qrCode: string; // Base64 QR code image
  backupCodes: string[];
  message: string;
}

export interface TwoFactorVerifyDto {
  token: string;
}

export interface TwoFactorVerifyLoginDto {
  email: string;
  password: string;
  token: string;
}

export interface TwoFactorStatusResponse {
  enabled: boolean;
  verified: boolean;
}

export interface TwoFactorDisableDto {
  password: string;
}

export interface BackupCodesResponse {
  backupCodes: string[];
  message: string;
}

export interface VerifyBackupCodeDto {
  email: string;
  password: string;
  backupCode: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    role: string;
    twoFactorEnabled?: boolean;
  };
  requires2FA?: boolean; // If true, need to call verify-login endpoint
  tempToken?: string; // Temporary token for 2FA verification
}
