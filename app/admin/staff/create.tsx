import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/loader';
import { Section } from '@/components/ui/section';
import { useAuth } from '@/context/AuthContext';
import { useDepartments, useRoles } from '@/hooks/useAdmin';
import { useThemeColor } from '@/hooks/use-theme-color';
import { apiFetch } from '@/services/api';
import { hasPermission } from '@/utils/permissions';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

export default function StaffCreateScreen() {
  const { user } = useAuth();
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');
  const mutedColor = useThemeColor({}, 'tabIconDefault');

  // Permission check
  useEffect(() => {
    if (!user?.admin || !hasPermission(user.permissions, 'staff', 'create')) {
      Alert.alert('Không có quyền', 'Bạn không có quyền tạo nhân viên mới', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [user]);

  // Form state
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    phonenumber: '',
    role: '',
    departments: [] as number[],
    active: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch roles and departments
  const { roles, loading: rolesLoading } = useRoles();
  const { departments, loading: deptsLoading } = useDepartments();

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
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }
    if (!formData.role) {
      newErrors.role = 'Vui lòng chọn vai trò';
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
    console.log('[StaffCreate] Creating staff...', formData);

    try {
      const payload = {
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phonenumber: formData.phonenumber.trim() || null,
        role: parseInt(formData.role),
        departments: formData.departments,
        active: formData.active ? 1 : 0,
      };

      const response = await apiFetch('/admin/staff', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      console.log('[StaffCreate] Success:', response);
      Alert.alert(
        'Thành công',
        'Nhân viên đã được tạo thành công',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('[StaffCreate] Error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tạo nhân viên');
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

  const isLoading = rolesLoading || deptsLoading;

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <Loader />
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
              <ThemedText type="title">Tạo nhân viên mới</ThemedText>
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

          {/* Account Info */}
          <Section>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Thông tin tài khoản
            </ThemedText>

            <Input
              label="Mật khẩu *"
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

          {/* Submit Button */}
          <Section>
            <Button
              onPress={handleSubmit}
              loading={submitting}
              disabled={submitting}
              fullWidth
            >
              Tạo nhân viên
            </Button>
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
});
