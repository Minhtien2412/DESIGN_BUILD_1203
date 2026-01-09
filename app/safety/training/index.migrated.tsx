/**
 * Training Programs Screen - Migrated to Universal Components
 * Using ModuleLayout + UniversalList pattern
 */

import { ModuleLayout } from '@/components/layouts/ModuleLayout';
import { Loader } from '@/components/ui/loader';
import { UniversalList } from '@/components/universal/UniversalList';
import { useTrainingPrograms } from '@/hooks/useSafety';
import {
    TrainingType,
    type CreateTrainingProgramParams,
    type TrainingProgram,
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

export default function TrainingProgramsScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const [filter, setFilter] = useState<'all' | 'mandatory' | 'optional'>('all');
  const [modalVisible, setModalVisible] = useState(false);

  const { programs, loading, error, create, refetch } = useTrainingPrograms({
    projectId: projectId || '',
  });

  if (loading && programs.length === 0) {
    return <Loader />;
  }

  const mandatoryPrograms = programs.filter((p) => p.isMandatory);
  const optionalPrograms = programs.filter((p) => !p.isMandatory);

  const filteredPrograms =
    filter === 'mandatory'
      ? mandatoryPrograms
      : filter === 'optional'
      ? optionalPrograms
      : programs;

  return (
    <>
      <Stack.Screen options={{ title: 'Đào tạo An toàn', headerShown: false }} />

      <ModuleLayout
        title="Đào tạo An toàn"
        subtitle={`${programs.length} chương trình • ${mandatoryPrograms.length} bắt buộc • ${optionalPrograms.length} tùy chọn`}
        showBackButton
        headerRight={
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle" size={28} color="#0066CC" />
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
            style={[styles.filterTab, filter === 'mandatory' && styles.filterTabActive]}
            onPress={() => setFilter('mandatory')}
          >
            <Text
              style={[styles.filterTabText, filter === 'mandatory' && styles.filterTabTextActive]}
            >
              Bắt buộc
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'optional' && styles.filterTabActive]}
            onPress={() => setFilter('optional')}
          >
            <Text
              style={[styles.filterTabText, filter === 'optional' && styles.filterTabTextActive]}
            >
              Tùy chọn
            </Text>
          </TouchableOpacity>
        </View>

        {/* Universal List with custom program cards */}
        <UniversalList<TrainingProgram>
          config={{
            data: filteredPrograms,
            keyExtractor: (item) => item.id,
            renderItem: (item) => <ProgramCard program={item} />,
            onRefresh: refetch,
            emptyIcon: 'school',
            emptyMessage: 'Chưa có chương trình đào tạo nào',
            emptyAction: {
              label: 'Tạo chương trình',
              onPress: () => setModalVisible(true),
            },
          }}
        />
      </ModuleLayout>

      <AddProgramModal
        visible={modalVisible}
        projectId={projectId || ''}
        onClose={() => setModalVisible(false)}
        onCreate={async (params) => {
          try {
            await (create as any)(params);
            setModalVisible(false);
            Alert.alert('Thành công', 'Đã tạo chương trình đào tạo');
          } catch (err) {
            Alert.alert('Lỗi', 'Không thể tạo chương trình đào tạo');
          }
        }}
      />
    </>
  );
}

// Custom card for training programs
interface ProgramCardProps {
  program: TrainingProgram;
}

