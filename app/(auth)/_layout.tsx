/**
 * Auth Layout - Modern Auth Flow
 *
 * Routes:
 * - auth: Modern combined Login/Register (default)
 * - forgot-password: Password reset
 * - otp-verify: OTP verification (for phone auth)
 */

import { useI18n } from "@/services/i18nService";
import { Stack } from "expo-router";

export default function AuthLayout() {
  const { t } = useI18n();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#0B0B1A" },
      }}
    >
      {/* Modern combined auth screen */}
      <Stack.Screen name="auth" options={{ title: t("auth.login") }} />

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
