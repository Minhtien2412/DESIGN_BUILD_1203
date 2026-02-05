/**
 * Seller Promotions - Shopee/TikTok Style
 * Quản lý khuyến mãi và voucher
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Types
interface Promotion {
  id: number;
  code: string;
  name: string;
  type: "percentage" | "fixed" | "shipping";
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: "active" | "scheduled" | "expired" | "paused";
  applicableProducts: "all" | "selected";
  selectedProductCount?: number;
}

interface PromotionStats {
  active: number;
  scheduled: number;
  expired: number;
  totalUsed: number;
  totalRevenue: number;
}

type FilterType = "all" | "active" | "scheduled" | "expired" | "paused";

export default function SellerPromotionsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [stats, setStats] = useState<PromotionStats>({
    active: 0,
    scheduled: 0,
    expired: 0,
    totalUsed: 0,
    totalRevenue: 0,
  });
  const [filter, setFilter] = useState<FilterType>("all");

  // Fetch promotions
  const fetchPromotions = useCallback(async () => {
    try {
      // In production: const response = await apiFetch('/seller/promotions');

      // Mock data
      setStats({
        active: 3,
        scheduled: 2,
        expired: 5,
        totalUsed: 245,
        totalRevenue: 125000000,
      });

      setPromotions([
        {
          id: 1,
          code: "KIENTRUC50",
          name: "Giảm 50% thiết kế mới",
          type: "percentage",
          value: 50,
          minOrderValue: 5000000,
          maxDiscount: 2000000,
          usageLimit: 100,
          usedCount: 45,
          startDate: "2024-01-01",
          endDate: "2024-01-31",
          status: "active",
          applicableProducts: "all",
        },
        {
          id: 2,
          code: "FREESHIP",
          name: "Miễn phí giao bản vẽ",
          type: "shipping",
          value: 100,
          minOrderValue: 2000000,
          usageLimit: 200,
          usedCount: 156,
          startDate: "2024-01-01",
          endDate: "2024-02-28",
          status: "active",
          applicableProducts: "all",
        },
        {
          id: 3,
          code: "TET2024",
          name: "Khuyến mãi Tết 2024",
          type: "fixed",
          value: 1000000,
          minOrderValue: 10000000,
          usageLimit: 50,
          usedCount: 28,
          startDate: "2024-01-15",
          endDate: "2024-02-15",
          status: "active",
          applicableProducts: "selected",
          selectedProductCount: 12,
        },
        {
          id: 4,
          code: "VALENTINE",
          name: "Valentine Special",
          type: "percentage",
          value: 20,
          minOrderValue: 3000000,
          maxDiscount: 1000000,
          usageLimit: 100,
          usedCount: 0,
          startDate: "2024-02-10",
          endDate: "2024-02-14",
          status: "scheduled",
          applicableProducts: "all",
        },
        {
          id: 5,
          code: "NEWYEAR",
          name: "Chào năm mới",
          type: "percentage",
          value: 30,
          minOrderValue: 5000000,
          maxDiscount: 1500000,
          usageLimit: 80,
          usedCount: 80,
          startDate: "2023-12-25",
          endDate: "2024-01-05",
          status: "expired",
          applicableProducts: "all",
        },
        {
          id: 6,
          code: "SUMMER10",
          name: "Summer Sale",
          type: "percentage",
          value: 10,
          minOrderValue: 2000000,
          usageLimit: 150,
          usedCount: 45,
          startDate: "2024-01-01",
          endDate: "2024-06-30",
          status: "paused",
          applicableProducts: "selected",
          selectedProductCount: 8,
        },
      ]);
    } catch (error) {
      console.error("[SellerPromotions] Fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPromotions();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  // Get status info
  const getStatusInfo = (status: Promotion["status"]) => {
    switch (status) {
      case "active":
        return { label: "Đang diễn ra", color: "#10B981", bg: "#D1FAE5" };
      case "scheduled":
        return { label: "Sắp diễn ra", color: "#3B82F6", bg: "#DBEAFE" };
      case "expired":
        return { label: "Đã kết thúc", color: "#6B7280", bg: "#F3F4F6" };
      case "paused":
        return { label: "Tạm dừng", color: "#F59E0B", bg: "#FEF3C7" };
      default:
        return { label: status, color: "#6B7280", bg: "#F3F4F6" };
    }
  };

  // Get promotion type label
  const getTypeLabel = (type: Promotion["type"]) => {
    switch (type) {
      case "percentage":
        return "Giảm %";
      case "fixed":
        return "Giảm tiền";
      case "shipping":
        return "Free ship";
      default:
        return type;
    }
  };

  // Toggle promotion status
  const handleToggleStatus = async (
    promotionId: number,
    currentStatus: Promotion["status"],
  ) => {
    if (currentStatus === "expired") {
      Alert.alert(
        "Thông báo",
        "Không thể thay đổi trạng thái khuyến mãi đã hết hạn",
      );
      return;
    }

    const newStatus = currentStatus === "paused" ? "active" : "paused";

    try {
      // In production: await apiFetch(`/seller/promotions/${promotionId}/status`, { method: 'PATCH', body: { status: newStatus } });

      setPromotions((prev) =>
        prev.map((p) =>
          p.id === promotionId ? { ...p, status: newStatus } : p,
        ),
      );
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái");
    }
  };

  // Delete promotion
  const handleDelete = (promotionId: number) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa khuyến mãi này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            // In production: await apiFetch(`/seller/promotions/${promotionId}`, { method: 'DELETE' });
            setPromotions((prev) => prev.filter((p) => p.id !== promotionId));
          } catch (error) {
            Alert.alert("Lỗi", "Không thể xóa khuyến mãi");
          }
        },
      },
    ]);
  };

  // Filter promotions
  const filteredPromotions = promotions.filter((promo) => {
    if (filter === "all") return true;
    return promo.status === filter;
  });

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: "all", label: "Tất cả", count: promotions.length },
    { key: "active", label: "Đang diễn ra", count: stats.active },
    { key: "scheduled", label: "Sắp diễn ra", count: stats.scheduled },
    { key: "expired", label: "Đã kết thúc", count: stats.expired },
    {
      key: "paused",
      label: "Tạm dừng",
      count: promotions.filter((p) => p.status === "paused").length,
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Stats Header */}
      <LinearGradient
        colors={["#FF6B35", "#FF8C5A"]}
        style={styles.statsHeader}
      >
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalUsed}</Text>
            <Text style={styles.statLabel}>Lượt sử dụng</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {formatCurrency(stats.totalRevenue)}
            </Text>
            <Text style={styles.statLabel}>Doanh thu từ mã</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((f) => (
          <Pressable
            key={f.key}
            style={[
              styles.filterChip,
              filter === f.key && styles.activeFilterChip,
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === f.key && styles.activeFilterChipText,
              ]}
            >
              {f.label} ({f.count})
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Promotions List */}
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF6B35"]}
          />
        }
        contentContainerStyle={styles.listContent}
      >
        {filteredPromotions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="pricetag-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>Chưa có khuyến mãi nào</Text>
            <Pressable style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>
                Tạo khuyến mãi đầu tiên
              </Text>
            </Pressable>
          </View>
        ) : (
          filteredPromotions.map((promo) => {
            const statusInfo = getStatusInfo(promo.status);
            const usagePercentage = (promo.usedCount / promo.usageLimit) * 100;

            return (
              <View key={promo.id} style={styles.promoCard}>
                {/* Header */}
                <View style={styles.promoHeader}>
                  <View style={styles.promoCodeContainer}>
                    <View style={styles.promoCodeBadge}>
                      <Text style={styles.promoCode}>{promo.code}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusInfo.bg },
                      ]}
                    >
                      <Text
                        style={[styles.statusText, { color: statusInfo.color }]}
                      >
                        {statusInfo.label}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>
                      {getTypeLabel(promo.type)}
                    </Text>
                  </View>
                </View>

                {/* Name */}
                <Text style={styles.promoName}>{promo.name}</Text>

                {/* Value */}
                <View style={styles.promoValue}>
                  {promo.type === "percentage" ? (
                    <>
                      <Text style={styles.valueText}>Giảm {promo.value}%</Text>
                      {promo.maxDiscount && (
                        <Text style={styles.maxDiscountText}>
                          (tối đa {formatCurrency(promo.maxDiscount)})
                        </Text>
                      )}
                    </>
                  ) : promo.type === "fixed" ? (
                    <Text style={styles.valueText}>
                      Giảm {formatCurrency(promo.value)}
                    </Text>
                  ) : (
                    <Text style={styles.valueText}>Miễn phí vận chuyển</Text>
                  )}
                </View>

                {/* Conditions */}
                <View style={styles.conditionsRow}>
                  <View style={styles.condition}>
                    <Ionicons name="cart-outline" size={14} color="#6B7280" />
                    <Text style={styles.conditionText}>
                      Đơn tối thiểu: {formatCurrency(promo.minOrderValue)}
                    </Text>
                  </View>
                  <View style={styles.condition}>
                    <Ionicons name="cube-outline" size={14} color="#6B7280" />
                    <Text style={styles.conditionText}>
                      {promo.applicableProducts === "all"
                        ? "Tất cả sản phẩm"
                        : `${promo.selectedProductCount} sản phẩm`}
                    </Text>
                  </View>
                </View>

                {/* Usage Progress */}
                <View style={styles.usageSection}>
                  <View style={styles.usageHeader}>
                    <Text style={styles.usageLabel}>Đã sử dụng</Text>
                    <Text style={styles.usageCount}>
                      {promo.usedCount}/{promo.usageLimit}
                    </Text>
                  </View>
                  <View style={styles.usageBar}>
                    <View
                      style={[
                        styles.usageFill,
                        {
                          width: `${Math.min(usagePercentage, 100)}%`,
                          backgroundColor:
                            usagePercentage >= 90 ? "#EF4444" : "#10B981",
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Date */}
                <View style={styles.dateRow}>
                  <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                  <Text style={styles.dateText}>
                    {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
                  </Text>
                </View>

                {/* Actions */}
                <View style={styles.promoActions}>
                  <Pressable
                    style={styles.actionBtn}
                    onPress={() => {
                      /* Edit */
                    }}
                  >
                    <Ionicons name="create-outline" size={18} color="#3B82F6" />
                    <Text style={[styles.actionText, { color: "#3B82F6" }]}>
                      Sửa
                    </Text>
                  </Pressable>

                  {promo.status !== "expired" && (
                    <Pressable
                      style={styles.actionBtn}
                      onPress={() => handleToggleStatus(promo.id, promo.status)}
                    >
                      <Ionicons
                        name={
                          promo.status === "paused"
                            ? "play-outline"
                            : "pause-outline"
                        }
                        size={18}
                        color="#F59E0B"
                      />
                      <Text style={[styles.actionText, { color: "#F59E0B" }]}>
                        {promo.status === "paused" ? "Tiếp tục" : "Tạm dừng"}
                      </Text>
                    </Pressable>
                  )}

                  <Pressable
                    style={styles.actionBtn}
                    onPress={() => handleDelete(promo.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    <Text style={[styles.actionText, { color: "#EF4444" }]}>
                      Xóa
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* FAB - Add Promotion */}
      <Pressable style={styles.fab}>
        <LinearGradient
          colors={["#FF6B35", "#FF8C5A"]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </LinearGradient>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statsHeader: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  filtersContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: "#FF6B35",
  },
  filterChipText: {
    fontSize: 13,
    color: "#6B7280",
  },
  activeFilterChipText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 12,
  },
  emptyButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#FF6B35",
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  promoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  promoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  promoCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  promoCodeBadge: {
    backgroundColor: "#FFF5F2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#FF6B35",
    borderStyle: "dashed",
  },
  promoCode: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  typeBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  promoName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  promoValue: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
  },
  valueText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  maxDiscountText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 6,
  },
  conditionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  condition: {
    flexDirection: "row",
    alignItems: "center",
  },
  conditionText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  usageSection: {
    marginBottom: 12,
  },
  usageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  usageLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  usageCount: {
    fontSize: 12,
    color: "#1F2937",
    fontWeight: "500",
  },
  usageBar: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
  },
  usageFill: {
    height: "100%",
    borderRadius: 3,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 6,
  },
  promoActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
    gap: 16,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    fontSize: 13,
    marginLeft: 4,
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
    borderRadius: 28,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
});
