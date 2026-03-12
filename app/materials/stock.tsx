/**
 * Materials Stock Management Screen
 * Quản lý kho vật liệu xây dựng
 *
 * Features:
 * - Stock overview with alert indicators
 * - Search & filter by category
 * - Material request list
 * - Transaction history (in/out/adjust)
 * - Low stock warnings
 *
 * API: GET /materials, GET /materials/requests (mock fallback)
 * @created 2026-02-27
 */

import {
    type Material,
    type MaterialRequest,
    type MaterialTransaction,
    MOCK_MATERIALS,
    MOCK_REQUESTS,
    MOCK_TRANSACTIONS
} from "@/services/api/materials.mock";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SW } = Dimensions.get("window");

const COLORS = {
  primary: "#0D9488",
  primaryDark: "#0F766E",
  bg: "#F8FAFC",
  card: "#FFFFFF",
  text: "#0F172A",
  textSec: "#64748B",
  border: "#E2E8F0",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
};

const CATEGORY_CONFIG: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  concrete: { label: "Bê tông", icon: "cube-outline", color: "#64748B" },
  steel: { label: "Thép", icon: "hardware-chip-outline", color: "#475569" },
  brick: { label: "Gạch", icon: "grid-outline", color: "#D97706" },
  wood: { label: "Gỗ", icon: "leaf-outline", color: "#059669" },
  electrical: { label: "Điện", icon: "flash-outline", color: "#F59E0B" },
  plumbing: { label: "Nước", icon: "water-outline", color: "#3B82F6" },
  finishing: {
    label: "Hoàn thiện",
    icon: "color-palette-outline",
    color: "#8B5CF6",
  },
  other: {
    label: "Khác",
    icon: "ellipsis-horizontal-outline",
    color: "#94A3B8",
  },
};

const REQUEST_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ duyệt", color: COLORS.warning },
  approved: { label: "Đã duyệt", color: COLORS.success },
  rejected: { label: "Từ chối", color: COLORS.error },
  ordered: { label: "Đã đặt", color: COLORS.info },
  delivered: { label: "Đã giao", color: COLORS.primary },
  cancelled: { label: "Đã hủy", color: "#94A3B8" },
};

