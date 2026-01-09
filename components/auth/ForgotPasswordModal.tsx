import { useThemeColor } from '@/hooks/use-theme-color';
import { apiFetch } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ForgotPasswordStep {
  email: string;
  resetCode: string;
  newPassword: string;
  confirmPassword: string;
}

export function ForgotPasswordModal({ visible, onClose, onSuccess }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ForgotPasswordStep>({
    email: '',
    resetCode: '',
    newPassword: '',
    confirmPassword: '',
  });

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');

  const handleSendCode = async () => {
    if (!formData.email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      Alert.alert(
        'Thành công',
        'Mã xác thực đã được gửi đến email của bạn',
        [{ text: 'OK', onPress: () => setStep('code') }]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi mã xác thực. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!formData.resetCode.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã xác thực');
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          code: formData.resetCode,
        }),
      });

      setStep('password');
    } catch (error) {
      Alert.alert('Lỗi', 'Mã xác thực không đúng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!formData.newPassword.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu mới');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          code: formData.resetCode,
          newPassword: formData.newPassword,
        }),
      });

      Alert.alert(
        'Thành công',
        'Mật khẩu đã được đặt lại. Vui lòng đăng nhập lại.',
        [
          {
            text: 'OK',
            onPress: () => {
              onSuccess?.();
              handleClose();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('email');
    setFormData({ email: '', resetCode: '', newPassword: '', confirmPassword: '' });
    onClose();
  };

  const renderEmailStep = () => (
    <View style={styles.stepContainer}>
      <View style={[styles.iconCircle, { backgroundColor: `${primaryColor}20` }]}>
        <Ionicons name="mail-outline" size={40} color={primaryColor} />
      </View>
      <Text style={[styles.title, { color: textColor }]}>Quên mật khẩu?</Text>
      <Text style={[styles.subtitle, { color: textColor }]}>
        Nhập email để nhận mã xác thực
      </Text>

      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color={primaryColor} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder="Email của bạn"
          placeholderTextColor="#9CA3AF"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
        {formData.email.includes('@') && formData.email.includes('.') && (
          <Ionicons name="checkmark-circle" size={20} color="#0066CC" />
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.button, 
          { backgroundColor: primaryColor },
          (!formData.email.trim() || loading) && styles.buttonDisabled
        ]}
        onPress={handleSendCode}
        disabled={loading || !formData.email.trim()}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Text style={styles.buttonText}>Gửi mã xác thực</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderCodeStep = () => (
    <View style={styles.stepContainer}>
      <View style={[styles.iconCircle, { backgroundColor: `${primaryColor}20` }]}>
        <Ionicons name="key-outline" size={40} color={primaryColor} />
      </View>
      <Text style={[styles.title, { color: textColor }]}>Nhập mã xác thực</Text>
      <Text style={[styles.subtitle, { color: textColor }]}>
        Mã 6 số đã được gửi đến {formData.email}
      </Text>

      <View style={styles.inputContainer}>
        <Ionicons name="key-outline" size={20} color={primaryColor} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: textColor, fontSize: 24, letterSpacing: 8, textAlign: 'center' }]}
          placeholder="●●●●●●"
          placeholderTextColor="#9CA3AF"
          value={formData.resetCode}
          onChangeText={(text) => setFormData({ ...formData, resetCode: text.replace(/\D/g, '') })}
          keyboardType="number-pad"
          maxLength={6}
          editable={!loading}
        />
        {formData.resetCode.length === 6 && (
          <Ionicons name="checkmark-circle" size={20} color="#0066CC" />
        )}
      </View>

      <TouchableOpacity
        style={styles.resendButton}
        onPress={handleSendCode}
        disabled={loading}
      >
        <Text style={[styles.resendText, { color: primaryColor }]}>
          Gửi lại mã
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: primaryColor }]}
        onPress={handleVerifyCode}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Xác thực</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSendCode} disabled={loading}>
        <Text style={[styles.resendText, { color: primaryColor }]}>
          Gửi lại mã
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPasswordStep = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.title, { color: textColor }]}>Đặt mật khẩu mới</Text>
      <Text style={[styles.subtitle, { color: textColor }]}>
        Nhập mật khẩu mới cho tài khoản của bạn
      </Text>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder="Mật khẩu mới"
          value={formData.newPassword}
          onChangeText={(text) => setFormData({ ...formData, newPassword: text })}
          secureTextEntry
          editable={!loading}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder="Xác nhận mật khẩu"
          value={formData.confirmPassword}
          onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
          secureTextEntry
          editable={!loading}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: primaryColor }]}
        onPress={handleResetPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor }]}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>

          {step === 'email' && renderEmailStep()}
          {step === 'code' && renderCodeStep()}
          {step === 'password' && renderPasswordStep()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  stepContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    width: '100%',
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    paddingVertical: 8,
    marginTop: 8,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
