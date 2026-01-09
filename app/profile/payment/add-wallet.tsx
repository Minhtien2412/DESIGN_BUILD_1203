import { Container } from '@/components/ui/container';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const WALLETS = [
  { id: 'momo', name: 'MoMo', color: '#A50064', icon: '💜' },
  { id: 'zalopay', name: 'ZaloPay', color: '#0068FF', icon: '💙' },
  { id: 'vnpay', name: 'VNPay', color: '#1A1F71', icon: '🔵' },
  { id: 'shopeepay', name: 'ShopeePay', color: '#0066CC', icon: '🧡' },
  { id: 'viettelpay', name: 'ViettelPay', color: '#E50019', icon: '❤️' },
  { id: 'applepay', name: 'Apple Pay', color: '#000000', icon: '🍎' },
  { id: 'googlepay', name: 'Google Pay', color: '#4285F4', icon: '🟢' },
  { id: 'samsung', name: 'Samsung Pay', color: '#1428A0', icon: '💠' },
];

interface WalletForm {
  walletId: string;
  phoneNumber: string;
}

export default function AddWalletScreen() {
  const [loading, setLoading] = useState(false);
  const [walletForm, setWalletForm] = useState<WalletForm>({
    walletId: '',
    phoneNumber: '',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isDefault, setIsDefault] = useState(false);

  const selectedWallet = WALLETS.find(w => w.id === walletForm.walletId);

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.substring(0, 10);
  };

  const sendVerificationCode = async () => {
    if (walletForm.phoneNumber.length < 10) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCodeSent(true);
      setCountdown(60);

      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error sending code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length < 4) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.back();
    } catch (error) {
      console.error('Error verifying:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fullWidth>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Liên kết ví điện tử</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Wallet Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chọn ví điện tử</Text>
            <View style={styles.walletGrid}>
              {WALLETS.map(wallet => (
                <TouchableOpacity
                  key={wallet.id}
                  style={[
                    styles.walletCard,
                    walletForm.walletId === wallet.id && styles.walletCardActive,
                    walletForm.walletId === wallet.id && { borderColor: wallet.color },
                  ]}
                  onPress={() => setWalletForm({ ...walletForm, walletId: wallet.id })}
                >
                  <View style={[styles.walletIcon, { backgroundColor: `${wallet.color}15` }]}>
                    <Text style={styles.walletEmoji}>{wallet.icon}</Text>
                  </View>
                  <Text style={[
                    styles.walletName,
                    walletForm.walletId === wallet.id && { color: wallet.color, fontWeight: '600' },
                  ]}>
                    {wallet.name}
                  </Text>
                  {walletForm.walletId === wallet.id && (
                    <View style={[styles.checkIcon, { backgroundColor: wallet.color }]}>
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Phone Number */}
          {selectedWallet && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Xác thực tài khoản</Text>

              <Text style={styles.inputLabel}>Số điện thoại đăng ký {selectedWallet.name}</Text>
              <View style={styles.phoneRow}>
                <View style={[styles.inputWithIcon, { flex: 1 }]}>
                  <Text style={styles.phonePrefix}>+84</Text>
                  <TextInput
                    style={styles.inputInner}
                    value={walletForm.phoneNumber}
                    onChangeText={(text) =>
                      setWalletForm({ ...walletForm, phoneNumber: formatPhone(text) })
                    }
                    placeholder="912 345 678"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
                <TouchableOpacity
                  style={[
                    styles.sendCodeButton,
                    { backgroundColor: selectedWallet.color },
                    (countdown > 0 || walletForm.phoneNumber.length < 10) && styles.sendCodeDisabled,
                  ]}
                  onPress={sendVerificationCode}
                  disabled={countdown > 0 || walletForm.phoneNumber.length < 10 || loading}
                >
                  <Text style={styles.sendCodeText}>
                    {countdown > 0 ? `${countdown}s` : 'Gửi mã'}
                  </Text>
                </TouchableOpacity>
              </View>

              {codeSent && (
                <>
                  <Text style={styles.inputLabel}>Mã xác thực OTP</Text>
                  <TextInput
                    style={styles.otpInput}
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    placeholder="Nhập mã 6 số"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={6}
                    textAlign="center"
                  />
                  <Text style={styles.otpHint}>
                    Mã xác thực đã được gửi đến số điện thoại của bạn
                  </Text>
                </>
              )}

              <TouchableOpacity
                style={styles.defaultToggle}
                onPress={() => setIsDefault(!isDefault)}
              >
                <View style={[styles.checkbox, isDefault && styles.checkboxActive]}>
                  {isDefault && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <Text style={styles.defaultText}>Đặt làm ví mặc định khi thanh toán</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Features */}
          {selectedWallet && (
            <View style={styles.featuresCard}>
              <Text style={styles.featuresTitle}>Tiện ích khi dùng {selectedWallet.name}</Text>
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Ionicons name="flash" size={20} color="#0066CC" />
                  <Text style={styles.featureText}>Thanh toán nhanh chóng</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="shield-checkmark" size={20} color="#0066CC" />
                  <Text style={styles.featureText}>Bảo mật cao với OTP</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="gift" size={20} color="#000000" />
                  <Text style={styles.featureText}>Ưu đãi và hoàn tiền</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="wallet" size={20} color={Colors.light.primary} />
                  <Text style={styles.featureText}>Quản lý chi tiêu dễ dàng</Text>
                </View>
              </View>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Save Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              selectedWallet && { backgroundColor: selectedWallet.color },
              loading && styles.saveButtonDisabled,
              (!selectedWallet || (codeSent && !verificationCode)) && styles.saveButtonDisabled,
            ]}
            onPress={codeSent ? handleVerify : sendVerificationCode}
            disabled={loading || !selectedWallet || (codeSent && !verificationCode)}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>
                {codeSent ? 'Xác nhận liên kết' : `Liên kết ${selectedWallet?.name || 'ví'}`}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  walletGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  walletCard: {
    width: '48%',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    position: 'relative',
  },
  walletCardActive: {
    backgroundColor: '#F8FAFC',
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  walletEmoji: {
    fontSize: 24,
  },
  walletName: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    marginTop: 8,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    gap: 8,
  },
  phonePrefix: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  inputInner: {
    flex: 1,
    padding: 14,
    paddingLeft: 0,
    fontSize: 15,
    color: '#333',
  },
  sendCodeButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendCodeDisabled: {
    opacity: 0.5,
  },
  sendCodeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  otpInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 16,
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    letterSpacing: 8,
  },
  otpHint: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },
  defaultToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  defaultText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  featuresCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  featuresTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 14,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#64748B',
  },
  bottomBar: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
