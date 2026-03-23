/**
 * 404 Not Found Screen
 * Fallback for unmatched routes in Expo Router
 */
import { Ionicons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Không tìm thấy" }} />
      <View style={s.container}>
        <Ionicons name="alert-circle-outline" size={72} color="#D1D5DB" />
        <Text style={s.code}>404</Text>
        <Text style={s.title}>Trang không tồn tại</Text>
        <Text style={s.subtitle}>
          Đường dẫn bạn truy cập không khả dụng hoặc đã bị xoá.
        </Text>
        <Link href="/(tabs)" style={s.link}>
          <Text style={s.linkText}>← Quay về Trang chủ</Text>
        </Link>
      </View>
    </>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: "#FFFFFF",
  },
  code: {
    fontSize: 56,
    fontWeight: "800",
    color: "#E5E7EB",
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  link: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: "#90B44C",
  },
  linkText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
