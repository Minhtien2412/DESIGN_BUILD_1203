/**
 * Unified Reports & Analytics Dashboard
 * Cross-module aggregated view: revenue, orders, progress, HR
 * Uses dashboardApi + orders.service + reporting hooks
 */

import { useAuth } from "@/context/AuthContext";
import { getOrders, type Order } from "@/services/api/orders.service";
import {
    type AdminDashboard,
    type ClientDashboard,
    type EngineerDashboard,
    getAdminDashboard,
    getClientDashboard,
    getEngineerDashboard,
} from "@/services/dashboardApi";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SW } = Dimensions.get("window");

const C = {
  primary: "#7FAF4D",
  primaryLight: "#EEF7DA",
  blue: "#3B82F6",
  blueLight: "#EFF6FF",
  orange: "#F59E0B",
  orangeLight: "#FFFBEB",
  red: "#EF4444",
  redLight: "#FEF2F2",
  purple: "#8B5CF6",
  purpleLight: "#F5F3FF",
  teal: "#14B8A6",
  tealLight: "#F0FDFA",
  text: "#111827",
  textSec: "#6B7280",
  bg: "#F9FAFB",
  card: "#FFFFFF",
  border: "#E5E7EB",
};

type TimeRange = "7d" | "30d" | "90d" | "1y";

interface AggregatedStats {
  revenue: number;
  revenueGrowth: number;
  totalOrders: number;
  pendingOrders: number;
  activeProjects: number;
  completedProjects: number;
  totalUsers: number;
  projectProgress: number; // avg %
}

