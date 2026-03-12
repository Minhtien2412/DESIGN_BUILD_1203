/**
 * Two-Factor Authentication API Service
 * Backend: http://103.200.20.100:3000/api/v1/auth/2fa
 */

import type {
    BackupCodesResponse,
    LoginResponse,
    TwoFactorDisableDto,
    TwoFactorSetupResponse,
    TwoFactorStatusResponse,
    TwoFactorVerifyDto,
    TwoFactorVerifyLoginDto,
    VerifyBackupCodeDto,
} from '@/types/two-factor';
import { apiFetch } from './api';

const TWO_FACTOR_BASE = '/auth/2fa';

/**
 * Enable 2FA and get QR code
 * POST /auth/2fa/enable
 */
export const enable2FA = async (): Promise<TwoFactorSetupResponse> => {
  return apiFetch<TwoFactorSetupResponse>(`${TWO_FACTOR_BASE}/enable`, {
    method: 'POST',
  });
};

/**
 * Verify TOTP code during setup
 * POST /auth/2fa/verify
 */
export const verify2FASetup = async (data: TwoFactorVerifyDto): Promise<{ message: string }> => {
  return apiFetch<{ message: string }>(`${TWO_FACTOR_BASE}/verify`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Verify 2FA during login
 * POST /auth/2fa/verify-login
 */
export const verify2FALogin = async (data: TwoFactorVerifyLoginDto): Promise<LoginResponse> => {
  return apiFetch<LoginResponse>(`${TWO_FACTOR_BASE}/verify-login`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Disable 2FA
 * POST /auth/2fa/disable
 */
export const disable2FA = async (data: TwoFactorDisableDto): Promise<{ message: string }> => {
  return apiFetch<{ message: string }>(`${TWO_FACTOR_BASE}/disable`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Regenerate backup codes
 * POST /auth/2fa/regenerate-backup-codes
 */
export const regenerateBackupCodes = async (): Promise<BackupCodesResponse> => {
  return apiFetch<BackupCodesResponse>(`${TWO_FACTOR_BASE}/regenerate-backup-codes`, {
    method: 'POST',
  });
};

/**
 * Get 2FA status
 * GET /auth/2fa/status
 */
export const get2FAStatus = async (): Promise<TwoFactorStatusResponse> => {
  return apiFetch<TwoFactorStatusResponse>(`${TWO_FACTOR_BASE}/status`);
};

/**
 * Verify backup code (emergency login)
 * POST /auth/2fa/verify-backup-code
 */
export const verifyBackupCode = async (data: VerifyBackupCodeDto): Promise<LoginResponse> => {
  return apiFetch<LoginResponse>(`${TWO_FACTOR_BASE}/verify-backup-code`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
