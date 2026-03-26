import { useMaterial } from "@/hooks/useInventory";
import { MaterialCategory, MaterialUnit, StockStatus } from "@/types/inventory";
import { Ionicons } from "@expo/vector-icons";
import { Href, router, useLocalSearchParams } from "expo-router";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const CATEGORY_LABELS: Record<MaterialCategory, string> = {
  [MaterialCategory.CEMENT]: "Xi măng",
  [MaterialCategory.STEEL]: "Thép",
  [MaterialCategory.SAND]: "Cát",
  [MaterialCategory.GRAVEL]: "Đá/Sỏi",
  [MaterialCategory.BRICK]: "Gạch",
  [MaterialCategory.TILE]: "Gạch ốp lát",
  [MaterialCategory.PAINT]: "Sơn",
  [MaterialCategory.WOOD]: "Gỗ",
  [MaterialCategory.ELECTRICAL]: "Điện",
  [MaterialCategory.PLUMBING]: "Ống nước",
  [MaterialCategory.TOOLS]: "Dụng cụ",
  [MaterialCategory.SAFETY_EQUIPMENT]: "Bảo hộ",
  [MaterialCategory.OTHER]: "Khác",
};

const UNIT_LABELS: Record<MaterialUnit, string> = {
  [MaterialUnit.KG]: "kg",
  [MaterialUnit.TON]: "tấn",
  [MaterialUnit.M]: "m",
  [MaterialUnit.M2]: "m²",
  [MaterialUnit.M3]: "m³",
  [MaterialUnit.PIECE]: "cái",
  [MaterialUnit.BOX]: "hộp",
  [MaterialUnit.BAG]: "bao",
  [MaterialUnit.LITER]: "lít",
  [MaterialUnit.SET]: "bộ",
};

const STOCK_STATUS_CONFIG: Record<
  StockStatus,
  { label: string; color: string; bg: string }
> = {
  [StockStatus.IN_STOCK]: {
    label: "Còn hàng",
    color: "#10B981",
    bg: "#ECFDF5",
  },
  [StockStatus.LOW_STOCK]: {
    label: "Sắp hết",
    color: "#F59E0B",
    bg: "#FFFBEB",
  },
  [StockStatus.OUT_OF_STOCK]: {
    label: "Hết hàng",
    color: "#EF4444",
    bg: "#FEF2F2",
  },
  [StockStatus.ORDERED]: { label: "Đã đặt", color: "#3B82F6", bg: "#EFF6FF" },
};

const getStockStatus = (current: number, min: number): StockStatus => {
  if (current <= 0) return StockStatus.OUT_OF_STOCK;
  if (current <= min) return StockStatus.LOW_STOCK;
  return StockStatus.IN_STOCK;
};

const formatCurrency = (amount: number) =>
  amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
};

export default function MaterialDetailScreen() {
  const { id, projectId } = useLocalSearchParams<{
    id: string;
    projectId?: string;
  }>();
  const { material, loading, error } = useMaterial(id);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={styles.loadingText}>Đang tải chi tiết...</Text>
      </View>
    );
  }

  if (error || !material) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>
          {error ? "Không thể tải dữ liệu" : "Không tìm thấy vật liệu"}
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
          <Text style={styles.retryText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status = getStockStatus(material.currentStock, material.minStock);
  const statusCfg = STOCK_STATUS_CONFIG[status];
  const stockPercent = material.maxStock
    ? Math.min((material.currentStock / material.maxStock) * 100, 100)
    : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{material.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
          <Text style={[styles.statusText, { color: statusCfg.color }]}>
            {statusCfg.label}
          </Text>
        </View>
      </View>

      {material.description && (
        <Text style={styles.description}>{material.description}</Text>
      )}

      {/* Stock Overview Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tồn kho</Text>
        <View style={styles.stockRow}>
          <View style={styles.stockItem}>
            <Text style={styles.stockLabel}>Hiện tại</Text>
            <Text style={[styles.stockValue, { color: statusCfg.color }]}>
              {material.currentStock} {UNIT_LABELS[material.unit]}
            </Text>
          </View>
          <View style={styles.stockItem}>
            <Text style={styles.stockLabel}>Tối thiểu</Text>
            <Text style={styles.stockValue}>
              {material.minStock} {UNIT_LABELS[material.unit]}
            </Text>
          </View>
          {material.maxStock && (
            <View style={styles.stockItem}>
              <Text style={styles.stockLabel}>Tối đa</Text>
              <Text style={styles.stockValue}>
                {material.maxStock} {UNIT_LABELS[material.unit]}
              </Text>
            </View>
          )}
        </View>

        {material.maxStock ? (
          <View style={styles.progressContainer}>
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${stockPercent}%`,
                    backgroundColor: statusCfg.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{stockPercent.toFixed(0)}%</Text>
          </View>
        ) : null}
      </View>

      {/* Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thông tin</Text>
        <InfoRow label="Danh mục" value={CATEGORY_LABELS[material.category]} />
        <InfoRow label="Đơn vị" value={UNIT_LABELS[material.unit]} />
        <InfoRow label="Đơn giá" value={formatCurrency(material.unitPrice)} />
        <InfoRow
          label="Tổng giá trị"
          value={formatCurrency(material.totalValue)}
        />
        {material.warehouseLocation && (
          <InfoRow label="Vị trí kho" value={material.warehouseLocation} />
        )}
        {material.lastRestocked && (
          <InfoRow
            label="Nhập kho lần cuối"
            value={formatDate(material.lastRestocked)}
          />
        )}
      </View>

      {/* Supplier Card */}
      {material.supplier && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Nhà cung cấp</Text>
          <InfoRow label="Tên" value={material.supplier.name} />
          <InfoRow label="Liên hệ" value={material.supplier.contactPerson} />
          <InfoRow label="SĐT" value={material.supplier.phone} />
          <InfoRow label="Email" value={material.supplier.email} />
        </View>
      )}

      {/* Timestamps */}
      <View style={styles.card}>
        <InfoRow label="Tạo ngày" value={formatDate(material.createdAt)} />
        <InfoRow label="Cập nhật" value={formatDate(material.updatedAt)} />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() =>
            router.push(
              `/inventory/transactions?projectId=${material.projectId}&materialId=${material.id}` as Href,
            )
          }
        >
          <Ionicons name="receipt-outline" size={18} color="#fff" />
          <Text style={styles.actionText}>Lịch sử giao dịch</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  name: { fontSize: 20, fontWeight: "700", color: "#1F2937", flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: "600" },
  description: { fontSize: 14, color: "#6B7280", marginBottom: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 4,
  },
  stockRow: { flexDirection: "row", justifyContent: "space-around" },
  stockItem: { alignItems: "center", gap: 2 },
  stockLabel: { fontSize: 12, color: "#9CA3AF" },
  stockValue: { fontSize: 18, fontWeight: "700", color: "#374151" },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  progressBg: {
    flex: 1,
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3 },
  progressText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    width: 36,
    textAlign: "right",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F3F4F6",
  },
  infoLabel: { fontSize: 13, color: "#6B7280" },
  infoValue: { fontSize: 13, fontWeight: "600", color: "#374151" },
  actions: { marginTop: 8, gap: 8 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0D9488",
    paddingVertical: 12,
    borderRadius: 10,
  },
  actionText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