export default function UnifiedReportsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [range, setRange] = useState<TimeRange>("30d");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<AggregatedStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);

      // Parallel fetch dashboard + recent orders
      const [orders, dashData] = await Promise.allSettled([
        getOrders({ page: 1, limit: 5 }),
        fetchDashboardByRole(user?.role),
      ]);

      if (orders.status === "fulfilled") {
        const orderList = Array.isArray(orders.value)
          ? orders.value
          : ((orders.value as any)?.data ?? []);
        setRecentOrders(orderList);
      }

      const aggregated: AggregatedStats = {
        revenue: 0,
        revenueGrowth: 0,
        totalOrders: 0,
        pendingOrders: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalUsers: 0,
        projectProgress: 0,
      };

      if (dashData.status === "fulfilled" && dashData.value) {
        const d = dashData.value;
        aggregated.revenue = d.totalRevenue ?? 0;
        aggregated.totalUsers = d.totalUsers ?? 0;
        aggregated.activeProjects = d.activeProjects ?? 0;
        aggregated.completedProjects = d.completedProjects ?? 0;
      }

      if (orders.status === "fulfilled") {
        const orderList = Array.isArray(orders.value)
          ? orders.value
          : ((orders.value as any)?.data ?? []);
        aggregated.totalOrders = orderList.length;
        aggregated.pendingOrders = orderList.filter(
          (o: Order) => o.status === "PENDING" || o.status === "CONFIRMED",
        ).length;
      }

      setStats(aggregated);
    } catch (err: any) {
      setError(err.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.role, range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <Stack.Screen options={{ title: "Báo cáo tổng hợp" }} />
        <View style={s.center}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Báo cáo tổng hợp",
          headerStyle: { backgroundColor: C.card },
        }}
      />

      <ScrollView
        contentContainerStyle={s.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.primary}
          />
        }
      >
        {error && (
          <View style={s.errorBanner}>
            <Ionicons name="warning-outline" size={16} color={C.red} />
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        {/* Time Range Selector */}
        <View style={s.rangeRow}>
          {(["7d", "30d", "90d", "1y"] as TimeRange[]).map((r) => (
            <TouchableOpacity
              key={r}
              style={[s.rangeBtn, range === r && s.rangeBtnActive]}
              onPress={() => setRange(r)}
            >
              <Text
                style={[s.rangeBtnText, range === r && s.rangeBtnTextActive]}
              >
                {r === "7d"
                  ? "7 ngày"
                  : r === "30d"
                    ? "30 ngày"
                    : r === "90d"
                      ? "90 ngày"
                      : "1 năm"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* KPI Cards */}
        <View style={s.kpiGrid}>
          <KPICard
            icon="cash-outline"
            label="Doanh thu"
            value={formatCurrency(stats?.revenue ?? 0)}
            color={C.primary}
            bgColor={C.primaryLight}
          />
          <KPICard
            icon="cart-outline"
            label="Đơn hàng"
            value={`${stats?.totalOrders ?? 0}`}
            color={C.blue}
            bgColor={C.blueLight}
          />
          <KPICard
            icon="construct-outline"
            label="Dự án"
            value={`${stats?.activeProjects ?? 0}`}
            sub={`${stats?.completedProjects ?? 0} xong`}
            color={C.purple}
            bgColor={C.purpleLight}
          />
          <KPICard
            icon="hourglass-outline"
            label="Chờ xử lý"
            value={`${stats?.pendingOrders ?? 0}`}
            color={C.orange}
            bgColor={C.orangeLight}
          />
        </View>

        {/* Quick Actions */}
        <Text style={s.sectionTitle}>Báo cáo chi tiết</Text>
        <View style={s.actionGrid}>
          <ActionCard
            icon="bar-chart-outline"
            label="KPI"
            desc="Chỉ số hiệu suất"
            color={C.teal}
            onPress={() => router.push("/reports/kpi" as any)}
          />
          <ActionCard
            icon="document-text-outline"
            label="Dự án"
            desc="Báo cáo dự án"
            color={C.blue}
            onPress={() => router.push("/reports" as any)}
          />
          <ActionCard
            icon="people-outline"
            label="Nhân sự"
            desc="Chấm công, lương"
            color={C.purple}
            onPress={() => router.push("/labor/attendance" as any)}
          />
          <ActionCard
            icon="trending-up-outline"
            label="Tiến độ"
            desc="Timeline dự án"
            color={C.primary}
            onPress={() => router.push("/(tabs)/timeline" as any)}
          />
        </View>

        {/* Recent Orders */}
        <Text style={s.sectionTitle}>Đơn hàng gần đây</Text>
        {recentOrders.length === 0 ? (
          <View style={s.emptyCard}>
            <Ionicons name="receipt-outline" size={32} color={C.textSec} />
            <Text style={s.emptyText}>Chưa có đơn hàng</Text>
          </View>
        ) : (
          <View style={s.card}>
            {recentOrders.slice(0, 5).map((order) => (
              <TouchableOpacity
                key={order.id}
                style={s.orderRow}
                onPress={() => router.push(`/orders/${order.id}` as any)}
              >
                <View style={s.orderInfo}>
                  <Text style={s.orderNumber}>#{order.orderNumber}</Text>
                  <Text style={s.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </Text>
                </View>
                <View style={s.orderRight}>
                  <Text style={s.orderTotal}>
                    {formatCurrency(order.total)}
                  </Text>
                  <View
                    style={[
                      s.orderBadge,
                      { backgroundColor: getStatusColor(order.status) + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        s.orderBadgeText,
                        { color: getStatusColor(order.status) },
                      ]}
                    >
                      {getStatusLabel(order.status)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───
function KPICard({
  icon,
  label,
  value,
  sub,
  color,
  bgColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  sub?: string;
  color: string;
  bgColor: string;
}) {
  return (
    <View style={[s.kpiCard, { borderLeftColor: color }]}>
      <View style={[s.kpiIcon, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={s.kpiValue}>{value}</Text>
      <Text style={s.kpiLabel}>{label}</Text>
      {sub && <Text style={s.kpiSub}>{sub}</Text>}
    </View>
  );
}

function ActionCard({
  icon,
  label,
  desc,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  desc: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={s.actionCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[s.actionIcon, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={s.actionLabel}>{label}</Text>
      <Text style={s.actionDesc}>{desc}</Text>
    </TouchableOpacity>
  );
}

// ─── Helpers ───
async function fetchDashboardByRole(
  role?: string,
): Promise<AdminDashboard | EngineerDashboard | ClientDashboard | null> {
  try {
    if (role === "admin") return await getAdminDashboard();
    if (role === "engineer" || role === "employee")
      return await getEngineerDashboard();
    return await getClientDashboard();
  } catch {
    return null;
  }
}

function formatCurrency(v: number): string {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return new Intl.NumberFormat("vi-VN").format(v);
}

function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: C.orange,
    CONFIRMED: C.blue,
    PROCESSING: C.purple,
    SHIPPING: C.teal,
    DELIVERED: C.primary,
    COMPLETED: C.primary,
    CANCELLED: C.red,
    REFUNDED: C.red,
  };
  return map[status] || C.textSec;
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: "Chờ",
    CONFIRMED: "Xác nhận",
    PROCESSING: "Xử lý",
    SHIPPING: "Giao",
    DELIVERED: "Đã giao",
    COMPLETED: "Xong",
    CANCELLED: "Hủy",
    REFUNDED: "Hoàn tiền",
  };
  return map[status] || status;
}

// ─── Styles ───
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.redLight,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  errorText: { color: C.red, fontSize: 13, flex: 1 },
  rangeRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  rangeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
  },
  rangeBtnActive: { backgroundColor: C.primary, borderColor: C.primary },
  rangeBtnText: { fontSize: 13, color: C.textSec, fontWeight: "500" },
  rangeBtnTextActive: { color: C.card },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  kpiCard: {
    width: (SW - 42) / 2,
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  kpiIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  kpiValue: { fontSize: 20, fontWeight: "700", color: C.text },
  kpiLabel: { fontSize: 12, color: C.textSec, marginTop: 2 },
  kpiSub: { fontSize: 11, color: C.primary, marginTop: 2 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
    marginBottom: 12,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  actionCard: {
    width: (SW - 42) / 2,
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 14,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionLabel: { fontSize: 14, fontWeight: "600", color: C.text },
  actionDesc: { fontSize: 12, color: C.textSec, marginTop: 2 },
  card: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  emptyCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    marginBottom: 16,
    elevation: 1,
  },
  emptyText: { color: C.textSec, fontSize: 14, marginTop: 8 },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  orderInfo: { flex: 1 },
  orderNumber: { fontSize: 14, fontWeight: "600", color: C.text },
  orderDate: { fontSize: 12, color: C.textSec, marginTop: 2 },
  orderRight: { alignItems: "flex-end" },
  orderTotal: { fontSize: 14, fontWeight: "600", color: C.text },
  orderBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  orderBadgeText: { fontSize: 11, fontWeight: "600" },
});
