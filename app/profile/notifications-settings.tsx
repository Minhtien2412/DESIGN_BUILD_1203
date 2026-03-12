/**
 * Notification Settings Screen
 * Manage push notification preferences
 * @route /profile/notifications-settings
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import { useState } from "react";
import {
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const STATUS_H = StatusBar.currentHeight ?? 44;

interface NotifSetting {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  color: string;
  bgColor: string;
}

const NOTIFICATION_GROUPS: { title: string; items: NotifSetting[] }[] = [
  {
    title: "Đơn hàng & Giao dịch",
    items: [
      {
        id: "orders",
        icon: "cart-outline",
        title: "Đơn hàng",
        subtitle: "Cập nhật trạng thái đơn hàng",
        color: "#0D9488",
        bgColor: "#CCFBF1",
      },
      {
        id: "payments",
        icon: "card-outline",
        title: "Thanh toán",
        subtitle: "Giao dịch, hoàn tiền, xác nhận",
        color: "#F59E0B",
        bgColor: "#FEF3C7",
      },
      {
        id: "promotions",
        icon: "pricetag-outline",
        title: "Khuyến mãi",
        subtitle: "Ưu đãi, voucher, flash sale",
        color: "#EF4444",
        bgColor: "#FEE2E2",
      },
    ],
  },
  {
    title: "Dự án & Công việc",
    items: [
      {
        id: "projects",
        icon: "folder-open-outline",
        title: "Dự án",
        subtitle: "Cập nhật tiến độ dự án",
        color: "#3B82F6",
        bgColor: "#DBEAFE",
      },
      {
        id: "tasks",
        icon: "checkbox-outline",
        title: "Công việc",
        subtitle: "Nhiệm vụ mới, deadline",
        color: "#8B5CF6",
        bgColor: "#EDE9FE",
      },
      {
        id: "meetings",
        icon: "videocam-outline",
        title: "Cuộc họp",
        subtitle: "Nhắc lịch họp, thay đổi lịch",
        color: "#06B6D4",
        bgColor: "#CFFAFE",
      },
    ],
  },
  {
    title: "Cộng đồng",
    items: [
      {
        id: "messages",
        icon: "chatbubbles-outline",
        title: "Tin nhắn",
        subtitle: "Tin nhắn mới từ liên hệ",
        color: "#10B981",
        bgColor: "#D1FAE5",
      },
      {
        id: "social",
        icon: "heart-outline",
        title: "Tương tác",
        subtitle: "Thích, bình luận, chia sẻ",
        color: "#EC4899",
        bgColor: "#FCE7F3",
      },
    ],
  },
];

export default function NotificationSettingsScreen() {
  const [masterEnabled, setMasterEnabled] = useState(true);
  const [settings, setSettings] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    NOTIFICATION_GROUPS.forEach((g) =>
      g.items.forEach((i) => {
        initial[i.id] = true;
      }),
    );
    return initial;
  });

  const toggleSetting = (id: string) => {
    setSettings((prev) => ({ ...prev, [id]: !prev[id] }));
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
        colors={["#1E3A5F", "#EF4444"]}
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
          <Text style={styles.headerTitle}>Cài đặt thông báo</Text>
          <View style={styles.backBtn} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Master Toggle */}
        <View style={styles.masterCard}>
          <View style={[styles.iconWrap, { backgroundColor: "#FEE2E2" }]}>
            <Ionicons name="notifications" size={22} color="#EF4444" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.masterTitle}>Thông báo đẩy</Text>
            <Text style={styles.masterSub}>
              {masterEnabled ? "Đang bật" : "Đang tắt"} tất cả thông báo
            </Text>
          </View>
          <Switch
            value={masterEnabled}
            onValueChange={setMasterEnabled}
            trackColor={{ false: "#E2E8F0", true: "#EF4444" }}
            thumbColor="#fff"
          />
        </View>

        {masterEnabled &&
          NOTIFICATION_GROUPS.map((group) => (
            <View key={group.title} style={styles.section}>
              <Text style={styles.sectionTitle}>
                {group.title.toUpperCase()}
              </Text>
              <View style={styles.card}>
                {group.items.map((item, idx) => (
                  <View key={item.id}>
                    <View style={styles.row}>
                      <View
                        style={[
                          styles.iconWrap,
                          { backgroundColor: item.bgColor },
                        ]}
                      >
                        <Ionicons
                          name={item.icon}
                          size={18}
                          color={item.color}
                        />
                      </View>
                      <View style={styles.rowContent}>
                        <Text style={styles.rowTitle}>{item.title}</Text>
                        <Text style={styles.rowSub}>{item.subtitle}</Text>
                      </View>
                      <Switch
                        value={settings[item.id] ?? true}
                        onValueChange={() => toggleSetting(item.id)}
                        trackColor={{ false: "#E2E8F0", true: item.color }}
                        thumbColor="#fff"
                      />
                    </View>
                    {idx < group.items.length - 1 && (
                      <View style={styles.divider} />
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}

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
    fontSize: 17,
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
  masterCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
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
  masterTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  masterSub: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  rowSub: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 64,
  },
});
