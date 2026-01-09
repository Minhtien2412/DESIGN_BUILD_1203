import { useAttendanceSummary, useWorkerSummary } from '@/hooks/useLabor';
import { WorkerRole } from '@/types/labor';
import { Ionicons } from '@expo/vector-icons';
import { Href, router, useLocalSearchParams } from 'expo-router';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const ROLE_LABELS: Record<WorkerRole, string> = {
  [WorkerRole.FOREMAN]: 'Đốc công',
  [WorkerRole.SKILLED_WORKER]: 'Thợ chính',
  [WorkerRole.UNSKILLED_WORKER]: 'Phụ hồ',
  [WorkerRole.EQUIPMENT_OPERATOR]: 'Vận hành máy',
  [WorkerRole.ELECTRICIAN]: 'Thợ điện',
  [WorkerRole.PLUMBER]: 'Thợ nước',
  [WorkerRole.CARPENTER]: 'Thợ mộc',
  [WorkerRole.MASON]: 'Thợ nề',
  [WorkerRole.PAINTER]: 'Thợ sơn',
  [WorkerRole.WELDER]: 'Thợ hàn',
  [WorkerRole.SAFETY_OFFICER]: 'An toàn',
  [WorkerRole.ENGINEER]: 'Kỹ sư',
  [WorkerRole.SUPERVISOR]: 'Giám sát',
  [WorkerRole.OTHER]: 'Khác',
};

const ROLE_ICONS: Record<WorkerRole, string> = {
  [WorkerRole.FOREMAN]: 'person-outline',
  [WorkerRole.SKILLED_WORKER]: 'build-outline',
  [WorkerRole.UNSKILLED_WORKER]: 'hammer-outline',
  [WorkerRole.EQUIPMENT_OPERATOR]: 'construct-outline',
  [WorkerRole.ELECTRICIAN]: 'flash-outline',
  [WorkerRole.PLUMBER]: 'water-outline',
  [WorkerRole.CARPENTER]: 'cut-outline',
  [WorkerRole.MASON]: 'cube-outline',
  [WorkerRole.PAINTER]: 'brush-outline',
  [WorkerRole.WELDER]: 'flame-outline',
  [WorkerRole.SAFETY_OFFICER]: 'shield-checkmark-outline',
  [WorkerRole.ENGINEER]: 'calculator-outline',
  [WorkerRole.SUPERVISOR]: 'people-outline',
  [WorkerRole.OTHER]: 'ellipsis-horizontal-outline',
};

const ROLE_COLORS: Record<WorkerRole, string> = {
  [WorkerRole.FOREMAN]: '#0066CC',
  [WorkerRole.SKILLED_WORKER]: '#0066CC',
  [WorkerRole.UNSKILLED_WORKER]: '#999999',
  [WorkerRole.EQUIPMENT_OPERATOR]: '#666666',
  [WorkerRole.ELECTRICIAN]: '#0066CC',
  [WorkerRole.PLUMBER]: '#0066CC',
  [WorkerRole.CARPENTER]: '#666666',
  [WorkerRole.MASON]: '#000000',
  [WorkerRole.PAINTER]: '#0066CC',
  [WorkerRole.WELDER]: '#FF6F00',
  [WorkerRole.SAFETY_OFFICER]: '#0066CC',
  [WorkerRole.ENGINEER]: '#0066CC',
  [WorkerRole.SUPERVISOR]: '#0066CC',
  [WorkerRole.OTHER]: '#4A4A4A',
};

