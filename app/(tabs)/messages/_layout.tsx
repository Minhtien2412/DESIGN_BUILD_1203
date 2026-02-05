/**
 * Messages Stack Layout
 * ======================
 *
 * Stack navigation cho các màn hình messages:
 * - index: Redirect to chat-archives
 * - chat-archives: Danh sách lịch sử chat đã lưu
 * - archive-detail: Chi tiết một archive
 */

import { useThemeColor } from "@/hooks/useThemeColor";
import { Stack } from "expo-router";

export default function MessagesLayout() {
  const bgColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: bgColor,
        },
        headerTintColor: textColor,
        headerTitleStyle: {
          fontWeight: "600",
        },
        headerBackTitle: "Quay lại",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="chat-archives"
        options={{
          title: "Lịch sử Chat",
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="archive-detail"
        options={{
          title: "Chi tiết Archive",
        }}
      />
    </Stack>
  );
}
