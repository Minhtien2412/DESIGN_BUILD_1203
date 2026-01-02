/**
 * Shopee-style Multi-step Register Screen
 * Step 1: Phone/Email → Step 2: OTP Verification → Step 3: Profile Setup
 * 
 * UPDATED: Sử dụng PerfexAuthContext để đăng ký qua Perfex CRM
 */

import { usePerfexAuth } from '@/context/PerfexAuthContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Shopee Orange Theme Colors
const SHOPEE_COLORS = {
  primary: '#EE4D2D',
  primaryDark: '#D73211',
  primaryLight: '#FF6B47',
  secondary: '#FFE4DD',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#222222',
  textMuted: '#757575',
  border: '#E0E0E0',
  success: '#00C853',
  error: '#D32F2F',
  warning: '#FFA000',
};

// Available roles
const ROLES = [
  { value: 'CLIENT', label: 'Khách hàng', icon: 'person', desc: 'Tìm dịch vụ xây dựng' },
  { value: 'CONTRACTOR', label: 'Nhà thầu', icon: 'hammer', desc: 'Nhận công trình' },
  { value: 'ENGINEER', label: 'Kỹ sư', icon: 'construct', desc: 'Tư vấn kỹ thuật' },
  { value: 'ARCHITECT', label: 'Kiến trúc sư', icon: 'business', desc: 'Thiết kế kiến trúc' },
  { value: 'DESIGNER', label: 'Thiết kế nội thất', icon: 'color-palette', desc: 'Thiết kế không gian' },
  { value: 'SUPPLIER', label: 'Nhà cung cấp', icon: 'cube', desc: 'Cung cấp vật liệu' },
];

