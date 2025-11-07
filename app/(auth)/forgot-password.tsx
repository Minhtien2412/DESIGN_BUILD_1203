import AuthBackground from '@/components/ui/AuthBackground';
import { useThemeColor } from '@/hooks/use-theme-color';
import { apiFetch } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const primary = useThemeColor({}, 'primary');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const emailLabel = useRef(new Animated.Value(0)).current;
  const animateLabel = (active: boolean) =>
    Animated.timing(emailLabel, { toValue: active ? 1 : 0, duration: 180, useNativeDriver: false }).start();

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      Alert.alert('Lỗi', 'Địa chỉ email không hợp lệ');
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch<{ success: boolean; message: string }>('/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      if (response.success) {
        setSent(true);
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <AuthBackground>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: text }]}>Quên mật khẩu?</Text>
            <Text style={[styles.subtitle, { color: textMuted }]}>
              {!sent ? 'Nhập email của bạn để nhận link đặt lại mật khẩu' : 'Email đã được gửi!'}
            </Text>
          </View>

          <View style={[styles.form, { backgroundColor: surface, borderColor: border }]}>
            {!sent ? (
              <>
                <View style={[styles.inputContainer, { position: 'relative' }]}>
                  <Ionicons name="mail-outline" size={20} color={emailFocused ? primary : textMuted} style={styles.inputIcon} />
                  <Animated.Text
                    style={[
                      styles.floatingLabel,
                      {
                        color: emailFocused ? primary : textMuted,
                        top: emailLabel.interpolate({ inputRange: [0, 1], outputRange: [14, -8] }),
                        fontSize: emailLabel.interpolate({ inputRange: [0, 1], outputRange: [14, 12] }) as any,
                        backgroundColor: surface,
                        paddingHorizontal: 4,
                      },
                    ]}
                    pointerEvents="none"
                  >
                    Email
                  </Animated.Text>
                  <TextInput
                    style={[styles.input, { borderColor: emailFocused ? primary : border, backgroundColor: surface, color: text }]}
                    placeholder=""
                    selectionColor={primary}
                    value={email}
                    onChangeText={(t) => {
                      setEmail(t);
                      animateLabel(t.length > 0);
                    }}
                    onFocus={() => {
                      setEmailFocused(true);
                      animateLabel(true);
                    }}
                    onBlur={() => {
                      setEmailFocused(false);
                      animateLabel(email.length > 0);
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    editable={!loading}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: primary }, loading && styles.buttonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Gửi link đặt lại</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.successBox}>
                <View style={styles.successIconContainer}>
                  <Text style={styles.successIcon}>✓</Text>
                </View>
                <Text style={[styles.successTitle, { color: text }]}>Kiểm tra email của bạn</Text>
                <Text style={[styles.successText, { color: textMuted }]}>
                  Chúng tôi đã gửi link đặt lại mật khẩu đến{ '\n' }
                  <Text style={styles.emailText}>{email}</Text>
                </Text>
                <Text style={styles.successHint}>Không thấy email? Kiểm tra thư mục Spam</Text>
              </View>
            )}

            <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.backButton} disabled={loading}>
              <Text style={[styles.backText, { color: primary }]}>← Quay lại đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </AuthBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  form: {
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingLeft: 44,
    paddingTop: 22,
    fontSize: 16,
  },
  floatingLabel: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
    backgroundColor: 'transparent',
    alignSelf: 'flex-start',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    top: 15,
    zIndex: 2,
  },
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: {
    fontSize: 48,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  successText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  emailText: {
    fontWeight: '600',
    color: '#007AFF',
  },
  successHint: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
  },
  backButton: {
    paddingVertical: 12,
  },
  backText: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
  },
});
