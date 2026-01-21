/**
 * ConnectionStatusBanner Component
 * Shows WebSocket connection status with reconnect option
 *
 * @created 19/01/2026
 */

import { Ionicons } from "@expo/vector-icons";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface ConnectionStatusBannerProps {
  connected: boolean;
  connecting: boolean;
  error?: string | null;
  onReconnect?: () => void;
  style?: object;
}

export function ConnectionStatusBanner({
  connected,
  connecting,
  error,
  onReconnect,
  style,
}: ConnectionStatusBannerProps) {
  // Don't show banner when connected
  if (connected && !error) return null;

  const getStatusConfig = () => {
    if (connecting) {
      return {
        backgroundColor: "#FFF3CD",
        textColor: "#856404",
        icon: null,
        text: "Đang kết nối...",
        showLoader: true,
      };
    }

    if (error) {
      return {
        backgroundColor: "#F8D7DA",
        textColor: "#721C24",
        icon: "alert-circle" as const,
        text: error,
        showLoader: false,
      };
    }

    return {
      backgroundColor: "#FFF3CD",
      textColor: "#856404",
      icon: "cloud-offline" as const,
      text: "Mất kết nối",
      showLoader: false,
    };
  };

  const config = getStatusConfig();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: config.backgroundColor },
        style,
      ]}
    >
      <View style={styles.content}>
        {config.showLoader ? (
          <ActivityIndicator size="small" color={config.textColor} />
        ) : config.icon ? (
          <Ionicons name={config.icon} size={16} color={config.textColor} />
        ) : null}

        <Text style={[styles.text, { color: config.textColor }]}>
          {config.text}
        </Text>
      </View>

      {!connecting && onReconnect && (
        <TouchableOpacity style={styles.reconnectButton} onPress={onReconnect}>
          <Ionicons name="refresh" size={14} color={config.textColor} />
          <Text style={[styles.reconnectText, { color: config.textColor }]}>
            Thử lại
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  text: {
    fontSize: 13,
    fontWeight: "500",
  },
  reconnectButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  reconnectText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default ConnectionStatusBanner;
