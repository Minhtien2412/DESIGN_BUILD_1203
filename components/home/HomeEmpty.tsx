/**
 * HomeEmpty — Empty state component for home screen
 */
import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const HomeEmpty = memo<{
  message?: string;
  onRetry?: () => void;
}>(({ message = "Không có dữ liệu", onRetry }) => (
  <View style={styles.container}>
    <Ionicons name="cube-outline" size={48} color="#D1D5DB" />
    <Text style={styles.message}>{message}</Text>
    {onRetry && (
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
        <Text style={styles.retryText}>Thử lại</Text>
      </TouchableOpacity>
    )}
  </View>
));

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  message: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: "#0D9488",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});
