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
                        pointerEvents: 'none',
                      },
                    ]}
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
    paddingHorizontal: 8,
    paddingVertical: 20,
    maxWidth: '100%',
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  form: {
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingLeft: 42,
    paddingTop: 20,
    fontSize: 14,
  },
  floatingLabel: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
    backgroundColor: 'transparent',
    alignSelf: 'flex-start',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 14,
    zIndex: 2,
  },
  button: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0A6847',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
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
    paddingVertical: 16,
    marginBottom: 16,
  },
  successIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 40,
    color: '#0A6847',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  successText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 10,
  },
  emailText: {
    fontWeight: '600',
    color: '#0A6847',
  },
  successHint: {
    fontSize: 12,
    color: '#808080',
    textAlign: 'center',
  },
  backButton: {
    paddingVertical: 8,
  },
  backText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
});
