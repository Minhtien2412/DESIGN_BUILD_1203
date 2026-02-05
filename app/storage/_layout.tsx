/**
 * Storage Layout
 */

import { Stack } from "expo-router";

export default function StorageLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="file/[id]" />
    </Stack>
  );
}
