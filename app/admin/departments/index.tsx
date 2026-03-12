import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/loader';
import { Section } from '@/components/ui/section';
import { useAuth } from '@/context/AuthContext';
import type { Department } from '@/hooks/useAdmin';
import { useDepartments } from '@/hooks/useAdmin';
import { useThemeColor } from '@/hooks/use-theme-color';
import { apiFetch } from '@/services/api';
import { hasPermission } from '@/utils/permissions';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function DepartmentsManagementScreen() {
  const { user } = useAuth();
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');
  const mutedColor = useThemeColor({}, 'tabIconDefault');
  const cardBg = useThemeColor({}, 'surface');

  // Permission check
  useEffect(() => {
    if (!user?.admin || !hasPermission(user.permissions, 'departments', 'view')) {
      Alert.alert('Không có quyền', 'Bạn không có quyền xem phòng ban', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [user]);

  const { departments, loading, error, refresh } = useDepartments();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: null as number | null,
  });

  // Reset form
  const resetForm = () => {
    setFormData({ name: '', description: '', parent_id: null });
    setShowCreateForm(false);
    setEditingDept(null);
  };

  // Handle create
  const handleCreate = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên phòng ban');
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch('/admin/departments', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          parent_id: formData.parent_id,
        }),
      });

      Alert.alert('Thành công', 'Phòng ban đã được tạo');
      resetForm();
      refresh();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tạo phòng ban');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle update
  const handleUpdate = async () => {
    if (!editingDept) return;
    if (!formData.name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên phòng ban');
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch(`/admin/departments/${editingDept.departmentid}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          parent_id: formData.parent_id,
        }),
      });

      Alert.alert('Thành công', 'Phòng ban đã được cập nhật');
      resetForm();
      refresh();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật phòng ban');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = (dept: Department) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa phòng ban "${dept.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiFetch(`/admin/departments/${dept.departmentid}`, { method: 'DELETE' });
              Alert.alert('Thành công', 'Phòng ban đã được xóa');
              refresh();
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa phòng ban');
            }
          }
        }
      ]
    );
  };

  // Handle edit
  const handleEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      description: dept.description || '',
      parent_id: dept.parent_id || null,
    });
    setShowCreateForm(true);
  };

  if (loading && !departments.length) {
    return (
      <ThemedView style={styles.container}>
        <Loader />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <Container>
          <Section>
            <ThemedText>Lỗi: {error}</ThemedText>
            <Button onPress={refresh}>Thử lại</Button>
          </Section>
        </Container>
      </ThemedView>
    );
  }

  // Organize departments into tree structure
  const rootDepartments = departments.filter(d => !d.parent_id);
  const getSubDepartments = (parentId: number) =>
    departments.filter(d => d.parent_id === parentId);

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={rootDepartments}
        keyExtractor={(item) => item.departmentid.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Container>
            {/* Header */}
            <Section>
              <View style={styles.header}>
                <View>
                  <ThemedText type="title">Quản lý phòng ban</ThemedText>
                  <ThemedText style={[styles.subtitle, { color: mutedColor }]}>
                    {departments.length} phòng ban
                  </ThemedText>
                </View>
                {hasPermission(user?.permissions, 'departments', 'create') && (
                  <Button
                    variant="primary"
                    size="sm"
                    onPress={() => {
                      resetForm();
                      setShowCreateForm(!showCreateForm);
                    }}
                  >
                    <Ionicons name={showCreateForm ? 'close' : 'add'} size={20} color="#fff" />
                    <ThemedText style={styles.buttonText}>
                      {showCreateForm ? 'Hủy' : 'Tạo phòng ban'}
                    </ThemedText>
                  </Button>
                )}
              </View>
            </Section>

            {/* Create/Edit Form */}
            {showCreateForm && (
              <Section>
                <View style={[styles.form, { backgroundColor: cardBg, borderColor }]}>
                  <ThemedText type="subtitle" style={styles.formTitle}>
                    {editingDept ? 'Chỉnh sửa phòng ban' : 'Tạo phòng ban mới'}
                  </ThemedText>

                  <Input
                    label="Tên phòng ban *"
                    value={formData.name}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                    placeholder="Nhập tên phòng ban"
                  />

                  <Input
                    label="Mô tả"
                    value={formData.description}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                    placeholder="Nhập mô tả (không bắt buộc)"
                    multiline
                    numberOfLines={3}
                  />

                  {/* Parent Department Selector */}
                  <View>
                    <ThemedText style={styles.label}>Phòng ban cha</ThemedText>
                    <View style={styles.parentGrid}>
                      <Button
                        variant={formData.parent_id === null ? 'primary' : 'ghost'}
                        size="sm"
                        onPress={() => setFormData(prev => ({ ...prev, parent_id: null }))}
                      >
                        Không có
                      </Button>
                      {departments
                        .filter(d => !editingDept || d.departmentid !== editingDept.departmentid)
                        .map((dept) => (
                          <Button
                            key={dept.departmentid}
                            variant={formData.parent_id === dept.departmentid ? 'primary' : 'ghost'}
                            size="sm"
                            onPress={() => setFormData(prev => ({ ...prev, parent_id: dept.departmentid }))}
                          >
                            {dept.name}
                          </Button>
                        ))}
                    </View>
                  </View>

                  <View style={styles.formActions}>
                    <Button
                      variant="ghost"
                      onPress={resetForm}
                      style={styles.actionButton}
                      disabled={submitting}
                    >
                      Hủy
                    </Button>
                    <Button
                      onPress={editingDept ? handleUpdate : handleCreate}
                      loading={submitting}
                      disabled={submitting}
                      style={styles.actionButton}
                    >
                      {editingDept ? 'Cập nhật' : 'Tạo'}
                    </Button>
                  </View>
                </View>
              </Section>
            )}
          </Container>
        }
        renderItem={({ item }) => (
          <Container fullWidth>
            {/* Parent Department */}
            <View style={[styles.deptCard, { backgroundColor: cardBg, borderColor }]}>
              <View style={styles.deptHeader}>
                <View style={styles.deptIcon}>
                  <Ionicons name="business-outline" size={24} color={iconColor} />
                </View>
                <View style={styles.deptInfo}>
                  <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                  {item.description && (
                    <ThemedText style={[styles.deptDesc, { color: mutedColor }]} numberOfLines={2}>
                      {item.description}
                    </ThemedText>
                  )}
                  <ThemedText style={[styles.deptStats, { color: mutedColor }]}>
                    {item.total_staff || 0} nhân viên
                  </ThemedText>
                </View>
                <View style={styles.deptActions}>
                  {hasPermission(user?.permissions, 'departments', 'edit') && (
                    <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionIcon}>
                      <Ionicons name="create-outline" size={20} color={iconColor} />
                    </TouchableOpacity>
                  )}
                  {hasPermission(user?.permissions, 'departments', 'delete') && (
                    <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionIcon}>
                      <Ionicons name="trash-outline" size={20} color="#000000" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Sub-departments */}
              {getSubDepartments(item.departmentid).map((subDept) => (
                <View key={subDept.departmentid} style={[styles.subDept, { borderColor }]}>
                  <View style={styles.subDeptContent}>
                    <Ionicons name="arrow-forward" size={16} color={mutedColor} />
                    <View style={styles.subDeptInfo}>
                      <ThemedText type="defaultSemiBold">{subDept.name}</ThemedText>
                      {subDept.description && (
                        <ThemedText style={[styles.subDeptDesc, { color: mutedColor }]} numberOfLines={1}>
                          {subDept.description}
                        </ThemedText>
                      )}
                      <ThemedText style={[styles.subDeptStats, { color: mutedColor }]}>
                        {subDept.total_staff || 0} nhân viên
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.subDeptActions}>
                    {hasPermission(user?.permissions, 'departments', 'edit') && (
                      <TouchableOpacity onPress={() => handleEdit(subDept)} style={styles.actionIcon}>
                        <Ionicons name="create-outline" size={18} color={iconColor} />
                      </TouchableOpacity>
                    )}
                    {hasPermission(user?.permissions, 'departments', 'delete') && (
                      <TouchableOpacity onPress={() => handleDelete(subDept)} style={styles.actionIcon}>
                        <Ionicons name="trash-outline" size={18} color="#000000" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </Container>
        )}
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 4,
  },
  form: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  formTitle: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  parentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  deptCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  deptHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  deptIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deptInfo: {
    flex: 1,
  },
  deptDesc: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  deptStats: {
    fontSize: 12,
    marginTop: 4,
  },
  deptActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIcon: {
    padding: 8,
  },
  subDept: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  subDeptContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  subDeptInfo: {
    flex: 1,
  },
  subDeptDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  subDeptStats: {
    fontSize: 11,
    marginTop: 2,
  },
  subDeptActions: {
    flexDirection: 'row',
    gap: 8,
  },
});
