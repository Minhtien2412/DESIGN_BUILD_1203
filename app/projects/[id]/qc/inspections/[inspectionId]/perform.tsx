import ChecklistItemComponent from '@/components/construction/ChecklistItem';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import {
    CheckItemStatus,
    Inspection,
    QCInspectionService,
} from '@/services/api/qc-inspections.mock';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PerformInspectionScreen() {
  const { id: projectId, inspectionId } = useLocalSearchParams<{ id: string; inspectionId: string }>();

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInspection();
  }, [inspectionId]);

  const loadInspection = async () => {
    try {
      setLoading(true);
      const data = await QCInspectionService.getInspection(inspectionId);
      setInspection(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải thông tin kiểm tra');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = (itemId: string) => {
    if (!inspection) return;

    const updatedChecklist = inspection.checklist.map(item => {
      if (item.id === itemId) {
        // Cycle through: pending -> pass -> fail -> pending
        let newStatus: CheckItemStatus;
        switch (item.status) {
          case 'pending':
            newStatus = 'pass';
            break;
          case 'pass':
            newStatus = 'fail';
            break;
          case 'fail':
            newStatus = 'pending';
            break;
          default:
            newStatus = 'pending';
        }
        return { ...item, status: newStatus };
      }
      return item;
    });

    setInspection({ ...inspection, checklist: updatedChecklist });
  };

  const handleAddNote = (itemId: string) => {
    if (!inspection) return;

    Alert.prompt(
      'Ghi chú',
      'Nhập ghi chú cho mục này:',
      (text) => {
        const updatedChecklist = inspection.checklist.map(item =>
          item.id === itemId ? { ...item, notes: text } : item
        );
        setInspection({ ...inspection, checklist: updatedChecklist });
      }
    );
  };

  const handleComplete = async () => {
    if (!inspection) return;

    const pending = inspection.checklist.filter(item => item.status === 'pending');
    
    if (pending.length > 0) {
      Alert.alert(
        'Cảnh báo',
        `Còn ${pending.length} mục chưa kiểm tra. Bạn có muốn tiếp tục?`,
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Hoàn thành', onPress: saveInspection },
        ]
      );
    } else {
      saveInspection();
    }
  };

  const saveInspection = async () => {
    if (!inspection) return;

    try {
      setSaving(true);

      await QCInspectionService.updateInspection(inspection.id, {
        checklist: inspection.checklist,
        status: 'completed',
        completedDate: new Date().toISOString(),
      });

      Alert.alert('Thành công', 'Đã lưu kết quả kiểm tra', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu kết quả');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !inspection) {
    return (
      <Container fullWidth>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thực hiện kiểm tra</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </Container>
    );
  }

  const stats = {
    total: inspection.checklist.length,
    pass: inspection.checklist.filter(item => item.status === 'pass').length,
    fail: inspection.checklist.filter(item => item.status === 'fail').length,
    pending: inspection.checklist.filter(item => item.status === 'pending').length,
  };

  const passRate = stats.total > 0 ? Math.round((stats.pass / stats.total) * 100) : 0;

  // Group checklist by category
  const groupedChecklist = inspection.checklist.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof inspection.checklist>);

  return (
    <Container fullWidth>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thực hiện kiểm tra</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.inspectionTitle}>{inspection.title}</Text>
            {inspection.description && (
              <Text style={styles.inspectionDescription}>{inspection.description}</Text>
            )}
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={16} color="#6b7280" />
              <Text style={styles.infoText}>Kiểm tra viên: {inspection.inspector}</Text>
            </View>
            {inspection.location && (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color="#6b7280" />
                <Text style={styles.infoText}>{inspection.location}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color="#6b7280" />
              <Text style={styles.infoText}>
                {new Date(inspection.scheduledDate).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          </View>

          {/* Progress Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.pass}</Text>
                <Text style={[styles.statLabel, { color: '#0066CC' }]}>Đạt</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.fail}</Text>
                <Text style={[styles.statLabel, { color: '#000000' }]}>Không đạt</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.pending}</Text>
                <Text style={[styles.statLabel, { color: '#0066CC' }]}>Chưa kiểm tra</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { fontSize: 24, color: '#3b82f6' }]}>
                  {passRate}%
                </Text>
                <Text style={styles.statLabel}>Tỷ lệ đạt</Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressSegment, { 
                backgroundColor: '#0066CC', 
                width: `${(stats.pass / stats.total) * 100}%` 
              }]} />
              <View style={[styles.progressSegment, { 
                backgroundColor: '#000000', 
                width: `${(stats.fail / stats.total) * 100}%` 
              }]} />
              <View style={[styles.progressSegment, { 
                backgroundColor: '#0066CC', 
                width: `${(stats.pending / stats.total) * 100}%` 
              }]} />
            </View>
          </View>

          {/* Checklist by Category */}
          {Object.entries(groupedChecklist).map(([category, items]) => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category}</Text>
              <View style={styles.checklistItems}>
                {items.map(item => (
                  <ChecklistItemComponent
                    key={item.id}
                    title={item.description}
                    status={item.status === 'pass' ? 'passed' : item.status === 'fail' ? 'failed' : 'pending'}
                    onStatusChange={(status) => {
                      // Handle status change
                      handleToggleItem(item.id);
                    }}
                    notes={item.notes}
                  />
                ))}
              </View>
            </View>
          ))}

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              variant="primary"
              onPress={handleComplete}
              loading={saving}
              disabled={saving}
            >
              Hoàn thành kiểm tra
            </Button>
            <Button
              variant="outline"
              onPress={() => router.back()}
              disabled={saving}
            >
              Lưu nháp
            </Button>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 15,
    color: '#9ca3af',
  },
  content: {
    padding: 16,
    gap: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  inspectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  inspectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#6b7280',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  progressSegment: {
    height: '100%',
  },
  categorySection: {
    gap: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  checklistItems: {
    gap: 8,
  },
  actions: {
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
});
