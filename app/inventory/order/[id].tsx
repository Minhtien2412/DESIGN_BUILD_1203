import { useMaterialOrders } from "@/hooks/useInventory";
import type { MaterialOrderItem } from "@/types/inventory";
import { OrderStatus } from "@/types/inventory";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string }
> = {
  [OrderStatus.DRAFT]: { label: "Nháp", color: "#6B7280", bg: "#F3F4F6" },
  [OrderStatus.PENDING]: {
    label: "Chờ duyệt",
    color: "#F59E0B",
    bg: "#FFFBEB",
  },
  [OrderStatus.APPROVED]: {
    label: "Đã duyệt",
    color: "#3B82F6",
    bg: "#EFF6FF",
  },
  [OrderStatus.ORDERED]: { label: "Đã đặt", color: "#8B5CF6", bg: "#F5F3FF" },
  [OrderStatus.PARTIALLY_RECEIVED]: {
    label: "Nhận 1 phần",
    color: "#F97316",
    bg: "#FFF7ED",
  },
  [OrderStatus.RECEIVED]: { label: "Đã nhận", color: "#10B981", bg: "#ECFDF5" },
  [OrderStatus.CANCELLED]: { label: "Đã hủy", color: "#EF4444", bg: "#FEF2F2" },
};

const formatCurrency = (amount: number) =>
  amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
};

export default function OrderDetailScreen() {
  const { id, projectId } = useLocalSearchParams<{
    id: string;
    projectId?: string;
  }>();
  const { orders, loading, error, approveOrder, cancelOrder } =
    useMaterialOrders(projectId || "");

  const order = useMemo(() => orders.find((o) => o.id === id), [orders, id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>
          {error ? "Không thể tải dữ liệu" : "Không tìm thấy đơn hàng"}
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
          <Text style={styles.retryText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusCfg = STATUS_CONFIG[order.status];
  const canApprove = order.status === OrderStatus.PENDING;
  const canCancel =
    order.status === OrderStatus.DRAFT || order.status === OrderStatus.PENDING;

  const handleApprove = async () => {
    try {
      await approveOrder(order.id);
    } catch {
      // Error handled by hook
    }
  };

  const handleCancel = async () => {
    try {
      await cancelOrder(order.id);
    } catch {
      // Error handled by hook
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.orderNumber}>
            {order.orderNo || order.orderNumber}
          </Text>
          <Text style={styles.supplierName}>
            {order.supplier?.name ?? order.supplierId}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
          <Text style={[styles.statusText, { color: statusCfg.color }]}>
            {statusCfg.label}
          </Text>
        </View>
      </View>

      {/* Dates Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thời gian</Text>
        <InfoRow label="Ngày đặt" value={formatDate(order.orderDate)} />
        <InfoRow
          label="Giao dự kiến"
          value={formatDate(order.expectedDeliveryDate)}
        />
        {order.actualDeliveryDate && (
          <InfoRow
            label="Giao thực tế"
            value={formatDate(order.actualDeliveryDate)}
          />
        )}
      </View>

      {/* People Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Người phụ trách</Text>
        <InfoRow label="Người đặt" value={order.orderedBy.name} />
        {order.approvedBy && (
          <InfoRow label="Người duyệt" value={order.approvedBy.name} />
        )}
      </View>

      {/* Items Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mặt hàng ({order.items.length})</Text>
        {order.items.map((item: MaterialOrderItem) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>
                {item.material?.name ?? item.materialId}
              </Text>
              <Text style={styles.itemMeta}>
                SL: {item.quantity} — Đã nhận: {item.receivedQuantity}
              </Text>
            </View>
            <Text style={styles.itemAmount}>{formatCurrency(item.amount)}</Text>
          </View>
        ))}
      </View>

      {/* Pricing Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Chi phí</Text>
        <InfoRow label="Tạm tính" value={formatCurrency(order.subtotal)} />
        <InfoRow
          label={`Thuế (${(order.taxRate * 100).toFixed(0)}%)`}
          value={formatCurrency(order.taxAmount)}
        />
        <InfoRow
          label="Vận chuyển"
          value={formatCurrency(order.shippingCost)}
        />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng cộng</Text>
          <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
        </View>
      </View>

      {order.notes && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ghi chú</Text>
          <Text style={styles.notes}>{order.notes}</Text>
        </View>
      )}

      {/* Actions */}
      {(canApprove || canCancel) && (
        <View style={styles.actions}>
          {canApprove && (
            <TouchableOpacity style={styles.approveBtn} onPress={handleApprove}>
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text style={styles.actionText}>Duyệt đơn hàng</Text>
            </TouchableOpacity>
          )}
          {canCancel && (
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Ionicons name="close-circle" size={18} color="#EF4444" />
              <Text style={[styles.actionText, { color: "#EF4444" }]}>
                Hủy đơn hàng
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 16, paddingBottom: 40 },
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
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  orderNumber: { fontSize: 20, fontWeight: "700", color: "#1F2937" },
  supplierName: { fontSize: 14, color: "#6B7280", marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: "600" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F3F4F6",
  },
  infoLabel: { fontSize: 13, color: "#6B7280" },
  infoValue: { fontSize: 13, fontWeight: "600", color: "#374151" },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F3F4F6",
  },
  itemName: { fontSize: 13, fontWeight: "600", color: "#374151" },
  itemMeta: { fontSize: 12, color: "#9CA3AF" },
  itemAmount: { fontSize: 14, fontWeight: "700", color: "#374151" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginTop: 4,
  },
  totalLabel: { fontSize: 15, fontWeight: "700", color: "#374151" },
  totalValue: { fontSize: 18, fontWeight: "700", color: "#0D9488" },
  notes: { fontSize: 13, color: "#6B7280", lineHeight: 20 },
  actions: { marginTop: 8, gap: 10 },
  approveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#10B981",
    paddingVertical: 12,
    borderRadius: 10,
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  actionText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
