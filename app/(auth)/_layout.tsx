/**
 * Auth Layout - Modern Auth Flow
 *
 * Routes:
 * - auth: Modern combined Login/Register (default)
 * - forgot-password: Password reset
 * - otp-verify: OTP verification (for phone auth)
 */

import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#0F0F23" },
      }}
    >
      {/* Modern combined auth screen */}
      <Stack.Screen name="auth" options={{ title: "Đăng nhập" }} />

      {/* Supporting screens */}
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="otp-verify" />
      <Stack.Screen name="reset-password" />

      {/* Legacy - redirect to auth */}
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
    </Stack>
  );
}
