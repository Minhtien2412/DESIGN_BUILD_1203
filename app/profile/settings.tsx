/**
 * Settings Screen
 * Central settings hub for the profile section
 * @route /profile/settings
 */

import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Href, Stack, router } from "expo-router";
import { memo, useCallback } from "react";
import {
    Alert,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// ============================================================================
// TYPES
// ============================================================================
interface SettingItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  route?: string;
  action?: string;
  color: string;
  showArrow?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
}

interface SettingSection {
  id: string;
  title: string;
  items: SettingItem[];
}

// ============================================================================
// CONSTANTS
// ============================================================================
const STATUS_H = StatusBar.currentHeight ?? 44;

const SETTINGS_SECTIONS: SettingSection[] = [
  {
    id: "account",
    title: "Tài khoản",
    items: [
      {
        id: "edit-profile",
        icon: "person-outline",
        title: "Chỉnh sửa hồ sơ",
        subtitle: "Tên, ảnh đại diện, thông tin cá nhân",
        route: "/profile/edit",
        color: "#0D9488",
        showArrow: true,
      },
      {
        id: "security",
        icon: "shield-checkmark-outline",
        title: "Bảo mật & Quyền riêng tư",
        subtitle: "Mật khẩu, xác thực 2 lớp",
        route: "/profile/security",
        color: "#8B5CF6",
        showArrow: true,
      },
      {
        id: "addresses",
        icon: "location-outline",
        title: "Địa chỉ",
        subtitle: "Quản lý địa chỉ giao hàng",
        route: "/profile/addresses",
        color: "#10B981",
        showArrow: true,
      },
      {
        id: "payment-methods",
        icon: "card-outline",
        title: "Phương thức thanh toán",
        subtitle: "Ví, thẻ ngân hàng",
        route: "/profile/payment-methods",
        color: "#F59E0B",
        showArrow: true,
      },
    ],
  },
  {
    id: "preferences",
    title: "Tùy chỉnh",
    items: [
      {
        id: "notifications",
        icon: "notifications-outline",
        title: "Thông báo",
        subtitle: "Quản lý cài đặt thông báo",
        route: "/profile/notifications-settings",
        color: "#EF4444",
        showArrow: true,
      },
      {
        id: "language",
        icon: "language-outline",
        title: "Ngôn ngữ",
        subtitle: "Tiếng Việt",
        route: "/profile/language",
        color: "#06B6D4",
        showArrow: true,
      },
    ],
  },
  {
    id: "support",
    title: "Hỗ trợ",
    items: [
      {
        id: "help",
        icon: "help-circle-outline",
        title: "Trung tâm trợ giúp",
        route: "/customer-support",
        color: "#0D9488",
        showArrow: true,
      },
      {
        id: "feedback",
        icon: "chatbubble-ellipses-outline",
        title: "Góp ý & Phản hồi",
        route: "/feedback",
        color: "#10B981",
        showArrow: true,
      },
      {
        id: "about",
        icon: "information-circle-outline",
        title: "Về ứng dụng",
        subtitle: "Phiên bản 1.0.0",
        route: "/about",
        color: "#64748B",
        showArrow: true,
      },
      {
        id: "terms",
        icon: "document-text-outline",
        title: "Điều khoản dịch vụ",
        route: "/terms",
        color: "#64748B",
        showArrow: true,
      },
    ],
  },
];

// ============================================================================
// COMPONENTS
// ============================================================================
const SettingRow = memo(
  ({
    item,
    onPress,
  }: {
    item: SettingItem;
    onPress: (item: SettingItem) => void;
  }) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={() => onPress(item)}
      activeOpacity={0.6}
    >
      <View
        style={[styles.settingIcon, { backgroundColor: `${item.color}15` }]}
      >
        <Ionicons name={item.icon} size={20} color={item.color} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        {item.subtitle && (
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        )}
      </View>
      {item.showArrow && (
        <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
      )}
      {item.showSwitch && (
        <Switch value={item.switchValue} trackColor={{ true: item.color }} />
      )}
    </TouchableOpacity>
  ),
);

// ============================================================================
// MAIN SCREEN
// ============================================================================
export default function SettingsScreen() {
  const { signOut, user } = useAuth();

  const handlePress = useCallback((item: SettingItem) => {
    if (item.route) {
      router.push(item.route as Href);
    } else if (item.action === "logout") {
      handleSignOut();
    }
  }, []);

  const handleSignOut = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất khỏi tài khoản?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Header */}
      <LinearGradient
        colors={["#1E3A5F", "#0D9488"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cài đặt</Text>
          <View style={styles.backBtn} />
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {SETTINGS_SECTIONS.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, idx) => (
                <View key={item.id}>
                  <SettingRow item={item} onPress={handlePress} />
                  {idx < section.items.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.signOutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Phiên bản 1.0.0 • Build 2025.06</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingTop: STATUS_H + 8,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  settingSubtitle: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 64,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 8,
    gap: 8,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#EF4444",
  },
  versionText: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 16,
  },
});
