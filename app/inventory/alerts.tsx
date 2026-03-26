import { useStockAlerts } from "@/hooks/useInventory";
import type { StockAlert } from "@/types/inventory";
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

type SeverityKey = "ALL" | "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

const SEVERITY_FILTERS: { key: SeverityKey; label: string }[] = [
  { key: "ALL", label: "Tất cả" },
  { key: "CRITICAL", label: "Nghiêm trọng" },
  { key: "HIGH", label: "Cao" },
  { key: "MEDIUM", label: "Trung bình" },
  { key: "LOW", label: "Thấp" },
];

const SEVERITY_CONFIG: Record<
  string,
  { icon: string; color: string; bg: string }
> = {
  CRITICAL: { icon: "alert-circle", color: "#EF4444", bg: "#FEF2F2" },
  HIGH: { icon: "warning", color: "#F59E0B", bg: "#FFFBEB" },
  MEDIUM: { icon: "information-circle", color: "#3B82F6", bg: "#EFF6FF" },
  LOW: { icon: "checkmark-circle", color: "#10B981", bg: "#ECFDF5" },
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
};

export default function AlertsScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { alerts, loading, error, refetch } = useStockAlerts(projectId || "");
  const [activeFilter, setActiveFilter] = useState<SeverityKey>("ALL");

  const filtered = useMemo(() => {
    if (activeFilter === "ALL") return alerts;
    return alerts.filter((a) => a.severity === activeFilter);
  }, [alerts, activeFilter]);

  const renderAlert = ({ item }: { item: StockAlert }) => {
    const cfg = SEVERITY_CONFIG[item.severity] ?? SEVERITY_CONFIG.LOW;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push(
            `/inventory/material/${item.materialId}?projectId=${projectId}` as Href,
          )
        }
      >
        <View style={styles.cardRow}>
          <View style={[styles.iconCircle, { backgroundColor: cfg.bg }]}>
            <Ionicons name={cfg.icon as any} size={20} color={cfg.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>{item.message}</Text>
            <Text style={styles.alertMeta}>Vật tư: {item.materialId}</Text>
          </View>
        </View>
        <View style={styles.footer}>
          <View style={[styles.severityBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.severityText, { color: cfg.color }]}>
              {item.severity}
            </Text>
          </View>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={styles.loadingText}>Đang tải cảnh báo...</Text>
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
      {/* Severity Filter */}
      <View style={styles.filterBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={SEVERITY_FILTERS}
          keyExtractor={(f) => f.key}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item: f }) => {
            const isActive = f.key === activeFilter;
            return (
              <TouchableOpacity
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(f.key)}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive && styles.filterTextActive,
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((s) => {
          const count = alerts.filter((a) => a.severity === s).length;
          const cfg = SEVERITY_CONFIG[s];
          return (
            <View key={s} style={styles.summaryItem}>
              <Ionicons name={cfg.icon as any} size={16} color={cfg.color} />
              <Text style={[styles.summaryCount, { color: cfg.color }]}>
                {count}
              </Text>
            </View>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        renderItem={renderAlert}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons
              name="checkmark-circle-outline"
              size={48}
              color="#10B981"
            />
            <Text style={styles.emptyText}>Không có cảnh báo</Text>
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
  filterChipActive: { backgroundColor: "#EF4444" },
  filterText: { fontSize: 13, color: "#666", fontWeight: "500" },
  filterTextActive: { color: "#fff" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 10,
    marginBottom: 4,
  },
  summaryItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  summaryCount: { fontSize: 15, fontWeight: "700" },
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
  alertTitle: { fontSize: 14, fontWeight: "600", color: "#333" },
  alertMeta: { fontSize: 12, color: "#999" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  severityText: { fontSize: 11, fontWeight: "600" },
  dateText: { fontSize: 11, color: "#999" },
  emptyText: { fontSize: 14, color: "#999" },
});
