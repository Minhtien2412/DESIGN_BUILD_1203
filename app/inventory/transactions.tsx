import { useStockTransactions } from "@/hooks/useInventory";
import type { StockTransaction } from "@/types/inventory";
import { TransactionType } from "@/types/inventory";
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

type FilterKey = "ALL" | TransactionType;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "Tất cả" },
  { key: TransactionType.PURCHASE, label: "Mua hàng" },
  { key: TransactionType.USAGE, label: "Sử dụng" },
  { key: TransactionType.RETURN, label: "Trả hàng" },
  { key: TransactionType.ADJUSTMENT, label: "Điều chỉnh" },
  { key: TransactionType.TRANSFER, label: "Luân chuyển" },
];

const TYPE_CONFIG: Record<
  string,
  { icon: string; color: string; label: string }
> = {
  PURCHASE: { icon: "arrow-down-circle", color: "#10B981", label: "Mua hàng" },
  USAGE: { icon: "arrow-up-circle", color: "#EF4444", label: "Sử dụng" },
  ADJUSTMENT: {
    icon: "swap-horizontal",
    color: "#F59E0B",
    label: "Điều chỉnh",
  },
  TRANSFER: { icon: "git-compare", color: "#8B5CF6", label: "Luân chuyển" },
  RETURN: { icon: "return-down-back", color: "#3B82F6", label: "Trả hàng" },
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
};

export default function TransactionsScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { transactions, loading, error, refetch } = useStockTransactions(
    projectId || "",
  );
  const [activeFilter, setActiveFilter] = useState<FilterKey>("ALL");

  const filtered = useMemo(() => {
    if (activeFilter === "ALL") return transactions;
    return transactions.filter((t) => t.type === activeFilter);
  }, [transactions, activeFilter]);

  const renderTransaction = ({ item }: { item: StockTransaction }) => {
    const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.PURCHASE;
    const isPositive =
      item.type === TransactionType.PURCHASE ||
      item.type === TransactionType.RETURN;

    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View
            style={[styles.iconCircle, { backgroundColor: cfg.color + "15" }]}
          >
            <Ionicons name={cfg.icon as any} size={20} color={cfg.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.materialName}>
              {item.material?.name ?? item.materialId}
            </Text>
            <Text style={styles.transType}>{cfg.label}</Text>
          </View>
          <Text
            style={[
              styles.quantity,
              { color: isPositive ? "#10B981" : "#EF4444" },
            ]}
          >
            {isPositive ? "+" : "-"}
            {item.quantity} {item.material?.unit ?? ""}
          </Text>
        </View>
        {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Bởi: {item.createdBy.name}</Text>
          <Text style={styles.footerText}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={styles.loadingText}>Đang tải lịch sử...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Không thể tải dữ liệu</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
          <Text style={styles.retryText}>Thử lại</Text>
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
          data={FILTERS}
          keyExtractor={(f) => f.key}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item: f }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                activeFilter === f.key && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(f.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === f.key && styles.filterTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="receipt-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 40,
  },
  loadingText: { fontSize: 14, color: "#666", marginTop: 8 },
  errorText: { fontSize: 15, color: "#333", fontWeight: "600" },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#0D9488",
    borderRadius: 8,
  },
  retryText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  filterBar: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
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
  list: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    gap: 8,
  },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  materialName: { fontSize: 14, fontWeight: "600", color: "#333" },
  transType: { fontSize: 12, color: "#999" },
  quantity: { fontSize: 16, fontWeight: "700" },
  notes: { fontSize: 12, color: "#666", paddingLeft: 50 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#F0F0F0",
  },
  footerText: { fontSize: 11, color: "#999" },
  emptyText: { fontSize: 14, color: "#999" },
});
