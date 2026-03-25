/**
 * Staff Reports Screen
 * Aggregated labor analytics: attendance, payroll, performance
 * Uses real data from useLabor hooks
 */

import {
    useAttendanceSummary,
    usePayrollSummary,
    useWorkerSummary,
} from "@/hooks/useLabor";
import { useProjects } from "@/hooks/useProjects";
import { PayrollStatus, WorkerRole } from "@/types/labor";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const C = {
  primary: "#0D9488",
  primaryBg: "#F0FDFA",
  blue: "#3B82F6",
  blueBg: "#EFF6FF",
  orange: "#F59E0B",
  orangeBg: "#FFFBEB",
  red: "#EF4444",
  redBg: "#FEF2F2",
  green: "#10B981",
  greenBg: "#ECFDF5",
  purple: "#8B5CF6",
  purpleBg: "#F5F3FF",
  text: "#111827",
  textSec: "#6B7280",
  bg: "#F9FAFB",
  card: "#FFFFFF",
  border: "#E5E7EB",
};

type TimeRange = "today" | "week" | "month";

const ROLE_LABELS: Partial<Record<WorkerRole, string>> = {
  [WorkerRole.FOREMAN]: "Đốc công",
  [WorkerRole.SKILLED_WORKER]: "Thợ chính",
  [WorkerRole.UNSKILLED_WORKER]: "Phụ hồ",
  [WorkerRole.ELECTRICIAN]: "Thợ điện",
  [WorkerRole.PLUMBER]: "Thợ nước",
  [WorkerRole.CARPENTER]: "Thợ mộc",
  [WorkerRole.MASON]: "Thợ nề",
  [WorkerRole.PAINTER]: "Thợ sơn",
  [WorkerRole.WELDER]: "Thợ hàn",
  [WorkerRole.ENGINEER]: "Kỹ sư",
  [WorkerRole.SUPERVISOR]: "Giám sát",
};

function formatCurrency(amount: number): string {
  if (amount >= 1e9) return `${(amount / 1e9).toFixed(1)} tỷ`;
  if (amount >= 1e6) return `${(amount / 1e6).toFixed(1)}tr`;
  if (amount >= 1e3) return `${(amount / 1e3).toFixed(0)}K`;
  return new Intl.NumberFormat("vi-VN").format(amount);
}

function getDateRange(range: TimeRange): { start: string; end: string } {
  const now = new Date();
  const end = now.toISOString().split("T")[0];
  let start: string;
  if (range === "today") {
    start = end;
  } else if (range === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    start = d.toISOString().split("T")[0];
  } else {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    start = d.toISOString().split("T")[0];
  }
  return { start, end };
}

