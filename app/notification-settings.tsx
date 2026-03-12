/**
 * Notification Settings Screen
 * ==============================
 *
 * Cho user cấu hình: mute category, quiet hours, sound, vibrate, grouping.
 *
 * @author ThietKeResort Team
 * @created 2026-03-05
 */

import { useNotificationSettings } from "@/context/NotificationControllerContext";
import type { NotificationCategory } from "@/services/notification-system";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useCallback, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ============================================================================
// CATEGORY CONFIG
// ============================================================================

const ALL_CATEGORIES: {
  key: NotificationCategory;
  label: string;
  icon: string;
}[] = [
  { key: "chat", label: "Tin nhắn", icon: "chatbubbles" },
  { key: "booking", label: "Đặt lịch", icon: "calendar" },
  { key: "call", label: "Cuộc gọi", icon: "call" },
  { key: "project", label: "Dự án", icon: "briefcase" },
  { key: "task", label: "Công việc", icon: "checkbox" },
  { key: "payment", label: "Thanh toán", icon: "card" },
  { key: "system", label: "Hệ thống", icon: "settings" },
  { key: "social", label: "Mạng xã hội", icon: "people" },
  { key: "crm", label: "CRM", icon: "business" },
  { key: "delivery", label: "Giao hàng", icon: "car" },
  { key: "meeting", label: "Cuộc họp", icon: "videocam" },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, muteCategory, unmuteCategory } =
    useNotificationSettings();

  const [quietStart, setQuietStart] = useState(settings.quietHoursStart || "");
  const [quietEnd, setQuietEnd] = useState(settings.quietHoursEnd || "");

  const handleToggleGlobalMute = useCallback(
    (value: boolean) => {
      updateSettings({ globalMute: value });
    },
    [updateSettings],
  );

  const handleToggleSound = useCallback(
    (value: boolean) => {
      updateSettings({ soundEnabled: value });
    },
    [updateSettings],
  );

  const handleToggleVibrate = useCallback(
    (value: boolean) => {
      updateSettings({ vibrateEnabled: value });
    },
    [updateSettings],
  );

  const handleTogglePreview = useCallback(
    (value: boolean) => {
      updateSettings({ showPreview: value });
    },
    [updateSettings],
  );

  const handleToggleGrouping = useCallback(
    (value: boolean) => {
      updateSettings({ groupingEnabled: value });
    },
    [updateSettings],
  );

  const handleToggleCategory = useCallback(
    (category: NotificationCategory, muted: boolean) => {
      if (muted) {
        unmuteCategory(category);
      } else {
        muteCategory(category);
      }
    },
    [muteCategory, unmuteCategory],
  );

  const handleSaveQuietHours = useCallback(() => {
    updateSettings({
      quietHoursStart: quietStart || null,
      quietHoursEnd: quietEnd || null,
    });
  }, [quietStart, quietEnd, updateSettings]);

  return (
    <>
      <Stack.Screen options={{ title: "Cài đặt thông báo" }} />
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={styles.content}
      >
        {/* General Settings */}
        <Text style={styles.sectionTitle}>Cài đặt chung</Text>
        <View style={styles.card}>
          <SettingRow
            icon="notifications-off"
            label="Tạm tắt tất cả thông báo"
            description="Không hiển thị toast, vẫn lưu vào trung tâm"
            value={settings.globalMute}
            onToggle={handleToggleGlobalMute}
          />
          <SettingRow
            icon="volume-high"
            label="Âm thanh"
            value={settings.soundEnabled}
            onToggle={handleToggleSound}
          />
          <SettingRow
            icon="phone-portrait"
            label="Rung"
            value={settings.vibrateEnabled}
            onToggle={handleToggleVibrate}
          />
          <SettingRow
            icon="eye"
            label="Xem trước nội dung"
            description="Hiện nội dung trong toast"
            value={settings.showPreview}
            onToggle={handleTogglePreview}
          />
          <SettingRow
            icon="layers"
            label="Gom nhóm thông báo"
            description="Gộp nhiều thông báo cùng loại"
            value={settings.groupingEnabled}
            onToggle={handleToggleGrouping}
          />
        </View>

        {/* Quiet Hours */}
        <Text style={styles.sectionTitle}>Giờ yên tĩnh</Text>
        <View style={styles.card}>
          <Text style={styles.quietDesc}>
            Trong khoảng thời gian này, thông báo sẽ không phát âm/rung. Vẫn lưu
            vào trung tâm thông báo.
          </Text>
          <View style={styles.quietRow}>
            <View style={styles.quietInput}>
              <Text style={styles.quietLabel}>Từ</Text>
              <TextInput
                style={styles.timeInput}
                value={quietStart}
                onChangeText={setQuietStart}
                onBlur={handleSaveQuietHours}
                placeholder="22:00"
                placeholderTextColor="#BBB"
                keyboardType="numbers-and-punctuation"
                maxLength={5}
              />
            </View>
            <View style={styles.quietInput}>
              <Text style={styles.quietLabel}>Đến</Text>
              <TextInput
                style={styles.timeInput}
                value={quietEnd}
                onChangeText={setQuietEnd}
                onBlur={handleSaveQuietHours}
                placeholder="07:00"
                placeholderTextColor="#BBB"
                keyboardType="numbers-and-punctuation"
                maxLength={5}
              />
            </View>
          </View>
        </View>

        {/* Per-category settings */}
        <Text style={styles.sectionTitle}>Thông báo theo danh mục</Text>
        <View style={styles.card}>
          {ALL_CATEGORIES.map((cat) => {
            const isMuted = settings.mutedCategories.includes(cat.key);
            return (
              <SettingRow
                key={cat.key}
                icon={cat.icon}
                label={cat.label}
                description={isMuted ? "Đã tắt âm" : "Bật"}
                value={!isMuted}
                onToggle={() => handleToggleCategory(cat.key, isMuted)}
              />
            );
          })}
        </View>
      </ScrollView>
    </>
  );
}

// ============================================================================
// SETTING ROW COMPONENT
// ============================================================================

function SettingRow({
  icon,
  label,
  description,
  value,
  onToggle,
}: {
  icon: string;
  label: string;
  description?: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}) {
  return (
    <View style={styles.settingRow}>
      <Ionicons
        name={icon as any}
        size={22}
        color="#555"
        style={styles.settingIcon}
      />
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description ? (
          <Text style={styles.settingDesc}>{description}</Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#DDD", true: "#0D948880" }}
        thumbColor={value ? "#0D9488" : "#F4F4F4"}
      />
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#888",
    textTransform: "uppercase",
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingIcon: {
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  settingDesc: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  quietDesc: {
    fontSize: 13,
    color: "#888",
    padding: 14,
    lineHeight: 18,
  },
  quietRow: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 16,
  },
  quietInput: {
    flex: 1,
  },
  quietLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
});
