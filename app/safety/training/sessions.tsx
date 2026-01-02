/**
 * Training Sessions Screen
 * Manage training sessions and attendance
 */

import { Loader } from '@/components/ui/loader';
import { useTrainingSessions } from '@/hooks/useSafety';
import {
    TrainingStatus,
    type CreateTrainingSessionParams,
    type TrainingSession,
} from '@/types/safety';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function TrainingSessionsScreen() {
  const { projectId, programId } = useLocalSearchParams<{ projectId: string; programId?: string }>();
  const [filter, setFilter] = useState<TrainingStatus | 'all'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { sessions, loading, error, create, refetch } = useTrainingSessions({
    projectId: projectId || '',
    programId,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading && sessions.length === 0) {
    return <Loader />;
  }

  const filteredSessions = filter === 'all' ? sessions : sessions.filter((s) => s.status === filter);

  const scheduledCount = sessions.filter((s) => s.status === TrainingStatus.SCHEDULED).length;
  const completedCount = sessions.filter((s) => s.status === TrainingStatus.COMPLETED).length;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Buổi đào tạo',
          headerRight: () => (
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Ionicons name="add-circle" size={28} color="#2196F3" style={{ marginRight: 8 }} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Stats Header */}
      <View style={styles.statsHeader}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{sessions.length}</Text>
          <Text style={styles.statLabel}>Tổng số</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#2196F3' }]}>{scheduledCount}</Text>
          <Text style={styles.statLabel}>Sắp tới</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#4CAF50' }]}>{completedCount}</Text>
          <Text style={styles.statLabel}>Hoàn thành</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === TrainingStatus.SCHEDULED && styles.filterTabActive]}
          onPress={() => setFilter(TrainingStatus.SCHEDULED)}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === TrainingStatus.SCHEDULED && styles.filterTabTextActive,
            ]}
          >
            Sắp tới
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === TrainingStatus.IN_PROGRESS && styles.filterTabActive,
          ]}
          onPress={() => setFilter(TrainingStatus.IN_PROGRESS)}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === TrainingStatus.IN_PROGRESS && styles.filterTabTextActive,
            ]}
          >
            Đang diễn ra
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === TrainingStatus.COMPLETED && styles.filterTabActive]}
          onPress={() => setFilter(TrainingStatus.COMPLETED)}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === TrainingStatus.COMPLETED && styles.filterTabTextActive,
            ]}
          >
            Hoàn thành
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredSessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SessionCard session={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có buổi đào tạo nào</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.addButtonText}>Lên lịch đào tạo</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Create Session Modal */}
      <CreateSessionModal
        visible={modalVisible}
        projectId={projectId || ''}
        defaultProgramId={programId}
        onClose={() => setModalVisible(false)}
        onCreate={async (params) => {
          try {
            await create(params);
            setModalVisible(false);
            Alert.alert('Thành công', 'Đã tạo buổi đào tạo');
          } catch (err) {
            Alert.alert('Lỗi', 'Không thể tạo buổi đào tạo');
          }
        }}
      />
    </>
  );
}

interface SessionCardProps {
  session: TrainingSession;
}

