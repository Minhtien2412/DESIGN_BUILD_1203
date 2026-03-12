/**
 * Equipment Detail Screen
 * Chi tiết thiết bị với lịch sử bảo trì, booking, nhật ký sử dụng
 *
 * Features:
 * - Equipment info card with status badge
 * - Maintenance history timeline
 * - Usage log list
 * - Booking schedule
 * - Edit/Delete actions
 *
 * API: GET /equipment/:id (falls back to mock data)
 * @created 2026-02-27
 */

import {
    type Equipment,
    type MaintenanceRecord,
    type UsageLog,
    MOCK_EQUIPMENT,
    MOCK_MAINTENANCE_RECORDS,
    MOCK_USAGE_LOGS,
} from "@/services/api/equipment.mock";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SW } = Dimensions.get("window");

const COLORS = {
  primary: "#0D9488",
  primaryDark: "#0F766E",
  bg: "#F8FAFC",
  card: "#FFFFFF",
  text: "#0F172A",
  textSec: "#64748B",
  border: "#E2E8F0",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
};

const STATUS_MAP: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  available: {
    label: "Sẵn sàng",
    color: COLORS.success,
    icon: "checkmark-circle",
  },
  "in-use": { label: "Đang sử dụng", color: COLORS.info, icon: "construct" },
  maintenance: { label: "Bảo trì", color: COLORS.warning, icon: "build" },
  broken: { label: "Hỏng", color: COLORS.error, icon: "alert-circle" },
  reserved: { label: "Đã đặt", color: "#8B5CF6", icon: "bookmark" },
};

const CONDITION_MAP: Record<string, { label: string; color: string }> = {
  excellent: { label: "Xuất sắc", color: COLORS.success },
  good: { label: "Tốt", color: COLORS.primary },
  fair: { label: "Trung bình", color: COLORS.warning },
  poor: { label: "Kém", color: COLORS.error },
};

const CATEGORY_MAP: Record<string, { label: string; icon: string }> = {
  heavy: { label: "Thiết bị nặng", icon: "truck" },
  power: { label: "Dụng cụ điện", icon: "flash" },
  lifting: { label: "Nâng hạ", icon: "arrow-up" },
  concrete: { label: "Bê tông", icon: "cube" },
  welding: { label: "Hàn", icon: "flame" },
  measuring: { label: "Đo lường", icon: "analytics" },
  safety: { label: "An toàn", icon: "shield-checkmark" },
  other: { label: "Khác", icon: "hardware-chip" },
};

const MAINTENANCE_TYPE_MAP: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  routine: { label: "Định kỳ", color: COLORS.primary, icon: "timer-outline" },
  repair: { label: "Sửa chữa", color: COLORS.warning, icon: "build-outline" },
  inspection: { label: "Kiểm tra", color: COLORS.info, icon: "search-outline" },
  calibration: {
    label: "Hiệu chuẩn",
    color: "#8B5CF6",
    icon: "settings-outline",
  },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

// ═══════════════════════════════════════════════════════════════════════
// INFO ROW
// ═══════════════════════════════════════════════════════════════════════

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <View style={s.infoRow}>
    <View style={s.infoIcon}>
      <Ionicons name={icon as any} size={16} color={COLORS.textSec} />
    </View>
    <Text style={s.infoLabel}>{label}</Text>
    <Text style={s.infoValue}>{value}</Text>
  </View>
);

// ═══════════════════════════════════════════════════════════════════════
// MAINTENANCE CARD
// ═══════════════════════════════════════════════════════════════════════

