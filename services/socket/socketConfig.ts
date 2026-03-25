/**
 * Socket Configuration — Single Source of Truth
 * ===============================================
 * Every WebSocket consumer MUST use these helpers.
 * Do NOT hardcode URLs, transports, or normalizeWsUrl elsewhere.
 *
 * Production backend: wss://baotienweb.cloud (Nginx → Docker:3002 → NestJS:3000)
 * Socket.IO path: /socket.io (default)
 * Namespaces: /chat, /call, /progress, /notifications
 */

import ENV from "@/config/env";
import { getAccessToken } from "@/services/apiClient";
import { Platform } from "react-native";

// ────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────

/** Hardcoded production WS URL — the ultimate fallback so we never hit localhost */
const PRODUCTION_WS_URL = "wss://baotienweb.cloud";

export type SocketNamespace =
  | "chat"
  | "call"
  | "progress"
  | "notifications"
  | "conversations";

const NS_MAP: Record<SocketNamespace, string> = {
  chat: ENV.WS_CHAT_NS || "/chat",
  call: ENV.WS_CALL_NS || "/call",
  progress: ENV.WS_PROGRESS_NS || "/progress",
  notifications: ENV.WS_NOTIFICATION_NS || "/notifications",
  conversations: "/conversations",
};

// ────────────────────────────────────────────────
// URL helpers
// ────────────────────────────────────────────────

/**
 * Normalize a WebSocket URL:
 *  - Strip trailing slash
 *  - Strip /ws or /api suffixes that don't belong in Socket.IO base URL
 *  - Android emulator: localhost / 127.0.0.1 → 10.0.2.2
 *    (only when intentionally targeting local backend)
 */