function ProgramCard({ program }: ProgramCardProps) {
  const typeIcon = getTrainingIcon(program.type);
  const typeColor = program.isMandatory ? '#000000' : '#0066CC';

  return (
    <TouchableOpacity
      style={styles.programCard}
      onPress={() => router.push(`/safety/training/${program.id}`)}
    >
      <View style={styles.programHeader}>
        <View style={[styles.typeIcon, { backgroundColor: `${typeColor}15` }]}>
          <Ionicons name={typeIcon as any} size={28} color={typeColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.programTitle}>{program.title}</Text>
          <Text style={styles.programType}>{getTrainingTypeLabel(program.type)}</Text>
        </View>
        {program.isMandatory && (
          <View style={styles.mandatoryBadge}>
            <Text style={styles.mandatoryText}>BẮT BUỘC</Text>
          </View>
        )}
      </View>

      {program.description && (
        <Text style={styles.programDescription} numberOfLines={2}>
          {program.description}
        </Text>
      )}

      <View style={styles.programInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="time" size={16} color="#666" />
          <Text style={styles.infoText}>{program.durationMinutes} phút</Text>
        </View>
        {program.validityPeriodMonths && (
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={16} color="#666" />
            <Text style={styles.infoText}>Hiệu lực: {program.validityPeriodMonths} tháng</Text>
          </View>
        )}
        {program.instructor && (
          <View style={styles.infoRow}>
            <Ionicons name="person" size={16} color="#666" />
            <Text style={styles.infoText}>{program.instructor}</Text>
          </View>
        )}
      </View>

      {program.requiredFor && program.requiredFor.length > 0 && (
        <View style={styles.rolesSection}>
          <Text style={styles.rolesLabel}>Yêu cầu cho:</Text>
          <View style={styles.rolesTags}>
            {program.requiredFor.slice(0, 3).map((role: string, idx: number) => (
              <View key={idx} style={styles.roleTag}>
                <Text style={styles.roleTagText}>{role}</Text>
              </View>
            ))}
            {program.requiredFor.length > 3 && (
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>+{program.requiredFor.length - 3}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {program.certificationIssued && (
        <View style={styles.certificationBadge}>
          <Ionicons name="ribbon" size={14} color="#0066CC" />
          <Text style={styles.certificationText}>Cấp chứng chỉ</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Modal form (preserved for Task 21)
interface AddProgramModalProps {
  visible: boolean;
  projectId: string;
  onClose: () => void;
  onCreate: (params: CreateTrainingProgramParams) => Promise<void>;
}

function AddProgramModal({ visible, projectId, onClose, onCreate }: AddProgramModalProps) {
  const [type, setType] = useState<TrainingType>(TrainingType.ORIENTATION);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [validityPeriodMonths, setValidityPeriodMonths] = useState('');
  const [isMandatory, setIsMandatory] = useState(false);
  const [instructor, setInstructor] = useState('');
  const [certificationIssued, setCertificationIssued] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên chương trình');
      return;
    }
    if (!durationMinutes || parseInt(durationMinutes) <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập thời lượng hợp lệ');
      return;
    }

    setCreating(true);
    try {
      await onCreate({
        projectId,
        type,
        title: title.trim(),
        description: description.trim() || '',
        duration: parseInt(durationMinutes),
        durationMinutes: parseInt(durationMinutes),
        validityPeriodMonths: validityPeriodMonths ? parseInt(validityPeriodMonths) : 0,
        isMandatory,
        instructor: instructor.trim() || '',
        certificationIssued,
        createdBy: 'current-user',
      });
      // Reset form
      setType(TrainingType.ORIENTATION);
      setTitle('');
      setDescription('');
      setDurationMinutes('');
      setValidityPeriodMonths('');
      setIsMandatory(false);
      setInstructor('');
      setCertificationIssued(false);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tạo chương trình đào tạo</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.inputLabel}>Loại đào tạo *</Text>
            <View style={styles.typeChips}>
              {Object.values(TrainingType).slice(0, 8).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, type === t && styles.typeChipActive]}
                  onPress={() => setType(t)}
                >
                  <Ionicons
                    name={getTrainingIcon(t) as any}
                    size={18}
                    color={type === t ? '#FFF' : '#666'}
                  />
                  <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>
                    {getTrainingTypeLabel(t)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Tên chương trình *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="VD: Định hướng an toàn công trường"
            />

            <Text style={styles.inputLabel}>Mô tả</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Mô tả nội dung chương trình"
              multiline
              numberOfLines={4}
            />

            <Text style={styles.inputLabel}>Thời lượng (phút) *</Text>
            <TextInput
              style={styles.input}
              value={durationMinutes}
              onChangeText={setDurationMinutes}
              keyboardType="number-pad"
              placeholder="VD: 120"
            />

            <Text style={styles.inputLabel}>Hiệu lực (tháng)</Text>
            <TextInput
              style={styles.input}
              value={validityPeriodMonths}
              onChangeText={setValidityPeriodMonths}
              keyboardType="number-pad"
              placeholder="VD: 12"
            />

            <Text style={styles.inputLabel}>Giảng viên</Text>
            <TextInput
              style={styles.input}
              value={instructor}
              onChangeText={setInstructor}
              placeholder="VD: Nguyễn Văn A"
            />

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setIsMandatory(!isMandatory)}
            >
              <Ionicons
                name={isMandatory ? 'checkbox' : 'square-outline'}
                size={24}
                color={isMandatory ? '#000000' : '#666'}
              />
              <Text style={styles.checkboxLabel}>Bắt buộc</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setCertificationIssued(!certificationIssued)}
            >
              <Ionicons
                name={certificationIssued ? 'checkbox' : 'square-outline'}
                size={24}
                color={certificationIssued ? '#0066CC' : '#666'}
              />
              <Text style={styles.checkboxLabel}>Cấp chứng chỉ</Text>
            </TouchableOpacity>
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
function getTrainingIcon(type: TrainingType): string {
  const icons: Partial<Record<TrainingType, string>> = {
    [TrainingType.ORIENTATION]: 'flag',
    [TrainingType.TOOLBOX_TALK]: 'construct',
    [TrainingType.FALL_PROTECTION]: 'warning',
    [TrainingType.ELECTRICAL_SAFETY]: 'flash',
    [TrainingType.FIRST_AID]: 'medical',
    [TrainingType.PPE_USAGE]: 'shield',
    [TrainingType.FIRE_SAFETY]: 'flame',
    [TrainingType.CONFINED_SPACE]: 'cube',
  };
  return icons[type] || 'school';
}

function getTrainingTypeLabel(type: TrainingType): string {
  const labels: Partial<Record<TrainingType, string>> = {
    [TrainingType.ORIENTATION]: 'Định hướng',
    [TrainingType.TOOLBOX_TALK]: 'Toolbox Talk',
    [TrainingType.FALL_PROTECTION]: 'Ngăn rơi',
    [TrainingType.ELECTRICAL_SAFETY]: 'An toàn điện',
    [TrainingType.FIRST_AID]: 'Sơ cứu',
    [TrainingType.PPE_USAGE]: 'Sử dụng PPE',
    [TrainingType.FIRE_SAFETY]: 'Phòng cháy',
    [TrainingType.CONFINED_SPACE]: 'Không gian hạn chế',
    [TrainingType.HAZARD_COMMUNICATION]: 'Truyền đạt nguy hiểm',
    [TrainingType.EMERGENCY_RESPONSE]: 'Ứng phó khẩn cấp',
  };
  return labels[type] || type;
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
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#0066CC',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },

  // Custom program card styles
  programCard: {
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
  programHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  typeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  programTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  programType: {
    fontSize: 13,
    color: '#666',
  },
  mandatoryBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
  },
  mandatoryText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: 'bold',
  },
  programDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  programInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
  },
  rolesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  rolesLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  rolesTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  roleTag: {
    backgroundColor: '#E8F4FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleTagText: {
    fontSize: 11,
    color: '#1565C0',
    fontWeight: '500',
  },
  certificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F4FF',
    padding: 8,
    borderRadius: 6,
    marginTop: 12,
  },
  certificationText: {
    fontSize: 12,
    color: '#004499',
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  typeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#FFF',
    gap: 6,
  },
  typeChipActive: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  typeChipText: {
    fontSize: 12,
    color: '#666',
  },
  typeChipTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
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
    backgroundColor: '#0066CC',
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
