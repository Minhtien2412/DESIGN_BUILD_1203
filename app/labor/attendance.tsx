import { useAttendances, useWorkers } from '@/hooks/useLabor';
import { AttendanceStatus, ShiftType } from '@/types/labor';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: 'Có mặt',
  [AttendanceStatus.ABSENT]: 'Vắng',
  [AttendanceStatus.LATE]: 'Trễ',
  [AttendanceStatus.HALF_DAY]: 'Nửa ngày',
  [AttendanceStatus.ON_LEAVE]: 'Nghỉ phép',
  [AttendanceStatus.SICK_LEAVE]: 'Nghỉ ốm',
  [AttendanceStatus.EXCUSED]: 'Có phép',
};

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: '#0D9488',
  [AttendanceStatus.ABSENT]: '#000000',
  [AttendanceStatus.LATE]: '#0D9488',
  [AttendanceStatus.HALF_DAY]: '#0D9488',
  [AttendanceStatus.ON_LEAVE]: '#999999',
  [AttendanceStatus.SICK_LEAVE]: '#000000',
  [AttendanceStatus.EXCUSED]: '#0D9488',
};

const SHIFT_LABELS: Record<ShiftType, string> = {
  [ShiftType.MORNING]: 'Sáng',
  [ShiftType.AFTERNOON]: 'Chiều',
  [ShiftType.NIGHT]: 'Tối',
  [ShiftType.FULL_DAY]: 'Cả ngày',
  [ShiftType.OVERTIME]: 'Tăng ca',
};