const URGENCY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: "Thấp", color: COLORS.success },
  medium: { label: "TB", color: COLORS.warning },
  high: { label: "Cao", color: COLORS.error },
};

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}tr`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return `${amount}đ`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}

// ═══════════════════════════════════════════════════════════════════════
// MATERIAL STOCK CARD
// ═══════════════════════════════════════════════════════════════════════

const MaterialCard = React.memo<{ item: Material }>(({ item }) => {
  const cat = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.other;
  const stockPercent = Math.min(100, (item.currentStock / item.maxStock) * 100);
  const isLow = item.currentStock <= item.minStock;
  const stockColor = isLow
    ? COLORS.error
    : stockPercent > 60
      ? COLORS.success
      : COLORS.warning;

  return (
    <View style={st.matCard}>
      <View style={st.matHeader}>
        <View style={[st.matIcon, { backgroundColor: cat.color + "15" }]}>
          <Ionicons name={cat.icon as any} size={18} color={cat.color} />
        </View>
        <View style={st.matInfo}>
          <Text style={st.matName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={st.matCat}>
            {cat.label} · {item.unit}
          </Text>
        </View>
        {isLow && (
          <View style={st.lowBadge}>
            <Ionicons name="warning" size={10} color={COLORS.error} />
            <Text style={st.lowText}>Thấp</Text>
          </View>
        )}
      </View>

      {/* Stock bar */}
      <View style={st.stockRow}>
        <Text style={st.stockLabel}>Tồn kho</Text>
        <Text style={st.stockValue}>
          {item.currentStock} / {item.maxStock} {item.unit}
        </Text>
      </View>
      <View style={st.stockBar}>
        <View
          style={[
            st.stockFill,
            { width: `${stockPercent}%`, backgroundColor: stockColor },
          ]}
        />
      </View>

      {/* Bottom */}
      <View style={st.matBottom}>
        <Text style={st.matPrice}>
          {formatCurrency(item.unitPrice)}/{item.unit}
        </Text>
        {item.supplier && (
          <Text style={st.matSupplier} numberOfLines={1}>
            <Ionicons name="business-outline" size={10} /> {item.supplier}
          </Text>
        )}
      </View>
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════
// REQUEST CARD
// ═══════════════════════════════════════════════════════════════════════

const RequestCard = React.memo<{ item: MaterialRequest }>(({ item }) => {
  const statusConfig = REQUEST_STATUS[item.status] || REQUEST_STATUS.pending;
  const urgency = URGENCY_CONFIG[item.urgency] || URGENCY_CONFIG.low;

  return (
    <View style={st.reqCard}>
      <View style={st.reqHeader}>
        <Text style={st.reqName} numberOfLines={1}>
          {item.materialName}
        </Text>
        <View
          style={[st.reqBadge, { backgroundColor: statusConfig.color + "15" }]}
        >
          <Text style={[st.reqBadgeText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>
      <View style={st.reqMeta}>
        <Text style={st.reqQty}>
          {item.quantity} {item.unit}
        </Text>
        <View
          style={[st.urgencyBadge, { backgroundColor: urgency.color + "15" }]}
        >
          <Text style={[st.urgencyText, { color: urgency.color }]}>
            {urgency.label}
          </Text>
        </View>
        <Text style={st.reqDate}>{formatDate(item.requestedAt)}</Text>
      </View>
      <Text style={st.reqBy}>{item.requestedBy}</Text>
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════
// TRANSACTION CARD
// ═══════════════════════════════════════════════════════════════════════

const TransactionCard = React.memo<{ item: MaterialTransaction }>(
  ({ item }) => {
    const isIn = item.type === "in";
    const isAdj = item.type === "adjust";
    const typeConfig = isIn
      ? { label: "Nhập", color: COLORS.success, icon: "add-circle-outline" }
      : isAdj
        ? {
            label: "Điều chỉnh",
            color: COLORS.info,
            icon: "swap-horizontal-outline",
          }
        : { label: "Xuất", color: COLORS.error, icon: "remove-circle-outline" };

    return (
      <View style={st.txCard}>
        <View style={[st.txIcon, { backgroundColor: typeConfig.color + "15" }]}>
          <Ionicons
            name={typeConfig.icon as any}
            size={16}
            color={typeConfig.color}
          />
        </View>
        <View style={st.txInfo}>
          <Text style={st.txName} numberOfLines={1}>
            {item.materialName}
          </Text>
          <Text style={st.txMeta}>
            {item.performedBy} · {formatDate(item.performedAt)}
          </Text>
        </View>
        <View style={st.txRight}>
          <Text style={[st.txQty, { color: typeConfig.color }]}>
            {isIn ? "+" : isAdj ? "±" : "-"}
            {item.quantity} {item.unit}
          </Text>
          <Text style={st.txStock}>
            {item.beforeStock} → {item.afterStock}
          </Text>
        </View>
      </View>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════

export default function MaterialsStockScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"stock" | "requests" | "history">(
    "stock",
  );
  const [refreshing, setRefreshing] = useState(false);

  // Data (from mock, will switch to API later)
  const materials = MOCK_MATERIALS;
  const requests = MOCK_REQUESTS || [];
  const transactions = MOCK_TRANSACTIONS || [];

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    let result = materials;
    if (selectedCategory !== "all") {
      result = result.filter((m) => m.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) => m.name.toLowerCase().includes(q) || m.category.includes(q),
      );
    }
    return result;
  }, [materials, selectedCategory, searchQuery]);

  // Stats
  const totalValue = useMemo(
    () => materials.reduce((sum, m) => sum + m.currentStock * m.unitPrice, 0),
    [materials],
  );
  const lowStockCount = useMemo(
    () => materials.filter((m) => m.currentStock <= m.minStock).length,
    [materials],
  );
  const pendingRequests = useMemo(
    () => requests.filter((r) => r.status === "pending").length,
    [requests],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[st.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={st.header}
        >
          <View style={st.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={st.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={st.headerTitle}>Quản lý vật liệu</Text>
            <TouchableOpacity style={st.headerBtn}>
              <Ionicons name="add-circle-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Overview Stats */}
          <View style={st.overviewRow}>
            <View style={st.overviewItem}>
              <Text style={st.overviewValue}>{materials.length}</Text>
              <Text style={st.overviewLabel}>Vật liệu</Text>
            </View>
            <View style={st.overviewDivider} />
            <View style={st.overviewItem}>
              <Text style={st.overviewValue}>{formatCurrency(totalValue)}</Text>
              <Text style={st.overviewLabel}>Giá trị kho</Text>
            </View>
            <View style={st.overviewDivider} />
            <View style={st.overviewItem}>
              <Text
                style={[
                  st.overviewValue,
                  lowStockCount > 0 && { color: "#FCA5A5" },
                ]}
              >
                {lowStockCount}
              </Text>
              <Text style={st.overviewLabel}>Sắp hết</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Search */}
        <View style={st.searchWrap}>
          <Ionicons name="search-outline" size={18} color={COLORS.textSec} />
          <TextInput
            style={st.searchInput}
            placeholder="Tìm vật liệu..."
            placeholderTextColor={COLORS.textSec}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Tab Switcher */}
        <View style={st.tabRow}>
          {(
            [
              { key: "stock", label: "Tồn kho", count: materials.length },
              { key: "requests", label: "Yêu cầu", count: pendingRequests },
              {
                key: "history",
                label: "Giao dịch",
                count: transactions.length,
              },
            ] as const
          ).map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[st.tab, activeTab === tab.key && st.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  st.tabLabel,
                  activeTab === tab.key && st.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
              {tab.count > 0 && (
                <View
                  style={[
                    st.tabBadge,
                    activeTab === tab.key && st.tabBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      st.tabBadgeText,
                      activeTab === tab.key && { color: "#fff" },
                    ]}
                  >
                    {tab.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Category Chips (for stock tab) */}
        {activeTab === "stock" && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={st.chipScroll}
          >
            <TouchableOpacity
              style={[st.chip, selectedCategory === "all" && st.chipActive]}
              onPress={() => setSelectedCategory("all")}
            >
              <Text
                style={[
                  st.chipText,
                  selectedCategory === "all" && st.chipTextActive,
                ]}
              >
                Tất cả
              </Text>
            </TouchableOpacity>
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <TouchableOpacity
                key={key}
                style={[st.chip, selectedCategory === key && st.chipActive]}
                onPress={() => setSelectedCategory(key)}
              >
                <Ionicons
                  name={config.icon as any}
                  size={12}
                  color={selectedCategory === key ? "#fff" : config.color}
                />
                <Text
                  style={[
                    st.chipText,
                    selectedCategory === key && st.chipTextActive,
                  ]}
                >
                  {config.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Content */}
        <ScrollView
          style={st.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {activeTab === "stock" &&
            (filteredMaterials.length === 0 ? (
              <View style={st.empty}>
                <Ionicons name="cube-outline" size={48} color={COLORS.border} />
                <Text style={st.emptyText}>Không tìm thấy vật liệu</Text>
              </View>
            ) : (
              filteredMaterials.map((item) => (
                <MaterialCard key={item.id} item={item} />
              ))
            ))}

          {activeTab === "requests" &&
            (requests.length === 0 ? (
              <View style={st.empty}>
                <Ionicons
                  name="document-text-outline"
                  size={48}
                  color={COLORS.border}
                />
                <Text style={st.emptyText}>Chưa có yêu cầu</Text>
              </View>
            ) : (
              requests.map((item) => <RequestCard key={item.id} item={item} />)
            ))}

          {activeTab === "history" &&
            (transactions.length === 0 ? (
              <View style={st.empty}>
                <Ionicons
                  name="swap-horizontal-outline"
                  size={48}
                  color={COLORS.border}
                />
                <Text style={st.emptyText}>Chưa có giao dịch</Text>
              </View>
            ) : (
              transactions.map((item) => (
                <TransactionCard key={item.id} item={item} />
              ))
            ))}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  backBtn: { padding: 4 },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 12,
  },
  headerBtn: { padding: 4 },

  overviewRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    marginTop: 12,
    padding: 12,
  },
  overviewItem: { flex: 1, alignItems: "center" },
  overviewValue: { fontSize: 16, fontWeight: "800", color: "#fff" },
  overviewLabel: { fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  overviewDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: 4,
  },

  // Search
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },

  // Tabs
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabLabel: { fontSize: 13, fontWeight: "600", color: COLORS.textSec },
  tabLabelActive: { color: "#fff" },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  tabBadgeActive: { backgroundColor: "rgba(255,255,255,0.3)" },
  tabBadgeText: { fontSize: 10, fontWeight: "700", color: COLORS.textSec },

  // Category Chips
  chipScroll: { paddingHorizontal: 16, paddingVertical: 10, gap: 6 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, fontWeight: "500", color: COLORS.textSec },
  chipTextActive: { color: "#fff" },

  // Content
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },

  // Material Card
  matCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  matHeader: { flexDirection: "row", alignItems: "center" },
  matIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  matInfo: { flex: 1, marginLeft: 10 },
  matName: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  matCat: { fontSize: 11, color: COLORS.textSec, marginTop: 1 },
  lowBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  lowText: { fontSize: 10, fontWeight: "600", color: COLORS.error },

  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 4,
  },
  stockLabel: { fontSize: 11, color: COLORS.textSec },
  stockValue: { fontSize: 11, fontWeight: "600", color: COLORS.text },
  stockBar: { height: 6, backgroundColor: "#F1F5F9", borderRadius: 3 },
  stockFill: { height: 6, borderRadius: 3 },

  matBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  matPrice: { fontSize: 13, fontWeight: "700", color: COLORS.primary },
  matSupplier: { fontSize: 11, color: COLORS.textSec },

  // Request Card
  reqCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reqName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  reqBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  reqBadgeText: { fontSize: 10, fontWeight: "600" },
  reqMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  reqQty: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  urgencyBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  urgencyText: { fontSize: 10, fontWeight: "600" },
  reqDate: { fontSize: 11, color: COLORS.textSec },
  reqBy: { fontSize: 11, color: COLORS.textSec, marginTop: 4 },

  // Transaction Card
  txCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  txIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  txInfo: { flex: 1, marginLeft: 10 },
  txName: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  txMeta: { fontSize: 10, color: COLORS.textSec, marginTop: 2 },
  txRight: { alignItems: "flex-end" },
  txQty: { fontSize: 14, fontWeight: "700" },
  txStock: { fontSize: 10, color: COLORS.textSec, marginTop: 2 },

  // Empty
  empty: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 14, color: COLORS.textSec, marginTop: 12 },
});
