/**
 * useOtpAuth Hook
 * ================
 *
 * React hook cho OTP authentication flow
 *
 * Features:
 * - Send OTP với rate limiting
 * - Verify OTP với attempt tracking
 * - Auto-login sau verify
 * - Countdown timer UI
 *
 * @author ThietKeResort Team
 * @created 2026-01-22
 */

import { useAuth } from "@/context/AuthContext";
import { otpAuthService, OtpChannel } from "@/services/auth/otp-auth.service";
import { useCallback, useEffect, useState } from "react";

// ============================================================================
// Types
// ============================================================================

export interface UseOtpAuthState {
  /** Current phone number */
  phone: string;
  /** Current OTP code being entered */
  code: string;
  /** Current step: phone input → otp verification → success */
  step: "phone" | "otp" | "success";
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Can resend OTP (cooldown passed) */
  canResend: boolean;
  /** Seconds until can resend */
  resendCooldown: number;
  /** Seconds until OTP expires */
  expiresIn: number;
  /** Number of verify attempts */
  attempts: number;
  /** Verification result user data */
  user: any | null;
  /** Is new user (needs profile completion) */
  isNewUser: boolean;
}

export interface UseOtpAuthActions {
  /** Set phone number */
  setPhone: (phone: string) => void;
  /** Set OTP code */
  setCode: (code: string) => void;
  /** Send OTP to phone */
  sendOtp: (channel?: OtpChannel) => Promise<boolean>;
  /** Verify OTP code */
  verifyOtp: () => Promise<boolean>;
  /** Resend OTP */
  resendOtp: (channel?: OtpChannel) => Promise<boolean>;
  /** Go back to phone input step */
  goBack: () => void;
  /** Reset all state */
  reset: () => void;
  /** Clear error */
  clearError: () => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useOtpAuth(): UseOtpAuthState & UseOtpAuthActions {
  const { signInWithPhone } = useAuth();

  // State
  const [phone, setPhoneState] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "success">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [expiresIn, setExpiresIn] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  // ============================================
  // Countdown Timer
  // ============================================

  useEffect(() => {
    if (step !== "otp") return;

    const interval = setInterval(() => {
      setResendCooldown(otpAuthService.getResendCooldown());
      setExpiresIn(otpAuthService.getExpiryTime());
      setCanResend(otpAuthService.canResend());
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  // ============================================
  // Actions
  // ============================================

  const setPhone = useCallback((value: string) => {
    // Only allow digits
    const cleaned = value.replace(/\D/g, "");
    setPhoneState(cleaned);
    setError(null);
  }, []);

  const sendOtp = useCallback(
    async (channel?: OtpChannel): Promise<boolean> => {
      if (!phone || phone.length < 10) {
        setError("Vui lòng nhập số điện thoại hợp lệ");
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        await otpAuthService.sendOtp({ phone, channel });
        setStep("otp");
        setCode("");
        setAttempts(0);
        setResendCooldown(60);
        setExpiresIn(300);
        return true;
      } catch (err: any) {
        setError(err.message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [phone],
  );

  const verifyOtp = useCallback(async (): Promise<boolean> => {
    if (!code || code.length !== 6) {
      setError("Vui lòng nhập đủ 6 số");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await otpAuthService.verifyOtp({ phone, code });

      if (result.success && result.accessToken && result.refreshToken) {
        // Auto login with tokens
        setUser(result.user);
        setIsNewUser(result.isNewUser || false);
        setStep("success");

        // Sign in with phone via AuthContext
        if (result.user) {
          await signInWithPhone(phone, result.user.name, result.user.email);
        }

        return true;
      }

      return false;
    } catch (err: any) {
      setError(err.message);
      setAttempts((prev) => prev + 1);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [phone, code, signInWithPhone]);

  const resendOtp = useCallback(
    async (channel?: OtpChannel): Promise<boolean> => {
      if (!canResend) {
        setError(`Vui lòng đợi ${resendCooldown} giây`);
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        await otpAuthService.resendOtp(channel);
        setCode("");
        setAttempts(0);
        return true;
      } catch (err: any) {
        setError(err.message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [canResend, resendCooldown],
  );

  const goBack = useCallback(() => {
    if (step === "otp") {
      setStep("phone");
      setCode("");
      setError(null);
    }
  }, [step]);

  const reset = useCallback(() => {
    setPhoneState("");
    setCode("");
    setStep("phone");
    setIsLoading(false);
    setError(null);
    setCanResend(true);
    setResendCooldown(0);
    setExpiresIn(0);
    setAttempts(0);
    setUser(null);
    setIsNewUser(false);
    otpAuthService.clearState();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    phone,
    code,
    step,
    isLoading,
    error,
    canResend,
    resendCooldown,
    expiresIn,
    attempts,
    user,
    isNewUser,
    // Actions
    setPhone,
    setCode,
    sendOtp,
    verifyOtp,
    resendOtp,
    goBack,
    reset,
    clearError,
  };
}

export default useOtpAuth;
