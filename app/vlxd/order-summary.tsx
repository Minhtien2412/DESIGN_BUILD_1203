/**
 * Tổng hợp đơn hàng - Order Summary & Statistics
 * Route: /vlxd/order-summary
 * Dashboard thống kê chi tiết đơn hàng VLXD
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
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

// ── Types ──────────────────────────────────────────────────────────────
type TabKey = "overview" | "materials" | "suppliers" | "timeline";

// ── Data ───────────────────────────────────────────────────────────────
const ORDER_INFO = {
  code: "MS102",
  location: "Vinhomes Q9",
  job: "Cung cấp VLXD",
  date: "26/03/2026",
  supplier: "VLXD Đức Hạnh",
  supplierRating: 4.8,
  status: "Đang xử lý",
  createdBy: "Nguyễn Văn A",
  priority: "Bình thường",
};

const ORDERED_ITEMS = [
  {
    name: "Cát bê tông hạt lớn",
    price: 460000,
    qty: 2,
    unit: "m³",
    total: 920000,
    category: "Cát",
  },
  {
    name: "Đá mi",
    price: 490000,
    qty: 1,
    unit: "m³",
    total: 490000,
    category: "Đá",
  },
  {
    name: "Xi măng Hà Tiên đa dụng",
    price: 83000,
    qty: 100,
    unit: "bao",
    total: 8300000,
    category: "Xi măng",
  },
  {
    name: "Gạch tuynen Quốc Toàn",
    price: 1370,
    qty: 1000,
    unit: "viên",
    total: 1370000,
    category: "Gạch",
  },
  {
    name: "Thép phi 10",
    price: 114000,
    qty: 20,
    unit: "cây",
    total: 2280000,
    category: "Thép",
  },
  {
    name: "Thép phi 12",
    price: 169000,
    qty: 30,
    unit: "cây",
    total: 5070000,
    category: "Thép",
  },
  {
    name: "Thép phi 14",
    price: 229000,
    qty: 10,
    unit: "cây",
    total: 2290000,
    category: "Thép",
  },
];

const GRAND_TOTAL = 20720000;

const CATEGORY_STATS = [
  {
    name: "Thép",
    total: 9640000,
    percent: 46.5,
    color: "#0D9488",
    icon: "construct-outline" as const,
  },
  {
    name: "Xi măng",
    total: 8300000,
    percent: 40.1,
    color: "#8B5CF6",
    icon: "cube-outline" as const,
  },
  {
    name: "Gạch",
    total: 1370000,
    percent: 6.6,
    color: "#F59E0B",
    icon: "grid-outline" as const,
  },
  {
    name: "Cát",
    total: 920000,
    percent: 4.4,
    color: "#06B6D4",
    icon: "water-outline" as const,
  },
  {
    name: "Đá",
    total: 490000,
    percent: 2.4,
    color: "#64748B",
    icon: "diamond-outline" as const,
  },
];

const TIMELINE = [
  {
    time: "08:30",
    date: "25/03/2026",
    event: "Tạo đơn hàng MS102",
    status: "done",
    icon: "document-text" as const,
  },
  {
    time: "09:15",
    date: "25/03/2026",
    event: "Gửi yêu cầu báo giá 4 NCC",
    status: "done",
    icon: "paper-plane" as const,
  },
  {
    time: "14:00",
    date: "25/03/2026",
    event: "NCC1 - VLXD Đức Hạnh gửi báo giá",
    status: "done",
    icon: "pricetag" as const,
  },
  {
    time: "15:30",
    date: "25/03/2026",
    event: "NCC3 - Hòa Phát VLXD gửi báo giá",
    status: "done",
    icon: "pricetag" as const,
  },
  {
    time: "10:00",
    date: "26/03/2026",
    event: "Trình mẫu vật tư - Đạt 5/5",
    status: "done",
    icon: "flask" as const,
  },
  {
    time: "11:00",
    date: "26/03/2026",
    event: "Face ID xác nhận NCC & KS",
    status: "done",
    icon: "finger-print" as const,
  },
  {
    time: "11:30",
    date: "26/03/2026",
    event: "Chọn NCC: VLXD Đức Hạnh",
    status: "done",
    icon: "checkmark-circle" as const,
  },
  {
    time: "14:00",
    date: "26/03/2026",
    event: "Giao hàng đợt 1",
    status: "current",
    icon: "car" as const,
  },
  {
    time: "16:00",
    date: "26/03/2026",
    event: "Nghiệm thu & thanh toán",
    status: "pending",
    icon: "cash" as const,
  },
];

const SUPPLIER_COMPARISON = [
  {
    name: "VLXD Đức Hạnh",
    code: "NCC1",
    total: 20720000,
    rating: 4.8,
    delivery: "2-4h",
    lowestItems: 6,
    selected: true,
  },
  {
    name: "Hòa Phát VLXD",
    code: "NCC3",
    total: 20105000,
    rating: 4.9,
    delivery: "4-6h",
    lowestItems: 8,
    selected: false,
  },
  {
    name: "VLXD Miền Đông",
    code: "NCC4",
    total: 20850000,
    rating: 4.5,
    delivery: "3-4h",
    lowestItems: 3,
    selected: false,
  },
  {
    name: "VLXD Phương Nam",
    code: "NCC2",
    total: 21290000,
    rating: 4.6,
    delivery: "3-5h",
    lowestItems: 2,
    selected: false,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────
function formatVND(n: number): string {
  return n.toLocaleString("vi-VN");
}

// ── Tab data ───────────────────────────────────────────────────────────
const TABS: {
  key: TabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "overview", label: "Tổng quan", icon: "pie-chart-outline" },
  { key: "materials", label: "Vật tư", icon: "list-outline" },
  { key: "suppliers", label: "NCC", icon: "business-outline" },
  { key: "timeline", label: "Tiến trình", icon: "time-outline" },
];

// ── Sub-components ─────────────────────────────────────────────────────
function OverviewTab() {
  return (
    <>
      {/* Order detail card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="document-text" size={18} color="#0D9488" />
          <Text style={styles.cardTitle}>Chi tiết đơn hàng</Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{ORDER_INFO.status}</Text>
          </View>
        </View>
        {[
          { label: "Mã đơn", value: ORDER_INFO.code, icon: "barcode-outline" },
          {
            label: "Vị trí",
            value: ORDER_INFO.location,
            icon: "location-outline",
          },
          {
            label: "Công việc",
            value: ORDER_INFO.job,
            icon: "construct-outline",
          },
          {
            label: "Lịch cấp hàng",
            value: ORDER_INFO.date,
            icon: "calendar-outline",
          },
          {
            label: "Nhà cung cấp",
            value: ORDER_INFO.supplier,
            icon: "storefront-outline",
          },
          {
            label: "Người tạo",
            value: ORDER_INFO.createdBy,
            icon: "person-outline",
          },
          {
            label: "Ưu tiên",
            value: ORDER_INFO.priority,
            icon: "flag-outline",
          },
        ].map((item) => (
          <View key={item.label} style={styles.detailRow}>
            <Ionicons name={item.icon as any} size={16} color="#94A3B8" />
            <Text style={styles.detailLabel}>{item.label}</Text>
            <Text style={styles.detailValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      {/* Category breakdown with visual bars */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="stats-chart" size={18} color="#0D9488" />
          <Text style={styles.cardTitle}>Phân bổ chi phí theo hạng mục</Text>
        </View>
        {CATEGORY_STATS.map((cat) => (
          <View key={cat.name} style={styles.barRow}>
            <View style={styles.barLabel}>
              <Ionicons name={cat.icon} size={16} color={cat.color} />
              <Text style={styles.barName}>{cat.name}</Text>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${cat.percent}%`,
                    backgroundColor: cat.color,
                  },
                ]}
              />
            </View>
            <View style={styles.barValues}>
              <Text style={styles.barPercent}>{cat.percent}%</Text>
              <Text style={styles.barAmount}>{formatVND(cat.total)} ₫</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Grand total */}
      <LinearGradient colors={["#0D9488", "#0F766E"]} style={styles.totalCard}>
        <Text style={styles.totalLabel}>TỔNG GIÁ TRỊ ĐƠN HÀNG</Text>
        <Text style={styles.totalValue}>{formatVND(GRAND_TOTAL)} ₫</Text>
        <View style={styles.totalDetails}>
          <View style={styles.totalDetailItem}>
            <Text style={styles.totalDetailValue}>{ORDERED_ITEMS.length}</Text>
            <Text style={styles.totalDetailLabel}>Mặt hàng</Text>
          </View>
          <View style={styles.totalDetailDivider} />
          <View style={styles.totalDetailItem}>
            <Text style={styles.totalDetailValue}>5</Text>
            <Text style={styles.totalDetailLabel}>Hạng mục</Text>
          </View>
          <View style={styles.totalDetailDivider} />
          <View style={styles.totalDetailItem}>
            <Text style={styles.totalDetailValue}>1</Text>
            <Text style={styles.totalDetailLabel}>Nhà cung cấp</Text>
          </View>
        </View>
      </LinearGradient>
    </>
  );
}

function MaterialsTab() {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="cube" size={18} color="#0D9488" />
        <Text style={styles.cardTitle}>Danh sách vật tư đặt hàng</Text>
      </View>

      {/* Table header */}
      <View style={styles.matTableHeader}>
        <Text style={[styles.matTh, { flex: 2.5 }]}>Vật tư</Text>
        <Text style={[styles.matTh, { flex: 1 }]}>Đơn giá</Text>
        <Text style={[styles.matTh, { flex: 0.6 }]}>SL</Text>
        <Text style={[styles.matTh, { flex: 0.5 }]}>ĐVT</Text>
        <Text style={[styles.matTh, { flex: 1.2, textAlign: "right" }]}>
          Thành tiền
        </Text>
      </View>

      {ORDERED_ITEMS.map((item, idx) => (
        <View
          key={idx}
          style={[styles.matRow, idx % 2 === 0 && styles.matRowAlt]}
        >
          <View style={{ flex: 2.5 }}>
            <Text style={styles.matName}>{item.name}</Text>
            <Text style={styles.matCategory}>{item.category}</Text>
          </View>
          <Text style={[styles.matTd, { flex: 1 }]}>
            {formatVND(item.price)}
          </Text>
          <Text style={[styles.matTd, styles.matQty, { flex: 0.6 }]}>
            {item.qty.toLocaleString("vi-VN")}
          </Text>
          <Text style={[styles.matTd, { flex: 0.5, color: "#94A3B8" }]}>
            {item.unit}
          </Text>
          <Text style={[styles.matTd, styles.matTotal, { flex: 1.2 }]}>
            {formatVND(item.total)}
          </Text>
        </View>
      ))}

      {/* Total row */}
      <View style={styles.matTotalRow}>
        <Text style={styles.matTotalLabel}>THÀNH TIỀN</Text>
        <Text style={styles.matTotalValue}>{formatVND(GRAND_TOTAL)} ₫</Text>
      </View>
    </View>
  );
}

function SuppliersTab() {
  return (
    <>
      {SUPPLIER_COMPARISON.map((s, idx) => (
        <View
          key={idx}
          style={[
            styles.supplierCard,
            s.selected && styles.supplierCardSelected,
          ]}
        >
          {s.selected && (
            <View style={styles.selectedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#fff" />
              <Text style={styles.selectedBadgeText}>Đã chọn</Text>
            </View>
          )}
          <View style={styles.supplierHeader}>
            <View>
              <Text style={styles.supplierName}>{s.name}</Text>
              <Text style={styles.supplierCode}>{s.code}</Text>
            </View>
            <View style={styles.supplierRating}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.supplierRatingText}>{s.rating}</Text>
            </View>
          </View>
          <View style={styles.supplierStats}>
            <View style={styles.supplierStat}>
              <Text style={styles.supplierStatValue}>
                {formatVND(s.total)} ₫
              </Text>
              <Text style={styles.supplierStatLabel}>Tổng báo giá</Text>
            </View>
            <View style={styles.supplierStat}>
              <Text style={styles.supplierStatValue}>{s.delivery}</Text>
              <Text style={styles.supplierStatLabel}>Giao hàng</Text>
            </View>
            <View style={styles.supplierStat}>
              <Text style={styles.supplierStatValue}>{s.lowestItems}</Text>
              <Text style={styles.supplierStatLabel}>Giá thấp nhất</Text>
            </View>
          </View>
          {/* Price difference */}
          {!s.selected && (
            <Text style={styles.priceDiff}>
              {s.total > GRAND_TOTAL
                ? `+${formatVND(s.total - GRAND_TOTAL)} ₫ so với NCC đã chọn`
                : `-${formatVND(GRAND_TOTAL - s.total)} ₫ so với NCC đã chọn`}
            </Text>
          )}
        </View>
      ))}
    </>
  );
}

function TimelineTab() {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="time" size={18} color="#0D9488" />
        <Text style={styles.cardTitle}>Tiến trình đơn hàng</Text>
      </View>

      {TIMELINE.map((item, idx) => (
        <View key={idx} style={styles.timelineItem}>
          <View style={styles.timelineLeft}>
            <View
              style={[
                styles.timelineDot,
                item.status === "done"
                  ? styles.timelineDotDone
                  : item.status === "current"
                    ? styles.timelineDotCurrent
                    : styles.timelineDotPending,
              ]}
            >
              <Ionicons
                name={item.icon}
                size={14}
                color={
                  item.status === "done"
                    ? "#fff"
                    : item.status === "current"
                      ? "#fff"
                      : "#94A3B8"
                }
              />
            </View>
            {idx < TIMELINE.length - 1 && (
              <View
                style={[
                  styles.timelineLine,
                  item.status === "done" && styles.timelineLineDone,
                ]}
              />
            )}
          </View>
          <View style={styles.timelineContent}>
            <Text
              style={[
                styles.timelineEvent,
                item.status === "current" && {
                  color: "#0D9488",
                  fontWeight: "700",
                },
                item.status === "pending" && { color: "#94A3B8" },
              ]}
            >
              {item.event}
            </Text>
            <Text style={styles.timelineTime}>
              {item.time} • {item.date}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Main component ─────────────────────────────────────────────────────
export default function OrderSummaryScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={["#0D9488", "#0F766E", "#115E59"]}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Tổng hợp đơn hàng</Text>
            <Text style={styles.headerSub}>
              {ORDER_INFO.code} • {ORDER_INFO.location}
            </Text>
          </View>
          <Pressable style={styles.shareBtn}>
            <Ionicons name="share-outline" size={22} color="#fff" />
          </Pressable>
        </View>

        {/* Quick stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>{formatVND(GRAND_TOTAL)}</Text>
            <Text style={styles.quickStatLabel}>Tổng giá trị (₫)</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>{ORDERED_ITEMS.length}</Text>
            <Text style={styles.quickStatLabel}>Mặt hàng</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>4</Text>
            <Text style={styles.quickStatLabel}>NCC báo giá</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon}
              size={18}
              color={activeTab === tab.key ? "#0D9488" : "#94A3B8"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Tab content */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "materials" && <MaterialsTab />}
        {activeTab === "suppliers" && <SuppliersTab />}
        {activeTab === "timeline" && <TimelineTab />}

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
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backBtn: { padding: 8, marginRight: 8 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  headerSub: { fontSize: 13, color: "#A7F3D0", marginTop: 2 },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  quickStats: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: 14,
  },
  quickStat: { flex: 1, alignItems: "center" },
  quickStatValue: { fontSize: 16, fontWeight: "800", color: "#fff" },
  quickStatLabel: { fontSize: 10, color: "#A7F3D0", marginTop: 2 },
  quickStatDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: 4,
  },

  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: "#0D9488" },
  tabText: { fontSize: 12, fontWeight: "500", color: "#94A3B8" },
  tabTextActive: { color: "#0D9488", fontWeight: "700" },

  body: { flex: 1 },
  bodyContent: { padding: 16 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#1E293B", flex: 1 },

  // Status
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F59E0B",
  },
  statusText: { fontSize: 11, fontWeight: "600", color: "#F59E0B" },

  // Detail rows
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F1F5F9",
  },
  detailLabel: { fontSize: 13, color: "#94A3B8", width: 100 },
  detailValue: { fontSize: 13, fontWeight: "600", color: "#1E293B", flex: 1 },

  // Bar chart
  barRow: { marginBottom: 14 },
  barLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  barName: { fontSize: 13, fontWeight: "600", color: "#1E293B" },
  barTrack: {
    height: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  barFill: { height: 8, borderRadius: 4 },
  barValues: { flexDirection: "row", justifyContent: "space-between" },
  barPercent: { fontSize: 11, fontWeight: "700", color: "#64748B" },
  barAmount: { fontSize: 11, color: "#94A3B8" },

  // Total card
  totalCard: {
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#A7F3D0",
    letterSpacing: 1,
  },
  totalValue: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    marginTop: 4,
  },
  totalDetails: {
    flexDirection: "row",
    marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    padding: 10,
    width: "100%",
  },
  totalDetailItem: { flex: 1, alignItems: "center" },
  totalDetailValue: { fontSize: 16, fontWeight: "800", color: "#fff" },
  totalDetailLabel: { fontSize: 10, color: "#A7F3D0", marginTop: 2 },
  totalDetailDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: 4,
  },

  // Materials table
  matTableHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: "#1E293B",
    borderRadius: 8,
    marginBottom: 2,
  },
  matTh: { fontSize: 10, fontWeight: "700", color: "#94A3B8" },
  matRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F1F5F9",
  },
  matRowAlt: { backgroundColor: "#FAFBFC" },
  matName: { fontSize: 12, fontWeight: "600", color: "#1E293B" },
  matCategory: { fontSize: 10, color: "#94A3B8", marginTop: 1 },
  matTd: { fontSize: 11, color: "#64748B" },
  matQty: { fontWeight: "700", color: "#0D9488", textAlign: "center" },
  matTotal: { textAlign: "right", fontWeight: "600", color: "#1E293B" },
  matTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginTop: 4,
    borderTopWidth: 2,
    borderTopColor: "#0D9488",
  },
  matTotalLabel: { fontSize: 14, fontWeight: "800", color: "#0D9488" },
  matTotalValue: { fontSize: 16, fontWeight: "800", color: "#0D9488" },

  // Suppliers
  supplierCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
    }),
  },
  supplierCardSelected: {
    borderColor: "#0D9488",
    borderWidth: 2,
    backgroundColor: "#F0FDFA",
  },
  selectedBadge: {
    position: "absolute",
    top: -1,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#0D9488",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  selectedBadgeText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  supplierHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  supplierName: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  supplierCode: { fontSize: 12, color: "#94A3B8", marginTop: 1 },
  supplierRating: { flexDirection: "row", alignItems: "center", gap: 4 },
  supplierRatingText: { fontSize: 14, fontWeight: "700", color: "#64748B" },
  supplierStats: { flexDirection: "row", gap: 8 },
  supplierStat: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingVertical: 8,
    borderRadius: 8,
  },
  supplierStatValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E293B",
  },
  supplierStatLabel: { fontSize: 10, color: "#94A3B8", marginTop: 2 },
  priceDiff: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 10,
    fontStyle: "italic",
    textAlign: "center",
  },

  // Timeline
  timelineItem: { flexDirection: "row", minHeight: 56 },
  timelineLeft: { width: 36, alignItems: "center" },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  timelineDotDone: { backgroundColor: "#10B981" },
  timelineDotCurrent: { backgroundColor: "#0D9488" },
  timelineDotPending: { backgroundColor: "#F1F5F9" },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 4,
  },
  timelineLineDone: { backgroundColor: "#10B981" },
  timelineContent: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 16,
  },
  timelineEvent: { fontSize: 13, fontWeight: "500", color: "#1E293B" },
  timelineTime: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
});
