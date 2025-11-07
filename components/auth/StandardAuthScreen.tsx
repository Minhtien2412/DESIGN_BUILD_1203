/**
 * Standard Authentication Screen
 * Clean, modern design for login/register
 * Based on official API: https://api.thietkeresort.com.vn/docs/api-docs.html
 */

import { useStandardAuth } from '@/context/StandardAuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AuthMode = 'login' | 'register';

export default function StandardAuthScreen() {
  const router = useRouter();
  const { signIn, signUp, loading } = useStandardAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation
  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (mode === 'register') {
      if (!name) {
        newErrors.name = 'Tên là bắt buộc';
      }
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu không khớp';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Login
  const handleLogin = async () => {
    if (!validateForm()) return;

    const result = await signIn(email, password);
    if (result.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Đăng nhập thất bại', result.message);
    }
  };

  // Handle Register
  const handleRegister = async () => {
    if (!validateForm()) return;
    
    const result = await signUp(email, password, name, phone || undefined);
    if (result.success) {
      Alert.alert('Đăng ký thành công', 'Bạn đã đăng ký thành công!', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
    } else {
      Alert.alert('Đăng ký thất bại', result.message);
    }
  };

  const handleSubmit = () => {
    if (mode === 'login') {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setErrors({});
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#2E5BFF', '#1a3dbf']}
              style={styles.iconContainer}
            >
              <Ionicons name="home" size={40} color="#fff" />
            </LinearGradient>
            <Text style={styles.title}>Thiết Kế Resort</Text>
            <Text style={styles.subtitle}>
              {mode === 'login' ? 'Đăng nhập vào tài khoản' : 'Tạo tài khoản mới'}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name field (register only) */}
            {mode === 'register' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Họ và tên</Text>
                  <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                    <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập họ và tên"
                      placeholderTextColor="#999"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                    />
                  </View>
                  {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Số điện thoại (tùy chọn)</Text>
                  <View style={[styles.inputContainer, errors.phone && styles.inputError]}>
                    <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập số điện thoại"
                      placeholderTextColor="#999"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                    />
                  </View>
                  {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                </View>
              </>
            )}

            {/* Email field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="example@email.com"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật khẩu</Text>
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#666"
                  />
                </Pressable>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Confirm password (register only) */}
            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Xác nhận mật khẩu</Text>
                <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập lại mật khẩu"
                    placeholderTextColor="#999"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                </View>
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>
            )}

            {/* Forgot password (login only) */}
            {mode === 'login' && (
              <Pressable style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
              </Pressable>
            )}

            {/* Submit button */}
            <Pressable
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={loading ? ['#999', '#666'] : ['#2E5BFF', '#1a3dbf']}
                style={styles.submitGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                  </Text>
                )}
              </LinearGradient>
            </Pressable>

            {/* Mode toggle */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
              </Text>
              <Pressable onPress={toggleMode}>
                <Text style={styles.toggleLink}>
                  {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>HOẶC</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social login */}
          <View style={styles.socialContainer}>
            <Pressable style={styles.socialButton}>
              <Ionicons name="logo-google" size={24} color="#DB4437" />
              <Text style={styles.socialButtonText}>Google</Text>
            </Pressable>
            <Pressable style={styles.socialButton}>
              <Ionicons name="logo-facebook" size={24} color="#4267B2" />
              <Text style={styles.socialButtonText}>Facebook</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 16,
    height: 52,
  },
  inputError: {
    borderColor: '#EE2D3D',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EE2D3D',
    marginTop: 4,
    marginLeft: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#2E5BFF',
    fontWeight: '600',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  toggleText: {
    fontSize: 14,
    color: '#999',
  },
  toggleLink: {
    fontSize: 14,
    color: '#2E5BFF',
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    fontSize: 12,
    color: '#666',
    paddingHorizontal: 16,
    fontWeight: '600',
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    paddingVertical: 14,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
