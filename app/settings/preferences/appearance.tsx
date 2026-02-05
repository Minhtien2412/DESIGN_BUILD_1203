/**
 * Appearance Settings Screen - Theme Selection
 * @route /profile/appearance
 */

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  primary: "#10B981",
  bg: "#F8FAFC",
  card: "#FFFFFF",
  text: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2E8F0",
};

type ThemeOption = "light" | "dark" | "system";

interface ThemeConfig {
  id: ThemeOption;
  name: string;
  icon: string;
  description: string;
  preview: {
    bg: string;
    card: string;
    text: string;
  };
}

const THEMES: ThemeConfig[] = [
  {
    id: "light",
    name: "Sáng",
    icon: "sunny",
    description: "Giao diện sáng, phù hợp ban ngày",
    preview: { bg: "#F8FAFC", card: "#FFFFFF", text: "#0F172A" },
  },
  {
    id: "dark",
    name: "Tối",
    icon: "moon",
    description: "Giao diện tối, dễ nhìn ban đêm",
    preview: { bg: "#0F172A", card: "#1E293B", text: "#F8FAFC" },
  },
  {
    id: "system",
    name: "Tự động",
    icon: "phone-portrait",
    description: "Theo cài đặt hệ thống",
    preview: { bg: "#6366F1", card: "#818CF8", text: "#FFFFFF" },
  },
];

const ACCENT_COLORS = [
  { id: "green", name: "Xanh lá", color: "#10B981" },
  { id: "blue", name: "Xanh dương", color: "#3B82F6" },
  { id: "purple", name: "Tím", color: "#8B5CF6" },
  { id: "pink", name: "Hồng", color: "#EC4899" },
  { id: "orange", name: "Cam", color: "#F97316" },
  { id: "red", name: "Đỏ", color: "#EF4444" },
];

export default function AppearanceScreen() {
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>("light");
  const [selectedAccent, setSelectedAccent] = useState("green");

  const handleThemeSelect = (theme: ThemeOption) => {
    setSelectedTheme(theme);
    // Would save to AsyncStorage and apply theme
  };

  const handleAccentSelect = (accentId: string) => {
    setSelectedAccent(accentId);
    // Would save to AsyncStorage and apply accent color
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Giao diện</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Theme Selection */}
        <Text style={styles.sectionTitle}>Chế độ hiển thị</Text>
        <View style={styles.themesContainer}>
          {THEMES.map((theme) => (
            <Pressable
              key={theme.id}
              style={[
                styles.themeCard,
                selectedTheme === theme.id && styles.themeCardSelected,
              ]}
              onPress={() => handleThemeSelect(theme.id)}
            >
              {/* Preview */}
              <View
                style={[
                  styles.themePreview,
                  { backgroundColor: theme.preview.bg },
                ]}
              >
                <View
                  style={[
                    styles.previewCard,
                    { backgroundColor: theme.preview.card },
                  ]}
                >
                  <View
                    style={[
                      styles.previewLine,
                      { backgroundColor: theme.preview.text },
                    ]}
                  />
                  <View
                    style={[
                      styles.previewLine,
                      styles.previewLineShort,
                      { backgroundColor: theme.preview.text, opacity: 0.5 },
                    ]}
                  />
                </View>
                <View
                  style={[
                    styles.previewNav,
                    { backgroundColor: theme.preview.card },
                  ]}
                >
                  {[1, 2, 3, 4].map((i) => (
                    <View
                      key={i}
                      style={[
                        styles.previewNavDot,
                        { backgroundColor: theme.preview.text, opacity: 0.3 },
                      ]}
                    />
                  ))}
                </View>
              </View>

              {/* Info */}
              <View style={styles.themeInfo}>
                <View style={styles.themeHeader}>
                  <Ionicons
                    name={theme.icon as any}
                    size={20}
                    color={
                      selectedTheme === theme.id
                        ? COLORS.primary
                        : COLORS.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.themeName,
                      selectedTheme === theme.id && styles.themeNameSelected,
                    ]}
                  >
                    {theme.name}
                  </Text>
                </View>
                <Text style={styles.themeDesc}>{theme.description}</Text>
              </View>

              {/* Checkmark */}
              {selectedTheme === theme.id && (
                <View style={styles.checkmark}>
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={COLORS.primary}
                  />
                </View>
              )}
            </Pressable>
          ))}
        </View>

        {/* Accent Color */}
        <Text style={styles.sectionTitle}>Màu chủ đạo</Text>
        <View style={styles.accentContainer}>
          {ACCENT_COLORS.map((accent) => (
            <Pressable
              key={accent.id}
              style={styles.accentItem}
              onPress={() => handleAccentSelect(accent.id)}
            >
              <View
                style={[
                  styles.accentCircle,
                  { backgroundColor: accent.color },
                  selectedAccent === accent.id && styles.accentCircleSelected,
                ]}
              >
                {selectedAccent === accent.id && (
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.accentName}>{accent.name}</Text>
            </Pressable>
          ))}
        </View>

        {/* Font Size */}
        <Text style={styles.sectionTitle}>Cỡ chữ</Text>
        <View style={styles.fontSizeCard}>
          <Text style={styles.fontSizeLabel}>Aa</Text>
          <View style={styles.fontSizeSlider}>
            {["Nhỏ", "Vừa", "Lớn"].map((size, index) => (
              <Pressable key={size} style={styles.fontSizeOption}>
                <View
                  style={[
                    styles.fontSizeDot,
                    index === 1 && styles.fontSizeDotActive,
                  ]}
                />
                <Text
                  style={[
                    styles.fontSizeText,
                    index === 1 && styles.fontSizeTextActive,
                  ]}
                >
                  {size}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={[styles.fontSizeLabel, { fontSize: 22 }]}>Aa</Text>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle"
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.infoText}>
            Các thay đổi sẽ được áp dụng ngay lập tức
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: COLORS.text },
  content: { padding: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 8,
  },
  themesContainer: { gap: 12, marginBottom: 24 },
  themeCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  themeCardSelected: { borderColor: COLORS.primary },
  themePreview: {
    height: 120,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  previewCard: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    justifyContent: "center",
  },
  previewLine: { height: 8, borderRadius: 4, marginBottom: 6 },
  previewLineShort: { width: "60%" },
  previewNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  previewNavDot: { width: 20, height: 20, borderRadius: 10 },
  themeInfo: { gap: 4 },
  themeHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  themeName: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  themeNameSelected: { color: COLORS.primary },
  themeDesc: { fontSize: 13, color: COLORS.textSecondary },
  checkmark: { position: "absolute", top: 12, right: 12 },
  accentContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },
  accentItem: { alignItems: "center", gap: 6 },
  accentCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  accentCircleSelected: {
    borderWidth: 3,
    borderColor: COLORS.text,
  },
  accentName: { fontSize: 12, color: COLORS.textSecondary },
  fontSizeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  fontSizeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  fontSizeSlider: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  fontSizeOption: { alignItems: "center", gap: 4 },
  fontSizeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.border,
  },
  fontSizeDotActive: {
    backgroundColor: COLORS.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  fontSizeText: { fontSize: 12, color: COLORS.textSecondary },
  fontSizeTextActive: { color: COLORS.primary, fontWeight: "600" },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primary + "10",
    padding: 12,
    borderRadius: 8,
  },
  infoText: { fontSize: 13, color: COLORS.text },
});