const MaintenanceCard = React.memo<{ record: MaintenanceRecord }>(
  ({ record }) => {
    const typeConfig =
      MAINTENANCE_TYPE_MAP[record.type] || MAINTENANCE_TYPE_MAP.routine;
    return (
      <View style={s.maintCard}>
        <View style={[s.maintDot, { backgroundColor: typeConfig.color }]}>
          <Ionicons name={typeConfig.icon as any} size={12} color="#fff" />
        </View>
        <View style={s.maintContent}>
          <View style={s.maintHeader}>
            <Text style={s.maintType}>{typeConfig.label}</Text>
            <Text style={s.maintDate}>{formatDate(record.performedAt)}</Text>
          </View>
          <Text style={s.maintDesc} numberOfLines={2}>
            {record.description}
          </Text>
          <View style={s.maintMeta}>
            <Text style={s.maintMetaText}>
              <Ionicons name="person-outline" size={10} /> {record.performedBy}
            </Text>
            {record.cost != null && record.cost > 0 && (
              <Text style={s.maintCost}>{formatCurrency(record.cost)}</Text>
            )}
          </View>
        </View>
      </View>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════
// USAGE LOG CARD
// ═══════════════════════════════════════════════════════════════════════

const UsageLogCard = React.memo<{ log: UsageLog }>(({ log }) => (
  <View style={s.usageCard}>
    <View style={s.usageLeft}>
      <Text style={s.usageDate}>{formatDate(log.startTime)}</Text>
      <Text style={s.usageHours}>{log.hours}h</Text>
    </View>
    <View style={s.usageDivider} />
    <View style={s.usageRight}>
      <Text style={s.usageOperator}>{log.operator}</Text>
      {log.location && (
        <View style={s.usageLocationRow}>
          <Ionicons name="location-outline" size={10} color={COLORS.textSec} />
          <Text style={s.usageLocation}>{log.location}</Text>
        </View>
      )}
      {log.fuelUsed && <Text style={s.usageFuel}>⛽ {log.fuelUsed}L</Text>}
    </View>
  </View>
));

// ═══════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════

export default function EquipmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [usage, setUsage] = useState<UsageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "maintenance" | "usage">(
    "info",
  );

  const loadData = useCallback(async () => {
    try {
      // Try API first, fallback to mock
      const eq = MOCK_EQUIPMENT.find((e) => e.id === id) || null;
      const maint =
        MOCK_MAINTENANCE_RECORDS?.filter((m) => m.equipmentId === id) || [];
      const logs = MOCK_USAGE_LOGS?.filter((l) => l.equipmentId === id) || [];

      setEquipment(eq);
      setMaintenance(maint);
      setUsage(logs);
    } catch (error) {
      console.error("[EquipmentDetail] Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const statusConfig = equipment ? STATUS_MAP[equipment.status] : null;
  const conditionConfig = equipment ? CONDITION_MAP[equipment.condition] : null;
  const categoryConfig = equipment ? CATEGORY_MAP[equipment.category] : null;

  const totalHoursUsed = useMemo(
    () => usage.reduce((sum, l) => sum + l.hours, 0),
    [usage],
  );
  const totalMaintCost = useMemo(
    () => maintenance.reduce((sum, m) => sum + (m.cost || 0), 0),
    [maintenance],
  );

  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={s.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (!equipment) {
    return (
      <View style={s.errorContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color={COLORS.textSec}
        />
        <Text style={s.errorText}>Không tìm thấy thiết bị</Text>
        <TouchableOpacity style={s.retryBtn} onPress={() => router.back()}>
          <Text style={s.retryText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[s.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={s.header}
        >
          <View style={s.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={s.headerTitle} numberOfLines={1}>
              {equipment.name}
            </Text>
            <TouchableOpacity style={s.menuBtn}>
              <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Status & Condition */}
          <View style={s.headerBadges}>
            {statusConfig && (
              <View
                style={[
                  s.badge,
                  { backgroundColor: statusConfig.color + "20" },
                ]}
              >
                <Ionicons
                  name={statusConfig.icon as any}
                  size={14}
                  color={statusConfig.color}
                />
                <Text style={[s.badgeText, { color: statusConfig.color }]}>
                  {statusConfig.label}
                </Text>
              </View>
            )}
            {conditionConfig && (
              <View
                style={[
                  s.badge,
                  { backgroundColor: conditionConfig.color + "20" },
                ]}
              >
                <Text style={[s.badgeText, { color: conditionConfig.color }]}>
                  {conditionConfig.label}
                </Text>
              </View>
            )}
          </View>

          {/* Quick Stats */}
          <View style={s.quickStats}>
            <View style={s.qStat}>
              <Text style={s.qStatValue}>{totalHoursUsed}h</Text>
              <Text style={s.qStatLabel}>Giờ hoạt động</Text>
            </View>
            <View style={s.qStatDivider} />
            <View style={s.qStat}>
              <Text style={s.qStatValue}>{maintenance.length}</Text>
              <Text style={s.qStatLabel}>Bảo trì</Text>
            </View>
            <View style={s.qStatDivider} />
            <View style={s.qStat}>
              <Text style={s.qStatValue}>
                {totalMaintCost > 0
                  ? `${(totalMaintCost / 1_000_000).toFixed(1)}tr`
                  : "0"}
              </Text>
              <Text style={s.qStatLabel}>Chi phí BT</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Tab Switcher */}
        <View style={s.tabRow}>
          {(
            [
              {
                key: "info",
                label: "Thông tin",
                icon: "information-circle-outline",
              },
              { key: "maintenance", label: "Bảo trì", icon: "build-outline" },
              { key: "usage", label: "Nhật ký", icon: "time-outline" },
            ] as const
          ).map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[s.tab, activeTab === tab.key && s.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons
                name={tab.icon as any}
                size={16}
                color={activeTab === tab.key ? COLORS.primary : COLORS.textSec}
              />
              <Text
                style={[s.tabLabel, activeTab === tab.key && s.tabLabelActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          style={s.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* ─── INFO TAB ─── */}
          {activeTab === "info" && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Thông tin thiết bị</Text>
              <View style={s.infoCard}>
                {categoryConfig && (
                  <InfoRow
                    icon={categoryConfig.icon}
                    label="Loại"
                    value={categoryConfig.label}
                  />
                )}
                {equipment.model && (
                  <InfoRow
                    icon="hardware-chip-outline"
                    label="Model"
                    value={equipment.model}
                  />
                )}
                {equipment.serialNumber && (
                  <InfoRow
                    icon="barcode-outline"
                    label="Serial"
                    value={equipment.serialNumber}
                  />
                )}
                {equipment.location && (
                  <InfoRow
                    icon="location-outline"
                    label="Vị trí"
                    value={equipment.location}
                  />
                )}
                {equipment.assignedTo && (
                  <InfoRow
                    icon="person-outline"
                    label="Phụ trách"
                    value={equipment.assignedTo}
                  />
                )}
                {equipment.currentProject && (
                  <InfoRow
                    icon="business-outline"
                    label="Dự án"
                    value={equipment.currentProject}
                  />
                )}
                {equipment.purchaseDate && (
                  <InfoRow
                    icon="calendar-outline"
                    label="Ngày mua"
                    value={formatDate(equipment.purchaseDate)}
                  />
                )}
                {equipment.warranty && (
                  <InfoRow
                    icon="shield-outline"
                    label="Bảo hành"
                    value={equipment.warranty}
                  />
                )}
                {equipment.lastMaintenance && (
                  <InfoRow
                    icon="build-outline"
                    label="Bảo trì gần nhất"
                    value={formatDate(equipment.lastMaintenance)}
                  />
                )}
                {equipment.nextMaintenance && (
                  <InfoRow
                    icon="alarm-outline"
                    label="Bảo trì tiếp"
                    value={formatDate(equipment.nextMaintenance)}
                  />
                )}
                {equipment.totalHours != null && (
                  <InfoRow
                    icon="timer-outline"
                    label="Tổng giờ máy"
                    value={`${equipment.totalHours} giờ`}
                  />
                )}
              </View>

              {equipment.notes && (
                <View style={[s.infoCard, { marginTop: 12 }]}>
                  <Text style={s.notesTitle}>Ghi chú</Text>
                  <Text style={s.notesText}>{equipment.notes}</Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={s.actions}>
                <TouchableOpacity style={s.actionBtn}>
                  <Ionicons
                    name="create-outline"
                    size={18}
                    color={COLORS.primary}
                  />
                  <Text style={s.actionBtnText}>Chỉnh sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.actionBtn}>
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={COLORS.info}
                  />
                  <Text style={[s.actionBtnText, { color: COLORS.info }]}>
                    Đặt lịch
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.actionBtn}>
                  <Ionicons
                    name="qr-code-outline"
                    size={18}
                    color={COLORS.textSec}
                  />
                  <Text style={[s.actionBtnText, { color: COLORS.textSec }]}>
                    QR Code
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ─── MAINTENANCE TAB ─── */}
          {activeTab === "maintenance" && (
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Lịch sử bảo trì</Text>
                <TouchableOpacity style={s.addBtn}>
                  <Ionicons name="add" size={18} color="#fff" />
                  <Text style={s.addBtnText}>Thêm</Text>
                </TouchableOpacity>
              </View>

              {maintenance.length === 0 ? (
                <View style={s.emptyState}>
                  <Ionicons
                    name="build-outline"
                    size={48}
                    color={COLORS.border}
                  />
                  <Text style={s.emptyText}>Chưa có lịch sử bảo trì</Text>
                </View>
              ) : (
                maintenance.map((record) => (
                  <MaintenanceCard key={record.id} record={record} />
                ))
              )}
            </View>
          )}

          {/* ─── USAGE TAB ─── */}
          {activeTab === "usage" && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Nhật ký sử dụng</Text>

              {usage.length === 0 ? (
                <View style={s.emptyState}>
                  <Ionicons
                    name="time-outline"
                    size={48}
                    color={COLORS.border}
                  />
                  <Text style={s.emptyText}>Chưa có nhật ký sử dụng</Text>
                </View>
              ) : (
                usage.map((log) => <UsageLogCard key={log.id} log={log} />)
              )}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bg,
  },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.textSec },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bg,
    padding: 40,
  },
  errorText: { fontSize: 16, color: COLORS.textSec, marginVertical: 16 },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryText: { fontSize: 14, fontWeight: "600", color: "#fff" },

  // Header
  header: { paddingHorizontal: 16, paddingBottom: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  backBtn: { padding: 4 },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 12,
  },
  menuBtn: { padding: 4 },
  headerBadges: { flexDirection: "row", gap: 8, marginTop: 12, marginLeft: 36 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { fontSize: 12, fontWeight: "600" },

  // Quick Stats
  quickStats: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    marginTop: 16,
    padding: 12,
  },
  qStat: { flex: 1, alignItems: "center" },
  qStatValue: { fontSize: 16, fontWeight: "800", color: "#fff" },
  qStatLabel: { fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  qStatDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: 4,
  },

  // Tabs
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 12,
  },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabLabel: { fontSize: 13, fontWeight: "500", color: COLORS.textSec },
  tabLabelActive: { color: COLORS.primary, fontWeight: "700" },

  // Content
  content: { flex: 1 },
  section: { padding: 16 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addBtnText: { fontSize: 12, fontWeight: "600", color: "#fff" },

  // Info Card
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  infoIcon: { width: 28, alignItems: "center" },
  infoLabel: { flex: 1, fontSize: 13, color: COLORS.textSec, marginLeft: 4 },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    maxWidth: "50%" as any,
    textAlign: "right",
  },
  notesTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  notesText: { fontSize: 13, color: COLORS.textSec, lineHeight: 20 },

  // Actions
  actions: { flexDirection: "row", gap: 10, marginTop: 16 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionBtnText: { fontSize: 12, fontWeight: "600", color: COLORS.primary },

  // Maintenance Card
  maintCard: { flexDirection: "row", marginBottom: 12 },
  maintDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 2,
  },
  maintContent: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  maintHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  maintType: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  maintDate: { fontSize: 11, color: COLORS.textSec },
  maintDesc: {
    fontSize: 12,
    color: COLORS.textSec,
    marginTop: 4,
    lineHeight: 18,
  },
  maintMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  maintMetaText: { fontSize: 11, color: COLORS.textSec },
  maintCost: { fontSize: 12, fontWeight: "700", color: COLORS.error },

  // Usage Card
  usageCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  usageLeft: { width: 60, alignItems: "center", justifyContent: "center" },
  usageDate: { fontSize: 10, color: COLORS.textSec },
  usageHours: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primary,
    marginTop: 2,
  },
  usageDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 10,
  },
  usageRight: { flex: 1, justifyContent: "center" },
  usageOperator: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  usageLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 3,
  },
  usageLocation: { fontSize: 11, color: COLORS.textSec },
  usageFuel: {
    fontSize: 11,
    color: COLORS.warning,
    fontWeight: "500",
    marginTop: 2,
  },

  // Empty
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 14, color: COLORS.textSec, marginTop: 12 },
});
