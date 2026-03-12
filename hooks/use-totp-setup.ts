/**
 * TOTP 2FA Setup Hook
 * Manages the Two-Factor Authentication setup wizard flow
 *
 * Features:
 * - Generate TOTP secret and QR code
 * - Verify code and enable 2FA
 * - Disable 2FA
 * - Regenerate backup codes
 * - Get 2FA status
 */

import { useAuth } from "@/context/AuthContext";
import { del, get, post } from "@/services/api";
import { useCallback, useEffect, useState } from "react";

// ============= Types =============

export type TotpSetupStep =
  | "idle"
  | "loading"
  | "setup" // Show QR code
  | "verify" // Enter verification code
  | "success"
  | "error";

export interface TotpStatus {
  enabled: boolean;
  enabledAt?: string;
  backupCodesRemaining?: number;
}

export interface TotpSetupData {
  secret: string;
  otpAuthUrl: string;
  qrCodeDataUrl: string;
  backupCodes: string[];
}

export interface UseTotpSetupReturn {
  // State
  step: TotpSetupStep;
  status: TotpStatus | null;
  setupData: TotpSetupData | null;
  backupCodes: string[] | null;
  code: string;
  error: string | null;
  loading: boolean;
  remainingAttempts: number | null;

  // Actions
  setCode: (code: string) => void;
  checkStatus: () => Promise<void>;
  startSetup: () => Promise<void>;
  verifyAndEnable: () => Promise<boolean>;
  disable: (code: string) => Promise<boolean>;
  regenerateBackupCodes: (code: string) => Promise<string[] | null>;
  reset: () => void;
}

// ============= Hook =============

export function useTotpSetup(): UseTotpSetupReturn {
  const { user } = useAuth();

  // State
  const [step, setStep] = useState<TotpSetupStep>("idle");
  const [status, setStatus] = useState<TotpStatus | null>(null);
  const [setupData, setSetupData] = useState<TotpSetupData | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(
    null,
  );

  /**
   * Check 2FA status
   */
  const checkStatus = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const response = await get<{
        success: boolean;
        data: TotpStatus;
      }>("/auth/2fa/status");

      if (response.success) {
        setStatus(response.data);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to check 2FA status";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Start 2FA setup - generates secret and QR code
   */
  const startSetup = useCallback(async () => {
    if (!user) {
      setError("Please log in first");
      return;
    }

    try {
      setStep("loading");
      setError(null);
      setCode("");

      const response = await post<{
        success: boolean;
        data: TotpSetupData;
        message?: string;
      }>("/auth/2fa/setup", {});

      if (response.success && response.data) {
        setSetupData(response.data);
        setBackupCodes(response.data.backupCodes);
        setStep("setup");
      } else {
        throw new Error("Failed to generate 2FA setup data");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to start 2FA setup";
      setError(message);
      setStep("error");
    }
  }, [user]);

  /**
   * Verify code and enable 2FA
   */
  const verifyAndEnable = useCallback(async (): Promise<boolean> => {
    if (!code || code.length < 6) {
      setError("Please enter a 6-digit code");
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await post<{
        success: boolean;
        message: string;
        remainingAttempts?: number;
      }>("/auth/2fa/enable", { code });

      if (response.success) {
        setStep("success");
        // Refresh status
        await checkStatus();
        return true;
      } else {
        setError(response.message || "Invalid verification code");
        if (response.remainingAttempts !== undefined) {
          setRemainingAttempts(response.remainingAttempts);
        }
        return false;
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to verify code";
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [code, checkStatus]);

  /**
   * Disable 2FA (requires current code)
   */
  const disable = useCallback(
    async (verificationCode: string): Promise<boolean> => {
      if (!verificationCode || verificationCode.length < 6) {
        setError("Please enter a valid code");
        return false;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await del<{
          success: boolean;
          message: string;
        }>("/auth/2fa/disable", { code: verificationCode });

        if (response.success) {
          setStatus({ enabled: false });
          setSetupData(null);
          setBackupCodes(null);
          setStep("idle");
          return true;
        } else {
          setError(response.message || "Failed to disable 2FA");
          return false;
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to disable 2FA";
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Regenerate backup codes (requires current code)
   */
  const regenerateBackupCodes = useCallback(
    async (verificationCode: string): Promise<string[] | null> => {
      if (!verificationCode || verificationCode.length < 6) {
        setError("Please enter a valid code");
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await post<{
          success: boolean;
          backupCodes: string[];
          message?: string;
        }>("/auth/2fa/backup-codes/regenerate", { code: verificationCode });

        if (response.success && response.backupCodes) {
          setBackupCodes(response.backupCodes);
          // Refresh status for updated count
          await checkStatus();
          return response.backupCodes;
        } else {
          setError(response.message || "Failed to regenerate backup codes");
          return null;
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to regenerate backup codes";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [checkStatus],
  );

  /**
   * Reset hook state
   */
  const reset = useCallback(() => {
    setStep("idle");
    setSetupData(null);
    setBackupCodes(null);
    setCode("");
    setError(null);
    setRemainingAttempts(null);
  }, []);

  // Auto-check status when user is available
  useEffect(() => {
    if (user) {
      checkStatus();
    }
  }, [user, checkStatus]);

  return {
    // State
    step,
    status,
    setupData,
    backupCodes,
    code,
    error,
    loading,
    remainingAttempts,

    // Actions
    setCode,
    checkStatus,
    startSetup,
    verifyAndEnable,
    disable,
    regenerateBackupCodes,
    reset,
  };
}

export default useTotpSetup;
