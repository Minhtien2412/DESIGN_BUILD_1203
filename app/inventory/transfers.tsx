import { useTransferOrders } from "@/hooks/useInventory";
import type { TransferOrder } from "@/types/inventory";
import { TransferStatus } from "@/types/inventory";
import { Ionicons } from "@expo/vector-icons";
import { Href, router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const STATUS_FILTERS: { key: TransferStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "Tất cả" },
  { key: TransferStatus.PENDING_APPROVAL, label: "Chờ duyệt" },
  { key: TransferStatus.APPROVED, label: "Đã duyệt" },
  { key: TransferStatus.IN_TRANSIT, label: "Đang chuyển" },
  { key: TransferStatus.RECEIVED, label: "Đã nhận" },
  { key: TransferStatus.REJECTED, label: "Từ chối" },
];

const STATUS_CONFIG: Record<
  TransferStatus,
  { label: string; color: string; bg: string }
> = {
  [TransferStatus.DRAFT]: { label: "Nháp", color: "#666", bg: "#F5F5F5" },
  [TransferStatus.PENDING_APPROVAL]: {
    label: "Chờ duyệt",
    color: "#F59E0B",
    bg: "#FFFBEB",
  },
  [TransferStatus.APPROVED]: {
    label: "Đã duyệt",
    color: "#3B82F6",
    bg: "#EFF6FF",
  },
  [TransferStatus.IN_TRANSIT]: {
    label: "Đang vận chuyển",
    color: "#8B5CF6",
    bg: "#F5F3FF",
  },
  [TransferStatus.RECEIVED]: {
    label: "Đã nhận",
    color: "#10B981",
    bg: "#ECFDF5",
  },
  [TransferStatus.REJECTED]: {
    label: "Từ chối",
    color: "#EF4444",
    bg: "#FEF2F2",
  },
  [TransferStatus.CANCELLED]: {
    label: "Đã hủy",
    color: "#9CA3AF",
    bg: "#F9FAFB",
  },
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
};

export default function TransfersScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const {
    transfers: allTransfers,
    loading,
    error,
    refetch,
  } = useTransferOrders(projectId || "");
  const [activeFilter, setActiveFilter] = useState<TransferStatus | "ALL">(
    "ALL",
  );

  const transfers = useMemo(() => {
    if (activeFilter === "ALL") return allTransfers;
    return allTransfers.filter((t) => t.status === activeFilter);
  }, [activeFilter, allTransfers]);

  const renderTransfer = ({ item }: { item: TransferOrder }) => {
    const cfg = STATUS_CONFIG[item.status];
    const totalItems = item.items.reduce(
      (sum, i) => sum + i.requestedQuantity,
      0,
    );

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() =>
          router.push(
            `/inventory/transfers?transferId=${item.id}&projectId=${projectId}` as Href,
          )
        }
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="git-compare" size={18} color="#8B5CF6" />
            <Text style={styles.transferNumber}>{item.transferNumber}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.badgeText, { color: cfg.color }]}>
              {cfg.label}
            </Text>
          </View>
        </View>

        <View style={styles.routeRow}>
          <View style={styles.warehouseBlock}>
            <Ionicons name="location-outline" size={14} color="#0D9488" />
            <Text style={styles.warehouseName} numberOfLines={1}>
              {item.fromWarehouse?.name ?? "N/A"}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color="#CCC" />
          <View style={styles.warehouseBlock}>
            <Ionicons name="location" size={14} color="#8B5CF6" />
            <Text style={styles.warehouseName} numberOfLines={1}>
              {item.toWarehouse?.name ?? "N/A"}
            </Text>
          </View>
        </View>

        <Text style={styles.reason} numberOfLines={2}>
          {item.reason}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.meta}>
            {item.items.length} vật tư · {totalItems} đơn vị
          </Text>
          <Text style={styles.meta}>{formatDate(item.createdAt)}</Text>
        </View>

        {item.requestedBy && (
          <View style={styles.personRow}>
            <Ionicons name="person-outline" size={12} color="#999" />
            <Text style={styles.personText}>
              Yêu cầu: {item.requestedBy.name}
            </Text>
            {item.approvedBy && (
              <>
                <Text style={styles.personSep}>·</Text>
                <Text style={styles.personText}>
                  Duyệt: {item.approvedBy.name}
                </Text>
              </>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={{ marginTop: 12, color: "#666" }}>Đang tải...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={{ marginTop: 12, color: "#666" }}>
          Không thể tải dữ liệu
        </Text>
        <TouchableOpacity
          onPress={refetch}
          style={{ marginTop: 12, padding: 10 }}
        >
          <Text style={{ color: "#8B5CF6", fontWeight: "600" }}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_FILTERS}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item }) => {
            const isActive = item.key === activeFilter;
            return (
              <TouchableOpacity
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(item.key)}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive && styles.filterTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Transfer List */}
      <FlatList
        data={transfers}
        renderItem={renderTransfer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="git-compare-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>Chưa có phiếu luân chuyển nào</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/inventory/create-transfer" as Href)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  filterBar: { backgroundColor: "#fff", paddingVertical: 10 },
  filterContent: { paddingHorizontal: 16, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  filterChipActive: { backgroundColor: "#0D9488" },
  filterText: { fontSize: 13, color: "#666", fontWeight: "500" },
  filterTextActive: { color: "#fff" },
  list: { padding: 16, paddingBottom: 80 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  transferNumber: { fontSize: 15, fontWeight: "700", color: "#333" },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  warehouseBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  warehouseName: { fontSize: 13, color: "#333", flex: 1 },
  reason: { fontSize: 12, color: "#666", lineHeight: 18 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  meta: { fontSize: 11, color: "#999" },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#F0F0F0",
  },
  personText: { fontSize: 11, color: "#999" },
  personSep: { fontSize: 11, color: "#CCC" },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: { fontSize: 14, color: "#999" },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
