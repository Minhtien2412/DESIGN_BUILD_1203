/**
 * Procurement - Vendor Detail Screen
 */

import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const COLORS = {
  primary: "#0D9488",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
};

export default function VendorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{ title: `Nhà cung cấp #${id}`, headerShown: true }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Vendor info placeholder */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.avatarCircle}>
            <Ionicons name="business" size={40} color={COLORS.primary} />
          </View>
          <Text style={[styles.vendorName, { color: textColor }]}>
            Nhà cung cấp #{id}
          </Text>
          <View style={styles.statusBadge}>
            <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
            <Text style={styles.statusText}>Đang hoạt động</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            {
              label: "Đơn hàng",
              value: "--",
              icon: "receipt-outline",
              color: COLORS.primary,
            },
            {
              label: "Đánh giá",
              value: "--",
              icon: "star-outline",
              color: COLORS.warning,
            },
            {
              label: "Tổng GT",
              value: "--",
              icon: "cash-outline",
              color: COLORS.success,
            },
          ].map((stat) => (
            <View
              key={stat.label}
              style={[styles.statCard, { backgroundColor: cardBg }]}
            >
              <Ionicons name={stat.icon as any} size={22} color={stat.color} />
              <Text style={[styles.statValue, { color: textColor }]}>
                {stat.value}
              </Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Info sections */}
        {[
          {
            title: "Thông tin liên hệ",
            icon: "call-outline",
            items: ["Tên liên hệ", "Số điện thoại", "Email"],
          },
          {
            title: "Địa chỉ",
            icon: "location-outline",
            items: ["Địa chỉ kho", "Địa chỉ văn phòng"],
          },
          {
            title: "Hợp đồng",
            icon: "document-text-outline",
            items: ["Hợp đồng hiện tại", "Điều khoản thanh toán"],
          },
        ].map((section) => (
          <View
            key={section.title}
            style={[styles.section, { backgroundColor: cardBg }]}
          >
            <View style={styles.sectionHeader}>
              <Ionicons
                name={section.icon as any}
                size={20}
                color={COLORS.primary}
              />
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                {section.title}
              </Text>
            </View>
            {section.items.map((item) => (
              <View key={item} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{item}</Text>
                <Text style={styles.infoValue}>--</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back-outline" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Quay lại</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.info }]}
          >
            <Ionicons name="create-outline" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Chỉnh sửa</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, gap: 16, paddingBottom: 40 },
  card: { alignItems: "center", padding: 24, borderRadius: 16, gap: 8 },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#0D948815",
    alignItems: "center",
    justifyContent: "center",
  },
  vendorName: { fontSize: 20, fontWeight: "bold" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { color: "#666", fontSize: 13 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    gap: 4,
  },
  statValue: { fontSize: 18, fontWeight: "bold" },
  statLabel: { color: "#999", fontSize: 11 },
  section: { padding: 16, borderRadius: 12, gap: 12 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600" },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  infoLabel: { color: "#666", fontSize: 14 },
  infoValue: { color: "#999", fontSize: 14 },
  actionsRow: { flexDirection: "row", gap: 12 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
