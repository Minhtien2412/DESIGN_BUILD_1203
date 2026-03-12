import { useDependencies, useTasks } from '@/hooks/useTimeline';
import { DependencyType } from '@/types/timeline';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const DEPENDENCY_TYPES: {
  value: DependencyType;
  label: string;
  short: string;
  description: string;
}[] = [
  {
    value: DependencyType.FINISH_TO_START,
    label: 'Kết thúc - Bắt đầu',
    short: 'FS',
    description: 'B chỉ có thể bắt đầu sau khi A kết thúc',
  },
  {
    value: DependencyType.START_TO_START,
    label: 'Bắt đầu - Bắt đầu',
    short: 'SS',
    description: 'B có thể bắt đầu khi A bắt đầu',
  },
  {
    value: DependencyType.FINISH_TO_FINISH,
    label: 'Kết thúc - Kết thúc',
    short: 'FF',
    description: 'B có thể kết thúc khi A kết thúc',
  },
  {
    value: DependencyType.START_TO_FINISH,
    label: 'Bắt đầu - Kết thúc',
    short: 'SF',
    description: 'B có thể kết thúc khi A bắt đầu',
  },
];

export default function DependenciesScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { dependencies, loading, deleteDependency } = useDependencies(projectId!);
  const { tasks } = useTasks(undefined, projectId);
  const [selectedType, setSelectedType] = useState<DependencyType | 'ALL'>('ALL');

  const getTaskName = (taskId: string) => {
    return tasks.find((t) => t.id === taskId)?.name || 'Unknown';
  };

  const getDependencyTypeInfo = (type: DependencyType) => {
    return DEPENDENCY_TYPES.find((t) => t.value === type)!;
  };

  const filteredDependencies =
    selectedType === 'ALL'
      ? dependencies
      : dependencies.filter((d) => d.type === selectedType);

  const handleDelete = (dependencyId: string, predecessorName: string, successorName: string) => {
    Alert.alert(
      'Xác nhận xóa',
      `Xóa phụ thuộc:\n"${predecessorName}" → "${successorName}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDependency(dependencyId);
              Alert.alert('Thành công', 'Phụ thuộc đã được xóa');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa phụ thuộc');
            }
          },
        },
      ]
    );
  };

  const handleAddDependency = () => {
    Alert.alert(
      'Thêm phụ thuộc',
      'Tính năng thêm phụ thuộc sẽ được triển khai với task selector',
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, selectedType === 'ALL' && styles.filterChipActive]}
              onPress={() => setSelectedType('ALL')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedType === 'ALL' && styles.filterChipTextActive,
                ]}
              >
                Tất cả ({dependencies.length})
              </Text>
            </TouchableOpacity>

            {DEPENDENCY_TYPES.map((type) => {
              const count = dependencies.filter((d) => d.type === type.value).length;
              return (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.filterChip,
                    selectedType === type.value && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedType(type.value)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedType === type.value && styles.filterChipTextActive,
                    ]}
                  >
                    {type.short} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#0D9488" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Về phụ thuộc công việc</Text>
            <Text style={styles.infoText}>
              Phụ thuộc xác định thứ tự thực hiện các công việc. Khi công việc A phụ thuộc
              vào B, hệ thống sẽ tự động điều chỉnh lịch trình khi có thay đổi.
            </Text>
          </View>
        </View>

        {/* Dependency Types Guide */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Các loại phụ thuộc</Text>
          {DEPENDENCY_TYPES.map((type) => (
            <View key={type.value} style={styles.typeCard}>
              <View style={styles.typeHeader}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{type.short}</Text>
                </View>
                <Text style={styles.typeLabel}>{type.label}</Text>
              </View>
              <Text style={styles.typeDescription}>{type.description}</Text>
            </View>
          ))}
        </View>

        {/* Dependencies List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Danh sách phụ thuộc ({filteredDependencies.length})
            </Text>
          </View>

          {filteredDependencies.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="git-branch-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>
                {selectedType === 'ALL'
                  ? 'Chưa có phụ thuộc nào'
                  : `Không có phụ thuộc loại ${getDependencyTypeInfo(selectedType as DependencyType).short}`}
              </Text>
            </View>
          ) : (
            filteredDependencies.map((dependency) => {
              const typeInfo = getDependencyTypeInfo(dependency.type);
              const predecessorName = getTaskName(dependency.predecessorId);
              const successorName = getTaskName(dependency.successorId);

              return (
                <View key={dependency.id} style={styles.dependencyCard}>
                  <View style={styles.dependencyHeader}>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>{typeInfo.short}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() =>
                        handleDelete(dependency.id, predecessorName, successorName)
                      }
                    >
                      <Ionicons name="trash-outline" size={18} color="#000000" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.dependencyFlow}>
                    <View style={styles.taskBox}>
                      <Ionicons name="checkbox-outline" size={16} color="#666" />
                      <Text style={styles.taskBoxText} numberOfLines={2}>
                        {predecessorName}
                      </Text>
                    </View>

                    <View style={styles.arrow}>
                      <Ionicons name="arrow-forward" size={20} color="#0D9488" />
                    </View>

                    <View style={styles.taskBox}>
                      <Ionicons name="checkbox-outline" size={16} color="#666" />
                      <Text style={styles.taskBoxText} numberOfLines={2}>
                        {successorName}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.dependencyDescription}>{typeInfo.description}</Text>

                  {dependency.lagDays !== undefined && dependency.lagDays !== 0 && (
                    <View style={styles.lagBox}>
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color={dependency.lagDays > 0 ? '#0D9488' : '#0D9488'}
                      />
                      <Text
                        style={[
                          styles.lagText,
                          {
                            color: dependency.lagDays > 0 ? '#0D9488' : '#0D9488',
                          },
                        ]}
                      >
                        {dependency.lagDays > 0 ? 'Trễ' : 'Sớm'} {Math.abs(dependency.lagDays)}{' '}
                        ngày
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Add FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleAddDependency}>
        <Ionicons name="add" size={28} color="#fff" />
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
  filterBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  filterChipActive: {
    backgroundColor: '#0D9488',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#F0FDFA',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 18,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  typeCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#0D9488',
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  typeDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
  },
  dependencyCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  dependencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteButton: {
    padding: 4,
  },
  dependencyFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  taskBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  taskBoxText: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  arrow: {
    width: 30,
    alignItems: 'center',
  },
  dependencyDescription: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  lagBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  lagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
