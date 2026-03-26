import { useHandoverRecords } from "@/hooks/useInventory";
import type { HandoverRecord } from "@/types/inventory";
import { HandoverStatus } from "@/types/inventory";
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

const STATUS_FILTERS: { key: HandoverStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "Tất cả" },
  { key: HandoverStatus.PENDING, label: "Chờ xác nhận" },
  { key: HandoverStatus.CONFIRMED, label: "Đã xác nhận" },
  { key: HandoverStatus.DRAFT, label: "Nháp" },
  { key: HandoverStatus.REJECTED, label: "Từ chối" },
];

const STATUS_CONFIG: Record<
  HandoverStatus,
  { label: string; color: string; bg: string; icon: string }
> = {
  [HandoverStatus.DRAFT]: {
    label: "Nháp",
    color: "#666",
    bg: "#F5F5F5",
    icon: "document-outline",
  },
  [HandoverStatus.PENDING]: {
    label: "Chờ xác nhận",
    color: "#F59E0B",
    bg: "#FFFBEB",
    icon: "time-outline",
  },
  [HandoverStatus.CONFIRMED]: {
    label: "Đã xác nhận",
    color: "#10B981",
    bg: "#ECFDF5",
    icon: "checkmark-circle",
  },
  [HandoverStatus.REJECTED]: {
    label: "Từ chối",
    color: "#EF4444",
    bg: "#FEF2F2",
    icon: "close-circle",
  },
  [HandoverStatus.CANCELLED]: {
    label: "Đã hủy",
    color: "#9CA3AF",
    bg: "#F9FAFB",
    icon: "ban",
  },
};

const CONDITION_LABELS: Record<string, { label: string; color: string }> = {
  NEW: { label: "Mới", color: "#10B981" },
  GOOD: { label: "Tốt", color: "#3B82F6" },
  FAIR: { label: "TB", color: "#F59E0B" },
  DAMAGED: { label: "Hỏng", color: "#EF4444" },
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
};

export default function HandoversScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const {
    handovers: allHandovers,
    loading,
    error,
    refetch,
  } = useHandoverRecords(projectId || "");
  const [activeFilter, setActiveFilter] = useState<HandoverStatus | "ALL">(
    "ALL",
  );

  const handovers = useMemo(() => {
    if (activeFilter === "ALL") return allHandovers;
    return allHandovers.filter((h) => h.status === activeFilter);
  }, [activeFilter, allHandovers]);

  const renderHandover = ({ item }: { item: HandoverRecord }) => {
    const cfg = STATUS_CONFIG[item.status];

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() =>
          router.push(
            `/inventory/handovers?handoverId=${item.id}&projectId=${projectId}` as Href,
          )
        }
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="hand-left" size={16} color="#F59E0B" />
            <Text style={styles.handoverNumber}>{item.handoverNumber}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
            <Ionicons name={cfg.icon as any} size={12} color={cfg.color} />
            <Text style={[styles.badgeText, { color: cfg.color }]}>
              {cfg.label}
            </Text>
          </View>
        </View>

        {/* People */}
        <View style={styles.peopleRow}>
          <View style={styles.personBlock}>
            <View style={[styles.personIcon, { backgroundColor: "#F0FDFA" }]}>
              <Ionicons name="person" size={14} color="#0D9488" />
            </View>
            <View style={styles.personInfo}>
              <Text style={styles.personName} numberOfLines={1}>
                {item.fromPerson.name}
              </Text>
              <Text style={styles.personRole}>{item.fromPerson.role}</Text>
            </View>
          </View>
          <View style={styles.arrowContainer}>
            <Ionicons name="arrow-forward" size={16} color="#CCC" />
          </View>
          <View style={styles.personBlock}>
            <View style={[styles.personIcon, { backgroundColor: "#F5F3FF" }]}>
              <Ionicons name="person" size={14} color="#8B5CF6" />
            </View>
            <View style={styles.personInfo}>
              <Text style={styles.personName} numberOfLines={1}>
                {item.toPerson.name}
              </Text>
              <Text style={styles.personRole}>{item.toPerson.role}</Text>
            </View>
          </View>
        </View>

        {/* Items summary */}
        <View style={styles.itemsSummary}>
          {item.items.slice(0, 3).map((hi) => {
            const condCfg =
              CONDITION_LABELS[hi.condition] ?? CONDITION_LABELS.GOOD;
            return (
              <View key={hi.id} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {hi.notes ?? `Vật tư ${hi.materialId}`}
                </Text>
                <Text style={styles.itemQty}>
                  {hi.quantity} {hi.unit}
                </Text>
                <View
                  style={[
                    styles.conditionBadge,
                    { backgroundColor: condCfg.color + "15" },
                  ]}
                >
                  <Text
                    style={[styles.conditionText, { color: condCfg.color }]}
                  >
                    {condCfg.label}
                  </Text>
                </View>
              </View>
            );
          })}
          {item.items.length > 3 && (
            <Text style={styles.moreItems}>
              +{item.items.length - 3} vật tư khác
            </Text>
          )}
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <Text style={styles.meta}>
            <Ionicons name="calendar-outline" size={11} color="#999" />{" "}
            {formatDate(item.handoverDate)}
          </Text>
          <Text style={styles.meta}>{item.reason}</Text>
        </View>

        {item.witnessName && (
          <View style={styles.witnessRow}>
            <Ionicons name="eye-outline" size={12} color="#999" />
            <Text style={styles.witnessText}>
              Chứng kiến: {item.witnessName}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={{ marginTop: 12, color: "#666" }}>
          Đang tải bàn giao...
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

  return (
    <View style={styles.container}>
      {/* Status Filter */}
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

      {/* Handover List */}
      <FlatList
        data={handovers}
        renderItem={renderHandover}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="hand-left-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>Chưa có biên bản bàn giao nào</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/inventory/create-handover" as Href)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: "#F59E0B",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  filterBar: { backgroundColor: "#fff", paddingVertical: 10 },
  filterContent: { paddingHorizontal: 16, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  filterChipActive: { backgroundColor: "#F59E0B" },
  filterText: { fontSize: 13, color: "#666", fontWeight: "500" },
  filterTextActive: { color: "#fff" },
  list: { padding: 16, paddingBottom: 80 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  handoverNumber: { fontSize: 15, fontWeight: "700", color: "#333" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },
  peopleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  personBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  personIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  personInfo: { flex: 1 },
  personName: { fontSize: 13, fontWeight: "600", color: "#333" },
  personRole: { fontSize: 11, color: "#999" },
  arrowContainer: { paddingHorizontal: 4 },
  itemsSummary: { gap: 4 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 2,
  },
  itemName: { flex: 1, fontSize: 12, color: "#666" },
  itemQty: { fontSize: 12, fontWeight: "600", color: "#333" },
  conditionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  conditionText: { fontSize: 10, fontWeight: "600" },
  moreItems: { fontSize: 11, color: "#999", fontStyle: "italic" },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#F0F0F0",
  },
  meta: { fontSize: 11, color: "#999" },
  witnessRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  witnessText: { fontSize: 11, color: "#999" },
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
    backgroundColor: "#F59E0B",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
