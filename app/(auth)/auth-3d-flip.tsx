/**
 * 3D Login & Register Screen (Refactored)
 * Clean code với custom hooks và permission management
 */

import { FlipCard3D } from '@/components/auth/FlipCard3D';
import { FormErrorBoundary } from '@/components/FormErrorBoundary';
import { InlineError } from '@/components/ui/inline-error';
import { ToastNotification } from '@/components/ui/toast-notification';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useToast } from '@/hooks/use-toast';
import { useLoginForm, useRegisterForm } from '@/hooks/useAuthForms';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function Auth3DFlipScreen() {
  const primary = useThemeColor({}, 'primary');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const error = useThemeColor({}, 'error');
  const success = useThemeColor({}, 'success');

  const { toast, hideToast } = useToast();
  const router = useRouter();

  // Login form hook
  const loginForm = useLoginForm();
  
  // Register form hook
  const registerForm = useRegisterForm();

  // Staff secret key for STAFF role registration
  const [staffSecretKey, setStaffSecretKey] = useState('');

  // Get location on mount for registration
  useEffect(() => {
    registerForm.getLocation();
  }, []);

  // Handle successful login/register
  const handleAuthSuccess = () => {
    router.replace('/(tabs)');
  };

  // ==================== LOGIN CONTENT ====================
  const LoginContent = (
    <View style={styles.formContent}>
      <Text style={[styles.title, { color: text }]}>Đăng Nhập</Text>
      <Text style={[styles.subtitle, { color: textMuted }]}>
        Chào mừng trở lại! Vui lòng đăng nhập
      </Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <View style={[styles.inputWrapper, { borderColor: border }]}>
          <Ionicons name="mail-outline" size={20} color={textMuted} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: text }]}
            placeholder="Email"
            placeholderTextColor={textMuted}
            value={loginForm.formData.email}
            onChangeText={(value) => loginForm.updateField('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!loginForm.loading}
          />
        </View>
        {loginForm.errors.email && <InlineError message={loginForm.errors.email} />}
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <View style={[styles.inputWrapper, { borderColor: border }]}>
          <Ionicons name="lock-closed-outline" size={20} color={textMuted} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: text }]}
            placeholder="Mật khẩu"
            placeholderTextColor={textMuted}
            value={loginForm.formData.password}
            onChangeText={(value) => loginForm.updateField('password', value)}
            secureTextEntry={!loginForm.showPassword}
            autoCapitalize="none"
            autoComplete="password"
            editable={!loginForm.loading}
          />
          <TouchableOpacity
            onPress={() => loginForm.setShowPassword(!loginForm.showPassword)}
            disabled={loginForm.loading}
          >
            <Ionicons
              name={loginForm.showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={textMuted}
            />
          </TouchableOpacity>
        </View>
        {loginForm.errors.password && <InlineError message={loginForm.errors.password} />}
      </View>

      {/* Remember Me & Forgot Password */}
      <View style={styles.optionsRow}>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => loginForm.updateField('rememberMe', !loginForm.formData.rememberMe)}
          disabled={loginForm.loading}
        >
          <Ionicons
            name={loginForm.formData.rememberMe ? 'checkbox' : 'square-outline'}
            size={20}
            color={primary}
          />
          <Text style={[styles.checkboxText, { color: text }]}>Ghi nhớ</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => router.push('/(auth)/forgot-password')}
          disabled={loginForm.loading}
        >
          <Text style={[styles.forgotText, { color: primary }]}>Quên mật khẩu?</Text>
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: primary }]}
        onPress={async () => {
          const success = await loginForm.handleSubmit();
          if (success) handleAuthSuccess();
        }}
        disabled={loginForm.loading}
      >
        {loginForm.loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Đăng Nhập</Text>
        )}
      </TouchableOpacity>

      {/* General Error */}
      {loginForm.errors.general && (
        <View style={[styles.errorBox, { backgroundColor: `${error}10`, borderColor: error }]}>
          <Ionicons name="alert-circle" size={20} color={error} />
          <Text style={[styles.errorText, { color: error }]}>{loginForm.errors.general}</Text>
        </View>
      )}
    </View>
  );

  // ==================== REGISTER CONTENT ====================
  const RegisterContent = (
    <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: text }]}>Đăng Ký</Text>
      <Text style={[styles.subtitle, { color: textMuted }]}>
        Tạo tài khoản mới để bắt đầu
      </Text>

      {/* Name Input */}
      <View style={styles.inputContainer}>
        <View style={[styles.inputWrapper, { borderColor: border }]}>
          <Ionicons name="person-outline" size={20} color={textMuted} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: text }]}
            placeholder="Họ và tên"
            placeholderTextColor={textMuted}
            value={registerForm.formData.name}
            onChangeText={(value) => registerForm.updateField('name', value)}
            autoCapitalize="words"
            editable={!registerForm.loading}
          />
        </View>
        {registerForm.errors.name && <InlineError message={registerForm.errors.name} />}
      </View>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <View style={[styles.inputWrapper, { borderColor: border }]}>
          <Ionicons name="mail-outline" size={20} color={textMuted} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: text }]}
            placeholder="Email"
            placeholderTextColor={textMuted}
            value={registerForm.formData.email}
            onChangeText={(value) => registerForm.updateField('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!registerForm.loading}
          />
        </View>
        {registerForm.errors.email && <InlineError message={registerForm.errors.email} />}
      </View>

      {/* Phone Input */}
      <View style={styles.inputContainer}>
        <View style={[styles.inputWrapper, { borderColor: border }]}>
          <Ionicons name="call-outline" size={20} color={textMuted} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: text }]}
            placeholder="Số điện thoại (VD: 0912345678)"
            placeholderTextColor={textMuted}
            value={registerForm.formData.phone}
            onChangeText={(value) => registerForm.updateField('phone', value)}
            keyboardType="phone-pad"
            editable={!registerForm.loading}
          />
        </View>
        {registerForm.errors.phone && <InlineError message={registerForm.errors.phone} />}
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <View style={[styles.inputWrapper, { borderColor: border }]}>
          <Ionicons name="lock-closed-outline" size={20} color={textMuted} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: text }]}
            placeholder="Mật khẩu"
            placeholderTextColor={textMuted}
            value={registerForm.formData.password}
            onChangeText={(value) => registerForm.updateField('password', value)}
            secureTextEntry={!registerForm.showPassword}
            autoCapitalize="none"
            editable={!registerForm.loading}
          />
          <TouchableOpacity
            onPress={() => registerForm.setShowPassword(!registerForm.showPassword)}
            disabled={registerForm.loading}
          >
            <Ionicons
              name={registerForm.showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={textMuted}
            />
          </TouchableOpacity>
        </View>
        {registerForm.errors.password && <InlineError message={registerForm.errors.password} />}
      </View>

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <View style={[styles.inputWrapper, { borderColor: border }]}>
          <Ionicons name="lock-closed-outline" size={20} color={textMuted} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: text }]}
            placeholder="Xác nhận mật khẩu"
            placeholderTextColor={textMuted}
            value={registerForm.formData.confirmPassword}
            onChangeText={(value) => registerForm.updateField('confirmPassword', value)}
            secureTextEntry={!registerForm.showConfirmPassword}
            autoCapitalize="none"
            editable={!registerForm.loading}
          />
          <TouchableOpacity
            onPress={() => registerForm.setShowConfirmPassword(!registerForm.showConfirmPassword)}
            disabled={registerForm.loading}
          >
            <Ionicons
              name={registerForm.showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={textMuted}
            />
          </TouchableOpacity>
        </View>
        {registerForm.errors.confirmPassword && (
          <InlineError message={registerForm.errors.confirmPassword} />
        )}
      </View>

      {/* Location Display */}
      {registerForm.formData.location && (
        <View style={[styles.locationCard, { backgroundColor: `${success}10`, borderColor: success }]}>
          <Ionicons name="location" size={20} color={success} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.locationTitle, { color: success }]}>Vị trí của bạn</Text>
            <Text style={[styles.locationText, { color: text }]} numberOfLines={2}>
              {registerForm.formData.location.address}
            </Text>
          </View>
          <TouchableOpacity onPress={registerForm.getLocation} disabled={registerForm.locationLoading}>
            <Ionicons
              name="refresh"
              size={20}
              color={registerForm.locationLoading ? textMuted : primary}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Role Selection */}
      <View style={styles.roleContainer}>
        <Text style={[styles.roleLabel, { color: text }]}>Loại tài khoản:</Text>
        <View style={styles.roleButtons}>
          {[
            { value: 'CLIENT', label: 'Khách hàng', icon: 'person' },
            { value: 'CONTRACTOR', label: 'Nhà thầu', icon: 'hammer' },
            { value: 'ENGINEER', label: 'Kỹ sư', icon: 'construct' },
          ].map((role) => (
            <TouchableOpacity
              key={role.value}
              style={[
                styles.roleButton,
                registerForm.formData.role === role.value && {
                  backgroundColor: `${primary}20`,
                  borderColor: primary,
                },
              ]}
              onPress={() => registerForm.updateField('role', role.value)}
              disabled={registerForm.loading}
            >
              <Ionicons
                name={role.icon as any}
                size={20}
                color={registerForm.formData.role === role.value ? primary : textMuted}
              />
              <Text
                style={[
                  styles.roleButtonText,
                  { color: registerForm.formData.role === role.value ? primary : textMuted },
                ]}
              >
                {role.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* More roles */}
        <View style={[styles.roleButtons, { marginTop: 8 }]}>
          {[
            { value: 'ARCHITECT', label: 'Kiến trúc sư', icon: 'business' },
            { value: 'DESIGNER', label: 'Thiết kế', icon: 'color-palette' },
            { value: 'SUPPLIER', label: 'Nhà cung cấp', icon: 'cube' },
            { value: 'STAFF', label: 'Nhân viên', icon: 'briefcase' },
          ].map((role) => (
            <TouchableOpacity
              key={role.value}
              style={[
                styles.roleButton,
                registerForm.formData.role === role.value && {
                  backgroundColor: `${primary}20`,
                  borderColor: primary,
                },
              ]}
              onPress={() => registerForm.updateField('role', role.value)}
              disabled={registerForm.loading}
            >
              <Ionicons
                name={role.icon as any}
                size={20}
                color={registerForm.formData.role === role.value ? primary : textMuted}
              />
              <Text
                style={[
                  styles.roleButtonText,
                  { color: registerForm.formData.role === role.value ? primary : textMuted },
                ]}
              >
                {role.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Staff Secret Key Input (only show if STAFF selected) */}
      {registerForm.formData.role === 'STAFF' && (
        <View style={styles.inputContainer}>
          <View style={[styles.inputWrapper, { borderColor: staffSecretKey === 'Nhaxinh@123' ? success : border }]}>
            <Ionicons name="key-outline" size={20} color={textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: text }]}
              placeholder="Nhập mã bảo mật nhân viên"
              placeholderTextColor={textMuted}
              value={staffSecretKey}
              onChangeText={setStaffSecretKey}
              secureTextEntry
              autoCapitalize="none"
              editable={!registerForm.loading}
            />
            {staffSecretKey && (
              <Ionicons
                name={staffSecretKey === 'Nhaxinh@123' ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={staffSecretKey === 'Nhaxinh@123' ? success : error}
              />
            )}
          </View>
          {staffSecretKey && staffSecretKey !== 'Nhaxinh@123' && (
            <InlineError message="Mã bảo mật không đúng. Chỉ nhân viên được cấp phép mới có thể đăng ký." />
          )}
        </View>
      )}

      {/* Terms Checkbox */}
      <TouchableOpacity
        style={styles.termsRow}
        onPress={() => registerForm.updateField('acceptTerms', !registerForm.formData.acceptTerms)}
        disabled={registerForm.loading}
      >
        <Ionicons
          name={registerForm.formData.acceptTerms ? 'checkbox' : 'square-outline'}
          size={20}
          color={primary}
        />
        <Text style={[styles.termsText, { color: text }]}>
          Tôi đồng ý với{' '}
          <Text style={{ color: primary }}>Điều khoản dịch vụ</Text>
        </Text>
      </TouchableOpacity>

      {/* Register Button */}
      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: primary }]}
        onPress={async () => {
          // Validate staff secret key if STAFF role selected
          if (registerForm.formData.role === 'STAFF' && staffSecretKey !== 'Nhaxinh@123') {
            registerForm.setErrors({ general: 'Bạn không có quyền đăng ký tài khoản Nhân viên. Vui lòng nhập đúng mã bảo mật.' });
            return;
          }
          
          const success = await registerForm.handleSubmit();
          if (success) handleAuthSuccess();
        }}
        disabled={registerForm.loading || registerForm.locationLoading}
      >
        {registerForm.loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Đăng Ký</Text>
        )}
      </TouchableOpacity>

      {/* General Error */}
      {registerForm.errors.general && (
        <View style={[styles.errorBox, { backgroundColor: `${error}10`, borderColor: error }]}>
          <Ionicons name="alert-circle" size={20} color={error} />
          <Text style={[styles.errorText, { color: error }]}>{registerForm.errors.general}</Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  return (
    <FormErrorBoundary>
      <LinearGradient
        colors={['#0066CC', '#004499', '#0080FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <FlipCard3D frontContent={LoginContent} backContent={RegisterContent} />
        </KeyboardAvoidingView>

        {/* Toast Notification */}
        {toast && <ToastNotification {...toast} onDismiss={hideToast} />}
      </LinearGradient>
    </FormErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  formContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkboxText: {
    fontSize: 13,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitButton: {
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  locationTitle: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 12,
  },
  roleContainer: {
    marginBottom: 12,
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  roleButtonText: {
    fontSize: 11,
    fontWeight: '500',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  termsText: {
    fontSize: 13,
    flex: 1,
  },
});
