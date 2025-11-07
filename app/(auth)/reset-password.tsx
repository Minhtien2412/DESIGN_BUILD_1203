import AuthBackground from '@/components/ui/AuthBackground';
import { useThemeColor } from '@/hooks/use-theme-color';
import { apiFetch } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const primary = useThemeColor({}, 'primary');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const [token, setToken] = useState(params.token || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenFocused, setTokenFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const tokenLabel = useRef(new Animated.Value(0)).current;
  const passLabel = useRef(new Animated.Value(0)).current;
  const confirmLabel = useRef(new Animated.Value(0)).current;
  const animate = (anim: Animated.Value, active: boolean) =>
    Animated.timing(anim, { toValue: active ? 1 : 0, duration: 180, useNativeDriver: false }).start();

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert('Lỗi', 'Token không hợp lệ. Vui lòng sử dụng link từ email.');
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch<{ success: boolean; message: string }>('/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      if (response.success) {
        Alert.alert(
          'Thành công',
          'Mật khẩu đã được đặt lại. Bạn có thể đăng nhập với mật khẩu mới.',
          [
            {
              text: 'Đăng nhập',
              onPress: () => router.replace('/(auth)/login'),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể đặt lại mật khẩu. Token có thể đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <AuthBackground>
        <View style={styles.container}>
          <Text style={[styles.title, { color: text }]}>Đặt lại mật khẩu</Text>
          <Text style={[styles.description, { color: textMuted }]}>Nhập mật khẩu mới của bạn</Text>

          <View style={[styles.form, { backgroundColor: surface, borderColor: border }]}>
            {!params.token && (
              <View style={[styles.inputContainer, { position: 'relative' }]}>
                <Ionicons name="key-outline" size={20} color={tokenFocused ? primary : textMuted} style={styles.inputIcon} />
                <Animated.Text
                  style={[
                    styles.floatingLabel,
                    {
                      color: tokenFocused ? primary : textMuted,
                      top: tokenLabel.interpolate({ inputRange: [0, 1], outputRange: [14, -8] }),
                      fontSize: tokenLabel.interpolate({ inputRange: [0, 1], outputRange: [14, 12] }) as any,
                      backgroundColor: surface,
                      paddingHorizontal: 4,
                    },
                  ]}
                  pointerEvents="none"
                >
                  Token (từ email)
                </Animated.Text>
                <TextInput
                  style={[styles.input, { borderColor: tokenFocused ? primary : border, backgroundColor: surface, color: text }]}
                  placeholder=""
                  selectionColor={primary}
                  value={token}
                  onChangeText={(t) => {
                    setToken(t);
                    animate(tokenLabel, t.length > 0);
                  }}
                  onFocus={() => {
                    setTokenFocused(true);
                    animate(tokenLabel, true);
                  }}
                  onBlur={() => {
                    setTokenFocused(false);
                    animate(tokenLabel, token.length > 0);
                  }}
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
            )}

            <View style={[styles.inputContainer, { position: 'relative' }]}>
              <Ionicons name="lock-closed-outline" size={20} color={passFocused ? primary : textMuted} style={styles.inputIcon} />
              <Animated.Text
                style={[
                  styles.floatingLabel,
                  {
                    color: passFocused ? primary : textMuted,
                    top: passLabel.interpolate({ inputRange: [0, 1], outputRange: [14, -8] }),
                    fontSize: passLabel.interpolate({ inputRange: [0, 1], outputRange: [14, 12] }) as any,
                    backgroundColor: surface,
                    paddingHorizontal: 4,
                  },
                ]}
                pointerEvents="none"
              >
                Mật khẩu mới
              </Animated.Text>
              <TextInput
                style={[styles.input, { borderColor: passFocused ? primary : border, backgroundColor: surface, color: text }]}
                placeholder=""
                selectionColor={primary}
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  animate(passLabel, t.length > 0);
                }}
                onFocus={() => {
                  setPassFocused(true);
                  animate(passLabel, true);
                }}
                onBlur={() => {
                  setPassFocused(false);
                  animate(passLabel, password.length > 0);
                }}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <View style={[styles.inputContainer, { position: 'relative' }]}>
              <Ionicons name="lock-closed-outline" size={20} color={confirmFocused ? primary : textMuted} style={styles.inputIcon} />
              <Animated.Text
                style={[
                  styles.floatingLabel,
                  {
                    color: confirmFocused ? primary : textMuted,
                    top: confirmLabel.interpolate({ inputRange: [0, 1], outputRange: [14, -8] }),
                    fontSize: confirmLabel.interpolate({ inputRange: [0, 1], outputRange: [14, 12] }) as any,
                    backgroundColor: surface,
                    paddingHorizontal: 4,
                  },
                ]}
                pointerEvents="none"
              >
                Xác nhận mật khẩu
              </Animated.Text>
              <TextInput
                style={[styles.input, { borderColor: confirmFocused ? primary : border, backgroundColor: surface, color: text }]}
                placeholder=""
                selectionColor={primary}
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  animate(confirmLabel, t.length > 0);
                }}
                onFocus={() => {
                  setConfirmFocused(true);
                  animate(confirmLabel, true);
                }}
                onBlur={() => {
                  setConfirmFocused(false);
                  animate(confirmLabel, confirmPassword.length > 0);
                }}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <TouchableOpacity style={[styles.button, { backgroundColor: primary }, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={[styles.backText, { color: primary }]}>← Quay lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AuthBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  form: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
  },
  inputContainer: { marginBottom: 16 },
  inputIcon: { position: 'absolute', left: 14, top: 15, zIndex: 2 },
  floatingLabel: { position: 'absolute', left: 16, zIndex: 1, backgroundColor: 'transparent', alignSelf: 'flex-start' },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingLeft: 44,
    paddingTop: 22,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 16,
  },
  backText: {
    textAlign: 'center',
    fontSize: 15,
  },
});