export default function StaffReportsScreen() {
  const [timeRange, setTimeRange] = useState<TimeRange>("today");
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const { start: periodStart, end: periodEnd } = useMemo(
    () => getDateRange(timeRange),
    [timeRange],
  );

  const { summary: workerSummary, loading: wLoad } = useWorkerSummary();
  const { summary: attendanceSummary, loading: aLoad } =
    useAttendanceSummary(today);
  const { summary: payrollSummary, loading: pLoad } = usePayrollSummary(
    periodStart,
    periodEnd,
  );
  const { projects } = useProjects();

  const loading = wLoad || aLoad || pLoad;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const activeProjects = projects.filter(
    (p) => p.status === "active" || p.status === "planning",
  ).length;

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={s.container}>
        <Stack.Screen options={{ title: "Báo cáo nhân sự" }} />
        <View style={s.center}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={s.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Báo cáo nhân sự",
          headerStyle: { backgroundColor: C.card },
        }}
      />

      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.primary}
          />
        }
      >
        {/* Time Range Selector */}
        <View style={s.timeRow}>
          {(["today", "week", "month"] as TimeRange[]).map((r) => (
            <TouchableOpacity
              key={r}
              style={[s.timeBtn, timeRange === r && s.timeBtnActive]}
              onPress={() => setTimeRange(r)}
            >
              <Text
                style={[s.timeBtnText, timeRange === r && s.timeBtnTextActive]}
              >
                {r === "today"
                  ? "Hôm nay"
                  : r === "week"
                    ? "7 ngày"
                    : "30 ngày"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* KPI Cards */}
        <View style={s.kpiRow}>
          <KPICard
            icon="people"
            label="Tổng nhân sự"
            value={workerSummary?.totalWorkers || 0}
            color={C.primary}
            bgColor={C.primaryBg}
          />
          <KPICard
            icon="checkmark-circle"
            label="Đang làm việc"
            value={workerSummary?.activeWorkers || 0}
            color={C.green}
            bgColor={C.greenBg}
          />
          <KPICard
            icon="time"
            label="Nghỉ phép"
            value={workerSummary?.onLeave || 0}
            color={C.orange}
            bgColor={C.orangeBg}
          />
          <KPICard
            icon="business"
            label="Dự án đang chạy"
            value={activeProjects}
            color={C.blue}
            bgColor={C.blueBg}
          />
        </View>

        {/* Attendance Section */}
        {attendanceSummary && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Chấm công hôm nay</Text>
              <TouchableOpacity
                onPress={() => router.push("/labor/attendance" as any)}
              >
                <Text style={s.seeAll}>Chi tiết →</Text>
              </TouchableOpacity>
            </View>

            <View style={s.card}>
              <View style={s.attendRow}>
                <AttendStat
                  label="Có mặt"
                  value={attendanceSummary.present}
                  total={attendanceSummary.totalWorkers}
                  color={C.green}
                />
                <AttendStat
                  label="Vắng mặt"
                  value={attendanceSummary.absent}
                  total={attendanceSummary.totalWorkers}
                  color={C.red}
                />
                <AttendStat
                  label="Đi trễ"
                  value={attendanceSummary.late}
                  total={attendanceSummary.totalWorkers}
                  color={C.orange}
                />
                <AttendStat
                  label="Nghỉ phép"
                  value={attendanceSummary.onLeave}
                  total={attendanceSummary.totalWorkers}
                  color={C.blue}
                />
              </View>

              {/* Attendance rate bar */}
              <View style={s.rateRow}>
                <Text style={s.rateLabel}>Tỷ lệ có mặt</Text>
                <Text
                  style={[
                    s.rateValue,
                    {
                      color:
                        attendanceSummary.attendanceRate >= 90
                          ? C.green
                          : attendanceSummary.attendanceRate >= 75
                            ? C.orange
                            : C.red,
                    },
                  ]}
                >
                  {attendanceSummary.attendanceRate.toFixed(1)}%
                </Text>
              </View>
              <View style={s.progressBar}>
                <View
                  style={[
                    s.progressFill,
                    {
                      width: `${Math.min(attendanceSummary.attendanceRate, 100)}%`,
                      backgroundColor:
                        attendanceSummary.attendanceRate >= 90
                          ? C.green
                          : attendanceSummary.attendanceRate >= 75
                            ? C.orange
                            : C.red,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        )}

        {/* Payroll Section */}
        {payrollSummary && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Bảng lương</Text>
              <TouchableOpacity
                onPress={() => router.push("/labor/payroll" as any)}
              >
                <Text style={s.seeAll}>Chi tiết →</Text>
              </TouchableOpacity>
            </View>

            <View style={s.card}>
              <View style={s.payrollGrid}>
                <View style={s.payrollItem}>
                  <Text style={s.payrollLabel}>Tổng nhân công</Text>
                  <Text style={s.payrollValue}>
                    {payrollSummary.totalWorkers}
                  </Text>
                </View>
                <View style={s.payrollItem}>
                  <Text style={s.payrollLabel}>Giờ làm thường</Text>
                  <Text style={s.payrollValue}>
                    {payrollSummary.totalRegularHours.toFixed(0)}h
                  </Text>
                </View>
                <View style={s.payrollItem}>
                  <Text style={s.payrollLabel}>Giờ tăng ca</Text>
                  <Text style={[s.payrollValue, { color: C.orange }]}>
                    {payrollSummary.totalOvertimeHours.toFixed(0)}h
                  </Text>
                </View>
                <View style={s.payrollItem}>
                  <Text style={s.payrollLabel}>Tổng chi trả</Text>
                  <Text style={[s.payrollValue, { color: C.primary }]}>
                    {formatCurrency(payrollSummary.totalNetPay)}
                  </Text>
                </View>
              </View>

              {/* Status breakdown */}
              {payrollSummary.byStatus.length > 0 && (
                <View style={s.statusList}>
                  {payrollSummary.byStatus.map((st) => (
                    <View key={st.status} style={s.statusRow}>
                      <View
                        style={[
                          s.statusDot,
                          {
                            backgroundColor:
                              st.status === PayrollStatus.PAID
                                ? C.green
                                : st.status === PayrollStatus.APPROVED
                                  ? C.blue
                                  : st.status === PayrollStatus.PENDING_APPROVAL
                                    ? C.orange
                                    : C.textSec,
                          },
                        ]}
                      />
                      <Text style={s.statusLabel}>{st.status}</Text>
                      <Text style={s.statusCount}>{st.count} người</Text>
                      <Text style={s.statusAmount}>
                        {formatCurrency(st.totalAmount)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Workforce Distribution */}
        {workerSummary && workerSummary.byRole.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Phân bổ nhân sự</Text>
              <TouchableOpacity
                onPress={() => router.push("/labor/workers" as any)}
              >
                <Text style={s.seeAll}>Xem tất cả →</Text>
              </TouchableOpacity>
            </View>

            <View style={s.card}>
              {workerSummary.byRole
                .sort((a, b) => b.count - a.count)
                .slice(0, 8)
                .map((item) => (
                  <View key={item.role} style={s.roleRow}>
                    <Text style={s.roleName}>
                      {ROLE_LABELS[item.role] || item.role}
                    </Text>
                    <View style={s.roleBarWrap}>
                      <View
                        style={[
                          s.roleBar,
                          {
                            width: `${Math.min(
                              (item.count / (workerSummary.totalWorkers || 1)) *
                                100,
                              100,
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={s.roleCount}>{item.count}</Text>
                  </View>
                ))}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Thao tác nhanh</Text>
          <View style={s.actionsRow}>
            <ActionBtn
              icon="person-add-outline"
              label="Thêm nhân sự"
              onPress={() => router.push("/labor/create-worker" as any)}
              color={C.primary}
            />
            <ActionBtn
              icon="calendar-outline"
              label="Chấm công"
              onPress={() => router.push("/labor/create-attendance" as any)}
              color={C.blue}
            />
            <ActionBtn
              icon="time-outline"
              label="Ca làm việc"
              onPress={() => router.push("/labor/shifts" as any)}
              color={C.purple}
            />
            <ActionBtn
              icon="document-text-outline"
              label="Đơn nghỉ phép"
              onPress={() => router.push("/labor/leave-requests" as any)}
              color={C.orange}
            />
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub Components ────────────────────────────

function KPICard({
  icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}) {
  return (
    <View style={[s.kpiCard, { backgroundColor: bgColor }]}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[s.kpiValue, { color }]}>{value}</Text>
      <Text style={s.kpiLabel}>{label}</Text>
    </View>
  );
}

function AttendStat({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  return (
    <View style={s.attendItem}>
      <Text style={[s.attendValue, { color }]}>{value}</Text>
      <Text style={s.attendLabel}>{label}</Text>
    </View>
  );
}

function ActionBtn({
  icon,
  label,
  onPress,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color: string;
}) {
  return (
    <TouchableOpacity style={s.actionBtn} onPress={onPress}>
      <View style={[s.actionIcon, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={s.actionLabel} numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ── Styles ────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: C.textSec, fontSize: 14 },
  scroll: { padding: 16, paddingBottom: 40 },

  timeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  timeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: C.card,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  timeBtnActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  timeBtnText: { fontSize: 13, color: C.textSec, fontWeight: "500" },
  timeBtnTextActive: { color: "#FFFFFF" },

  kpiRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  kpiCard: {
    width: "47.5%" as any,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    gap: 4,
  },
  kpiValue: { fontSize: 24, fontWeight: "700" },
  kpiLabel: { fontSize: 11, color: C.textSec, textAlign: "center" },

  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: C.text },
  seeAll: { fontSize: 13, color: C.primary, fontWeight: "500" },

  card: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },

  attendRow: { flexDirection: "row", justifyContent: "space-around" },
  attendItem: { alignItems: "center" },
  attendValue: { fontSize: 22, fontWeight: "700" },
  attendLabel: { fontSize: 11, color: C.textSec, marginTop: 2 },

  rateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 6,
  },
  rateLabel: { fontSize: 13, color: C.textSec },
  rateValue: { fontSize: 14, fontWeight: "700" },

  progressBar: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3 },

  payrollGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  payrollItem: {
    width: "46%" as any,
    marginBottom: 4,
  },
  payrollLabel: { fontSize: 12, color: C.textSec },
  payrollValue: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
    marginTop: 2,
  },

  statusList: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 12,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { flex: 1, fontSize: 13, color: C.textSec },
  statusCount: { fontSize: 13, color: C.text, fontWeight: "500", width: 60 },
  statusAmount: {
    fontSize: 13,
    color: C.text,
    fontWeight: "600",
    textAlign: "right",
    width: 80,
  },

  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  roleName: { width: 80, fontSize: 12, color: C.textSec },
  roleBarWrap: {
    flex: 1,
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  roleBar: {
    height: "100%",
    backgroundColor: C.primary,
    borderRadius: 4,
  },
  roleCount: {
    width: 30,
    fontSize: 13,
    fontWeight: "600",
    color: C.text,
    textAlign: "right",
  },

  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  actionLabel: {
    fontSize: 11,
    color: C.textSec,
    textAlign: "center",
    lineHeight: 14,
  },
});
