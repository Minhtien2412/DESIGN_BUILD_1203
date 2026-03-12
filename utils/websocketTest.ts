/**
 * WebSocket Connection Test Utility
 * ==================================
 *
 * Provides utilities to test and diagnose WebSocket connection issues.
 *
 * @author ThietKeResort Team
 * @created 2026-01-26
 */

import ENV from "@/config/env";
import { Platform } from "react-native";
import io, { Socket } from "socket.io-client";

// ============================================================================
// Types
// ============================================================================

export interface ConnectionTestResult {
  success: boolean;
  url: string;
  latency?: number;
  error?: string;
  socketId?: string;
  transport?: string;
  serverTime?: string;
}

export interface ConnectionDiagnostics {
  platform: string;
  wsUrl: string;
  apiUrl: string;
  networkAvailable: boolean;
  tests: ConnectionTestResult[];
  recommendations: string[];
}

// ============================================================================
// WebSocket Test Functions
// ============================================================================

/**
 * Get the WebSocket URL based on environment
 */
export function getWebSocketUrl(): string {
  let url =
    ENV.WS_BASE_URL ||
    ENV.WS_URL ||
    ENV.API_BASE_URL ||
    "wss://baotienweb.cloud";

  // Remove trailing slash
  url = url.replace(/\/$/, "");

  // Convert http to ws for API URLs
  if (url.startsWith("http://")) {
    url = url.replace("http://", "ws://");
  } else if (url.startsWith("https://")) {
    url = url.replace("https://", "wss://");
  }

  // Android emulator cannot reach localhost
  if (
    Platform.OS === "android" &&
    (url.includes("localhost") || url.includes("127.0.0.1"))
  ) {
    url = url.replace("localhost", "10.0.2.2").replace("127.0.0.1", "10.0.2.2");
  }

  return url;
}

/**
 * Test basic WebSocket connection
 */
export async function testConnection(
  token?: string,
  timeoutMs = 10000,
): Promise<ConnectionTestResult> {
  const wsUrl = getWebSocketUrl();
  const startTime = Date.now();

  console.log("[WebSocket Test] Testing connection to:", wsUrl);

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      socket.disconnect();
      resolve({
        success: false,
        url: wsUrl,
        error: "Connection timeout after " + timeoutMs + "ms",
      });
    }, timeoutMs);

    const socket: Socket = io(wsUrl, {
      auth: token ? { token } : undefined,
      transports:
        Platform.OS === "web"
          ? ["polling", "websocket"]
          : ["websocket", "polling"],
      timeout: timeoutMs,
      reconnection: false,
      forceNew: true,
    });

    socket.on("connect", () => {
      clearTimeout(timeout);
      const latency = Date.now() - startTime;

      console.log("[WebSocket Test] ✅ Connected!", {
        socketId: socket.id,
        transport: socket.io.engine?.transport?.name,
        latency: latency + "ms",
      });

      // Test ping/pong
      const pingStart = Date.now();
      socket.emit("ping", (serverTime: string) => {
        const pingLatency = Date.now() - pingStart;
        console.log("[WebSocket Test] Ping latency:", pingLatency + "ms");

        socket.disconnect();

        resolve({
          success: true,
          url: wsUrl,
          latency: pingLatency,
          socketId: socket.id,
          transport: socket.io.engine?.transport?.name,
          serverTime,
        });
      });

      // Fallback if server doesn't respond to ping
      setTimeout(() => {
        if (socket.connected) {
          socket.disconnect();
          resolve({
            success: true,
            url: wsUrl,
            latency,
            socketId: socket.id,
            transport: socket.io.engine?.transport?.name,
          });
        }
      }, 2000);
    });

    socket.on("connect_error", (error) => {
      clearTimeout(timeout);
      console.error("[WebSocket Test] ❌ Connection error:", error.message);
      socket.disconnect();
      resolve({
        success: false,
        url: wsUrl,
        error: error.message,
      });
    });
  });
}

/**
 * Test connection with authentication
 */
export async function testAuthenticatedConnection(
  token: string,
): Promise<ConnectionTestResult> {
  console.log("[WebSocket Test] Testing authenticated connection...");
  return testConnection(token);
}

/**
 * Test specific namespaces
 */
