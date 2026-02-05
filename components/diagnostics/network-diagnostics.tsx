/**
 * Network Diagnostics Component
 * Hiển thị trạng thái kết nối BE/FE và test connectivity
 */

import ENV from "@/config/env";
import { apiFetch } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface NetworkStatus {
  isConnected: boolean | null;
  type: string | null;
  effectiveType: string | null;
}

interface EndpointStatus {
  url: string;
  status: "checking" | "online" | "offline" | "error";
  responseTime?: number;
  error?: string;
}

const COLORS = {
  bg: "#F8FAFC",
  card: "#FFFFFF",
  text: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  success: "#0066CC",
  error: "#000000",
  warning: "#0066CC",
  border: "#E2E8F0",
};

export function NetworkDiagnostics() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: null,
    type: null,
    effectiveType: null,
  });

  const [endpoints, setEndpoints] = useState<EndpointStatus[]>([
    { url: ENV.API_BASE_URL, status: "checking" },
    { url: ENV.WS_BASE_URL || "", status: "checking" },
  ]);

  useEffect(() => {
    // Subscribe to network status
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkStatus({
        isConnected: state.isConnected,
        type: state.type,
        effectiveType: (state.details as any)?.effectiveType || null,
      });
    });

    // Initial check
    checkEndpoints();

    return () => unsubscribe();
  }, []);

  const checkEndpoints = async () => {
    const results: EndpointStatus[] = [];

    for (const endpoint of endpoints) {
      const startTime = Date.now();

      try {
        // Try to fetch from health endpoint or root
        const healthUrl = endpoint.url.includes("/api/v1")
          ? endpoint.url.replace("/api/v1", "/health")
          : `${endpoint.url}/health`;

        await apiFetch(healthUrl, {
          timeoutMs: 5000,
          method: "GET",
        });

        const responseTime = Date.now() - startTime;
        results.push({
          url: endpoint.url,
          status: "online",
          responseTime,
        });
      } catch (error: any) {
        results.push({
          url: endpoint.url,
          status: "error",
          error: error.message || "Connection failed",
        });
      }
    }

    setEndpoints(results);
  };

  const getStatusColor = (status: EndpointStatus["status"]) => {
    switch (status) {
      case "online":
        return COLORS.success;
      case "offline":
      case "error":
        return COLORS.error;
      case "checking":
        return COLORS.warning;
      default:
        return COLORS.textMuted;
    }
  };

  const getStatusIcon = (status: EndpointStatus["status"]) => {
    switch (status) {
      case "online":
        return "checkmark-circle";
      case "offline":
      case "error":
        return "close-circle";
      case "checking":
        return "time";
      default:
        return "help-circle";
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Network Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trạng thái mạng</Text>
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <Ionicons
                name={networkStatus.isConnected ? "wifi" : "wifi-outline"}
                size={24}
                color={
                  networkStatus.isConnected ? COLORS.success : COLORS.error
                }
              />
              <Text style={styles.statusLabel}>
                {networkStatus.isConnected === null
                  ? "Đang kiểm tra..."
                  : networkStatus.isConnected
                    ? "Đã kết nối"
                    : "Offline"}
              </Text>
            </View>
            {networkStatus.type && (
              <Text style={styles.statusValue}>{networkStatus.type}</Text>
            )}
          </View>

          {Platform.OS !== "web" && networkStatus.effectiveType && (
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Loại kết nối</Text>
              <Text style={styles.statusValue}>
                {networkStatus.effectiveType}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Backend Endpoints */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Backend Endpoints</Text>
          <TouchableOpacity onPress={checkEndpoints} style={styles.refreshBtn}>
            <Ionicons name="refresh" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {endpoints.map((endpoint, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.endpointHeader}>
              <Ionicons
                name={getStatusIcon(endpoint.status)}
                size={24}
                color={getStatusColor(endpoint.status)}
              />
              <Text style={styles.endpointUrl} numberOfLines={1}>
                {endpoint.url}
              </Text>
            </View>

            <View style={styles.endpointDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Trạng thái:</Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: getStatusColor(endpoint.status) },
                  ]}
                >
                  {endpoint.status === "checking"
                    ? "Đang kiểm tra..."
                    : endpoint.status === "online"
                      ? "✓ Online"
                      : endpoint.status === "error"
                        ? "✗ Lỗi kết nối"
                        : ""}
                </Text>
              </View>

              {endpoint.responseTime && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Thời gian phản hồi:</Text>
                  <Text style={styles.detailValue}>
                    {endpoint.responseTime}ms
                  </Text>
                </View>
              )}

              {endpoint.error && (
                <View style={styles.errorBox}>
                  <Ionicons name="warning" size={16} color={COLORS.error} />
                  <Text style={styles.errorText}>{endpoint.error}</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Configuration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cấu hình</Text>
        <View style={styles.card}>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>API Base URL:</Text>
            <Text style={styles.configValue} numberOfLines={1}>
              {ENV.API_BASE_URL}
            </Text>
          </View>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>WS Base URL:</Text>
            <Text style={styles.configValue} numberOfLines={1}>
              {ENV.WS_BASE_URL}
            </Text>
          </View>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>API Key:</Text>
            <Text style={styles.configValue}>
              {ENV.API_KEY ? ENV.API_KEY.substring(0, 15) + "..." : "Not set"}
            </Text>
          </View>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Platform:</Text>
            <Text style={styles.configValue}>{Platform.OS}</Text>
          </View>
        </View>
      </View>

      {/* Troubleshooting */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Khắc phục sự cố</Text>
        <View style={styles.card}>
          <Text style={styles.troubleText}>
            • Kiểm tra kết nối Internet{"\n"}• Kiểm tra backend server đang chạy
            {"\n"}• Kiểm tra firewall/CORS settings{"\n"}• Thử restart app hoặc
            clear cache
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  refreshBtn: {
    padding: 4,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusLabel: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: "500",
  },
  statusValue: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textTransform: "capitalize",
  },
  endpointHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  endpointUrl: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  endpointDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  detailValue: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: "500",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.error + "10",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.error,
  },
  configRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  configLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  configValue: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    textAlign: "right",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  troubleText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
});