export default function AttendanceScreen() {
  const { projectId, date: initialDate } = useLocalSearchParams<{
    projectId: string;
    date?: string;
  }>();
  const [selectedDate, setSelectedDate] = useState(
    initialDate ? new Date(initialDate) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const dateString = selectedDate.toISOString().split('T')[0];
  const { attendances, loading, deleteAttendance } = useAttendances(projectId, dateString);
  const { workers } = useWorkers(projectId);

  const handleDelete = async (attendanceId: string, workerName: string) => {
    Alert.alert('Xóa chấm công', `Xóa bản ghi chấm công của "${workerName}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAttendance(attendanceId);
            Alert.alert('Thành công', 'Đã xóa bản ghi');
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể xóa bản ghi');
          }
        },
      },
    ]);
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '--:--';
    return new Date(timeString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const presentCount = attendances.filter((a) => a.status === AttendanceStatus.PRESENT).length;
  const absentCount = attendances.filter((a) => a.status === AttendanceStatus.ABSENT).length;
  const lateCount = attendances.filter((a) => a.status === AttendanceStatus.LATE).length;
  const attendanceRate = attendances.length > 0 ? (presentCount / attendances.length) * 100 : 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Date Selector */}
      <View style={styles.dateSelector}>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
          <Ionicons name="calendar-outline" size={20} color="#0D9488" />
          <Text style={styles.dateText}>{selectedDate.toLocaleDateString('vi-VN')}</Text>
          <Ionicons name="chevron-down-outline" size={20} color="#0D9488" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.todayButton}
          onPress={() => setSelectedDate(new Date())}
        >
          <Text style={styles.todayButtonText}>Hôm nay</Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (date) setSelectedDate(date);
          }}
          maximumDate={new Date()}
        />
      )}

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Tổng số</Text>
            <Text style={styles.summaryValue}>{attendances.length}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: '#0D9488' }]}>Có mặt</Text>
            <Text style={[styles.summaryValue, { color: '#0D9488' }]}>{presentCount}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: '#000000' }]}>Vắng</Text>
            <Text style={[styles.summaryValue, { color: '#000000' }]}>{absentCount}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: '#0D9488' }]}>Trễ</Text>
            <Text style={[styles.summaryValue, { color: '#0D9488' }]}>{lateCount}</Text>
          </View>
        </View>

        <View style={styles.rateRow}>
          <Text style={styles.rateLabel}>Tỷ lệ có mặt:</Text>
          <Text style={styles.rateValue}>{attendanceRate.toFixed(1)}%</Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${attendanceRate}%`,
                backgroundColor:
                  attendanceRate >= 90 ? '#0D9488' : attendanceRate >= 75 ? '#0D9488' : '#000000',
              },
            ]}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {attendances.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có bản ghi chấm công</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() =>
                router.push(
                  `/labor/create-attendance?projectId=${projectId}&date=${dateString}`
                )
              }
            >
              <Text style={styles.emptyButtonText}>Chấm công ngay</Text>
            </TouchableOpacity>
          </View>
        ) : (
          attendances.map((attendance) => (
            <View key={attendance.id} style={styles.attendanceCard}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={24} color="#0D9488" />
                  </View>
                  <View style={styles.headerInfo}>
                    <Text style={styles.workerName}>
                      {attendance.worker?.fullName || 'N/A'}
                    </Text>
                    <Text style={styles.employeeId}>
                      {attendance.worker?.employeeId || 'N/A'}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: STATUS_COLORS[attendance.status] + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: STATUS_COLORS[attendance.status] },
                    ]}
                  >
                    {STATUS_LABELS[attendance.status]}
                  </Text>
                </View>
              </View>

              {/* Time Info */}
              <View style={styles.timeSection}>
                <View style={styles.timeRow}>
                  <Ionicons name="log-in-outline" size={16} color="#666" />
                  <Text style={styles.timeLabel}>Vào:</Text>
                  <Text style={styles.timeValue}>{formatTime(attendance.checkInTime)}</Text>
                </View>

                <View style={styles.timeRow}>
                  <Ionicons name="log-out-outline" size={16} color="#666" />
                  <Text style={styles.timeLabel}>Ra:</Text>
                  <Text style={styles.timeValue}>{formatTime(attendance.checkOutTime)}</Text>
                </View>

                <View style={styles.timeRow}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.timeLabel}>Ca:</Text>
                  <Text style={styles.timeValue}>{SHIFT_LABELS[attendance.shiftType]}</Text>
                </View>

                {attendance.hoursWorked !== undefined && (
                  <View style={styles.timeRow}>
                    <Ionicons name="timer-outline" size={16} color="#666" />
                    <Text style={styles.timeLabel}>Giờ làm:</Text>
                    <Text style={styles.timeValue}>{attendance.hoursWorked}h</Text>
                  </View>
                )}

                {attendance.overtimeHours !== undefined && attendance.overtimeHours > 0 && (
                  <View style={styles.timeRow}>
                    <Ionicons name="alarm-outline" size={16} color="#0D9488" />
                    <Text style={styles.timeLabel}>Tăng ca:</Text>
                    <Text style={[styles.timeValue, { color: '#0D9488' }]}>
                      {attendance.overtimeHours}h
                    </Text>
                  </View>
                )}
              </View>

              {/* Notes */}
              {attendance.notes && (
                <View style={styles.notesSection}>
                  <Text style={styles.notesText}>{attendance.notes}</Text>
                </View>
              )}

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() =>
                    handleDelete(attendance.id, attendance.worker?.fullName || 'N/A')
                  }
                >
                  <Ionicons name="trash-outline" size={16} color="#000000" />
                  <Text style={styles.deleteButtonText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          router.push(`/labor/create-attendance?projectId=${projectId}&date=${dateString}`)
        }
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
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
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 12,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    backgroundColor: '#F0FDFA',
    borderRadius: 8,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#0D9488',
  },
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0D9488',
    borderRadius: 8,
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  summary: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    gap: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateLabel: {
    fontSize: 14,
    color: '#666',
  },
  rateValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0D9488',
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
  scrollView: {
    flex: 1,
    padding: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
  },
  emptyButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0D9488',
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  attendanceCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  employeeId: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  timeSection: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeLabel: {
    fontSize: 13,
    color: '#666',
    width: 70,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  notesSection: {
    backgroundColor: '#F0FDFA',
    padding: 10,
    borderRadius: 6,
  },
  notesText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 6,
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