interface FormData {
  emailOrPhone: string;
  otp: string[];
  name: string;
  password: string;
  confirmPassword: string;
  role: string;
  acceptTerms: boolean;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

interface FormErrors {
  emailOrPhone?: string;
  otp?: string;
  name?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  terms?: string;
  general?: string;
}

export default function RegisterShopeeScreen() {
  const router = useRouter();
  const { signUp, loading: authLoading } = usePerfexAuth();
  
  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    emailOrPhone: '',
    otp: ['', '', '', '', '', ''],
    name: '',
    password: '',
    confirmPassword: '',
    role: 'CLIENT',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [locationLoading, setLocationLoading] = useState(false);
  
  // OTP input refs
  const otpRefs = useRef<(TextInput | null)[]>([]);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const stepAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0.33)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  
  // Animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Animate step change
  useEffect(() => {
    const progress = currentStep / 3;
    Animated.parallel([
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(stepAnim, { toValue: -20, duration: 150, useNativeDriver: true }),
        Animated.timing(stepAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]),
    ]).start();
  }, [currentStep]);

  // OTP Timer countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // Detect phone or email
  useEffect(() => {
    const value = formData.emailOrPhone;
    setIsPhone(/^\d+$/.test(value.replace(/[^0-9]/g, '')));
  }, [formData.emailOrPhone]);

  // Get location for registration
  const getLocation = async () => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Thông báo', 'Cần quyền truy cập vị trí để đăng ký');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const addressText = address 
        ? `${address.street || ''} ${address.district || ''} ${address.city || ''}`
        : 'Vị trí đã được xác định';

      setFormData(prev => ({
        ...prev,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: addressText.trim(),
        }
      }));
    } catch (error) {
      console.error('Location error:', error);
    } finally {
      setLocationLoading(false);
    }
  };

  // Shake animation
  const triggerShake = () => {
    Vibration.vibrate(100);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  // ========== STEP 1: Email/Phone Validation ==========
  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.emailOrPhone.trim()) {
      newErrors.emailOrPhone = 'Vui lòng nhập Email hoặc Số điện thoại';
    } else if (isPhone) {
      const phone = formData.emailOrPhone.replace(/[^0-9]/g, '');
      if (phone.length < 10) {
        newErrors.emailOrPhone = 'Số điện thoại không hợp lệ';
      }
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.emailOrPhone)) {
        newErrors.emailOrPhone = 'Email không hợp lệ';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validateStep1()) {
      triggerShake();
      return;
    }

    try {
      setLoading(true);
      // TODO: Call API to send OTP
      // For now, simulate OTP sent
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Start timer
      setOtpTimer(60);
      setCurrentStep(2);
      
      // Focus first OTP input
      setTimeout(() => otpRefs.current[0]?.focus(), 300);
    } catch (error: any) {
      setErrors({ general: error.message || 'Không thể gửi mã OTP' });
    } finally {
      setLoading(false);
    }
  };

  // ========== STEP 2: OTP Verification ==========
  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...formData.otp];
    newOtp[index] = text.slice(-1); // Only keep last digit
    
    setFormData(prev => ({ ...prev, otp: newOtp }));
    
    // Auto focus next input
    if (text && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    
    // Auto verify when complete
    if (newOtp.every(d => d !== '') && newOtp.join('').length === 6) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !formData.otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (otpCode?: string) => {
    const code = otpCode || formData.otp.join('');
    
    if (code.length !== 6) {
      setErrors({ otp: 'Vui lòng nhập đủ 6 số' });
      triggerShake();
      return;
    }

    try {
      setLoading(true);
      // TODO: Call API to verify OTP
      // For demo, accept any 6-digit code or "123456"
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success - move to step 3
      setCurrentStep(3);
      getLocation(); // Get location in background
    } catch (error: any) {
      setErrors({ otp: error.message || 'Mã OTP không đúng' });
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOtpTimer(60);
      setFormData(prev => ({ ...prev, otp: ['', '', '', '', '', ''] }));
      otpRefs.current[0]?.focus();
    } catch (error: any) {
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  // ========== STEP 3: Profile Setup ==========
  const validateStep3 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Họ tên quá ngắn';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (!formData.acceptTerms) {
      newErrors.terms = 'Bạn cần đồng ý với Điều khoản dịch vụ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateStep3()) {
      triggerShake();
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      // Prepare email (use phone as email if phone registration)
      const email = isPhone 
        ? `${formData.emailOrPhone.replace(/[^0-9]/g, '')}@phone.local`
        : formData.emailOrPhone;

      // Parse name into firstname and lastname
      const nameParts = formData.name.trim().split(' ');
      const firstname = nameParts[0];
      const lastname = nameParts.slice(1).join(' ') || firstname;

      // Call signUp from PerfexAuthContext
      // API: signUp({ email, password, firstname, lastname, phone?, company? })
      await signUp({
        email,
        password: formData.password,
        firstname,
        lastname,
        phone: isPhone ? formData.emailOrPhone : undefined,
        company: formData.role, // Store role in company field for now
        address: formData.location?.address,
      });

      // Success - navigate to home
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('[Register] Error:', error);
      triggerShake();
      setErrors({ 
        general: error.message || 'Đăng ký thất bại. Vui lòng thử lại.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    const pwd = formData.password;
    if (!pwd) return { level: 0, text: '', color: SHOPEE_COLORS.border };
    
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 1) return { level: 1, text: 'Yếu', color: SHOPEE_COLORS.error };
    if (score <= 2) return { level: 2, text: 'Trung bình', color: SHOPEE_COLORS.warning };
    if (score <= 3) return { level: 3, text: 'Khá', color: '#FFC107' };
    return { level: 4, text: 'Mạnh', color: SHOPEE_COLORS.success };
  };

  const pwdStrength = getPasswordStrength();
  const isLoading = loading || authLoading;

  // ========== RENDER ==========
  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[SHOPEE_COLORS.primary, SHOPEE_COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        {/* Back button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (currentStep > 1) {
              setCurrentStep(currentStep - 1);
            } else {
              router.back();
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name="home-city" size={36} color="#FFF" />
          <Text style={styles.headerTitle}>Tạo tài khoản</Text>
          <Text style={styles.headerSubtitle}>Chỉ 3 bước đơn giản</Text>
        </View>

        {/* Progress Steps */}
        <View style={styles.stepsContainer}>
          {[1, 2, 3].map((step) => (
            <View key={step} style={styles.stepItem}>
              <View style={[
                styles.stepCircle,
                currentStep >= step && styles.stepCircleActive,
                currentStep > step && styles.stepCircleComplete,
              ]}>
                {currentStep > step ? (
                  <Ionicons name="checkmark" size={16} color="#FFF" />
                ) : (
                  <Text style={[
                    styles.stepNumber,
                    currentStep >= step && styles.stepNumberActive,
                  ]}>
                    {step}
                  </Text>
                )}
              </View>
              <Text style={[
                styles.stepLabel,
                currentStep >= step && styles.stepLabelActive,
              ]}>
                {step === 1 ? 'Xác thực' : step === 2 ? 'Mã OTP' : 'Hoàn tất'}
              </Text>
            </View>
          ))}
          
          {/* Progress line */}
          <View style={styles.progressLine}>
            <Animated.View 
              style={[
                styles.progressFill,
                { 
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  })
                }
              ]} 
            />
          </View>
        </View>
      </LinearGradient>

      {/* Form */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formWrapper}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.formCard,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { translateX: shakeAnim }],
              }
            ]}
          >
            {/* ========== STEP 1: Email/Phone ========== */}
            {currentStep === 1 && (
              <Animated.View style={[{ transform: [{ translateX: stepAnim }] }]}>
                <Text style={styles.title}>Xác thực tài khoản</Text>
                <Text style={styles.subtitle}>
                  Nhập email hoặc số điện thoại để nhận mã xác thực
                </Text>

                {/* Email/Phone Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email / Số điện thoại</Text>
                  <View style={[styles.inputWrapper, errors.emailOrPhone && styles.inputError]}>
                    <Ionicons 
                      name={isPhone ? "call-outline" : "mail-outline"} 
                      size={20} 
                      color={SHOPEE_COLORS.textMuted} 
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="VD: 0912345678 hoặc email@gmail.com"
                      placeholderTextColor={SHOPEE_COLORS.textMuted}
                      value={formData.emailOrPhone}
                      onChangeText={(text) => {
                        setFormData(prev => ({ ...prev, emailOrPhone: text }));
                        if (errors.emailOrPhone) setErrors({});
                      }}
                      keyboardType="default"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                  </View>
                  {errors.emailOrPhone && (
                    <Text style={styles.errorText}>{errors.emailOrPhone}</Text>
                  )}
                </View>

                {/* Info */}
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={18} color={SHOPEE_COLORS.primary} />
                  <Text style={styles.infoText}>
                    {isPhone 
                      ? 'Mã OTP sẽ được gửi đến số điện thoại này'
                      : 'Mã OTP sẽ được gửi đến địa chỉ email này'
                    }
                  </Text>
                </View>

                {errors.general && (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={18} color={SHOPEE_COLORS.error} />
                    <Text style={styles.errorBoxText}>{errors.general}</Text>
                  </View>
                )}

                {/* Continue Button */}
                <TouchableOpacity
                  style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                  onPress={handleSendOtp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Tiếp tục</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* ========== STEP 2: OTP Verification ========== */}
            {currentStep === 2 && (
              <Animated.View style={[{ transform: [{ translateX: stepAnim }] }]}>
                <Text style={styles.title}>Nhập mã xác thực</Text>
                <Text style={styles.subtitle}>
                  Mã OTP đã được gửi đến{'\n'}
                  <Text style={{ fontWeight: '700', color: SHOPEE_COLORS.text }}>
                    {formData.emailOrPhone}
                  </Text>
                </Text>

                {/* OTP Inputs */}
                <View style={styles.otpContainer}>
                  {formData.otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => { otpRefs.current[index] = ref; }}
                      style={[
                        styles.otpInput,
                        digit && styles.otpInputFilled,
                        errors.otp && styles.otpInputError,
                      ]}
                      value={digit}
                      onChangeText={(text) => handleOtpChange(text, index)}
                      onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      editable={!isLoading}
                    />
                  ))}
                </View>
                {errors.otp && (
                  <Text style={[styles.errorText, { textAlign: 'center' }]}>{errors.otp}</Text>
                )}

                {/* Resend OTP */}
                <TouchableOpacity 
                  style={styles.resendRow}
                  onPress={handleResendOtp}
                  disabled={otpTimer > 0 || isLoading}
                >
                  <Text style={styles.resendText}>Không nhận được mã? </Text>
                  {otpTimer > 0 ? (
                    <Text style={[styles.resendLink, { color: SHOPEE_COLORS.textMuted }]}>
                      Gửi lại sau {otpTimer}s
                    </Text>
                  ) : (
                    <Text style={styles.resendLink}>Gửi lại</Text>
                  )}
                </TouchableOpacity>

                {/* Verify Button */}
                <TouchableOpacity
                  style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                  onPress={() => handleVerifyOtp()}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Xác nhận</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* ========== STEP 3: Profile Setup ========== */}
            {currentStep === 3 && (
              <Animated.View style={[{ transform: [{ translateX: stepAnim }] }]}>
                <Text style={styles.title}>Hoàn tất đăng ký</Text>
                <Text style={styles.subtitle}>
                  Chỉ còn vài bước nữa thôi!
                </Text>

                {/* Name Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Họ và tên</Text>
                  <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
                    <Ionicons name="person-outline" size={20} color={SHOPEE_COLORS.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập họ tên của bạn"
                      placeholderTextColor={SHOPEE_COLORS.textMuted}
                      value={formData.name}
                      onChangeText={(text) => {
                        setFormData(prev => ({ ...prev, name: text }));
                        if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                      }}
                      autoCapitalize="words"
                      editable={!isLoading}
                    />
                  </View>
                  {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mật khẩu</Text>
                  <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                    <Ionicons name="lock-closed-outline" size={20} color={SHOPEE_COLORS.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Tạo mật khẩu (ít nhất 6 ký tự)"
                      placeholderTextColor={SHOPEE_COLORS.textMuted}
                      value={formData.password}
                      onChangeText={(text) => {
                        setFormData(prev => ({ ...prev, password: text }));
                        if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                      }}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      editable={!isLoading}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons 
                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color={SHOPEE_COLORS.textMuted}
                      />
                    </TouchableOpacity>
                  </View>
                  {/* Password strength */}
                  {formData.password && (
                    <View style={styles.strengthContainer}>
                      <View style={styles.strengthBars}>
                        {[1, 2, 3, 4].map((level) => (
                          <View 
                            key={level}
                            style={[
                              styles.strengthBar,
                              { backgroundColor: level <= pwdStrength.level ? pwdStrength.color : SHOPEE_COLORS.border }
                            ]}
                          />
                        ))}
                      </View>
                      <Text style={[styles.strengthText, { color: pwdStrength.color }]}>
                        {pwdStrength.text}
                      </Text>
                    </View>
                  )}
                  {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Xác nhận mật khẩu</Text>
                  <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
                    <Ionicons name="lock-closed-outline" size={20} color={SHOPEE_COLORS.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập lại mật khẩu"
                      placeholderTextColor={SHOPEE_COLORS.textMuted}
                      value={formData.confirmPassword}
                      onChangeText={(text) => {
                        setFormData(prev => ({ ...prev, confirmPassword: text }));
                        if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                      }}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      editable={!isLoading}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <Ionicons 
                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color={SHOPEE_COLORS.textMuted}
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                </View>

                {/* Role Selection */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Bạn là</Text>
                  <View style={styles.rolesGrid}>
                    {ROLES.map((role) => (
                      <TouchableOpacity
                        key={role.value}
                        style={[
                          styles.roleCard,
                          formData.role === role.value && styles.roleCardActive,
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, role: role.value }))}
                        disabled={isLoading}
                      >
                        <Ionicons 
                          name={role.icon as any} 
                          size={24} 
                          color={formData.role === role.value ? SHOPEE_COLORS.primary : SHOPEE_COLORS.textMuted}
                        />
                        <Text style={[
                          styles.roleLabel,
                          formData.role === role.value && styles.roleLabelActive,
                        ]}>
                          {role.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Location */}
                {formData.location && (
                  <View style={styles.locationCard}>
                    <Ionicons name="location" size={20} color={SHOPEE_COLORS.success} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.locationTitle}>Vị trí của bạn</Text>
                      <Text style={styles.locationText} numberOfLines={1}>
                        {formData.location.address}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={getLocation} disabled={locationLoading}>
                      {locationLoading ? (
                        <ActivityIndicator size="small" color={SHOPEE_COLORS.primary} />
                      ) : (
                        <Ionicons name="refresh" size={20} color={SHOPEE_COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {/* Terms */}
                <TouchableOpacity
                  style={styles.termsRow}
                  onPress={() => setFormData(prev => ({ ...prev, acceptTerms: !prev.acceptTerms }))}
                  disabled={isLoading}
                >
                  <View style={[styles.checkbox, formData.acceptTerms && styles.checkboxChecked]}>
                    {formData.acceptTerms && <Ionicons name="checkmark" size={14} color="#FFF" />}
                  </View>
                  <Text style={styles.termsText}>
                    Tôi đồng ý với{' '}
                    <Text style={{ color: SHOPEE_COLORS.primary, fontWeight: '600' }}>
                      Điều khoản dịch vụ
                    </Text>
                    {' '}và{' '}
                    <Text style={{ color: SHOPEE_COLORS.primary, fontWeight: '600' }}>
                      Chính sách bảo mật
                    </Text>
                  </Text>
                </TouchableOpacity>
                {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

                {errors.general && (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={18} color={SHOPEE_COLORS.error} />
                    <Text style={styles.errorBoxText}>{errors.general}</Text>
                  </View>
                )}

                {/* Register Button */}
                <TouchableOpacity
                  style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                  onPress={handleRegister}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Hoàn tất đăng ký</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Login link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login-shopee')}>
                <Text style={styles.loginLink}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SHOPEE_COLORS.surface,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: Platform.OS === 'ios' ? 60 : 40,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  stepItem: {
    alignItems: 'center',
    zIndex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepCircleActive: {
    backgroundColor: '#FFF',
  },
  stepCircleComplete: {
    backgroundColor: SHOPEE_COLORS.success,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
  },
  stepNumberActive: {
    color: SHOPEE_COLORS.primary,
  },
  stepLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  stepLabelActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  progressLine: {
    position: 'absolute',
    left: 60,
    right: 60,
    top: 16,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    zIndex: 0,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 2,
  },
  formWrapper: {
    flex: 1,
    marginTop: -20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: SHOPEE_COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: SHOPEE_COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: SHOPEE_COLORS.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: SHOPEE_COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    backgroundColor: SHOPEE_COLORS.surface,
  },
  inputError: {
    borderColor: SHOPEE_COLORS.error,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: SHOPEE_COLORS.text,
  },
  errorText: {
    fontSize: 12,
    color: SHOPEE_COLORS.error,
    marginTop: 4,
    marginLeft: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${SHOPEE_COLORS.primary}10`,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: SHOPEE_COLORS.text,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${SHOPEE_COLORS.error}10`,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorBoxText: {
    flex: 1,
    fontSize: 13,
    color: SHOPEE_COLORS.error,
  },
  primaryButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: SHOPEE_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: SHOPEE_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  // OTP styles
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: SHOPEE_COLORS.border,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: SHOPEE_COLORS.text,
    backgroundColor: SHOPEE_COLORS.surface,
  },
  otpInputFilled: {
    borderColor: SHOPEE_COLORS.primary,
    backgroundColor: `${SHOPEE_COLORS.primary}10`,
  },
  otpInputError: {
    borderColor: SHOPEE_COLORS.error,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  resendText: {
    fontSize: 14,
    color: SHOPEE_COLORS.textMuted,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '700',
    color: SHOPEE_COLORS.primary,
  },
  // Role styles
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  roleCard: {
    width: '31%',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: SHOPEE_COLORS.border,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  roleCardActive: {
    borderColor: SHOPEE_COLORS.primary,
    backgroundColor: `${SHOPEE_COLORS.primary}10`,
  },
  roleLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: SHOPEE_COLORS.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },
  roleLabelActive: {
    color: SHOPEE_COLORS.primary,
    fontWeight: '600',
  },
  // Password strength
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Location
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: `${SHOPEE_COLORS.success}10`,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${SHOPEE_COLORS.success}30`,
  },
  locationTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: SHOPEE_COLORS.success,
  },
  locationText: {
    fontSize: 12,
    color: SHOPEE_COLORS.text,
  },
  // Terms
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: SHOPEE_COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: SHOPEE_COLORS.primary,
    borderColor: SHOPEE_COLORS.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: SHOPEE_COLORS.text,
    lineHeight: 20,
  },
  // Login link
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    color: SHOPEE_COLORS.textMuted,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: SHOPEE_COLORS.primary,
  },
});
