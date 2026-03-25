/**
 * Server Connection Hook
 * Monitors and manages server connection status
 */

import { ENV } from "@/config/env";
import { useCallback, useEffect, useState } from "react";

export interface ServerInfo {
  name: string;
  url: string;
  status: "connected" | "checking" | "offline" | "error";
  isProduction: boolean;
  responseTime?: number;
  lastChecked?: Date;
}

const SERVERS = [
  {
    name: "Production VPS",
    url: `${ENV.API_BASE_URL}/health`,
    isProduction: true,
  },
];

export function useServerConnection(autoCheck = true, intervalMs = 60000) {
  const [currentServer, setCurrentServer] = useState<ServerInfo>({
    name: "Checking...",
    url: "",
    status: "checking",
    isProduction: false,
  });

  const [allServers, setAllServers] = useState<ServerInfo[]>([]);

  const checkServer = useCallback(
    async (config: (typeof SERVERS)[0]): Promise<ServerInfo> => {
      const startTime = Date.now();

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // Tăng timeout lên 10s

        console.log(`[Health Check] Checking ${config.name}: ${config.url}`);
        console.log(
          `[Health Check] Using API Key: ${ENV.API_KEY ? "YES" : "NO"}`,
        );

        const response = await fetch(config.url, {
          method: "GET",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": ENV.API_KEY || "thietke-resort-api-key-2024",
          },
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        console.log(
          `[Health Check] ${config.name} - Status: ${response.status}, Time: ${responseTime}ms`,
        );

        if (response.ok) {
          try {
            const data = await response.json();
            console.log(`[Health Check] ${config.name} - Response:`, data);

            // Verify response format: { status: 'healthy', ... }
            if (data.status === "healthy") {
              console.log(`[Health Check] ✅ ${config.name} is ONLINE`);
              return {
                name: config.name,
                url: config.url,
                status: "connected",
                isProduction: config.isProduction,
                responseTime,
                lastChecked: new Date(),
              };
            } else {
              console.warn(
                `[Health Check] ⚠️ ${config.name} - Unexpected status: ${data.status}`,
              );
            }
          } catch (parseError) {
            console.error(
              `[Health Check] ❌ ${config.name} - JSON parse error:`,
              parseError,
            );
          }
        } else {
          console.warn(
            `[Health Check] ⚠️ ${config.name} - HTTP ${response.status}`,
          );
        }

        return {
          name: config.name,
          url: config.url,
          status: "error",
          isProduction: config.isProduction,
          responseTime,
          lastChecked: new Date(),
        };
      } catch (error: any) {
        const responseTime = Date.now() - startTime;
        console.error(
          `[Health Check] ❌ ${config.name} - Error:`,
          error.message,
        );

        return {
          name: config.name,
          url: config.url,
          status: "offline",
          isProduction: config.isProduction,
          responseTime,
          lastChecked: new Date(),
        };
      }
    },
    [],
  );

  const checkAllServers = useCallback(async () => {
    setCurrentServer((prev) => ({ ...prev, status: "checking" }));

    const results = await Promise.all(
      SERVERS.map((server) => checkServer(server)),
    );

    // Sort by priority: 1. connected production, 2. connected dev, 3. offline
    const sortedResults = results.sort((a, b) => {
      if (a.status === "connected" && b.status !== "connected") return -1;
      if (a.status !== "connected" && b.status === "connected") return 1;
      if (a.status === "connected" && b.status === "connected") {
        if (a.isProduction && !b.isProduction) return -1;
        if (!a.isProduction && b.isProduction) return 1;
        // Both connected, sort by response time
        return (a.responseTime || 999999) - (b.responseTime || 999999);
      }
      return 0;
    });

    setAllServers(sortedResults);

    // Find first available server (already sorted by priority)
    const available = sortedResults.find((s) => s.status === "connected");

    if (available) {
      setCurrentServer(available);
    } else {
      setCurrentServer({
        name: "Offline Mode",
        url: "",
        status: "offline",
        isProduction: false,
        lastChecked: new Date(),
      });
    }

    return results;
  }, [checkServer]);

  useEffect(() => {
    if (autoCheck) {
      checkAllServers();

      // Periodic check
      const interval = setInterval(checkAllServers, intervalMs);
      return () => clearInterval(interval);
    }
  }, [autoCheck, intervalMs, checkAllServers]);

  return {
    currentServer,
    allServers,
    checkAllServers,
    isOnline: currentServer.status === "connected",
    isProduction: currentServer.isProduction,
    isOffline: currentServer.status === "offline",
  };
}
