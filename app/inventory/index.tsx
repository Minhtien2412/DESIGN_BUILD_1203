import {
    useInventorySummary,
    useLowStockMaterials,
    useStockAlerts,
} from "@/hooks/useInventory";
import { MaterialCategory, StockStatus } from "@/types/inventory";
import { Ionicons } from "@expo/vector-icons";
import { Href, router, useLocalSearchParams } from "expo-router";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;

const CATEGORY_CONFIG: Record<
  MaterialCategory,
  { label: string; icon: string; color: string }
> = {
  CEMENT: { label: "Xi măng", icon: "cube", color: "#666666" },
  STEEL: { label: "Thép", icon: "git-network", color: "#1A1A1A" },
  SAND: { label: "Cát", icon: "water", color: "#0D9488" },
  GRAVEL: { label: "Đá", icon: "shapes", color: "#999999" },
  BRICK: { label: "Gạch", icon: "grid", color: "#0D9488" },
  TILE: { label: "Gạch lát", icon: "apps", color: "#0D9488" },
  PAINT: { label: "Sơn", icon: "color-palette", color: "#0D9488" },
  WOOD: { label: "Gỗ", icon: "file-tray-stacked", color: "#0D9488" },
  ELECTRICAL: { label: "Điện", icon: "flash", color: "#0D9488" },
  PLUMBING: { label: "Nước", icon: "water-outline", color: "#0D9488" },
  TOOLS: { label: "Dụng cụ", icon: "construct", color: "#0D9488" },
  SAFETY_EQUIPMENT: {
    label: "An toàn",
    icon: "shield-checkmark",
    color: "#0D9488",
  },
  OTHER: { label: "Khác", icon: "ellipsis-horizontal", color: "#999999" },
};