function SessionCard({ session }: SessionCardProps) {
  const statusColor = getStatusColor(session.status);
  const isPast = new Date(session.scheduledDate) < new Date();

  const attendedCount = session.participants?.filter((p) => p.attended).length || 0;
  const totalCount = session.participants?.length || 0;
  const attendanceRate = totalCount > 0 ? Math.round((attendedCount / totalCount) * 100) : 0;

  return (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() => router.push(`/safety/training/sessions/${session.id}`)}
    >
      <View style={styles.sessionHeader}>
        <View style={styles.dateSection}>
          <View style={[styles.dateBadge, isPast && styles.dateBadgePast]}>
            <Text style={[styles.dateDay, isPast && styles.dateTextPast]}>
              {new Date(session.scheduledDate).getDate()}
            </Text>
            <Text style={[styles.dateMonth, isPast && styles.dateTextPast]}>
              Tháng {new Date(session.scheduledDate).getMonth() + 1}
            </Text>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.sessionTitle}>Buổi #{session.id.slice(0, 8)}</Text>
          <Text style={styles.programId}>Chương trình: {session.programId}</Text>
          {session.location && (
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color="#666" />
              <Text style={styles.locationText}>{session.location}</Text>
            </View>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{getStatusLabel(session.status)}</Text>
        </View>
      </View>

      <View style={styles.timeInfo}>
        <View style={styles.timeRow}>
          <Ionicons name="time" size={16} color="#666" />
          <Text style={styles.timeText}>
            {typeof session.startTime === 'string' ? session.startTime : session.startTime.toISOString()} - {session.endTime ? (typeof session.endTime === 'string' ? session.endTime : session.endTime.toISOString()) : '...'}
          </Text>
        </View>
        {session.instructor && (
          <View style={styles.timeRow}>
            <Ionicons name="person" size={16} color="#666" />
            <Text style={styles.timeText}>{session.instructor}</Text>
          </View>
        )}
      </View>

      {totalCount > 0 && (
        <View style={styles.attendanceSection}>
          <View style={styles.attendanceBar}>
            <View style={[styles.attendanceProgress, { width: `${attendanceRate}%` }]} />
          </View>
          <View style={styles.attendanceStats}>
            <Text style={styles.attendanceText}>
              {attendedCount}/{totalCount} tham gia ({attendanceRate}%)
            </Text>
            <Ionicons name="people" size={16} color="#666" />
          </View>
        </View>
      )}

      {session.actualDuration && (
        <View style={styles.durationInfo}>
          <Ionicons name="hourglass" size={14} color="#FF9800" />
          <Text style={styles.durationText}>
            Thời lượng thực tế: {session.actualDuration} phút
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

interface CreateSessionModalProps {
  visible: boolean;
  projectId: string;
  defaultProgramId?: string;
  onClose: () => void;
  onCreate: (params: CreateTrainingSessionParams) => Promise<void>;
}

function CreateSessionModal({
  visible,
  projectId,
  defaultProgramId,
  onClose,
  onCreate,
}: CreateSessionModalProps) {
  const [programId, setProgramId] = useState(defaultProgramId || '');
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [instructor, setInstructor] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!programId.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập ID chương trình');
      return;
    }

    setCreating(true);
    try {
      await onCreate({
        projectId,
        programId: programId.trim(),
        scheduledDate: scheduledDate.toISOString(),
        startTime,
        endTime,
        location: location.trim() || undefined,
        instructor: instructor.trim() || undefined,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
      });
      // Reset form
      setProgramId(defaultProgramId || '');
      setScheduledDate(new Date());
      setStartTime('08:00');
      setEndTime('10:00');
      setLocation('');
      setInstructor('');
      setMaxParticipants('');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tạo buổi đào tạo</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.inputLabel}>ID Chương trình *</Text>
            <TextInput
              style={styles.input}
              value={programId}
              onChangeText={setProgramId}
              placeholder="Nhập ID chương trình"
              editable={!defaultProgramId}
            />

            <Text style={styles.inputLabel}>Ngày tổ chức *</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar" size={20} color="#666" />
              <Text style={styles.dateButtonText}>{scheduledDate.toLocaleDateString('vi-VN')}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={scheduledDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setScheduledDate(date);
                }}
              />
            )}

            <View style={styles.timeRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Giờ bắt đầu *</Text>
                <TextInput
                  style={styles.input}
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="HH:MM"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Giờ kết thúc *</Text>
                <TextInput
                  style={styles.input}
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="HH:MM"
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Địa điểm</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="VD: Phòng họp A"
            />

            <Text style={styles.inputLabel}>Giảng viên</Text>
            <TextInput
              style={styles.input}
              value={instructor}
              onChangeText={setInstructor}
              placeholder="VD: Nguyễn Văn A"
            />

            <Text style={styles.inputLabel}>Số lượng tối đa</Text>
            <TextInput
              style={styles.input}
              value={maxParticipants}
              onChangeText={setMaxParticipants}
              keyboardType="number-pad"
              placeholder="VD: 30"
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.createButton, creating && styles.buttonDisabled]}
              onPress={handleCreate}
              disabled={creating}
            >
              <Text style={styles.createButtonText}>{creating ? 'Đang tạo...' : 'Tạo'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Helper functions
function getStatusColor(status: TrainingStatus): string {
  switch (status) {
    case TrainingStatus.SCHEDULED:
      return '#2196F3';
    case TrainingStatus.IN_PROGRESS:
      return '#FF9800';
    case TrainingStatus.COMPLETED:
      return '#4CAF50';
    case TrainingStatus.CANCELLED:
      return '#9E9E9E';
    case TrainingStatus.EXPIRED:
      return '#F44336';
    default:
      return '#666';
  }
}

function getStatusLabel(status: TrainingStatus): string {
  const labels: Record<TrainingStatus, string> = {
    [TrainingStatus.SCHEDULED]: 'SẮP TỚI',
    [TrainingStatus.IN_PROGRESS]: 'ĐANG DIỄN RA',
    [TrainingStatus.COMPLETED]: 'HOÀN THÀNH',
    [TrainingStatus.CANCELLED]: 'ĐÃ HỦY',
    [TrainingStatus.EXPIRED]: 'HẾT HẠN',
  };
  return labels[status] || status;
}

const styles = StyleSheet.create({
  statsHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomColor: '#2196F3',
  },
  filterTabText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  sessionCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  dateSection: {
    alignItems: 'center',
  },
  dateBadge: {
    width: 64,
    height: 64,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateBadgePast: {
    backgroundColor: '#9E9E9E',
  },
  dateDay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  dateMonth: {
    fontSize: 11,
    color: '#FFF',
  },
  dateTextPast: {
    opacity: 0.7,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  programId: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: 'bold',
  },
  timeInfo: {
    gap: 6,
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 13,
    color: '#666',
  },
  attendanceSection: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  attendanceBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  attendanceProgress: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  attendanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendanceText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  durationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF3E0',
    padding: 8,
    borderRadius: 6,
    marginTop: 12,
  },
  durationText: {
    fontSize: 12,
    color: '#E65100',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateButtonText: {
    fontSize: 14,
    color: '#333',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  createButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
});
