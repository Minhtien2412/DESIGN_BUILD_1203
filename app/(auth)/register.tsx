import AuthBackground from '@/components/ui/AuthBackground';
import ENV from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useGoogleOAuth } from '@/hooks/useGoogleOAuth.native';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function RegisterScreen() {
  const primary = useThemeColor({}, 'primary');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [role, setRole] = useState<'client' | 'contractor' | 'company' | 'architect' | 'admin'>('client');
  const [loading, setLoading] = useState(false);
  const { 
    signUp, 
    signInWithGoogleCode,
    signInWithGoogleToken,
    signInWithGoogleAccessToken,
    signInWithFacebook 
  } = useAuth();
  const [socialLoading, setSocialLoading] = useState<null | 'google' | 'facebook'>(null);
  const router = useRouter();
  
  // Google OAuth with Authorization Code Flow (RECOMMENDED)
  const googleAuthCode = useGoogleOAuth({
    flow: 'auth-code',
    onSuccess: async ({ code }) => {
      if (!code) {
        Alert.alert('Lỗi', 'Không nhận được mã xác thực từ Google');
        setSocialLoading(null);
        return;
      }
      
      try {
        await signInWithGoogleCode(code);
        router.replace('/(tabs)');
      } catch (error: any) {
        Alert.alert('Google đăng nhập thất bại', error.message || 'Vui lòng thử lại');
      } finally {
        setSocialLoading(null);
      }
    },
    onError: (error) => {
      Alert.alert('Google OAuth Error', error.message);
      setSocialLoading(null);
    }
  });

  // Alternative: Implicit Flow
  const googleAuthImplicit = useGoogleOAuth({
    flow: 'implicit',
    onSuccess: async ({ accessToken, idToken }) => {
      if (!idToken) {
        Alert.alert('Lỗi', 'Không nhận được ID token từ Google');
        setSocialLoading(null);
        return;
      }
      
      try {
        await signInWithGoogleToken(idToken);
        router.replace('/(tabs)');
      } catch (error: any) {
        Alert.alert('Google đăng nhập thất bại', error.message || 'Vui lòng thử lại');
      } finally {
        setSocialLoading(null);
      }
    },
    onError: (error) => {
      Alert.alert('Google OAuth Error', error.message);
      setSocialLoading(null);
    }
  });

  const roleLabels = {
    client: 'Khách hàng',
    contractor: 'Nhà thầu',
    company: 'Công ty',
    architect: 'Kiến trúc sư',
    admin: 'Quản trị',
  };

  const handleRegister = async () => {
    // Trim whitespace
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    
    if (!trimmedName || !trimmedEmail || !trimmedPassword || !role) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin và chọn vai trò');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }
    if (trimmedPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    setLoading(true);
    try {
      console.log('[Register] Calling signUp...');
      await signUp(email, password, name, role);
      console.log('[Register] signUp completed successfully');
      console.log('[Register] Manually navigating to tabs (Option A)');
      router.replace('/(tabs)');
    } catch (error: any) {
      console.log('[Register] signUp failed:', error);
      Alert.alert('Lỗi đăng ký', error.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!ENV.ENABLE_SOCIAL_GOOGLE) {
      Alert.alert('Thông báo', 'Đăng nhập Google đang được bảo trì');
      return;
    }

    setSocialLoading('google');
    
    // Use Implicit Flow (backend expects idToken)
    await googleAuthImplicit.signIn();
  };

  const handleFacebook = async () => {
    setSocialLoading('facebook');
    try {
      await signInWithFacebook();
    } catch (error: any) {
      Alert.alert('Facebook dang nh?p th?t b?i', error.message || 'Vui l�ng th? l?i');
    } finally {
      setSocialLoading(null);
    }
  };

  // header appear animation
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslate = useRef(new Animated.Value(16)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(headerTranslate, { toValue: 0, duration: 500, useNativeDriver: true })
    ]).start();
    // button shimmer loop
    const loop = () => {
      shimmer.setValue(0);
      Animated.timing(shimmer, { toValue: 1, duration: 2200, useNativeDriver: true }).start(() => loop());
    };
    loop();
  }, [headerOpacity, headerTranslate, shimmer]);

  // micro interaction for CTA
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();

  // floating labels
  const nameLabel = useRef(new Animated.Value(0)).current;
  const emailLabel = useRef(new Animated.Value(0)).current;
  const passLabel = useRef(new Animated.Value(0)).current;
  const animateLabel = (anim: Animated.Value, active: boolean) =>
    Animated.timing(anim, { toValue: active ? 1 : 0, duration: 180, useNativeDriver: false }).start();

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <AuthBackground>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerTranslate }] }]}>
            <Text style={[styles.title, { color: text }]}>Tạo tài khoản mới</Text>
            <Text style={[styles.subtitle, { color: textMuted }]}>Đăng ký để bắt đầu</Text>
          </Animated.View>

          <Animated.View style={[styles.form, { backgroundColor: surface, borderColor: border, transform: [{ scale: scaleAnim }] }]}>
          <View style={[styles.inputContainer, { position: 'relative' }]}>
            <Ionicons name="person-outline" size={20} color={nameFocused ? primary : textMuted} style={styles.inputIcon} />
            <Animated.Text
              style={[
                styles.floatingLabel,
                {
                  color: nameFocused ? primary : textMuted,
                  top: nameLabel.interpolate({ inputRange: [0, 1], outputRange: [14, -8] }),
                  fontSize: nameLabel.interpolate({ inputRange: [0, 1], outputRange: [14, 12] }) as any,
                  backgroundColor: surface,
                  paddingHorizontal: 4,
                },
              ]}
              pointerEvents="none"
            >
              Họ và tên
            </Animated.Text>
            <TextInput 
              style={[
                styles.input,
                { borderColor: nameFocused ? primary : border, backgroundColor: surface, color: text }
              ]}
              placeholder=""
              selectionColor={primary}
              value={name} 
              onChangeText={(t) => { setName(t); animateLabel(nameLabel, t.length > 0); }}
              onFocus={() => { setNameFocused(true); animateLabel(nameLabel, true); }}
              onBlur={() => { setNameFocused(false); animateLabel(nameLabel, name.length > 0); }}
              autoComplete="name"
              editable={!loading}
            />
          </View>

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
              style={[
                styles.input,
                { borderColor: emailFocused ? primary : border, backgroundColor: surface, color: text }
              ]}
              placeholder=""
              selectionColor={primary}
              value={email} 
              onChangeText={(t) => { setEmail(t); animateLabel(emailLabel, t.length > 0); }}
              onFocus={() => { setEmailFocused(true); animateLabel(emailLabel, true); }}
              onBlur={() => { setEmailFocused(false); animateLabel(emailLabel, email.length > 0); }}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!loading}
            />
          </View>

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
              Mật khẩu
            </Animated.Text>
            <TextInput 
              style={[
                styles.input,
                { borderColor: passFocused ? primary : border, backgroundColor: surface, color: text }
              ]}
              placeholder=""
              selectionColor={primary}
              value={password} 
              onChangeText={(t) => { setPassword(t); animateLabel(passLabel, t.length > 0); }}
              onFocus={() => { setPassFocused(true); animateLabel(passLabel, true); }}
              onBlur={() => { setPassFocused(false); animateLabel(passLabel, password.length > 0); }}
              secureTextEntry
              autoComplete="password-new"
              editable={!loading}
            />
          </View>

          <View style={styles.roleContainer}>
            <Text style={[styles.label, { color: textMuted }]}>Vai trò</Text>
            <View style={styles.rolesRow}>
              {(['client','contractor','company','architect'] as const).map(r => (
                <TouchableOpacity 
                  key={r} 
                  style={[styles.roleChip, { borderColor: border }, role === r && styles.roleChipActive, role === r && { backgroundColor: primary, borderColor: primary }]} 
                  onPress={() => setRole(r)}
                  disabled={loading}
                >
                  <Text style={[styles.roleText, { color: textMuted }, role === r && styles.roleTextActive]}>
                    {roleLabels[r]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Pressable onPressIn={onPressIn} onPressOut={onPressOut} disabled={loading} onPress={handleRegister}>
            <View style={[styles.button, { backgroundColor: primary }, loading && styles.buttonDisabled]}>
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Đăng ký</Text>
              )}
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.shimmer,
                  {
                    transform: [
                      { translateX: shimmer.interpolate({ inputRange: [0, 1], outputRange: [-80, 300] }) },
                      { rotate: '20deg' },
                    ],
                  },
                ]}
              />
            </View>
          </Pressable>

          {(ENV.ENABLE_SOCIAL_GOOGLE || ENV.ENABLE_SOCIAL_FACEBOOK) && (
            <>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>hoặc</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialRow}>
                {ENV.ENABLE_SOCIAL_GOOGLE && (
                  <TouchableOpacity 
                    style={[styles.socialBtn, styles.google]} 
                    onPress={handleGoogle} 
                    disabled={!!socialLoading}
                  >
                    {socialLoading === 'google' ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Text style={styles.socialIcon}>G</Text>
                        <Text style={styles.socialText}>Google</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
                {ENV.ENABLE_SOCIAL_FACEBOOK && (
                  <TouchableOpacity 
                    style={[styles.socialBtn, styles.facebook]} 
                    onPress={handleFacebook} 
                    disabled={!!socialLoading}
                  >
                    {socialLoading === 'facebook' ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Text style={styles.socialIcon}>f</Text>
                        <Text style={styles.socialText}>Facebook</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
          </Animated.View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: textMuted }]}>Đã có tài khoản? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={[styles.link, { color: primary }]}>Đăng nhập</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <View style={[styles.footer, { marginTop: 8 }]}>
            <Link href="/intro" asChild>
              <TouchableOpacity accessibilityRole="button">
                <Text style={[styles.link, { color: textMuted }]}>Xem giới thiệu ứng dụng</Text>
              </TouchableOpacity>
            </Link>
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
  },
  form: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
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
    backgroundColor: 'transparent', // overridden dynamically with surface to create a notch over the border
    alignSelf: 'flex-start',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    top: 15,
    zIndex: 2,
  },
  roleContainer: {
    marginBottom: 20,
  },
  rolesRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    gap: 10,
  },
  roleChip: { 
    paddingVertical: 10, 
    paddingHorizontal: 16, 
    borderRadius: 20, 
    borderWidth: 1.5, 
    backgroundColor: '#00000008',
  },
  roleChipActive: { 
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  roleText: { 
    fontWeight: '600',
    fontSize: 14,
  },
  roleTextActive: { 
    color: '#fff',
  },
  button: { 
    height: 52, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  shimmer: {
    position: 'absolute',
    width: 80,
    height: '140%',
    top: '-20%',
    left: -80,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#999',
    fontSize: 14,
  },
  socialRow: { 
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: { 
    flex: 1,
    height: 50, 
    borderRadius: 12, 
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 8,
  },
  google: { 
    backgroundColor: '#DB4437',
    shadowColor: '#DB4437',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  googleDisabled: {
    backgroundColor: '#999',
    opacity: 0.5,
  },
  facebook: { 
    backgroundColor: '#1877F2',
    shadowColor: '#1877F2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  socialIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  socialText: { 
    color: '#fff', 
    fontSize: 15, 
    fontWeight: '600',
  },
  socialTextDisabled: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 15,
  },
  link: { 
    fontSize: 15,
    fontWeight: '600',
  },
});