export default function InventoryDashboardScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { summary, loading: summaryLoading } = useInventorySummary(projectId!);
  const { alerts, loading: alertsLoading } = useStockAlerts(projectId!);
  const { materials: lowStockMaterials } = useLowStockMaterials(projectId!);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCompact = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  if (summaryLoading || alertsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  const criticalAlerts = alerts.filter((a) => a.severity === "CRITICAL").length;
  const highAlerts = alerts.filter((a) => a.severity === "HIGH").length;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Summary Cards */}
        {summary && (
          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, styles.fullCard]}>
                <Ionicons name="cube-outline" size={24} color="#0D9488" />
                <Text style={styles.summaryLabel}>Tổng giá trị kho</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(summary.totalValue)}
                </Text>
                <Text style={styles.summarySubtext}>
                  {summary.totalItems} mặt hàng
                </Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, styles.halfCard]}>
                <Ionicons name="warning" size={20} color="#0D9488" />
                <Text style={styles.summaryLabel}>Sắp hết</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { fontSize: 20, color: "#0D9488" },
                  ]}
                >
                  {summary.lowStockItems}
                </Text>
                <Text style={styles.summarySubtext}>mặt hàng</Text>
              </View>

              <View style={[styles.summaryCard, styles.halfCard]}>
                <Ionicons name="alert-circle" size={20} color="#1A1A1A" />
                <Text style={styles.summaryLabel}>Hết hàng</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { fontSize: 20, color: "#1A1A1A" },
                  ]}
                >
                  {summary.outOfStockItems}
                </Text>
                <Text style={styles.summarySubtext}>mặt hàng</Text>
              </View>
            </View>

            {/* Alerts Banner */}
            {alerts.length > 0 && (
              <TouchableOpacity
                style={styles.alertsBanner}
                onPress={() =>
                  router.push(
                    `/inventory/alerts?projectId=${projectId}` as Href,
                  )
                }
              >
                <View style={styles.alertsLeft}>
                  <Ionicons name="notifications" size={20} color="#1A1A1A" />
                  <View style={styles.alertsText}>
                    <Text style={styles.alertsTitle}>
                      {alerts.length} cảnh báo kho
                    </Text>
                    {(criticalAlerts > 0 || highAlerts > 0) && (
                      <Text style={styles.alertsSubtitle}>
                        {criticalAlerts > 0
                          ? `${criticalAlerts} nghiêm trọng`
                          : ""}
                        {criticalAlerts > 0 && highAlerts > 0 ? ", " : ""}
                        {highAlerts > 0 ? `${highAlerts} cao` : ""}
                      </Text>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Category Breakdown */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Phân loại vật liệu</Text>
            <TouchableOpacity
              onPress={() =>
                router.push(
                  `/inventory/materials?projectId=${projectId}` as Href,
                )
              }
            >
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {summary &&
            Object.entries(summary.byCategory).map(([category, data]) => {
              const config = CATEGORY_CONFIG[category as MaterialCategory];
              const isLowStock = data.stockStatus === StockStatus.LOW_STOCK;
              const isOutOfStock =
                data.stockStatus === StockStatus.OUT_OF_STOCK;

              return (
                <View key={category} style={styles.categoryCard}>
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryLeft}>
                      <View
                        style={[
                          styles.categoryIcon,
                          { backgroundColor: config.color + "20" },
                        ]}
                      >
                        <Ionicons
                          name={config.icon as any}
                          size={20}
                          color={config.color}
                        />
                      </View>
                      <View style={styles.categoryInfo}>
                        <Text style={styles.categoryName}>{config.label}</Text>
                        <Text style={styles.categoryItems}>
                          {data.itemCount} mặt hàng
                        </Text>
                      </View>
                    </View>

                    <View style={styles.categoryRight}>
                      {isOutOfStock && (
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: "#F5F5F5" },
                          ]}
                        >
                          <Ionicons
                            name="alert-circle"
                            size={12}
                            color="#1A1A1A"
                          />
                          <Text
                            style={[styles.statusText, { color: "#1A1A1A" }]}
                          >
                            Hết
                          </Text>
                        </View>
                      )}
                      {isLowStock && !isOutOfStock && (
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: "#F0FDFA" },
                          ]}
                        >
                          <Ionicons name="warning" size={12} color="#0D9488" />
                          <Text
                            style={[styles.statusText, { color: "#0D9488" }]}
                          >
                            Thấp
                          </Text>
                        </View>
                      )}
                      <Text style={styles.categoryValue}>
                        {formatCompact(data.totalValue)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
        </View>

        {/* Low Stock Items */}
        {lowStockMaterials.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Vật liệu sắp hết</Text>
              <TouchableOpacity
                onPress={() =>
                  router.push(
                    `/inventory/materials?projectId=${projectId}&filter=low` as Href,
                  )
                }
              >
                <Text style={styles.seeAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            {lowStockMaterials.slice(0, 5).map((material) => {
              const config = CATEGORY_CONFIG[material.category];
              const stockPercentage =
                (material.currentStock / material.minStock) * 100;

              return (
                <TouchableOpacity
                  key={material.id}
                  style={styles.materialCard}
                  onPress={() =>
                    router.push(
                      `/inventory/material/${material.id}?projectId=${projectId}` as Href,
                    )
                  }
                >
                  <View
                    style={[
                      styles.categoryIcon,
                      styles.materialIcon,
                      { backgroundColor: config.color + "20" },
                    ]}
                  >
                    <Ionicons
                      name={config.icon as any}
                      size={18}
                      color={config.color}
                    />
                  </View>

                  <View style={styles.materialInfo}>
                    <Text style={styles.materialName} numberOfLines={1}>
                      {material.name}
                    </Text>
                    <View style={styles.stockRow}>
                      <Text style={styles.stockText}>
                        {material.currentStock} / {material.minStock}{" "}
                        {material.unit}
                      </Text>
                      <View
                        style={[
                          styles.stockBadge,
                          {
                            backgroundColor:
                              material.currentStock === 0
                                ? "#F5F5F5"
                                : stockPercentage < 50
                                  ? "#F0FDFA"
                                  : "#FFF9C4",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.stockBadgeText,
                            {
                              color:
                                material.currentStock === 0
                                  ? "#1A1A1A"
                                  : stockPercentage < 50
                                    ? "#0D9488"
                                    : "#0D9488",
                            },
                          ]}
                        >
                          {stockPercentage.toFixed(0)}%
                        </Text>
                      </View>
                    </View>

                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(stockPercentage, 100)}%`,
                            backgroundColor:
                              material.currentStock === 0
                                ? "#1A1A1A"
                                : stockPercentage < 50
                                  ? "#0D9488"
                                  : "#0D9488",
                          },
                        ]}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>

          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() =>
                router.push(
                  `/inventory/materials?projectId=${projectId}` as Href,
                )
              }
            >
              <Ionicons name="cube" size={28} color="#0D9488" />
              <Text style={styles.actionLabel}>Vật liệu</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() =>
                router.push(`/inventory/orders?projectId=${projectId}` as Href)
              }
            >
              <Ionicons name="document-text" size={28} color="#0D9488" />
              <Text style={styles.actionLabel}>Đơn hàng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() =>
                router.push(
                  `/inventory/suppliers?projectId=${projectId}` as Href,
                )
              }
            >
              <Ionicons name="business" size={28} color="#0D9488" />
              <Text style={styles.actionLabel}>Nhà cung cấp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() =>
                router.push(
                  `/inventory/transactions?projectId=${projectId}` as Href,
                )
              }
            >
              <Ionicons name="swap-horizontal" size={28} color="#0D9488" />
              <Text style={styles.actionLabel}>Giao dịch</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  summarySection: {
    padding: 16,
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
  },
  summaryCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fullCard: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  halfCard: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#666",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  summarySubtext: {
    fontSize: 12,
    color: "#999",
  },
  alertsBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#1A1A1A",
  },
  alertsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  alertsText: {
    flex: 1,
  },
  alertsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  alertsSubtitle: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    padding: 16,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  seeAllText: {
    fontSize: 14,
    color: "#0D9488",
    fontWeight: "500",
  },
  categoryCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  categoryItems: {
    fontSize: 12,
    color: "#666",
  },
  categoryRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  materialCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  materialIcon: {
    width: 36,
    height: 36,
  },
  materialInfo: {
    flex: 1,
    gap: 4,
  },
  materialName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  stockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stockText: {
    fontSize: 12,
    color: "#666",
  },
  stockBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: (SCREEN_WIDTH - 56) / 2,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
});
