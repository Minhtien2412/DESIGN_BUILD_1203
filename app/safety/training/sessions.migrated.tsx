/**
 * Training Sessions Screen - Migrated to Universal Components
 * Using ModuleLayout + UniversalList pattern with attendance tracking
 */

import { ModuleLayout } from '@/components/layouts/ModuleLayout';
import { Loader } from '@/components/ui/loader';
import { UniversalList } from '@/components/universal/UniversalList';
import { useTrainingSessions } from '@/hooks/useSafety';
import {
    TrainingStatus,
    type TrainingSession,
} from '@/types/safety';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function TrainingSessionsScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const [filter, setFilter] = useState<TrainingStatus | 'all'>('all');
  const [modalVisible, setModalVisible] = useState(false);

  const { sessions, loading, error, create, refetch } = useTrainingSessions({
    projectId: projectId || '',
  });

  if (loading && sessions.length === 0) {
    return <Loader />;
  }

  const scheduledSessions = sessions.filter((s) => s.status === TrainingStatus.SCHEDULED);
  const completedSessions = sessions.filter((s) => s.status === TrainingStatus.COMPLETED);

  const filteredSessions = filter === 'all' ? sessions : sessions.filter((s) => s.status === filter);

  return (
    <>
      <Stack.Screen options={{ title: 'Buổi Đào tạo', headerShown: false }} />

      <ModuleLayout
        title="Buổi Đào tạo"
        subtitle={`${sessions.length} buổi • ${scheduledSessions.length} đã lên lịch • ${completedSessions.length} hoàn thành`}
        showBackButton
        headerRight={
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle" size={28} color="#2196F3" />
          </TouchableOpacity>
        }
        scrollable={false}
        padding={false}
      >
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
              Đã lên lịch
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

        {/* Universal List with custom session cards */}
        <UniversalList<TrainingSession>
          config={{
            data: filteredSessions,
            keyExtractor: (item) => item.id,
            renderItem: (item) => <SessionCard session={item} />,
            onRefresh: refetch,
            emptyIcon: 'calendar',
            emptyMessage: 'Chưa có buổi đào tạo nào',
            emptyAction: {
              label: 'Tạo buổi đào tạo',
              onPress: () => setModalVisible(true),
            },
          }}
        />
      </ModuleLayout>

      <CreateSessionModal
        visible={modalVisible}
        projectId={projectId || ''}
        onClose={() => setModalVisible(false)}
        onCreate={async (params) => {
          try {
            await (create as any)(params);
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

// Custom card for training sessions with attendance tracking
interface SessionCardProps {
  session: TrainingSession;
}

function SessionCard({ session }: SessionCardProps) {
  const scheduledDate = new Date(session.scheduledDate);
  const isPast = scheduledDate < new Date();
  const statusColor = getStatusColor(session.status);
  const attendedCount = session.participants?.filter(p => p.attended).length || 0;
  const totalParticipants = session.participants?.length || 0;
  const attendancePercentage = totalParticipants > 0
    ? Math.round((attendedCount / totalParticipants) * 100)
    : 0;

  return (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() => router.push(`/safety/training/sessions/${session.id}`)}
    >
      {/* Date Badge */}
      <View style={[styles.dateBadge, isPast && styles.dateBadgePast]}>
        <Text style={[styles.dateDay, isPast && styles.dateDayPast]}>
          {scheduledDate.getDate()}
        </Text>
        <Text style={[styles.dateMonth, isPast && styles.dateMonthPast]}>
          Tháng {scheduledDate.getMonth() + 1}
        </Text>
      </View>

      <View style={styles.sessionContent}>
        {/* Session Title */}
        <Text style={styles.sessionTitle}>{session.programTitle || 'Buổi đào tạo'}</Text>
        {session.programId && (
          <Text style={styles.programRef} numberOfLines={1}>
            {session.programId}
          </Text>
        )}

        {/* Location and Status */}
        <View style={styles.sessionInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={14} color="#666" />
            <Text style={styles.infoText}>{session.location}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusLabel(session.status)}
            </Text>
          </View>
        </View>

        {/* Time and Instructor */}
        <View style={styles.sessionDetails}>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={14} color="#666" />
            <Text style={styles.infoText}>
              {typeof session.startTime === 'string' ? session.startTime : new Date(session.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {session.endTime ? (typeof session.endTime === 'string' ? session.endTime : new Date(session.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })) : 'TBD'}
            </Text>
          </View>
          {session.instructor && (
            <View style={styles.infoRow}>
              <Ionicons name="person" size={14} color="#666" />
              <Text style={styles.infoText}>{session.instructor}</Text>
            </View>
          )}
        </View>

        {/* Attendance Tracking */}
        {totalParticipants > 0 && (
          <View style={styles.attendanceSection}>
            <View style={styles.attendanceHeader}>
              <Text style={styles.attendanceLabel}>Điểm danh</Text>
              <Text style={styles.attendanceStats}>
                {attendedCount}/{totalParticipants} ({attendancePercentage}%)
              </Text>
            </View>
            <View style={styles.attendanceBar}>
              <View
                style={[
                  styles.attendanceProgress,
                  {
                    width: `${attendancePercentage}%`,
                    backgroundColor:
                      attendancePercentage >= 80 ? '#4CAF50' : attendancePercentage >= 50 ? '#FF9800' : '#F44336',
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Actual Duration (if completed) */}
        {session.status === TrainingStatus.COMPLETED && session.actualDuration && (
          <View style={styles.completionInfo}>
            <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
            <Text style={styles.completionText}>
              Hoàn thành • {session.actualDuration} phút
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// Modal form (preserved for Task 21)
interface CreateSessionModalProps {
  visible: boolean;
  projectId: string;
  onClose: () => void;
  onCreate: (params: Partial<TrainingSession>) => Promise<void>;
}

function CreateSessionModal({ visible, projectId, onClose, onCreate }: CreateSessionModalProps) {
  const [programId, setProgramId] = useState('');
  const [title, setTitle] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [instructor, setInstructor] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên buổi đào tạo');
      return;
    }
    if (!scheduledDate) {
      Alert.alert('Lỗi', 'Vui lòng chọn ngày');
      return;
    }
    if (!startTime || !endTime) {
      Alert.alert('Lỗi', 'Vui lòng nhập thời gian bắt đầu và kết thúc');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa điểm');
      return;
    }

    setCreating(true);
    try {
      await onCreate({
        projectId,
        programId: programId.trim() || '',
        programTitle: title.trim(),
        scheduledDate,
        startTime: new Date(`1970-01-01T${startTime.trim()}`),
        endTime: new Date(`1970-01-01T${endTime.trim()}`),
        location: location.trim(),
        instructor: instructor.trim() || '',
        status: TrainingStatus.SCHEDULED,
        participants: [],
        createdBy: 'current-user',
      });
      // Reset form
      setProgramId('');
      setTitle('');
      setScheduledDate('');
      setStartTime('');
      setEndTime('');
      setLocation('');
      setInstructor('');
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
            <Text style={styles.inputLabel}>ID chương trình</Text>
            <TextInput
              style={styles.input}
              value={programId}
              onChangeText={setProgramId}
              placeholder="VD: PROG-001"
            />

            <Text style={styles.inputLabel}>Tên buổi đào tạo *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="VD: Định hướng an toàn tháng 12"
            />

            <Text style={styles.inputLabel}>Ngày đào tạo *</Text>
            <TextInput
              style={styles.input}
              value={scheduledDate}
              onChangeText={setScheduledDate}
              placeholder="VD: 2024-12-15"
            />

            <View style={styles.timeRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Giờ bắt đầu *</Text>
                <TextInput
                  style={styles.input}
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="08:00"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Giờ kết thúc *</Text>
                <TextInput
                  style={styles.input}
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="10:00"
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Địa điểm *</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="VD: Phòng họp tầng 2"
            />

            <Text style={styles.inputLabel}>Giảng viên</Text>
            <TextInput
              style={styles.input}
              value={instructor}
              onChangeText={setInstructor}
              placeholder="VD: Nguyễn Văn A"
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
      return '#666';
    default:
      return '#999';
  }
}

function getStatusLabel(status: TrainingStatus): string {
  switch (status) {
    case TrainingStatus.SCHEDULED:
      return 'Đã lên lịch';
    case TrainingStatus.IN_PROGRESS:
      return 'Đang diễn ra';
    case TrainingStatus.COMPLETED:
      return 'Hoàn thành';
    case TrainingStatus.CANCELLED:
      return 'Đã hủy';
    default:
      return status;
  }
}

const styles = StyleSheet.create({
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#2196F3',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },

  // Custom session card styles
  sessionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  dateBadge: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateBadgePast: {
    backgroundColor: '#9E9E9E',
  },
  dateDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  dateDayPast: {
    color: '#E0E0E0',
  },
  dateMonth: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '500',
  },
  dateMonthPast: {
    color: '#E0E0E0',
  },
  sessionContent: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  programRef: {
    fontSize: 12,
    color: '#2196F3',
    marginBottom: 8,
  },
  sessionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  sessionDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  attendanceSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  attendanceLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  attendanceStats: {
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
  },
  attendanceBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  attendanceProgress: {
    height: '100%',
    borderRadius: 3,
  },
  completionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  completionText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },

  // Modal styles
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
  timeRow: {
    flexDirection: 'row',
    gap: 12,
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
