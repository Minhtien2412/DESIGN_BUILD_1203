/**
 * Settings Module Layout
 * Tách từ profile/ - Quản lý cài đặt ứng dụng
 */

import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Cài đặt" }} />
      {/* Account */}
      <Stack.Screen name="account/security" options={{ title: "Bảo mật" }} />
      <Stack.Screen
        name="account/privacy"
        options={{ title: "Quyền riêng tư" }}
      />
      <Stack.Screen
        name="account/change-password"
        options={{ title: "Đổi mật khẩu" }}
      />
      <Stack.Screen
        name="account/biometric"
        options={{ title: "Sinh trắc học" }}
      />
      {/* Preferences */}
      <Stack.Screen
        name="preferences/appearance"
        options={{ title: "Giao diện" }}
      />
      <Stack.Screen
        name="preferences/language"
        options={{ title: "Ngôn ngữ" }}
      />
      <Stack.Screen
        name="preferences/notifications"
        options={{ title: "Thông báo" }}
      />
      {/* Data */}
      <Stack.Screen name="data/cloud" options={{ title: "Đám mây" }} />
      <Stack.Screen
        name="data/permissions"
        options={{ title: "Quyền truy cập" }}
      />
      <Stack.Screen
        name="data/contact-sync"
        options={{ title: "Đồng bộ danh bạ" }}
      />
      {/* Help */}
      <Stack.Screen name="help/index" options={{ title: "Trợ giúp" }} />
    </Stack>
  );
}
