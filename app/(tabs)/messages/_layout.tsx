/**
 * Messages Stack Layout
 * ======================
 *
 * Stack navigation cho các màn hình messages:
 * - index: Danh sách cuộc hội thoại (Zalo/Messenger style)
 * - chat-archives: Lịch sử chat đã lưu trữ
 * - archive-detail: Chi tiết một archive
 */

import { useThemeColor } from "@/hooks/useThemeColor";
import { useI18n } from "@/services/i18nService";
import { Stack } from "expo-router";

export default function MessagesLayout() {
  const bgColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const { t } = useI18n();

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
        headerBackTitle: t("msgScreen.back"),
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
          title: t("msgScreen.chatArchives"),
        }}
      />
      <Stack.Screen
        name="archive-detail"
        options={{
          title: t("msgScreen.archiveDetail"),
        }}
      />
      <Stack.Screen
        name="calls-history"
        options={{
          title: t("msgScreen.callHistory"),
        }}
      />
      <Stack.Screen
        name="online-contacts"
        options={{
          title: t("msgScreen.contacts"),
        }}
      />
    </Stack>
  );
}
