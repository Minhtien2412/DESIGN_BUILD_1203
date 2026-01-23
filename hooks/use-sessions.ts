/**
 * Device Sessions Management Hook
 * Manages user's active login sessions across devices
 *
 * Features:
 * - List all active sessions
 * - Identify current session
 * - Revoke specific sessions (logout from device)
 * - Revoke all other sessions
 * - Revoke all sessions (logout everywhere)
 */

import { useAuth } from "@/context/AuthContext";
import { del, get, post } from "@/services/api";
import { useCallback, useEffect, useState } from "react";

// ============= Types =============

export interface DeviceSession {
  id: string;
  deviceName: string | null;
  deviceType: string | null; // mobile, tablet, desktop, web
  platform: string | null; // ios, android, windows, macos, linux, web
  browser: string | null;
  ipAddress: string | null;
  location: string | null;
  lastUsedAt: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
  isCurrent: boolean;
}

export interface UseSessionsReturn {
  // State
  sessions: DeviceSession[];
  currentSessionId: string | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchSessions: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<boolean>;
  revokeAllOther: () => Promise<number>;
  revokeAll: () => Promise<number>;
  refresh: () => Promise<void>;
}

// ============= Helpers =============

/**
 * Get device icon name based on device type
 */
export function getDeviceIcon(
  deviceType: string | null,
): "smartphone" | "tablet-smartphone" | "monitor" | "globe" {
  switch (deviceType) {
    case "mobile":
      return "smartphone";
    case "tablet":
      return "tablet-smartphone";
    case "desktop":
      return "monitor";
    default:
      return "globe";
  }
}

/**
 * Get platform display name
 */
export function getPlatformName(platform: string | null): string {
  switch (platform) {
    case "ios":
      return "iOS";
    case "android":
      return "Android";
    case "windows":
      return "Windows";
    case "macos":
      return "macOS";
    case "linux":
      return "Linux";
    default:
      return "Web";
  }
}

/**
 * Format session last used time
 */
export function formatLastUsed(lastUsedAt: string): string {
  const date = new Date(lastUsedAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString();
}

// ============= Hook =============

export function useSessions(): UseSessionsReturn {
  const { user, sessionId } = useAuth();
  const currentSessionId = sessionId ?? null;

  // State
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all active sessions
   */
  const fetchSessions = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const response = await get<{
        success: boolean;
        data: DeviceSession[];
        count: number;
      }>("/auth/sessions");

      if (response.success && response.data) {
        // Mark current session
        const sessionsWithCurrent = response.data.map((session) => ({
          ...session,
          isCurrent: session.id === currentSessionId,
        }));

        // Sort: current first, then by last used
        sessionsWithCurrent.sort((a, b) => {
          if (a.isCurrent) return -1;
          if (b.isCurrent) return 1;
          return (
            new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime()
          );
        });

        setSessions(sessionsWithCurrent);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch sessions";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user, currentSessionId]);

  /**
   * Revoke a specific session
   */
  const revokeSession = useCallback(
    async (sessionId: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const response = await del<{
          success: boolean;
          message: string;
        }>(`/auth/sessions/${sessionId}`);

        if (response.success) {
          // Remove from local state
          setSessions((prev) => prev.filter((s) => s.id !== sessionId));
          return true;
        } else {
          setError(response.message || "Failed to revoke session");
          return false;
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to revoke session";
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Revoke all sessions except current
   */
  const revokeAllOther = useCallback(async (): Promise<number> => {
    try {
      setLoading(true);
      setError(null);

      const response = await del<{
        success: boolean;
        message: string;
        revokedCount: number;
      }>("/auth/sessions", { currentSessionId });

      if (response.success) {
        // Keep only current session in local state
        setSessions((prev) => prev.filter((s) => s.isCurrent));
        return response.revokedCount;
      } else {
        setError(response.message || "Failed to revoke sessions");
        return 0;
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to revoke sessions";
      setError(message);
      return 0;
    } finally {
      setLoading(false);
    }
  }, [currentSessionId]);

  /**
   * Revoke all sessions (logout from all devices)
   */
  const revokeAll = useCallback(async (): Promise<number> => {
    try {
      setLoading(true);
      setError(null);

      const response = await post<{
        success: boolean;
        message: string;
        revokedCount: number;
      }>("/auth/sessions/revoke-all", {});

      if (response.success) {
        // Clear all sessions from local state
        setSessions([]);
        return response.revokedCount;
      } else {
        setError(response.message || "Failed to revoke sessions");
        return 0;
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to revoke sessions";
      setError(message);
      return 0;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh sessions
   */
  const refresh = useCallback(async () => {
    await fetchSessions();
  }, [fetchSessions]);

  // Auto-fetch on mount when user is available
  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user, fetchSessions]);

  return {
    // State
    sessions,
    currentSessionId,
    loading,
    error,

    // Actions
    fetchSessions,
    revokeSession,
    revokeAllOther,
    revokeAll,
    refresh,
  };
}

export default useSessions;
