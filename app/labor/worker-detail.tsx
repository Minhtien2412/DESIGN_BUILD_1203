/**
 * Worker Detail Screen
 * Màn hình chi tiết nhân công với thông tin đầy đủ
 *
 * @created 2026-02-04
 *
 * Features:
 * - Thông tin cá nhân
 * - Lịch sử chấm công
 * - Thống kê lương
 * - Kỹ năng & chứng chỉ
 * - Gọi điện / Nhắn tin
 */

import { useWorkerAttendanceHistory, useWorkerDetail } from "@/hooks/useLabor";
import {
    AttendanceStatus,
    ShiftType,
    WorkerRole,
    WorkerStatus,
} from "@/types/labor";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Linking,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// ============================================================================
// Constants
// ============================================================================

const COLORS = {
  primary: "#0D9488",
  success: "#00BFA5",
  warning: "#FFB800",
  error: "#EF4444",
  text: "#000000",
  textSecondary: "#757575",
  textTertiary: "#BDBDBD",
  background: "#F5F5F5",
  surface: "#FFFFFF",
  border: "#E0E0E0",
};

const ROLE_LABELS: Record<WorkerRole, string> = {
  [WorkerRole.FOREMAN]: "Đốc công",
  [WorkerRole.SKILLED_WORKER]: "Thợ chính",
  [WorkerRole.UNSKILLED_WORKER]: "Phụ hồ",
  [WorkerRole.EQUIPMENT_OPERATOR]: "Vận hành máy",
  [WorkerRole.ELECTRICIAN]: "Thợ điện",
  [WorkerRole.PLUMBER]: "Thợ nước",
  [WorkerRole.CARPENTER]: "Thợ mộc",
  [WorkerRole.MASON]: "Thợ nề",
  [WorkerRole.PAINTER]: "Thợ sơn",
  [WorkerRole.WELDER]: "Thợ hàn",
  [WorkerRole.SAFETY_OFFICER]: "An toàn",
  [WorkerRole.ENGINEER]: "Kỹ sư",
  [WorkerRole.SUPERVISOR]: "Giám sát",
  [WorkerRole.OTHER]: "Khác",
};

const STATUS_CONFIG: Record<WorkerStatus, { label: string; color: string }> = {
  [WorkerStatus.ACTIVE]: { label: "Đang làm việc", color: COLORS.success },
  [WorkerStatus.INACTIVE]: { label: "Nghỉ việc", color: COLORS.textSecondary },
  [WorkerStatus.ON_LEAVE]: { label: "Nghỉ phép", color: COLORS.primary },
  [WorkerStatus.SUSPENDED]: { label: "Tạm ngưng", color: COLORS.warning },
  [WorkerStatus.TERMINATED]: { label: "Thôi việc", color: COLORS.error },
};

const ATTENDANCE_CONFIG: Record<
  AttendanceStatus,
  { label: string; color: string; icon: string }
> = {
  [AttendanceStatus.PRESENT]: {
    label: "Có mặt",
    color: COLORS.success,
    icon: "checkmark-circle",
  },
  [AttendanceStatus.ABSENT]: {
    label: "Vắng",
    color: COLORS.error,
    icon: "close-circle",
  },
  [AttendanceStatus.LATE]: {
    label: "Trễ",
    color: COLORS.warning,
    icon: "time",
  },
  [AttendanceStatus.HALF_DAY]: {
    label: "Nửa ngày",
    color: COLORS.primary,
    icon: "contrast",
  },
  [AttendanceStatus.ON_LEAVE]: {
    label: "Nghỉ phép",
    color: COLORS.primary,
    icon: "calendar",
  },
  [AttendanceStatus.SICK_LEAVE]: {
    label: "Nghỉ ốm",
    color: COLORS.warning,
    icon: "medkit",
  },
  [AttendanceStatus.EXCUSED]: {
    label: "Có phép",
    color: COLORS.textSecondary,
    icon: "document-text",
  },
};

const SHIFT_LABELS: Record<ShiftType, string> = {
  [ShiftType.MORNING]: "Ca sáng",
  [ShiftType.AFTERNOON]: "Ca chiều",
  [ShiftType.NIGHT]: "Ca đêm",
  [ShiftType.FULL_DAY]: "Cả ngày",
  [ShiftType.OVERTIME]: "Tăng ca",
};

// ============================================================================
// Component
// ============================================================================

