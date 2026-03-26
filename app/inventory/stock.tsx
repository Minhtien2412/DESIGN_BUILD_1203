import {
    useStockSnapshots,
    useWarehouseStockSummaries,
    useWarehouses,
} from "@/hooks/useInventory";
import type { StockSnapshot, WarehouseStockSummary } from "@/types/inventory";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type TabKey = "overview" | "warehouse" | "items";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "overview", label: "Tổng hợp", icon: "pie-chart" },
  { key: "warehouse", label: "Theo kho", icon: "business" },
  { key: "items", label: "Theo vật tư", icon: "cube" },
];

const formatCompact = (value: number) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)} tỷ`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)} tr`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

export default function StockOverviewScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const {
    summaries,
    loading: loadingSummaries,
    error: errorSummaries,
    refetch: refetchSummaries,
  } = useWarehouseStockSummaries(projectId || "");
  const { warehouses, loading: loadingWarehouses } = useWarehouses(projectId);
  const { snapshots, loading: loadingSnapshots } = useStockSnapshots(
    projectId || "",
  );
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const loading = loadingSummaries || loadingWarehouses || loadingSnapshots;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={{ marginTop: 12, color: "#666" }}>
          Đang tải tồn kho...
        </Text>
      </View>
    );
  }

  if (errorSummaries) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
        <Text style={{ marginTop: 12, color: "#EF4444" }}>
          Không tải được dữ liệu
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refetchSummaries}>
          <Text style={{ color: "#FFF" }}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalValue = summaries.reduce((s, w) => s + w.totalValue, 0);
  const totalItems = summaries.reduce((s, w) => s + w.totalItems, 0);
  const totalLowStock = summaries.reduce((s, w) => s + w.lowStockCount, 0);
  const totalOutOfStock = summaries.reduce((s, w) => s + w.outOfStockCount, 0);

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Aggregated Summary */}
      <View style={styles.summaryGrid}>
        <View style={[styles.statCard, { borderLeftColor: "#0D9488" }]}>
          <Text style={styles.statValue}>{formatCompact(totalValue)}</Text>
          <Text style={styles.statLabel}>Tổng giá trị</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: "#3B82F6" }]}>
          <Text style={styles.statValue}>{totalItems}</Text>
          <Text style={styles.statLabel}>Tổng SKU</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: "#F59E0B" }]}>
          <Text style={styles.statValue}>{totalLowStock}</Text>
          <Text style={styles.statLabel}>Sắp hết</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: "#EF4444" }]}>
          <Text style={styles.statValue}>{totalOutOfStock}</Text>
          <Text style={styles.statLabel}>Hết hàng</Text>
        </View>
      </View>

      {/* Value Distribution */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Phân bổ giá trị theo kho</Text>
        {summaries.map((ws) => {
          const pct = totalValue > 0 ? (ws.totalValue / totalValue) * 100 : 0;
          return (
            <View key={ws.warehouseId} style={styles.distRow}>
              <View style={styles.distInfo}>
                <Text style={styles.distName}>{ws.warehouse.name}</Text>
                <Text style={styles.distValue}>
                  {formatCurrency(ws.totalValue)}
                </Text>
              </View>
              <View style={styles.distBarBg}>
                <View style={[styles.distBarFill, { width: `${pct}%` }]} />
              </View>
              <Text style={styles.distPct}>{pct.toFixed(0)}%</Text>
            </View>
          );
        })}
      </View>

      {/* Warehouse Status Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trạng thái các kho</Text>
        {warehouses.map((wh) => {
          const summary = summaries.find((ws) => ws.warehouseId === wh.id);
          return (
            <View key={wh.id} style={styles.whStatusCard}>
              <View style={styles.whStatusHeader}>
                <Ionicons
                  name={
                    wh.type === "MAIN"
                      ? "business"
                      : wh.type === "SITE"
                        ? "construct"
                        : "cube"
                  }
                  size={18}
                  color="#0D9488"
                />
                <Text style={styles.whStatusName}>{wh.name}</Text>
                <View style={styles.whTypeBadge}>
                  <Text style={styles.whTypeText}>
                    {wh.type === "MAIN"
                      ? "Chính"
                      : wh.type === "SITE"
                        ? "Công trình"
                        : "Tạm"}
                  </Text>
                </View>
              </View>
              <Text style={styles.whAddress}>{wh.address}</Text>
              <View style={styles.whStatusRow}>
                <Text style={styles.whStatItem}>
                  Quản lý:{" "}
                  <Text style={styles.whStatBold}>{wh.managerName}</Text>
                </Text>
              </View>
              {summary && (
                <View style={styles.whUtilRow}>
                  <Text style={styles.whUtilLabel}>
                    Công suất: {summary.utilizationPercent}%
                  </Text>
                  <View style={styles.whUtilBar}>
                    <View
                      style={[
                        styles.whUtilFill,
                        {
                          width: `${summary.utilizationPercent}%`,
                          backgroundColor:
                            summary.utilizationPercent > 80
                              ? "#EF4444"
                              : summary.utilizationPercent > 60
                                ? "#F59E0B"
                                : "#10B981",
                        },
                      ]}
                    />
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderWarehouse = ({ item }: { item: WarehouseStockSummary }) => (
    <View style={styles.whCard}>
      <View style={styles.whCardHeader}>
        <Ionicons
          name={
            item.warehouse.type === "MAIN"
              ? "business"
              : item.warehouse.type === "SITE"
                ? "construct"
                : "cube"
          }
          size={20}
          color="#0D9488"
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.whCardName}>{item.warehouse.name}</Text>
          <Text style={styles.whCardAddr}>{item.warehouse.address}</Text>
        </View>
      </View>

      <View style={styles.whCardStats}>
        <View style={styles.whCardStat}>
          <Text style={[styles.whCardStatVal, { color: "#333" }]}>
            {item.totalItems}
          </Text>
          <Text style={styles.whCardStatLbl}>Mặt hàng</Text>
        </View>
        <View style={styles.whCardStat}>
          <Text style={[styles.whCardStatVal, { color: "#0D9488" }]}>
            {formatCompact(item.totalValue)}
          </Text>
          <Text style={styles.whCardStatLbl}>Giá trị</Text>
        </View>
        <View style={styles.whCardStat}>
          <Text style={[styles.whCardStatVal, { color: "#F59E0B" }]}>
            {item.lowStockCount}
          </Text>
          <Text style={styles.whCardStatLbl}>Sắp hết</Text>
        </View>
        <View style={styles.whCardStat}>
          <Text style={[styles.whCardStatVal, { color: "#EF4444" }]}>
            {item.outOfStockCount}
          </Text>
          <Text style={styles.whCardStatLbl}>Hết hàng</Text>
        </View>
      </View>

      <View style={styles.whCardUtilRow}>
        <Text style={styles.whCardUtilLabel}>
          Sử dụng {item.utilizationPercent}%
        </Text>
        <View style={styles.whCardUtilBar}>
          <View
            style={[
              styles.whCardUtilFill,
              {
                width: `${item.utilizationPercent}%`,
                backgroundColor:
                  item.utilizationPercent > 80 ? "#EF4444" : "#0D9488",
              },
            ]}
          />
        </View>
      </View>
    </View>
  );

  const renderStockItem = ({ item }: { item: StockSnapshot }) => {
    const wh = warehouses.find((w) => w.id === item.warehouseId);
    const stockPct =
      item.currentStock > 0
        ? (item.availableStock / item.currentStock) * 100
        : 0;

    return (
      <View style={styles.stockItemCard}>
        <View style={styles.stockItemHeader}>
          <Text style={styles.stockItemMatId}>{item.materialId}</Text>
          <Text style={styles.stockItemWh}>{wh?.name ?? item.warehouseId}</Text>
        </View>
        <View style={styles.stockItemRow}>
          <View style={styles.stockItemCol}>
            <Text style={styles.stockItemLabel}>Tồn kho</Text>
            <Text style={styles.stockItemVal}>
              {item.currentStock} {item.unit}
            </Text>
          </View>
          <View style={styles.stockItemCol}>
            <Text style={styles.stockItemLabel}>Đã đặt</Text>
            <Text style={[styles.stockItemVal, { color: "#F59E0B" }]}>
              {item.reservedStock} {item.unit}
            </Text>
          </View>
          <View style={styles.stockItemCol}>
            <Text style={styles.stockItemLabel}>Khả dụng</Text>
            <Text style={[styles.stockItemVal, { color: "#0D9488" }]}>
              {item.availableStock} {item.unit}
            </Text>
          </View>
        </View>
        <View style={styles.stockItemBarBg}>
          <View
            style={[
              styles.stockItemBarFill,
              {
                width: `${stockPct}%`,
                backgroundColor:
                  stockPct < 30
                    ? "#EF4444"
                    : stockPct < 60
                      ? "#F59E0B"
                      : "#10B981",
              },
            ]}
          />
        </View>
        <Text style={styles.stockItemValue}>
          Giá trị: {formatCurrency(item.totalValue)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons
                name={tab.icon as any}
                size={18}
                color={isActive ? "#0D9488" : "#999"}
              />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      {activeTab === "overview" && (
        <FlatList
          data={[1]}
          renderItem={() => renderOverview()}
          keyExtractor={() => "overview"}
        />
      )}

      {activeTab === "warehouse" && (
        <FlatList
          data={summaries}
          renderItem={renderWarehouse}
          keyExtractor={(item) => item.warehouseId}
          contentContainerStyle={styles.listPadding}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Không có dữ liệu</Text>
            </View>
          }
        />
      )}

      {activeTab === "items" && (
        <FlatList
          data={snapshots}
          renderItem={renderStockItem}
          keyExtractor={(item) => `${item.materialId}-${item.warehouseId}`}
          contentContainerStyle={styles.listPadding}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Không có dữ liệu</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  centered: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: "#f5f5f5",
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: "#0D9488",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
  tabActive: { borderBottomWidth: 2, borderBottomColor: "#0D9488" },
  tabText: { fontSize: 13, color: "#999", fontWeight: "500" },
  tabTextActive: { color: "#0D9488", fontWeight: "600" },
  tabContent: { padding: 16, gap: 16 },
  listPadding: { padding: 16, paddingBottom: 40 },
  // ── Summary Grid ──
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 4,
    gap: 4,
  },
  statValue: { fontSize: 20, fontWeight: "700", color: "#333" },
  statLabel: { fontSize: 12, color: "#666" },
  // ── Distribution ──
  section: { gap: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: "#333" },
  distRow: { gap: 4 },
  distInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  distName: { fontSize: 13, color: "#333", fontWeight: "500" },
  distValue: { fontSize: 12, color: "#666" },
  distBarBg: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  distBarFill: { height: "100%", backgroundColor: "#0D9488", borderRadius: 3 },
  distPct: { fontSize: 11, color: "#999", textAlign: "right" },
  // ── Warehouse Status Card ──
  whStatusCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  whStatusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  whStatusName: { fontSize: 14, fontWeight: "600", color: "#333", flex: 1 },
  whTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "#F0FDFA",
    borderRadius: 4,
  },
  whTypeText: { fontSize: 10, fontWeight: "600", color: "#0D9488" },
  whAddress: { fontSize: 12, color: "#999" },
  whStatusRow: { flexDirection: "row" },
  whStatItem: { fontSize: 12, color: "#666" },
  whStatBold: { fontWeight: "600", color: "#333" },
  whUtilRow: { gap: 4 },
  whUtilLabel: { fontSize: 12, color: "#666" },
  whUtilBar: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
  },
  whUtilFill: { height: "100%", borderRadius: 2 },
  // ── Warehouse Summary Card ──
  whCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },
  whCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  whCardName: { fontSize: 14, fontWeight: "600", color: "#333" },
  whCardAddr: { fontSize: 12, color: "#999" },
  whCardStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  whCardStat: { alignItems: "center", gap: 2 },
  whCardStatVal: { fontSize: 16, fontWeight: "700" },
  whCardStatLbl: { fontSize: 11, color: "#999" },
  whCardUtilRow: { gap: 4 },
  whCardUtilLabel: { fontSize: 12, color: "#666" },
  whCardUtilBar: {
    height: 5,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  whCardUtilFill: { height: "100%", borderRadius: 3 },
  // ── Stock Item Card ──
  stockItemCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    gap: 6,
  },
  stockItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stockItemMatId: { fontSize: 13, fontWeight: "700", color: "#333" },
  stockItemWh: { fontSize: 11, color: "#999" },
  stockItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stockItemCol: { alignItems: "center", gap: 2 },
  stockItemLabel: { fontSize: 10, color: "#999" },
  stockItemVal: { fontSize: 14, fontWeight: "600", color: "#333" },
  stockItemBarBg: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
  },
  stockItemBarFill: { height: "100%", borderRadius: 2 },
  stockItemValue: { fontSize: 11, color: "#666", textAlign: "right" },
  // ── Empty ──
  empty: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: { fontSize: 14, color: "#999" },
});
