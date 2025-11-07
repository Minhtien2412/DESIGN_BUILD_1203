import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/loader';
import { Section } from '@/components/ui/section';
import { useAuth } from '@/context/AuthContext';
import { useDepartments, useRoles, useStaffDetail } from '@/hooks/useAdmin';
import { useThemeColor } from '@/hooks/use-theme-color';
import { apiFetch } from '@/services/api';
import { hasPermission } from '@/utils/permissions';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

export default function StaffEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');
  const mutedColor = useThemeColor({}, 'tabIconDefault');

  // Permission check
  useEffect(() => {
    if (!user?.admin || !hasPermission(user.permissions, 'staff', 'edit')) {
      Alert.alert('Không có quyền', 'Bạn không có quyền chỉnh sửa nhân viên', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [user]);

  // Fetch staff detail
  const { staff, loading: staffLoading, error, refresh } = useStaffDetail(id ? parseInt(id) : 0);
  const { roles, loading: rolesLoading } = useRoles();
  const { departments, loading: deptsLoading } = useDepartments();

  // Form state
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phonenumber: '',
    role: '',
    departments: [] as number[],
    active: true,
    changePassword: false,
    password: '',
    confirmPassword: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with staff data
  useEffect(() => {
    if (staff) {
      setFormData({
        firstname: staff.firstname,
        lastname: staff.lastname,
        email: staff.email,
        phonenumber: staff.phonenumber || '',
        role: staff.role.roleid.toString(),
        departments: staff.departments?.map(d => d.departmentid) || [],
        active: staff.active === 1,
        changePassword: false,
        password: '',
        confirmPassword: '',
      });
    }
  }, [staff]);

  // Validation
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstname.trim()) {
      newErrors.firstname = 'Vui lòng nhập tên';
    }
    if (!formData.lastname.trim()) {
      newErrors.lastname = 'Vui lòng nhập họ';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!formData.role) {
      newErrors.role = 'Vui lòng chọn vai trò';
    }

    // Password validation only if changing password
    if (formData.changePassword) {
      if (!formData.password) {
        newErrors.password = 'Vui lòng nhập mật khẩu mới';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu không khớp';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin');
      return;
    }

    setSubmitting(true);
    console.log('[StaffEdit] Updating staff...', formData);

    try {
      const payload: any = {
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        email: formData.email.trim().toLowerCase(),
        phonenumber: formData.phonenumber.trim() || null,
        role: parseInt(formData.role),
        departments: formData.departments,
        active: formData.active ? 1 : 0,
      };

      // Add password only if changing
      if (formData.changePassword && formData.password) {
        payload.password = formData.password;
      }

      const response = await apiFetch(`/admin/staff/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      console.log('[StaffEdit] Success:', response);
      Alert.alert(
        'Thành công',
        'Thông tin nhân viên đã được cập nhật',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('[StaffEdit] Error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật nhân viên');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle department selection
  const toggleDepartment = (deptId: number) => {
    setFormData(prev => ({
      ...prev,
      departments: prev.departments.includes(deptId)
        ? prev.departments.filter(id => id !== deptId)
        : [...prev.departments, deptId]
    }));
  };

  // Handle delete
  const handleDelete = () => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa nhân viên ${staff?.firstname} ${staff?.lastname}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiFetch(`/admin/staff/${id}`, { method: 'DELETE' });
              Alert.alert('Thành công', 'Nhân viên đã được xóa', [
                { text: 'OK', onPress: () => router.replace('/admin/staff') }
              ]);
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa nhân viên');
            }
          }
        }
      ]
    );
  };

  const isLoading = staffLoading || rolesLoading || deptsLoading;

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <Loader />
      </ThemedView>
    );
  }

  if (error || !staff) {
    return (
      <ThemedView style={styles.container}>
        <Container>
          <Section>
            <ThemedText>Không tìm thấy nhân viên</ThemedText>
            <Button onPress={() => router.back()}>Quay lại</Button>
          </Section>
        </Container>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Container>
          {/* Header */}
          <Section>
            <View style={styles.header}>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color={iconColor} />
              </Button>
              <ThemedText type="title">Chỉnh sửa nhân viên</ThemedText>
            </View>
          </Section>

          {/* Personal Info */}
          <Section>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Thông tin cá nhân
            </ThemedText>
            
            <Input
              label="Tên *"
              value={formData.firstname}
              onChangeText={(text) => setFormData(prev => ({ ...prev, firstname: text }))}
              placeholder="Nhập tên"
              error={errors.firstname}
              autoCapitalize="words"
            />

            <Input
              label="Họ *"
              value={formData.lastname}
              onChangeText={(text) => setFormData(prev => ({ ...prev, lastname: text }))}
              placeholder="Nhập họ"
              error={errors.lastname}
              autoCapitalize="words"
            />

            <Input
              label="Email *"
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              placeholder="email@example.com"
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Input
              label="Số điện thoại"
              value={formData.phonenumber}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phonenumber: text }))}
              placeholder="0123456789"
              keyboardType="phone-pad"
              autoComplete="tel"
            />
          </Section>

          {/* Password Change Section */}
          <Section>
            <View style={[styles.passwordSection, { borderColor }]}>
              <View style={styles.passwordHeader}>
                <ThemedText type="defaultSemiBold">Đổi mật khẩu</ThemedText>
                <Button
                  variant={formData.changePassword ? 'primary' : 'ghost'}
                  size="sm"
                  onPress={() => setFormData(prev => ({ 
                    ...prev, 
                    changePassword: !prev.changePassword,
                    password: '',
                    confirmPassword: ''
                  }))}
                >
                  {formData.changePassword ? 'Hủy' : 'Đổi mật khẩu'}
                </Button>
              </View>

              {formData.changePassword && (
                <View style={styles.passwordFields}>
                  <Input
                    label="Mật khẩu mới *"
                    value={formData.password}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                    placeholder="Tối thiểu 6 ký tự"
                    error={errors.password}
                    secureTextEntry
                    autoComplete="password-new"
                  />

                  <Input
                    label="Xác nhận mật khẩu *"
                    value={formData.confirmPassword}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                    placeholder="Nhập lại mật khẩu"
                    error={errors.confirmPassword}
                    secureTextEntry
                    autoComplete="password-new"
                  />
                </View>
              )}
            </View>
          </Section>

          {/* Role Selection */}
          <Section>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Vai trò *
            </ThemedText>
            {errors.role && (
              <ThemedText style={styles.errorText}>{errors.role}</ThemedText>
            )}
            <View style={styles.roleGrid}>
              {roles.map((role) => (
                <Button
                  key={role.roleid}
                  variant={formData.role === role.roleid.toString() ? 'primary' : 'ghost'}
                  size="sm"
                  onPress={() => setFormData(prev => ({ ...prev, role: role.roleid.toString() }))}
                  style={styles.roleButton}
                >
                  {role.name}
                </Button>
              ))}
            </View>
          </Section>

          {/* Departments Selection */}
          <Section>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Phòng ban
            </ThemedText>
            <ThemedText style={[styles.helperText, { color: mutedColor }]}>
              Chọn các phòng ban mà nhân viên này thuộc về
            </ThemedText>
            <View style={styles.deptGrid}>
              {departments.map((dept) => (
                <Button
                  key={dept.departmentid}
                  variant={formData.departments.includes(dept.departmentid) ? 'primary' : 'ghost'}
                  size="sm"
                  onPress={() => toggleDepartment(dept.departmentid)}
                  style={styles.deptButton}
                >
                  {dept.name}
                </Button>
              ))}
            </View>
          </Section>

          {/* Status Toggle */}
          <Section>
            <View style={[styles.statusRow, { borderColor }]}>
              <View style={styles.statusInfo}>
                <ThemedText type="defaultSemiBold">Trạng thái hoạt động</ThemedText>
                <ThemedText style={[styles.helperText, { color: mutedColor }]}>
                  {formData.active ? 'Nhân viên có thể đăng nhập' : 'Nhân viên bị vô hiệu hóa'}
                </ThemedText>
              </View>
              <Button
                variant={formData.active ? 'primary' : 'ghost'}
                size="sm"
                onPress={() => setFormData(prev => ({ ...prev, active: !prev.active }))}
              >
                {formData.active ? 'Hoạt động' : 'Vô hiệu hóa'}
              </Button>
            </View>
          </Section>

          {/* Action Buttons */}
          <Section>
            <View style={styles.actions}>
              <Button
                onPress={handleSubmit}
                loading={submitting}
                disabled={submitting}
                style={styles.submitButton}
              >
                Cập nhật
              </Button>

              {hasPermission(user?.permissions, 'staff', 'delete') && (
                <Button
                  variant="secondary"
                  onPress={handleDelete}
                  disabled={submitting}
                  style={styles.deleteButton}
                >
                  Xóa nhân viên
                </Button>
              )}
            </View>
          </Section>
        </Container>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    padding: 0,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  passwordSection: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passwordFields: {
    marginTop: 16,
    gap: 12,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleButton: {
    minWidth: 100,
  },
  deptGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  deptButton: {
    minWidth: 100,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  statusInfo: {
    flex: 1,
  },
  helperText: {
    fontSize: 13,
    marginTop: 4,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginBottom: 8,
  },
  actions: {
    gap: 12,
  },
  submitButton: {
    flex: 1,
  },
  deleteButton: {
    flex: 1,
  },
});