export function normalizeWsUrl(raw: string): string {
  if (!raw) return PRODUCTION_WS_URL;

  // Strip paths that break Socket.IO (e.g. "wss://example.com/ws" or ".../api")
  let cleaned = raw.replace(/\/(ws|api)\/?$/i, "");

  try {
    const parsed = new URL(cleaned);
    if (
      Platform.OS === "android" &&
      (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
    ) {
      console.warn(
        `[SocketConfig] ⚠️ localhost detected in WS URL "${cleaned}" — ` +
          `converting to 10.0.2.2 for Android emulator. ` +
          `If backend is remote, set EXPO_PUBLIC_WS_BASE_URL to production domain.`,
      );
      parsed.hostname = "10.0.2.2";
    }
    return parsed.toString().replace(/\/$/, "");
  } catch {
    // URL ctor may fail for ws:// on some RN builds — fallback to string ops
    if (
      Platform.OS === "android" &&
      (cleaned.includes("localhost") || cleaned.includes("127.0.0.1"))
    ) {
      console.warn(
        `[SocketConfig] ⚠️ localhost in raw URL "${cleaned}" — ` +
          `converting for Android emulator.`,
      );
      cleaned = cleaned
        .replace("localhost", "10.0.2.2")
        .replace("127.0.0.1", "10.0.2.2");
    }
    return cleaned.replace(/\/$/, "");
  }
}

/** Regex matching local-dev hostnames that should NEVER reach production. */
const LOCAL_HOST_RE = /localhost|127\.0\.0\.1|10\.0\.2\.2|0\.0\.0\.0/i;

let _wsBaseUrlLogged = false;

/**
 * Resolved + normalised base WS URL (no namespace, no trailing slash).
 *
 * Resolution order:
 *   WS_BASE_URL → WS_URL → PRODUCTION_WS_URL (hardcoded fallback)
 *
 * SAFETY NET: if the selected URL points to localhost / 10.0.2.2,
 * it is **overridden** with PRODUCTION_WS_URL so the app never
 * accidentally connects to a non-existent local gateway.
 */
export function getWsBaseUrl(): string {
  const wsBase = ENV.WS_BASE_URL;
  const wsLegacy = ENV.WS_URL;
  const apiBase = ENV.API_BASE_URL;

  // Pick the first truthy value
  let raw = wsBase || wsLegacy || PRODUCTION_WS_URL;

  // ── SAFETY NET ──────────────────────────────────────────────
  // If the resolved URL is a local-dev address (from stale Expo cache,
  // wrong .env, or IS_DEV fallback), force production URL.
  if (LOCAL_HOST_RE.test(raw)) {
    console.warn(
      `[SocketConfig] ⚠️ Local URL detected: "${raw}" — ` +
        `overriding with PRODUCTION_WS_URL ("${PRODUCTION_WS_URL}"). ` +
        `Clear Expo cache (npx expo start -c) if this is unexpected.`,
    );
    raw = PRODUCTION_WS_URL;
  }

  const resolved = normalizeWsUrl(raw);

  // Log once so devs can see which URL the app chose
  if (!_wsBaseUrlLogged) {
    _wsBaseUrlLogged = true;
    console.log(
      `[SocketConfig] WS URL resolved:\n` +
        `  ENV.WS_BASE_URL   = ${JSON.stringify(wsBase)}\n` +
        `  ENV.WS_URL         = ${JSON.stringify(wsLegacy)}\n` +
        `  ENV.API_BASE_URL   = ${JSON.stringify(apiBase)}\n` +
        `  PRODUCTION_WS_URL  = ${PRODUCTION_WS_URL}\n` +
        `  → selected raw     = ${JSON.stringify(raw)}\n` +
        `  → normalised       = ${JSON.stringify(resolved)}\n` +
        `  Platform           = ${Platform.OS}`,
    );
  }

  return resolved;
}

/** Full URL ready to pass to `io()` for a given namespace. */
export function buildNamespaceUrl(ns: SocketNamespace): string {
  const base = getWsBaseUrl();
  const nsPath = NS_MAP[ns] || `/${ns}`;
  const url = `${base}${nsPath}`;
  console.log(`[SocketConfig] buildNamespaceUrl("${ns}") → ${url}`);
  return url;
}

// ────────────────────────────────────────────────
// Transport
// ────────────────────────────────────────────────

/** Platform-aware transport order: mobile → WS first, web → polling first. */
export function getTransports(): ("websocket" | "polling")[] {
  return Platform.OS === "web"
    ? ["polling", "websocket"]
    : ["websocket", "polling"];
}

// ────────────────────────────────────────────────
// Default socket.io options
// ────────────────────────────────────────────────

export interface SocketConnectOptions {
  auth: { token: string };
  transports: ("websocket" | "polling")[];
  reconnection: boolean;
  reconnectionAttempts: number;
  reconnectionDelay: number;
  reconnectionDelayMax: number;
  timeout: number;
}

/**
 * Build standard socket.io connect options.
 * Token is injected automatically.
 */
export function buildSocketOptions(
  token: string,
  overrides?: Partial<SocketConnectOptions>,
): SocketConnectOptions {
  return {
    auth: { token },
    transports: getTransports(),
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10_000,
    timeout: 15_000,
    ...overrides,
  };
}

// ────────────────────────────────────────────────
// Auth helper (re-exported for convenience)
// ────────────────────────────────────────────────

export { getAccessToken };

// ────────────────────────────────────────────────
// Diagnostic logger
// ────────────────────────────────────────────────

/**
 * Log a connect_error with full diagnostic context.
 * Never logs the actual token — only its presence.
 */
export function logConnectError(
  tag: string,
  ns: SocketNamespace | string,
  url: string,
  error: Error & { description?: string; type?: string },
  token: string | null | undefined,
): void {
  console.error(
    `[${tag}] connect_error on /${ns}:`,
    `message=${error?.message ?? "unknown"}`,
    `description=${error?.description ?? "none"}`,
    `type=${error?.type ?? "none"}`,
    `url=${url}`,
    `hasToken=${!!token}`,
    `transport=${getTransports().join(",")}`,
  );
}