export default function WorkerDetailScreen() {
  const { workerId, projectId } = useLocalSearchParams<{
    workerId: string;
    projectId?: string;
  }>();

  const { worker, loading, error, refetch } = useWorkerDetail(workerId || "");
  const { history: attendanceHistory, loading: historyLoading } =
    useWorkerAttendanceHistory(workerId || "", 30);

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "attendance" | "stats">(
    "info",
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleCall = useCallback(() => {
    if (worker?.phoneNumber) {
      Linking.openURL(`tel:${worker.phoneNumber}`);
    }
  }, [worker?.phoneNumber]);

  const handleMessage = useCallback(() => {
    if (worker?.phoneNumber) {
      Linking.openURL(`sms:${worker.phoneNumber}`);
    }
  }, [worker?.phoneNumber]);

  const handleEmail = useCallback(() => {
    if (worker?.email) {
      Linking.openURL(`mailto:${worker.email}`);
    }
  }, [worker?.email]);

  const handleEdit = useCallback(() => {
    router.push(
      `/labor/create-worker?workerId=${workerId}&projectId=${projectId}` as any,
    );
  }, [workerId, projectId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  // Calculate attendance stats
  const attendanceStats = {
    total: attendanceHistory.length,
    present: attendanceHistory.filter(
      (a) => a.status === AttendanceStatus.PRESENT,
    ).length,
    absent: attendanceHistory.filter(
      (a) => a.status === AttendanceStatus.ABSENT,
    ).length,
    late: attendanceHistory.filter((a) => a.status === AttendanceStatus.LATE)
      .length,
    onLeave: attendanceHistory.filter(
      (a) =>
        a.status === AttendanceStatus.ON_LEAVE ||
        a.status === AttendanceStatus.SICK_LEAVE,
    ).length,
    totalHours: attendanceHistory.reduce(
      (sum, a) => sum + (a.hoursWorked || 0),
      0,
    ),
    overtimeHours: attendanceHistory.reduce(
      (sum, a) => sum + (a.overtimeHours || 0),
      0,
    ),
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (error || !worker) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
        <Text style={styles.errorText}>Không tìm thấy thông tin nhân công</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusConfig = STATUS_CONFIG[worker.status];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBtn}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết nhân công</Text>
        <TouchableOpacity onPress={handleEdit} style={styles.headerBtn}>
          <Ionicons name="create-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarSection}>
            {worker.photoUrl ? (
              <Image source={{ uri: worker.photoUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {worker.firstName?.[0]}
                  {worker.lastName?.[0]}
                </Text>
              </View>
            )}
            <View
              style={[
                styles.statusDot,
                { backgroundColor: statusConfig.color },
              ]}
            />
          </View>

          <Text style={styles.workerName}>{worker.fullName}</Text>
          <Text style={styles.workerId}>ID: {worker.employeeId}</Text>

          <View style={styles.roleStatusRow}>
            <View style={styles.roleBadge}>
              <Ionicons
                name="briefcase-outline"
                size={14}
                color={COLORS.primary}
              />
              <Text style={styles.roleText}>{ROLE_LABELS[worker.role]}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusConfig.color + "20" },
              ]}
            >
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleCall}>
              <Ionicons name="call" size={22} color={COLORS.surface} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleMessage}>
              <Ionicons name="chatbubble" size={22} color={COLORS.surface} />
            </TouchableOpacity>
            {worker.email && (
              <TouchableOpacity style={styles.actionBtn} onPress={handleEmail}>
                <Ionicons name="mail" size={22} color={COLORS.surface} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {(["info", "attendance", "stats"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab === "info"
                  ? "Thông tin"
                  : tab === "attendance"
                    ? "Chấm công"
                    : "Thống kê"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === "info" && (
          <View style={styles.section}>
            {/* Contact Info */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Thông tin liên hệ</Text>

              <View style={styles.infoRow}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={COLORS.textSecondary}
                />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Số điện thoại</Text>
                  <Text style={styles.infoValue}>{worker.phoneNumber}</Text>
                </View>
              </View>

              {worker.email && (
                <View style={styles.infoRow}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={COLORS.textSecondary}
                  />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{worker.email}</Text>
                  </View>
                </View>
              )}

              {worker.address && (
                <View style={styles.infoRow}>
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={COLORS.textSecondary}
                  />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Địa chỉ</Text>
                    <Text style={styles.infoValue}>{worker.address}</Text>
                  </View>
                </View>
              )}

              {worker.emergencyContactName && (
                <View style={styles.infoRow}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={20}
                    color={COLORS.error}
                  />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Liên hệ khẩn cấp</Text>
                    <Text style={styles.infoValue}>
                      {worker.emergencyContactName} -{" "}
                      {worker.emergencyContactPhone}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Employment Info */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Thông tin công việc</Text>

              <View style={styles.infoRow}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={COLORS.textSecondary}
                />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Ngày vào làm</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(worker.hireDate)}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons
                  name="cash-outline"
                  size={20}
                  color={COLORS.textSecondary}
                />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Lương theo giờ</Text>
                  <Text style={styles.infoValue}>
                    {formatCurrency(worker.hourlyRate)}/giờ
                  </Text>
                </View>
              </View>

              {worker.overtimeRate && (
                <View style={styles.infoRow}>
                  <Ionicons
                    name="time-outline"
                    size={20}
                    color={COLORS.textSecondary}
                  />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Lương tăng ca</Text>
                    <Text style={styles.infoValue}>
                      {formatCurrency(worker.overtimeRate)}/giờ
                    </Text>
                  </View>
                </View>
              )}

              {worker.bankName && (
                <View style={styles.infoRow}>
                  <Ionicons
                    name="card-outline"
                    size={20}
                    color={COLORS.textSecondary}
                  />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Ngân hàng</Text>
                    <Text style={styles.infoValue}>
                      {worker.bankName} - {worker.bankAccountNumber}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Skills & Certifications */}
            {(() => {
              const skills = worker.skills || [];
              const certifications = worker.certifications || [];
              if (skills.length === 0 && certifications.length === 0)
                return null;
              return (
                <View style={styles.infoCard}>
                  <Text style={styles.cardTitle}>Kỹ năng & Chứng chỉ</Text>

                  {skills.length > 0 && (
                    <View style={styles.tagsSection}>
                      <Text style={styles.tagsLabel}>Kỹ năng:</Text>
                      <View style={styles.tagsWrap}>
                        {skills.map((skill, idx) => (
                          <View key={idx} style={styles.tag}>
                            <Text style={styles.tagText}>{skill}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {certifications.length > 0 && (
                    <View style={styles.tagsSection}>
                      <Text style={styles.tagsLabel}>Chứng chỉ:</Text>
                      <View style={styles.tagsWrap}>
                        {certifications.map((cert, idx) => (
                          <View key={idx} style={[styles.tag, styles.certTag]}>
                            <Ionicons
                              name="ribbon"
                              size={12}
                              color={COLORS.primary}
                            />
                            <Text
                              style={[
                                styles.tagText,
                                { color: COLORS.primary },
                              ]}
                            >
                              {cert}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              );
            })()}

            {/* Notes */}
            {worker.notes && (
              <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Ghi chú</Text>
                <Text style={styles.notesText}>{worker.notes}</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === "attendance" && (
          <View style={styles.section}>
            {/* Attendance Summary */}
            <View style={styles.attendanceSummary}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                  {attendanceStats.present}
                </Text>
                <Text style={styles.summaryLabel}>Có mặt</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: COLORS.error }]}>
                  {attendanceStats.absent}
                </Text>
                <Text style={styles.summaryLabel}>Vắng</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: COLORS.warning }]}>
                  {attendanceStats.late}
                </Text>
                <Text style={styles.summaryLabel}>Trễ</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: COLORS.primary }]}>
                  {attendanceStats.onLeave}
                </Text>
                <Text style={styles.summaryLabel}>Nghỉ</Text>
              </View>
            </View>

            {/* Attendance History */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Lịch sử chấm công (30 ngày)</Text>

              {historyLoading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : attendanceHistory.length === 0 ? (
                <Text style={styles.emptyText}>Chưa có dữ liệu chấm công</Text>
              ) : (
                attendanceHistory.slice(0, 10).map((record) => {
                  const config = ATTENDANCE_CONFIG[record.status];
                  return (
                    <View key={record.id} style={styles.attendanceRow}>
                      <View style={styles.attendanceDate}>
                        <Text style={styles.attendanceDateText}>
                          {formatDate(record.date)}
                        </Text>
                        <Text style={styles.attendanceShift}>
                          {SHIFT_LABELS[record.shiftType]}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.attendanceStatus,
                          { backgroundColor: config.color + "15" },
                        ]}
                      >
                        <Ionicons
                          name={config.icon as any}
                          size={14}
                          color={config.color}
                        />
                        <Text
                          style={[
                            styles.attendanceStatusText,
                            { color: config.color },
                          ]}
                        >
                          {config.label}
                        </Text>
                      </View>
                      {record.hoursWorked && (
                        <Text style={styles.attendanceHours}>
                          {record.hoursWorked}h
                        </Text>
                      )}
                    </View>
                  );
                })
              )}
            </View>
          </View>
        )}

        {activeTab === "stats" && (
          <View style={styles.section}>
            {/* Work Hours Stats */}
            <View style={styles.statsCard}>
              <Text style={styles.cardTitle}>Thống kê công (30 ngày)</Text>

              <View style={styles.statsGrid}>
                <View style={styles.statsItem}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={32}
                    color={COLORS.primary}
                  />
                  <Text style={styles.statsValue}>
                    {attendanceStats.totalHours.toFixed(1)}
                  </Text>
                  <Text style={styles.statsLabel}>Giờ làm việc</Text>
                </View>
                <View style={styles.statsItem}>
                  <MaterialCommunityIcons
                    name="clock-plus-outline"
                    size={32}
                    color={COLORS.warning}
                  />
                  <Text style={styles.statsValue}>
                    {attendanceStats.overtimeHours.toFixed(1)}
                  </Text>
                  <Text style={styles.statsLabel}>Giờ tăng ca</Text>
                </View>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statsItem}>
                  <MaterialCommunityIcons
                    name="percent"
                    size={32}
                    color={COLORS.success}
                  />
                  <Text style={styles.statsValue}>
                    {attendanceStats.total > 0
                      ? Math.round(
                          (attendanceStats.present / attendanceStats.total) *
                            100,
                        )
                      : 0}
                    %
                  </Text>
                  <Text style={styles.statsLabel}>Tỷ lệ đi làm</Text>
                </View>
                <View style={styles.statsItem}>
                  <MaterialCommunityIcons
                    name="calendar-check"
                    size={32}
                    color={COLORS.primary}
                  />
                  <Text style={styles.statsValue}>{attendanceStats.total}</Text>
                  <Text style={styles.statsLabel}>Ngày công</Text>
                </View>
              </View>
            </View>

            {/* Earnings Estimate */}
            <View style={styles.statsCard}>
              <Text style={styles.cardTitle}>Ước tính thu nhập (30 ngày)</Text>

              <View style={styles.earningsRow}>
                <Text style={styles.earningsLabel}>Lương cơ bản</Text>
                <Text style={styles.earningsValue}>
                  {formatCurrency(
                    attendanceStats.totalHours * worker.hourlyRate,
                  )}
                </Text>
              </View>

              <View style={styles.earningsRow}>
                <Text style={styles.earningsLabel}>Tăng ca</Text>
                <Text style={styles.earningsValue}>
                  {formatCurrency(
                    attendanceStats.overtimeHours *
                      (worker.overtimeRate || worker.hourlyRate * 1.5),
                  )}
                </Text>
              </View>

              <View style={[styles.earningsRow, styles.earningsTotal]}>
                <Text style={styles.earningsTotalLabel}>Tổng cộng</Text>
                <Text style={styles.earningsTotalValue}>
                  {formatCurrency(
                    attendanceStats.totalHours * worker.hourlyRate +
                      attendanceStats.overtimeHours *
                        (worker.overtimeRate || worker.hourlyRate * 1.5),
                  )}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
    textAlign: "center",
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    paddingVertical: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarSection: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "700",
    color: COLORS.surface,
  },
  statusDot: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.surface,
  },
  workerName: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  workerId: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  roleStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "500",
  },
  quickActions: {
    flexDirection: "row",
    gap: 16,
  },
  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  section: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  tagsSection: {
    marginBottom: 12,
  },
  tagsLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  certTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.primary + "10",
  },
  tagText: {
    fontSize: 12,
    color: COLORS.text,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  attendanceSummary: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    paddingVertical: 20,
  },
  attendanceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  attendanceDate: {
    flex: 1,
  },
  attendanceDateText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  attendanceShift: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  attendanceStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  attendanceStatusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  attendanceHours: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 12,
    minWidth: 40,
    textAlign: "right",
  },
  statsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    marginBottom: 16,
  },
  statsItem: {
    flex: 1,
    alignItems: "center",
    padding: 12,
  },
  statsValue: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 8,
  },
  statsLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  earningsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  earningsLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  earningsValue: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
  },
  earningsTotal: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: COLORS.border,
  },
  earningsTotalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  earningsTotalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
  },
});