export async function testNamespace(
  namespace: string,
  token?: string,
): Promise<ConnectionTestResult> {
  const wsUrl = getWebSocketUrl() + namespace;
  const startTime = Date.now();

  console.log("[WebSocket Test] Testing namespace:", namespace);

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      socket.disconnect();
      resolve({
        success: false,
        url: wsUrl,
        error: "Namespace connection timeout",
      });
    }, 10000);

    const socket = io(wsUrl, {
      auth: token ? { token } : undefined,
      transports: ["websocket", "polling"],
      timeout: 10000,
      reconnection: false,
    });

    socket.on("connect", () => {
      clearTimeout(timeout);
      const latency = Date.now() - startTime;
      console.log("[WebSocket Test] ✅ Namespace connected:", namespace);
      socket.disconnect();
      resolve({
        success: true,
        url: wsUrl,
        latency,
        socketId: socket.id,
      });
    });

    socket.on("connect_error", (error) => {
      clearTimeout(timeout);
      console.error("[WebSocket Test] ❌ Namespace error:", error.message);
      socket.disconnect();
      resolve({
        success: false,
        url: wsUrl,
        error: error.message,
      });
    });
  });
}

/**
 * Run full diagnostics
 */
export async function runDiagnostics(
  token?: string,
): Promise<ConnectionDiagnostics> {
  console.log("\n========================================");
  console.log("[WebSocket Diagnostics] Starting...");
  console.log("========================================\n");

  const diagnostics: ConnectionDiagnostics = {
    platform: Platform.OS,
    wsUrl: getWebSocketUrl(),
    apiUrl: ENV.API_BASE_URL || "Not configured",
    networkAvailable: true, // Assume true, actual check would need NetInfo
    tests: [],
    recommendations: [],
  };

  // Test 1: Basic connection
  console.log("\n[Test 1] Basic WebSocket Connection");
  const basicTest = await testConnection();
  diagnostics.tests.push(basicTest);

  if (!basicTest.success) {
    diagnostics.recommendations.push(
      "Check if backend WebSocket server is running",
    );
    diagnostics.recommendations.push(
      "Verify WS_BASE_URL in environment config",
    );
    diagnostics.recommendations.push("Check firewall/CORS settings");
  }

  // Test 2: Authenticated connection (if token provided)
  if (token) {
    console.log("\n[Test 2] Authenticated Connection");
    const authTest = await testAuthenticatedConnection(token);
    diagnostics.tests.push(authTest);

    if (!authTest.success) {
      diagnostics.recommendations.push("Verify authentication token is valid");
      diagnostics.recommendations.push(
        "Check JWT secret matches between client and server",
      );
    }
  }

  // Test 3: Chat namespace
  console.log("\n[Test 3] Chat Namespace (/chat)");
  const chatTest = await testNamespace("/chat", token);
  diagnostics.tests.push(chatTest);

  // Test 4: Notifications namespace
  console.log("\n[Test 4] Notifications Namespace (/notifications)");
  const notifTest = await testNamespace("/notifications", token);
  diagnostics.tests.push(notifTest);

  // Generate summary
  console.log("\n========================================");
  console.log("[WebSocket Diagnostics] Summary");
  console.log("========================================");
  console.log("Platform:", diagnostics.platform);
  console.log("WebSocket URL:", diagnostics.wsUrl);
  console.log("API URL:", diagnostics.apiUrl);
  console.log("\nTest Results:");
  diagnostics.tests.forEach((test, index) => {
    console.log(
      `  ${index + 1}. ${test.success ? "✅" : "❌"} ${test.url}`,
      test.success ? `(${test.latency}ms)` : `- ${test.error}`,
    );
  });

  if (diagnostics.recommendations.length > 0) {
    console.log("\nRecommendations:");
    diagnostics.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
  }

  console.log("\n========================================\n");

  return diagnostics;
}

/**
 * Quick connection check (for UI status indicator)
 */
export async function quickConnectionCheck(): Promise<boolean> {
  try {
    const result = await testConnection(undefined, 5000);
    return result.success;
  } catch {
    return false;
  }
}

export default {
  getWebSocketUrl,
  testConnection,
  testAuthenticatedConnection,
  testNamespace,
  runDiagnostics,
  quickConnectionCheck,
};
