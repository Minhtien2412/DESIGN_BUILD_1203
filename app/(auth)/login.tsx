import { FormErrorBoundary } from '@/components/FormErrorBoundary';
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

export default function LoginScreen() {
  const primary = useThemeColor({}, 'primary');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const { 
    signIn, 
    signInWithGoogleCode, 
    signInWithGoogleToken,
    signInWithGoogleAccessToken,
    signInWithFacebook 
  } = useAuth();
  const [socialLoading, setSocialLoading] = useState<null | 'google' | 'facebook'>(null);
  const router = useRouter();
  
  // Google OAuth with Authorization Code Flow (RECOMMENDED)
  // This is the most secure method - backend exchanges code for tokens
  const googleAuthCode = useGoogleOAuth({
    flow: 'auth-code',
    onSuccess: async ({ code }) => {
      if (!code) {
        Alert.alert('Lỗi', 'Không nhận được mã xác thực từ Google');
        setSocialLoading(null);
        return;
      }
      
      try {
        // Send authorization code to backend
        // Backend will exchange with Google for: access_token, refresh_token, id_token
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

  // Alternative: Google OAuth with Implicit Flow (simpler, less secure)
  // Use this if you don't have backend support for code exchange yet
  const googleAuthImplicit = useGoogleOAuth({
    flow: 'implicit',
    onSuccess: async ({ accessToken, idToken }) => {
      if (!idToken) {
        Alert.alert('Lỗi', 'Không nhận được ID token từ Google');
        setSocialLoading(null);
        return;
      }
      
      try {
        // Send ID token to backend (backend expects idToken field)
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

  const handleLogin = async () => {
    // Trim whitespace
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    
    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ Email và Mật khẩu');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }
    setLoading(true);
    try {
      console.log('[Login] Calling signIn...');
      await signIn(email, password);
      console.log('[Login] signIn completed successfully');
      console.log('[Login] Manually navigating to tabs (Option A)');
      router.replace('/(tabs)');
    } catch (error: any) {
      console.log('[Login] signIn failed:', error);
      Alert.alert('Lỗi đăng nhập', error.message || 'Đăng nhập thất bại');
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

  // micro interaction: scale on press
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();

  // floating labels
  const emailLabel = useRef(new Animated.Value(0)).current;
  const passLabel = useRef(new Animated.Value(0)).current;
  const animateLabel = (anim: Animated.Value, active: boolean) =>
    Animated.timing(anim, { toValue: active ? 1 : 0, duration: 180, useNativeDriver: false }).start();

  return (
    <FormErrorBoundary>
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
            <Text style={[styles.title, { color: text }]}>Chào mừng trở lại</Text>
            <Text style={[styles.subtitle, { color: textMuted }]}>Đăng nhập để tiếp tục</Text>
          </Animated.View>

          <Animated.View style={[styles.form, { backgroundColor: surface, borderColor: border, transform: [{ scale: scaleAnim }] }]}>
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
                animateLabel(emailLabel, t.length > 0);
              }}
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
              style={[styles.input, { borderColor: passFocused ? primary : border, backgroundColor: surface, color: text }]}
              placeholder=""
              selectionColor={primary}
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                animateLabel(passLabel, t.length > 0);
              }}
              onFocus={() => { setPassFocused(true); animateLabel(passLabel, true); }}
              onBlur={() => { setPassFocused(false); animateLabel(passLabel, password.length > 0); }}
              secureTextEntry
              autoComplete="password"
              editable={!loading}
            />
          </View>
          
          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity style={styles.forgotButton}>
              <Text style={[styles.forgotText, { color: primary }]}>Quên mật khẩu?</Text>
            </TouchableOpacity>
          </Link>
          
          <Pressable onPressIn={onPressIn} onPressOut={onPressOut} disabled={loading} onPress={handleLogin}>
            <View style={[styles.button, { backgroundColor: primary }, loading && styles.buttonDisabled]}>
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Đăng nhập</Text>
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
            <Text style={[styles.footerText, { color: textMuted }]}>Chưa có tài khoản? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={[styles.link, { color: primary }]}>Đăng ký ngay</Text>
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
    </FormErrorBoundary>
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
  forgotButton: { 
    alignSelf: 'flex-end', 
    marginBottom: 20,
  },
  forgotText: { 
    fontSize: 14,
    fontWeight: '600',
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
