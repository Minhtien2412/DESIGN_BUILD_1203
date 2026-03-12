/**
 * OfflineDataBanner
 * Yellow/amber warning banner shown when screen data comes from local cache
 * instead of the real API. Matches the project notification-center style.
 */

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface OfflineDataBannerProps {
  /** Override the default message */
  message?: string;
  /** Callback when user taps "Thử lại" */
  onRetry?: () => void;
  /** Hide the banner entirely */
  visible?: boolean;
}

export default function OfflineDataBanner({
  message = "Đang dùng dữ liệu offline",
  onRetry,
  visible = true,
}: OfflineDataBannerProps) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Ionicons
        name="cloud-offline-outline"
        size={16}
        color="#92400E"
        style={styles.icon}
      />
      <Text style={styles.text} numberOfLines={1}>
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={styles.retryBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="refresh" size={14} color="#92400E" />
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderBottomWidth: 1,
    borderBottomColor: "#FDE68A",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    flex: 1,
    fontSize: 13,
    color: "#92400E",
    fontWeight: "500",
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#FEF3C7",
  },
  retryText: {
    fontSize: 12,
    color: "#92400E",
    fontWeight: "600",
    marginLeft: 4,
  },
});
