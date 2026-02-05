/**
 * Meetings Module Layout
 * Gộp từ meet/ + meeting/ - Video conferencing & Meeting rooms
 */

import { Stack } from "expo-router";

export default function MeetingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Cuộc họp" }} />
      <Stack.Screen name="create" options={{ title: "Tạo cuộc họp" }} />
      <Stack.Screen name="join" options={{ title: "Tham gia cuộc họp" }} />
      <Stack.Screen name="room" options={{ title: "Phòng họp" }} />
      <Stack.Screen name="[code]" options={{ title: "Tham gia bằng mã" }} />
      <Stack.Screen name="[id]" options={{ title: "Chi tiết cuộc họp" }} />
      <Stack.Screen name="[roomId]" options={{ title: "Phòng video" }} />
    </Stack>
  );
}
