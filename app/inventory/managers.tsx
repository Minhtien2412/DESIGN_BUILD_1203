import { useMaterialManagers, useWarehouses } from "@/hooks/useInventory";
import type { MaterialManager } from "@/types/inventory";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const formatCompact = (value: number) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)} tỷ`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)} tr`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Vừa xong";
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
};

export default function ManagersScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { managers, loading, error, refetch } = useMaterialManagers(
    projectId || "",
  );
  const { warehouses, loading: loadingWh } = useWarehouses(projectId);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(
    null,
  );

  const filteredManagers = useMemo(() => {
    if (!selectedWarehouse) return managers;
    return managers.filter((m) => m.warehouseId === selectedWarehouse);
  }, [managers, selectedWarehouse]);

  if (loading || loadingWh) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={{ marginTop: 12, color: "#666" }}>
          Đang tải nhân sự...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
        <Text style={{ marginTop: 12, color: "#EF4444" }}>
          Không tải được dữ liệu
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
          <Text style={{ color: "#FFF" }}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderManager = ({ item }: { item: MaterialManager }) => (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {item.userName
              .split(" ")
              .slice(-2)
              .map((w) => w[0])
              .join("")}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.managerName}>{item.userName}</Text>
          <Text style={styles.managerRole}>{item.userRole}</Text>
        </View>
        <View
          style={[styles.activeBadge, !item.isActive && styles.inactiveBadge]}
        >
          <View
            style={[styles.activeDot, !item.isActive && styles.inactiveDot]}
          />
          <Text
            style={[styles.activeText, !item.isActive && styles.inactiveText]}
          >
            {item.isActive ? "Hoạt động" : "Ngừng"}
          </Text>
        </View>
      </View>

      {/* Warehouse Assignment */}
      {item.warehouse && (
        <View style={styles.assignmentRow}>
          <Ionicons
            name={
              item.warehouse.type === "MAIN"
                ? "business"
                : item.warehouse.type === "SITE"
                  ? "construct"
                  : "cube"
            }
            size={14}
            color="#0D9488"
          />
          <Text style={styles.assignmentText}>{item.warehouse.name}</Text>
        </View>
      )}

      {/* Categories */}
      {item.materialCategories && item.materialCategories.length > 0 && (
        <View style={styles.categoriesRow}>
          {item.materialCategories.map((cat) => (
            <View key={cat} style={styles.catChip}>
              <Text style={styles.catChipText}>{cat}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Ionicons name="cube-outline" size={14} color="#0D9488" />
          <Text style={styles.statValue}>{item.totalItemsManaged}</Text>
          <Text style={styles.statLabel}>Mặt hàng</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Ionicons name="cash-outline" size={14} color="#3B82F6" />
          <Text style={styles.statValue}>
            {formatCompact(item.totalValueManaged)}
          </Text>
          <Text style={styles.statLabel}>Giá trị</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Ionicons name="calendar-outline" size={14} color="#F59E0B" />
          <Text style={styles.statValue}>{formatDate(item.assignedAt)}</Text>
          <Text style={styles.statLabel}>Phân công</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.footerText}>
          Phân công bởi: {item.assignedBy.name}
        </Text>
        {item.lastActivityAt && (
          <Text style={styles.footerText}>
            Hoạt động: {timeAgo(item.lastActivityAt)}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Summary Bar */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{managers.length}</Text>
          <Text style={styles.summaryLabel}>Nhân sự</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {managers.filter((m) => m.isActive).length}
          </Text>
          <Text style={styles.summaryLabel}>Hoạt động</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{warehouses.length}</Text>
          <Text style={styles.summaryLabel}>Kho</Text>
        </View>
      </View>

      {/* Warehouse Filter */}
      <View style={styles.filterBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: null, name: "Tất cả" }, ...warehouses] as any}
          keyExtractor={(item) => item.id ?? "all"}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item: wh }) => {
            const isActive = wh.id === selectedWarehouse;
            return (
              <TouchableOpacity
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setSelectedWarehouse(wh.id)}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive && styles.filterTextActive,
                  ]}
                >
                  {wh.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Manager List */}
      <FlatList
        data={filteredManagers}
        renderItem={renderManager}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>Chưa có nhân sự quản lý kho</Text>
          </View>
        }
      />
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
  // ── Summary Bar ──
  summaryBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  summaryItem: { alignItems: "center", gap: 2 },
  summaryValue: { fontSize: 20, fontWeight: "700", color: "#333" },
  summaryLabel: { fontSize: 12, color: "#999" },
  // ── Filter ──
  filterBar: { backgroundColor: "#fff", paddingVertical: 8 },
  filterContent: { paddingHorizontal: 16, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  filterChipActive: { backgroundColor: "#10B981" },
  filterText: { fontSize: 13, color: "#666", fontWeight: "500" },
  filterTextActive: { color: "#fff" },
  // ── List ──
  list: { padding: 16, paddingBottom: 40 },
  // ── Card ──
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 16, fontWeight: "700", color: "#0D9488" },
  managerName: { fontSize: 15, fontWeight: "600", color: "#333" },
  managerRole: { fontSize: 12, color: "#999" },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: "#ECFDF5",
  },
  inactiveBadge: { backgroundColor: "#F9FAFB" },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  inactiveDot: { backgroundColor: "#9CA3AF" },
  activeText: { fontSize: 11, fontWeight: "600", color: "#10B981" },
  inactiveText: { color: "#9CA3AF" },
  // ── Assignment ──
  assignmentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 54,
  },
  assignmentText: { fontSize: 13, color: "#666" },
  // ── Categories ──
  categoriesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    paddingLeft: 54,
  },
  catChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "#F3F4F6",
  },
  catChipText: { fontSize: 10, color: "#666", fontWeight: "500" },
  // ── Stats ──
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 8,
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
  },
  stat: { alignItems: "center", gap: 2 },
  statValue: { fontSize: 13, fontWeight: "600", color: "#333" },
  statLabel: { fontSize: 10, color: "#999" },
  statDivider: { width: 1, height: 24, backgroundColor: "#E5E7EB" },
  // ── Footer ──
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#F0F0F0",
  },
  footerText: { fontSize: 11, color: "#999" },
  // ── Empty ──
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: { fontSize: 14, color: "#999" },
});
