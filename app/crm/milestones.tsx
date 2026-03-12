/**
 * Project Milestones Screen
 * ==========================
 * 
 * Manage project milestones, track progress, mark completion
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { useMilestones } from '@/hooks/usePerfexAPI';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import type from perfex types
import type { Milestone as PerfexMilestone } from '@/types/perfex';

// Use Perfex Milestone type directly
type Milestone = PerfexMilestone;

export default function MilestonesScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  
  const { 
    milestones, 
    stats, 
    loading, 
    error, 
    refresh, 
    createMilestone, 
    updateMilestone, 
    deleteMilestone 
  } = useMilestones();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const cardBg = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');

  // Loading state
  if (loading && milestones.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: textColor }]}>Milestones</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={{ color: textColor, marginTop: 16 }}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: textColor }]}>Milestones</Text>
          <TouchableOpacity onPress={refresh}>
            <Ionicons name="refresh" size={22} color={primaryColor} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={{ color: '#EF4444', marginTop: 16, fontSize: 16 }}>Lỗi tải dữ liệu</Text>
          <TouchableOpacity onPress={refresh} style={{ marginTop: 12 }}>
            <Text style={{ color: primaryColor, fontWeight: '600' }}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleCreate = async (name: string, description: string, dueDate: Date) => {
    if (!projectId) return;

    try {
      await createMilestone({
        name,
        description,
        due_date: dueDate.toISOString().split('T')[0],
        project_id: projectId,
      });
      Alert.alert('Success', 'Milestone created');
      setShowCreateModal(false);
      await refresh();
    } catch (err) {
      console.error('Create milestone error:', err);
      Alert.alert('Error', 'Failed to create milestone');
    }
  };

  const handleMarkComplete = async (milestoneId: string) => {
    Alert.alert(
      'Mark Complete',
      'Are you sure you want to mark this milestone as complete?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              // Use date_finished field from Perfex Milestone type
              await updateMilestone(milestoneId, { date_finished: new Date().toISOString().split('T')[0] } as Partial<Milestone>);
              Alert.alert('Success', 'Milestone marked as complete');
              await refresh();
            } catch (err) {
              console.error('Mark complete error:', err);
              Alert.alert('Error', 'Failed to mark milestone as complete');
            }
          },
        },
      ]
    );
  };

  const getProgressPercentage = () => {
    if (milestones.length === 0) return 0;
    // Check if date_finished is set for completion status
    const completed = milestones.filter((m: Milestone) => m.date_finished).length;
    return Math.round((completed / milestones.length) * 100);
  };

  const renderMilestone = ({ item }: { item: Milestone }) => {
    const isCompleted = !!item.date_finished;
    const isOverdue =
      !isCompleted && new Date(item.due_date) < new Date();

    return (
      <View style={[styles.milestoneCard, { backgroundColor: cardBg, borderColor }]}>
        <View style={styles.milestoneHeader}>
          <TouchableOpacity
            onPress={() => !isCompleted && handleMarkComplete(item.id)}
            disabled={isCompleted}
          >
            <Ionicons
              name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
              size={32}
              color={isCompleted ? '#22c55e' : primaryColor}
            />
          </TouchableOpacity>
          
          <View style={styles.milestoneInfo}>
            <Text
              style={[
                styles.milestoneName,
                { color: textColor },
                isCompleted && styles.completedText,
              ]}
            >
              {item.name}
            </Text>
            
            {item.description && (
              <Text style={[styles.milestoneDesc, { color: textColor }]}>
                {item.description}
              </Text>
            )}
            
            <View style={styles.milestoneMeta}>
              <View style={[styles.dateChip, isOverdue && styles.overdueChip]}>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={isOverdue ? '#ef4444' : textColor}
                />
                <Text
                  style={[
                    styles.dateText,
                    { color: isOverdue ? '#ef4444' : textColor },
                  ]}
                >
                  {new Date(item.due_date).toLocaleDateString()}
                </Text>
              </View>
              
              {isCompleted && item.date_finished && (
                <View style={[styles.completedChip, { backgroundColor: '#22c55e20' }]}>
                  <Ionicons name="checkmark" size={14} color="#22c55e" />
                  <Text style={[styles.completedText, { color: '#22c55e' }]}>
                    {new Date(item.date_finished).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>Milestones</Text>
        <TouchableOpacity onPress={() => setShowCreateModal(true)}>
          <Ionicons name="add-circle" size={28} color={primaryColor} />
        </TouchableOpacity>
      </View>

      {/* Progress Card */}
      <View style={[styles.progressCard, { backgroundColor: cardBg }]}>
        <Text style={[styles.progressLabel, { color: textColor }]}>
          Project Progress
        </Text>
        <View style={styles.progressRow}>
          <View style={[styles.progressBar, { backgroundColor: borderColor }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${getProgressPercentage()}%`, backgroundColor: primaryColor },
              ]}
            />
          </View>
          <Text style={[styles.progressPercent, { color: primaryColor }]}>
            {getProgressPercentage()}%
          </Text>
        </View>
        <Text style={[styles.progressStats, { color: textColor }]}>
          {milestones.filter((m: Milestone) => m.date_finished).length} of {milestones.length} completed
        </Text>
      </View>

      <FlatList
        data={milestones}
        renderItem={renderMilestone}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Ionicons name="flag-outline" size={64} color="#6b7280" />
            <Text style={[styles.emptyText, { color: textColor }]}>
              No milestones yet
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: primaryColor }]}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.emptyButtonText}>Create First Milestone</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <CreateMilestoneModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        backgroundColor={backgroundColor}
        cardBg={cardBg}
        textColor={textColor}
        primaryColor={primaryColor}
        borderColor={borderColor}
      />
    </SafeAreaView>
  );
}

// Create Milestone Modal
interface CreateMilestoneModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string, dueDate: Date) => void;
  backgroundColor: string;
  cardBg: string;
  textColor: string;
  primaryColor: string;
  borderColor: string;
}

function CreateMilestoneModal({
  visible,
  onClose,
  onSubmit,
  backgroundColor,
  cardBg,
  textColor,
  primaryColor,
  borderColor,
}: CreateMilestoneModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter milestone name');
      return;
    }
    onSubmit(name, description, dueDate);
    setName('');
    setDescription('');
    setDueDate(new Date());
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              New Milestone
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.input, { color: textColor, borderColor }]}
            placeholder="Milestone name"
            placeholderTextColor="#6b7280"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={[styles.input, styles.textArea, { color: textColor, borderColor }]}
            placeholder="Description (optional)"
            placeholderTextColor="#6b7280"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />

          <TouchableOpacity
            style={[styles.dateButton, { borderColor }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={textColor} />
            <Text style={[styles.dateButtonText, { color: textColor }]}>
              Due: {dueDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setDueDate(date);
              }}
            />
          )}

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: primaryColor }]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Create Milestone</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressStats: {
    fontSize: 12,
    opacity: 0.7,
  },
  listContent: {
    padding: 16,
  },
  milestoneCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  milestoneHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  milestoneDesc: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  milestoneMeta: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  overdueChip: {
    backgroundColor: '#fef2f2',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  completedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '500',
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 24,
  },
  emptyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
  },
  dateButtonText: {
    fontSize: 16,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
