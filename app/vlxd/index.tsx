/**
 * VLXD Hub - Ép cọc - Bê tông - Vật liệu xây dựng
 * Route: /vlxd
 * Màn hình tổng quan cho quy trình đặt hàng VLXD
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
    Dimensions,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

// ── Status badge component ─────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const color =
    status === "completed"
      ? "#10B981"
      : status === "in-progress"
        ? "#F59E0B"
        : "#94A3B8";
  return (
    <View style={[styles.statusBadge, { backgroundColor: color + "20" }]}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={[styles.statusText, { color }]}>
        {status === "completed"
          ? "Hoàn tất"
          : status === "in-progress"
            ? "Đang xử lý"
            : "Chờ xử lý"}
      </Text>
    </View>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  color,
  suffix,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
  suffix?: string;
}) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIcon, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>
        {value}
        {suffix && <Text style={styles.statSuffix}> {suffix}</Text>}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ── Workflow steps ─────────────────────────────────────────────────────
const WORKFLOW_STEPS = [
  {
    id: 1,
    title: "Đặt hàng",
    subtitle: "Tạo đơn hàng VLXD mới",
    icon: "cart-outline" as const,
    route: "/vlxd/order",
    color: "#0D9488",
    description: "Đặt mã đơn, vị trí, công việc, lịch cấp hàng",
  },
  {
    id: 2,
    title: "Báo giá NCC",
    subtitle: "So sánh báo giá nhà cung cấp",
    icon: "pricetags-outline" as const,
    route: "/vlxd/quotation",
    color: "#8B5CF6",
    description: "NCC1 - NCC2 - NCC3 - NCC4 • Bảng giá chi tiết",
  },
  {
    id: 3,
    title: "Trình mẫu - Lưu mẫu",
    subtitle: "Xác nhận chất lượng vật tư",
    icon: "checkmark-circle-outline" as const,
    route: "/vlxd/sample-approval",
    color: "#F59E0B",
    description: "Face ID xác nhận NCC & Kỹ sư giám sát",
  },
  {
    id: 4,
    title: "Chọn NCC & Đặt hàng",
    subtitle: "Chọn NCC và xác nhận đơn hàng",
    icon: "bag-check-outline" as const,
    route: "/vlxd/supplier-selection",
    color: "#EF4444",
    description: "Chọn vật tư, số lượng, tính thành tiền",
  },
  {
    id: 5,
    title: "Đặt hàng Coffa",
    subtitle: "Cốp pha: Thành Nam / Việt Mỹ / Mỹ Anh",
    icon: "layers-outline" as const,
    route: "/vlxd/coffa-order",
    color: "#2563EB",
    description: "So sánh giá, chọn NCC, đặt hàng cốp pha",
  },
  {
    id: 6,
    title: "Sắt hàng rào bao che",
    subtitle: "Đặt hàng sản xuất hàng rào công trình",
    icon: "grid-outline" as const,
    route: "/vlxd/fence-order",
    color: "#DC2626",
    description: "4 bước: Đặt hàng → Báo giá → Trình mẫu → Chọn NCC",
  },
];

// ── Recent orders ──────────────────────────────────────────────────────
const RECENT_ORDERS = [
  {
    code: "MS102",
    location: "Vinhomes Q9",
    job: "Cung cấp VLXD",
    date: "26/03/2026",
    supplier: "VLXD Đức Hạnh",
    total: "20.720.000",
    status: "in-progress" as const,
  },
  {
    code: "MS102",
    location: "Vinhomes Q9",
    job: "Cấp Coffa",
    date: "26/03/2026",
    supplier: "Thành Nam / Việt Mỹ / Mỹ Anh",
    total: "11.775.000",
    status: "in-progress" as const,
  },
  {
    code: "MS102",
    location: "Anh Dung Q12",
    job: "Sản xuất hàng rào",
    date: "26/03/2026",
    supplier: "Hoài Nam",
    total: "12.400.000",
    status: "in-progress" as const,
  },
  {
    code: "MS101",
    location: "Khu đô thị Sala",
    job: "Ép cọc + VLXD",
    date: "20/03/2026",
    supplier: "Xi Măng Phương Nam",
    total: "45.300.000",
    status: "completed" as const,
  },
  {
    code: "MS100",
    location: "Thủ Đức City",
    job: "Bê tông tươi",
    date: "15/03/2026",
    supplier: "Bê Tông Hòa Phát",
    total: "32.150.000",
    status: "completed" as const,
  },
];

// ── Main component ─────────────────────────────────────────────────────
export default function VLXDHubScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header Gradient */}
      <LinearGradient
        colors={["#0D9488", "#0F766E", "#115E59"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Ép cọc - Bê tông - VLXD</Text>
            <Text style={styles.headerSubtitle}>Quản lý vật liệu xây dựng</Text>
          </View>
          <Pressable
            onPress={() => router.push("/vlxd/order-summary" as any)}
            style={styles.headerAction}
          >
            <Ionicons name="stats-chart" size={22} color="#fff" />
          </Pressable>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            icon="document-text-outline"
            label="Đơn hàng"
            value="12"
            color="#fff"
            suffix="đơn"
          />
          <StatCard
            icon="business-outline"
            label="Nhà cung cấp"
            value="4"
            color="#fff"
            suffix="NCC"
          />
          <StatCard
            icon="cash-outline"
            label="Tổng chi"
            value="256M"
            color="#fff"
            suffix="VNĐ"
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Quy trình ── */}
        <Text style={styles.sectionTitle}>
          <Ionicons name="git-branch-outline" size={18} color="#0D9488" /> Quy
          trình đặt hàng
        </Text>

        {WORKFLOW_STEPS.map((step, idx) => (
          <Pressable
            key={step.id}
            style={({ pressed }) => [
              styles.stepCard,
              pressed && styles.stepCardPressed,
            ]}
            onPress={() => router.push(step.route as any)}
          >
            <View style={styles.stepLeft}>
              <View
                style={[styles.stepNumber, { backgroundColor: step.color }]}
              >
                <Text style={styles.stepNumberText}>{step.id}</Text>
              </View>
              {idx < WORKFLOW_STEPS.length - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    { backgroundColor: step.color + "30" },
                  ]}
                />
              )}
            </View>
            <View style={styles.stepContent}>
              <View style={styles.stepHeader}>
                <View
                  style={[
                    styles.stepIconBg,
                    { backgroundColor: step.color + "12" },
                  ]}
                >
                  <Ionicons name={step.icon} size={22} color={step.color} />
                </View>
                <View style={styles.stepText}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
              </View>
              <Text style={styles.stepDesc}>{step.description}</Text>
            </View>
          </Pressable>
        ))}

        {/* ── Đơn hàng gần đây ── */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          <Ionicons name="time-outline" size={18} color="#0D9488" /> Đơn hàng
          gần đây
        </Text>

        {RECENT_ORDERS.map((order) => (
          <Pressable
            key={order.code}
            style={({ pressed }) => [
              styles.orderCard,
              pressed && { opacity: 0.9 },
            ]}
          >
            <View style={styles.orderHeader}>
              <View style={styles.orderCodeWrap}>
                <Text style={styles.orderCode}>{order.code}</Text>
                <StatusBadge status={order.status} />
              </View>
              <Text style={styles.orderTotal}>{order.total} ₫</Text>
            </View>
            <View style={styles.orderDetails}>
              <View style={styles.orderRow}>
                <Ionicons name="location-outline" size={14} color="#64748B" />
                <Text style={styles.orderInfo}>{order.location}</Text>
              </View>
              <View style={styles.orderRow}>
                <Ionicons name="construct-outline" size={14} color="#64748B" />
                <Text style={styles.orderInfo}>{order.job}</Text>
              </View>
              <View style={styles.orderRow}>
                <Ionicons name="calendar-outline" size={14} color="#64748B" />
                <Text style={styles.orderInfo}>{order.date}</Text>
              </View>
              <View style={styles.orderRow}>
                <Ionicons name="storefront-outline" size={14} color="#64748B" />
                <Text style={styles.orderInfo}>{order.supplier}</Text>
              </View>
            </View>
          </Pressable>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backBtn: { padding: 8, marginRight: 8 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  headerSubtitle: { fontSize: 13, color: "#A7F3D0", marginTop: 2 },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#fff",
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  statValue: { fontSize: 18, fontWeight: "800", color: "#fff" },
  statSuffix: { fontSize: 11, fontWeight: "400", color: "#A7F3D0" },
  statLabel: { fontSize: 11, color: "#A7F3D0", marginTop: 2 },

  body: { flex: 1 },
  bodyContent: { padding: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 14,
  },

  // Step cards
  stepCard: {
    flexDirection: "row",
    marginBottom: 4,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  stepCardPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  stepLeft: { alignItems: "center", marginRight: 12 },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: { fontSize: 13, fontWeight: "800", color: "#fff" },
  stepLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
    borderRadius: 1,
  },
  stepContent: { flex: 1 },
  stepHeader: { flexDirection: "row", alignItems: "center" },
  stepIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  stepText: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  stepSubtitle: { fontSize: 12, color: "#64748B", marginTop: 1 },
  stepDesc: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 8,
    lineHeight: 17,
  },

  // Order cards
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  orderCodeWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  orderCode: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0D9488",
  },
  orderTotal: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  orderDetails: { gap: 5 },
  orderRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  orderInfo: { fontSize: 13, color: "#64748B" },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "600" },
});
