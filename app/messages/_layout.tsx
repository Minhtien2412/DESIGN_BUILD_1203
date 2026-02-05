/**
 * Messages Layout - Unified Messaging System
 * With Authentication Guard
 * Updated: 24/01/2026
 */

import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function MessagesLayout() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log("[MessagesLayout] User not authenticated, redirecting...");
    }
  }, [loading, isAuthenticated]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0068FF" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <View style={styles.authContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="chatbubbles" size={80} color="#0068FF" />
          </View>
          <Text style={styles.authTitle}>Đăng nhập để nhắn tin</Text>
          <Text style={styles.authSubtitle}>
            Bạn cần đăng nhập để truy cập tin nhắn, trò chuyện với bạn bè và
            nhận thông báo real-time.
          </Text>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/(auth)/login")}
          >
            <Ionicons name="log-in-outline" size={20} color="#fff" />
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push("/(auth)/register")}
          >
            <Text style={styles.registerButtonText}>
              Chưa có tài khoản? Đăng ký ngay
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={18} color="#666" />
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // User is authenticated - show messages screens
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      {/* Main conversation list */}
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />

      {/* New conversation - search users */}
      <Stack.Screen
        name="new-conversation"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />

      {/* Chat with specific user - Primary chat screen */}
      <Stack.Screen
        name="[userId]"
        options={{
          headerShown: false,
        }}
      />

      {/* Group chat list */}
      <Stack.Screen
        name="groups"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  authContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  authContent: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 12,
  },
  authSubtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0068FF",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    gap: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  registerButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  registerButtonText: {
    color: "#0068FF",
    fontSize: 14,
    fontWeight: "500",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    paddingVertical: 8,
    gap: 6,
  },
  backButtonText: {
    color: "#666",
    fontSize: 14,
  },
});
