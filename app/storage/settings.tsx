/**
 * Storage Settings Screen
 * Quản lý cài đặt lưu trữ
 */

import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
} from "@/constants/modern-minimal-styles";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, Stack } from "expo-router";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SettingItem {
  id: string;
  title: string;
  description?: string;
  icon: keyof typeof Ionicons.glyphMap;
  type: "toggle" | "action" | "info";
  value?: boolean;
  info?: string;
  danger?: boolean;
}

const STORAGE_SETTINGS: SettingItem[] = [
  {
    id: "auto_backup",
    title: "Tự động sao lưu",
    description: "Sao lưu tài liệu lên cloud khi có kết nối WiFi",
    icon: "cloud-upload",
    type: "toggle",
    value: true,
  },
  {
    id: "wifi_only",
    title: "Chỉ dùng WiFi",
    description: "Tải xuống/tải lên chỉ khi có WiFi",
    icon: "wifi",
    type: "toggle",
    value: true,
  },
  {
    id: "offline_mode",
    title: "Chế độ Offline",
    description: "Lưu tài liệu quan trọng để xem offline",
    icon: "cloud-offline",
    type: "toggle",
    value: false,
  },
  {
    id: "auto_compress",
    title: "Nén hình ảnh tự động",
    description: "Giảm dung lượng hình ảnh khi tải lên",
    icon: "image",
    type: "toggle",
    value: true,
  },
];

const CACHE_SETTINGS: SettingItem[] = [
  {
    id: "cache_size",
    title: "Dung lượng cache",
    icon: "folder",
    type: "info",
    info: "45.2 MB",
  },
  {
    id: "clear_cache",
    title: "Xóa cache",
    description: "Giải phóng bộ nhớ tạm",
    icon: "trash",
    type: "action",
    danger: false,
  },
  {
    id: "clear_downloads",
    title: "Xóa tải xuống",
    description: "Xóa các tệp đã tải xuống offline",
    icon: "download",
    type: "action",
    danger: false,
  },
];

const DANGER_SETTINGS: SettingItem[] = [
  {
    id: "delete_all",
    title: "Xóa tất cả dữ liệu",
    description: "Xóa toàn bộ tài liệu trên cloud",
    icon: "warning",
    type: "action",
    danger: true,
  },
];

export default function StorageSettingsScreen() {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    auto_backup: true,
    wifi_only: true,
    offline_mode: false,
    auto_compress: true,
  });

  const handleToggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSettings((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAction = (item: SettingItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (item.danger) {
      Alert.alert(
        "Xác nhận",
        `Bạn có chắc chắn muốn ${item.title.toLowerCase()}? Hành động này không thể hoàn tác.`,
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Xác nhận",
            style: "destructive",
            onPress: () => {
              // Handle dangerous action
              Alert.alert("Thành công", "Đã thực hiện thao tác");
            },
          },
        ],
      );
    } else {
      Alert.alert("Thành công", `Đã ${item.title.toLowerCase()}`);
    }
  };

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.settingItem, item.danger && styles.settingItemDanger]}
      onPress={() => {
        if (item.type === "action") handleAction(item);
      }}
      activeOpacity={item.type === "toggle" ? 1 : 0.7}
    >
      <View
        style={[
          styles.settingIcon,
          {
            backgroundColor: item.danger
              ? "#fee2e2"
              : MODERN_COLORS.primary + "15",
          },
        ]}
      >
        <Ionicons
          name={item.icon}
          size={20}
          color={item.danger ? "#ef4444" : MODERN_COLORS.primary}
        />
      </View>
      <View style={styles.settingContent}>
        <Text
          style={[
            styles.settingTitle,
            item.danger && styles.settingTitleDanger,
          ]}
        >
          {item.title}
        </Text>
        {item.description && (
          <Text style={styles.settingDescription}>{item.description}</Text>
        )}
      </View>
      {item.type === "toggle" && (
        <Switch
          value={settings[item.id]}
          onValueChange={() => handleToggle(item.id)}
          trackColor={{
            false: MODERN_COLORS.border,
            true: MODERN_COLORS.primary + "50",
          }}
          thumbColor={settings[item.id] ? MODERN_COLORS.primary : "#f4f3f4"}
        />
      )}
      {item.type === "info" && (
        <Text style={styles.settingInfo}>{item.info}</Text>
      )}
      {item.type === "action" && !item.danger && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={MODERN_COLORS.textSecondary}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={MODERN_COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt lưu trữ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Storage Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đồng bộ & Sao lưu</Text>
          <View style={styles.sectionContent}>
            {STORAGE_SETTINGS.map(renderSettingItem)}
          </View>
        </View>

        {/* Cache Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bộ nhớ đệm</Text>
          <View style={styles.sectionContent}>
            {CACHE_SETTINGS.map(renderSettingItem)}
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>
            Vùng nguy hiểm
          </Text>
          <View style={styles.sectionContent}>
            {DANGER_SETTINGS.map(renderSettingItem)}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  backButton: {
    padding: MODERN_SPACING.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: MODERN_SPACING.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: MODERN_COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.sm,
  },
  dangerTitle: {
    color: "#ef4444",
  },
  sectionContent: {
    backgroundColor: MODERN_COLORS.surface,
    marginHorizontal: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.lg,
    overflow: "hidden",
    ...MODERN_SHADOWS.sm,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: MODERN_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  settingItemDanger: {
    borderBottomWidth: 0,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: MODERN_SPACING.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },
  settingTitleDanger: {
    color: "#ef4444",
  },
  settingDescription: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    marginTop: 2,
  },
  settingInfo: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.textSecondary,
  },
});
