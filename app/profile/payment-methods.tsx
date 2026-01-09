import { Container } from '@/components/ui/container';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const PAYMENT_METHODS = [
  {
    id: 'momo',
    name: 'Ví MoMo',
    icon: 'wallet-outline',
    color: '#A50064',
    enabled: true,
  },
  {
    id: 'zalopay',
    name: 'ZaloPay',
    icon: 'logo-z',
    color: '#008FE5',
    enabled: true,
  },
  {
    id: 'vnpay',
    name: 'VNPAY',
    icon: 'card-outline',
    color: '#0066B2',
    enabled: true,
  },
  {
    id: 'bank',
    name: 'Chuyển khoản ngân hàng',
    icon: 'business-outline',
    color: '#1E88E5',
    enabled: true,
  },
  {
    id: 'cod',
    name: 'Thanh toán khi nhận hàng (COD)',
    icon: 'cash-outline',
    color: '#0066CC',
    enabled: true,
  },
  {
    id: 'credit',
    name: 'Thẻ tín dụng/Ghi nợ',
    icon: 'card',
    color: '#666666',
    enabled: false,
  },
];

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState('momo');

  const handleSelectMethod = (methodId: string) => {
    const method = PAYMENT_METHODS.find(m => m.id === methodId);
    if (!method?.enabled) {
      Alert.alert('Thông báo', 'Phương thức thanh toán này sẽ sớm được hỗ trợ');
      return;
    }
    setSelectedMethod(methodId);
  };

  const handleContinue = () => {
    const method = PAYMENT_METHODS.find(m => m.id === selectedMethod);
    Alert.alert(
      'Xác nhận thanh toán',
      `Bạn đã chọn: ${method?.name}`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Tiếp tục', onPress: () => router.back() },
      ]
    );
  };

  const renderPaymentMethod = (method: any) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.methodCard,
        selectedMethod === method.id && styles.methodCardActive,
        !method.enabled && styles.methodCardDisabled,
      ]}
      onPress={() => handleSelectMethod(method.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.methodIcon, { backgroundColor: method.color + '20' }]}>
        <Ionicons name={method.icon as any} size={28} color={method.color} />
      </View>
      <View style={styles.methodInfo}>
        <Text style={styles.methodName}>{method.name}</Text>
        {!method.enabled && (
          <Text style={styles.comingSoon}>Sắp ra mắt</Text>
        )}
      </View>
      <View
        style={[
          styles.radio,
          selectedMethod === method.id && styles.radioActive,
        ]}
      >
        {selectedMethod === method.id && <View style={styles.radioDot} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <Container style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Phương thức thanh toán</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn phương thức thanh toán</Text>
          {PAYMENT_METHODS.map(renderPaymentMethod)}
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ưu đãi thanh toán</Text>
          <View style={styles.benefitCard}>
            <View style={styles.benefitIcon}>
              <Ionicons name="gift-outline" size={24} color="#0066CC" />
            </View>
            <View style={styles.benefitInfo}>
              <Text style={styles.benefitTitle}>Giảm 50K cho đơn đầu</Text>
              <Text style={styles.benefitDesc}>
                Áp dụng cho đơn hàng từ 500K khi thanh toán qua ví điện tử
              </Text>
            </View>
          </View>
          <View style={styles.benefitCard}>
            <View style={styles.benefitIcon}>
              <Ionicons name="flash-outline" size={24} color="#FFB800" />
            </View>
            <View style={styles.benefitInfo}>
              <Text style={styles.benefitTitle}>Hoàn tiền 10%</Text>
              <Text style={styles.benefitDesc}>
                Tối đa 100K cho thanh toán bằng VNPAY
              </Text>
            </View>
          </View>
        </View>

        {/* Security Info */}
        <View style={styles.securityInfo}>
          <Ionicons name="shield-checkmark" size={20} color="#0066CC" />
          <Text style={styles.securityText}>
            Giao dịch được bảo mật với tiêu chuẩn PCI DSS
          </Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueBtnText}>Tiếp tục</Text>
        </TouchableOpacity>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0066CC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
  },
  backBtn: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  section: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodCardActive: {
    backgroundColor: '#FFF5F0',
    borderColor: '#0066CC',
  },
  methodCardDisabled: {
    opacity: 0.5,
  },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: {
    flex: 1,
    marginLeft: 16,
  },
  methodName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  comingSoon: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: '#0066CC',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0066CC',
  },
  benefitCard: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 12,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitInfo: {
    flex: 1,
    marginLeft: 12,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  benefitDesc: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  securityText: {
    fontSize: 13,
    color: '#0066CC',
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  continueBtn: {
    backgroundColor: '#0066CC',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
