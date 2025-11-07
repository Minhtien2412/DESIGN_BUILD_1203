import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLogin, useSendOTP, useVerifyOTP } from '../hooks/api';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const loginMutation = useLogin();
  const sendOtpMutation = useSendOTP();
  const verifyOtpMutation = useVerifyOTP();

  const handlePasswordLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      await loginMutation.mutateAsync({ email, password });
    } catch (error: any) {
      Alert.alert('Đăng nhập thất bại', error.message || 'Có lỗi xảy ra');
    }
  };

  const handleSendOtp = async () => {
    if (!phone) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }

    try {
      await sendOtpMutation.mutateAsync({ phone });
      setIsOtpSent(true);
      Alert.alert('Thành công', 'Mã OTP đã được gửi đến số điện thoại của bạn');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra khi gửi OTP');
    }
  };

  const handleVerifyOtp = async () => {
    if (!phone || !otp) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      await verifyOtpMutation.mutateAsync({ phone, otp });
    } catch (error: any) {
      Alert.alert('Xác thực thất bại', error.message || 'Mã OTP không đúng');
    }
  };

  const isLoading = loginMutation.isPending || sendOtpMutation.isPending || verifyOtpMutation.isPending;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Đăng nhập</Text>
        
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeButton, loginMode === 'password' && styles.activeModeButton]}
            onPress={() => setLoginMode('password')}
          >
            <Text style={[styles.modeButtonText, loginMode === 'password' && styles.activeModeButtonText]}>
              Mật khẩu
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, loginMode === 'otp' && styles.activeModeButton]}
            onPress={() => setLoginMode('otp')}
          >
            <Text style={[styles.modeButtonText, loginMode === 'otp' && styles.activeModeButtonText]}>
              OTP
            </Text>
          </TouchableOpacity>
        </View>

        {loginMode === 'password' ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity
              style={[styles.button, isLoading && styles.disabledButton]}
              onPress={handlePasswordLogin}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {loginMutation.isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            
            {isOtpSent && (
              <TextInput
                style={styles.input}
                placeholder="Mã OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
              />
            )}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.disabledButton]}
              onPress={isOtpSent ? handleVerifyOtp : handleSendOtp}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isOtpSent 
                  ? (verifyOtpMutation.isPending ? 'Đang xác thực...' : 'Xác thực OTP')
                  : (sendOtpMutation.isPending ? 'Đang gửi OTP...' : 'Gửi OTP')
                }
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  modeToggle: {
    flexDirection: 'row',
    marginBottom: 30,
    backgroundColor: '#e0e0e0',
    borderRadius: 25,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeModeButton: {
    backgroundColor: '#007AFF',
  },
  modeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  activeModeButtonText: {
    color: 'white',
    fontWeight: '600',
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

export default LoginScreen;