export default function LaborIndexScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { summary: workerSummary, loading: workerLoading } = useWorkerSummary(projectId);
  const today = new Date().toISOString().split('T')[0];
  const { summary: attendanceSummary, loading: attendanceLoading } =
    useAttendanceSummary(today, projectId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (workerLoading || attendanceLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: '#E8F4FF' }]}>
            <Ionicons name="people" size={28} color="#0066CC" />
            <Text style={styles.summaryValue}>{workerSummary?.totalWorkers || 0}</Text>
            <Text style={styles.summaryLabel}>Tổng nhân công</Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="checkmark-circle" size={28} color="#0066CC" />
            <Text style={styles.summaryValue}>{workerSummary?.activeWorkers || 0}</Text>
            <Text style={styles.summaryLabel}>Đang làm việc</Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: '#E8F4FF' }]}>
            <Ionicons name="time" size={28} color="#0066CC" />
            <Text style={styles.summaryValue}>{workerSummary?.onLeave || 0}</Text>
            <Text style={styles.summaryLabel}>Nghỉ phép</Text>
          </View>
        </View>

        {/* Today's Attendance */}
        {attendanceSummary && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Chấm công hôm nay</Text>
              <TouchableOpacity
                onPress={() =>
                  router.push(`/labor/attendance?projectId=${projectId}&date=${today}` as Href)
                }
              >
                <Text style={styles.seeAll}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.attendanceCard}>
              <View style={styles.attendanceRow}>
                <View style={styles.attendanceItem}>
                  <View style={[styles.attendanceDot, { backgroundColor: '#0066CC' }]} />
                  <Text style={styles.attendanceLabel}>Có mặt</Text>
                  <Text style={styles.attendanceValue}>{attendanceSummary.present}</Text>
                </View>

                <View style={styles.attendanceItem}>
                  <View style={[styles.attendanceDot, { backgroundColor: '#000000' }]} />
                  <Text style={styles.attendanceLabel}>Vắng</Text>
                  <Text style={styles.attendanceValue}>{attendanceSummary.absent}</Text>
                </View>

                <View style={styles.attendanceItem}>
                  <View style={[styles.attendanceDot, { backgroundColor: '#0066CC' }]} />
                  <Text style={styles.attendanceLabel}>Trễ</Text>
                  <Text style={styles.attendanceValue}>{attendanceSummary.late}</Text>
                </View>

                <View style={styles.attendanceItem}>
                  <View style={[styles.attendanceDot, { backgroundColor: '#0066CC' }]} />
                  <Text style={styles.attendanceLabel}>Nghỉ</Text>
                  <Text style={styles.attendanceValue}>{attendanceSummary.onLeave}</Text>
                </View>
              </View>

              <View style={styles.attendanceRateRow}>
                <Text style={styles.attendanceRateLabel}>Tỷ lệ có mặt:</Text>
                <Text style={styles.attendanceRateValue}>
                  {attendanceSummary.attendanceRate.toFixed(1)}%
                </Text>
              </View>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${attendanceSummary.attendanceRate}%`,
                      backgroundColor:
                        attendanceSummary.attendanceRate >= 90
                          ? '#0066CC'
                          : attendanceSummary.attendanceRate >= 75
                          ? '#0066CC'
                          : '#000000',
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        )}

        {/* Workers by Role */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Phân bổ theo chuyên môn</Text>
            <TouchableOpacity
              onPress={() => router.push(`/labor/workers?projectId=${projectId}` as Href)}
            >
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rolesGrid}>
            {workerSummary?.byRole.map((item) => (
              <View key={item.role} style={styles.roleCard}>
                <View
                  style={[
                    styles.roleIcon,
                    { backgroundColor: ROLE_COLORS[item.role] + '20' },
                  ]}
                >
                  <Ionicons
                    name={ROLE_ICONS[item.role] as any}
                    size={24}
                    color={ROLE_COLORS[item.role]}
                  />
                </View>
                <Text style={styles.roleLabel} numberOfLines={2}>
                  {ROLE_LABELS[item.role]}
                </Text>
                <Text style={styles.roleCount}>{item.count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>

          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push(`/labor/workers?projectId=${projectId}` as Href)}
            >
              <Ionicons name="people-outline" size={32} color="#0066CC" />
              <Text style={styles.actionLabel}>Nhân công</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() =>
                router.push(`/labor/attendance?projectId=${projectId}&date=${today}` as Href)
              }
            >
              <Ionicons name="clipboard-outline" size={32} color="#0066CC" />
              <Text style={styles.actionLabel}>Chấm công</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push(`/labor/shifts?projectId=${projectId}` as Href)}
            >
              <Ionicons name="time-outline" size={32} color="#0066CC" />
              <Text style={styles.actionLabel}>Ca làm việc</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push(`/labor/leave-requests?projectId=${projectId}` as Href)}
            >
              <Ionicons name="calendar-outline" size={32} color="#999999" />
              <Text style={styles.actionLabel}>Nghỉ phép</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push(`/labor/payroll?projectId=${projectId}` as Href)}
            >
              <Ionicons name="cash-outline" size={32} color="#0066CC" />
              <Text style={styles.actionLabel}>Bảng lương</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  seeAll: {
    fontSize: 13,
    color: '#0066CC',
    fontWeight: '600',
  },
  attendanceCard: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 8,
    gap: 12,
  },
  attendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  attendanceItem: {
    alignItems: 'center',
    gap: 6,
  },
  attendanceDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  attendanceLabel: {
    fontSize: 11,
    color: '#666',
  },
  attendanceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  attendanceRateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  attendanceRateLabel: {
    fontSize: 13,
    color: '#666',
  },
  attendanceRateValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0066CC',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  roleCard: {
    width: '23%',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 6,
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    height: 26,
  },
  roleCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  actionCard: {
    width: '30%',
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
  },
  actionLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
