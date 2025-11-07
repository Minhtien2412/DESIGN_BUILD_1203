import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRegister } from '../hooks/api';

type UserRole = 'khach-hang' | 'nha-thau' | 'thau-phu' | 'cong-ty';

const RegisterScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'khach-hang' as UserRole,
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const registerMutation = useRegister();

  const roleOptions = [
    { value: 'khach-hang', label: 'Khách hàng' },
    { value: 'nha-thau', label: 'Nhà thầu' },
    { value: 'thau-phu', label: 'Thầu phụ' },
    { value: 'cong-ty', label: 'Công ty' },
  ];

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ tên');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return false;
    }
    if (!formData.password) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return false;
    }
    if (!acceptTerms) {
      Alert.alert('Lỗi', 'Vui lòng đồng ý với điều khoản sử dụng');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await registerMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      });
      Alert.alert('Thành công', 'Đăng ký tài khoản thành công');
    } catch (error: any) {
      Alert.alert('Đăng ký thất bại', error.message || 'Có lỗi xảy ra');
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Đăng ký tài khoản</Text>

          <TextInput
            style={styles.input}
            placeholder="Họ và tên"
            value={formData.name}
            onChangeText={(value) => updateFormData('name', value)}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Số điện thoại"
            value={formData.phone}
            onChangeText={(value) => updateFormData('phone', value)}
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Xác nhận mật khẩu"
            value={formData.confirmPassword}
            onChangeText={(value) => updateFormData('confirmPassword', value)}
            secureTextEntry
          />

          <View style={styles.roleSection}>
            <Text style={styles.roleTitle}>Loại tài khoản:</Text>
            <View style={styles.roleGrid}>
              {roleOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.roleOption,
                    formData.role === option.value && styles.selectedRoleOption,
                  ]}
                  onPress={() => updateFormData('role', option.value)}
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      formData.role === option.value && styles.selectedRoleOptionText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setAcceptTerms(!acceptTerms)}
          >
            <View style={[styles.checkbox, acceptTerms && styles.checkedCheckbox]}>
              {acceptTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              Tôi đồng ý với{' '}
              <Text style={styles.termsLink}>điều khoản sử dụng</Text>{' '}
              và{' '}
              <Text style={styles.termsLink}>chính sách bảo mật</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, registerMutation.isPending && styles.disabledButton]}
            onPress={handleRegister}
            disabled={registerMutation.isPending}
          >
            <Text style={styles.buttonText}>
              {registerMutation.isPending ? 'Đang đăng ký...' : 'Đăng ký'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  roleSection: {
    marginBottom: 20,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  roleOption: {
    width: '48%',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedRoleOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  roleOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedRoleOptionText: {
    color: 'white',
    fontWeight: '600',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkedCheckbox: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  termsLink: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RegisterScreen;
