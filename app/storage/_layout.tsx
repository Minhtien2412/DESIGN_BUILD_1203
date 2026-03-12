/**
 * Storage Layout
 */

import Colors from "@/constants/Colors";
import { Stack } from "expo-router";

export default function StorageLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: Colors.light.primary,
        headerBackTitle: "Quay lại",
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Lưu trữ" }} />
      <Stack.Screen name="settings" options={{ title: "Cài đặt lưu trữ" }} />
      <Stack.Screen name="file/[id]" options={{ title: "Chi tiết tệp" }} />
    </Stack>
  );
}
