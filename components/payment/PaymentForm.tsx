import { useThemeColor } from '@/hooks/use-theme-color';
import { apiFetch } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'wallet';
  label: string;
  icon: string;
  details?: string;
}

interface PaymentFormProps {
  amount: number;
  description: string;
  onSuccess: (paymentId: string) => void;
  onCancel?: () => void;
}

interface CardInfo {
  number: string;
  expiry: string;
  cvv: string;
  holderName: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'card', type: 'card', label: 'Thẻ tín dụng/ghi nợ', icon: 'card-outline' },
  { id: 'bank', type: 'bank', label: 'Chuyển khoản ngân hàng', icon: 'business-outline' },
  { id: 'momo', type: 'wallet', label: 'Ví MoMo', icon: 'wallet-outline' },
  { id: 'zalopay', type: 'wallet', label: 'ZaloPay', icon: 'wallet-outline' },
];

export function PaymentForm({ amount, description, onSuccess, onCancel }: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PAYMENT_METHODS[0]);
  const [cardInfo, setCardInfo] = useState<CardInfo>({
    number: '',
    expiry: '',
    cvv: '',
    holderName: '',
  });
  const [loading, setLoading] = useState(false);
  const [saveCard, setSaveCard] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = cleaned.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return text;
    }
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const validateCard = (): boolean => {
    const { number, expiry, cvv, holderName } = cardInfo;
    const cleanNumber = number.replace(/\s/g, '');
    
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      Alert.alert('Lỗi', 'Số thẻ không hợp lệ');
      return false;
    }

    if (expiry.length !== 5 || !expiry.includes('/')) {
      Alert.alert('Lỗi', 'Ngày hết hạn không hợp lệ (MM/YY)');
      return false;
    }

    if (cvv.length < 3 || cvv.length > 4) {
      Alert.alert('Lỗi', 'Mã CVV không hợp lệ');
      return false;
    }

    if (holderName.trim().length < 2) {
      Alert.alert('Lỗi', 'Tên chủ thẻ không hợp lệ');
      return false;
    }

    return true;
  };

  const processPayment = async () => {
    if (selectedMethod.type === 'card' && !validateCard()) {
      return;
    }

    setLoading(true);

    try {
      const paymentData = {
        amount,
        description,
        method: selectedMethod.id,
        ...(selectedMethod.type === 'card' && {
          card: {
            ...cardInfo,
            number: cardInfo.number.replace(/\s/g, ''),
          },
          saveCard,
        }),
      };

      const response = await apiFetch('/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      // Handle different payment methods
      if (selectedMethod.type === 'wallet') {
        // For wallet payments, typically redirect to external app
        Alert.alert(
          'Chuyển hướng thanh toán',
          `Bạn sẽ được chuyển đến ứng dụng ${selectedMethod.label} để hoàn thành thanh toán.`,
          [
            { text: 'Hủy', style: 'cancel' },
            { 
              text: 'Tiếp tục', 
              onPress: () => {
                // Simulate external app redirect
                setTimeout(() => {
                  onSuccess(response.paymentId);
                }, 2000);
              }
            },
          ]
        );
      } else {
        // For card/bank payments, process immediately
        onSuccess(response.paymentId);
      }

    } catch (error: any) {
      Alert.alert('Thanh toán thất bại', error.message || 'Có lỗi xảy ra khi xử lý thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentMethods = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>Phương thức thanh toán</Text>
      {PAYMENT_METHODS.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.methodOption,
            selectedMethod.id === method.id && { 
              borderColor: primaryColor, 
              backgroundColor: `${primaryColor}15` 
            }
          ]}
          onPress={() => setSelectedMethod(method)}
        >
          <Ionicons 
            name={method.icon as any} 
            size={24} 
            color={selectedMethod.id === method.id ? primaryColor : '#666'} 
          />
          <Text style={[
            styles.methodLabel,
            { color: selectedMethod.id === method.id ? primaryColor : textColor }
          ]}>
            {method.label}
          </Text>
          <Ionicons 
            name={selectedMethod.id === method.id ? 'radio-button-on' : 'radio-button-off'} 
            size={20} 
            color={selectedMethod.id === method.id ? primaryColor : '#666'} 
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCardForm = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>Thông tin thẻ</Text>
      
      <View style={styles.inputContainer}>
        <Ionicons name="card-outline" size={20} color={primaryColor} />
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder="Số thẻ"
          placeholderTextColor="#9CA3AF"
          value={cardInfo.number}
          onChangeText={(text) => setCardInfo({ ...cardInfo, number: formatCardNumber(text) })}
          keyboardType="numeric"
          maxLength={19}
        />
        {cardInfo.number.length >= 13 && (
          <Ionicons name="checkmark-circle" size={20} color="#0D9488" />
        )}
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
          <Ionicons name="calendar-outline" size={20} color={primaryColor} />
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="MM/YY"
            placeholderTextColor="#9CA3AF"
            value={cardInfo.expiry}
            onChangeText={(text) => setCardInfo({ ...cardInfo, expiry: formatExpiry(text) })}
            keyboardType="numeric"
            maxLength={5}
          />
          {cardInfo.expiry.length === 5 && (
            <Ionicons name="checkmark-circle" size={20} color="#0D9488" />
          )}
        </View>
        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
          <Ionicons name="lock-closed-outline" size={20} color={primaryColor} />
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="CVV"
            placeholderTextColor="#9CA3AF"
            value={cardInfo.cvv}
            onChangeText={(text) => setCardInfo({ ...cardInfo, cvv: text.replace(/\D/g, '') })}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
          />
          {cardInfo.cvv.length >= 3 && (
            <Ionicons name="checkmark-circle" size={20} color="#0D9488" />
          )}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color={primaryColor} />
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder="Tên chủ thẻ"
          placeholderTextColor="#9CA3AF"
          value={cardInfo.holderName}
          onChangeText={(text) => setCardInfo({ ...cardInfo, holderName: text })}
          autoCapitalize="words"
        />
        {cardInfo.holderName.length >= 2 && (
          <Ionicons name="checkmark-circle" size={20} color="#0D9488" />
        )}
      </View>

      <TouchableOpacity 
        style={styles.saveCardOption}
        onPress={() => setSaveCard(!saveCard)}
      >
        <Ionicons 
          name={saveCard ? 'checkbox' : 'square-outline'} 
          size={20} 
          color={primaryColor} 
        />
        <Text style={[styles.saveCardText, { color: textColor }]}>
          Lưu thẻ để thanh toán nhanh hơn lần sau
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderBankTransfer = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>Thông tin chuyển khoản</Text>
      <View style={styles.bankInfo}>
        <Text style={[styles.bankTitle, { color: textColor }]}>Thông tin tài khoản nhận:</Text>
        <Text style={[styles.bankDetail, { color: textColor }]}>Ngân hàng: Vietcombank</Text>
        <Text style={[styles.bankDetail, { color: textColor }]}>Số tài khoản: 1234567890</Text>
        <Text style={[styles.bankDetail, { color: textColor }]}>Chủ tài khoản: CÔNG TY THIẾT KẾ XÂY DỰNG</Text>
        <Text style={[styles.bankDetail, { color: textColor }]}>Nội dung: {description}</Text>
      </View>
    </View>
  );

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Thanh toán</Text>
        <Text style={[styles.amount, { color: primaryColor }]}>{formatCurrency(amount)}</Text>
        <Text style={[styles.description, { color: textColor }]}>{description}</Text>
      </View>

      {renderPaymentMethods()}

      {selectedMethod.type === 'card' && renderCardForm()}
      {selectedMethod.type === 'bank' && renderBankTransfer()}

      <View style={styles.buttonContainer}>
        {onCancel && (
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={onCancel}
          >
            <Text style={[styles.buttonText, { color: textColor }]}>Hủy</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.button, styles.payButton, { backgroundColor: primaryColor }]}
          onPress={processPayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.payButtonText}>
              {selectedMethod.type === 'bank' ? 'Tôi đã chuyển khoản' : 'Thanh toán ngay'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
  },
  methodLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveCardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  saveCardText: {
    marginLeft: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  bankInfo: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0D9488',
  },
  bankTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  bankDetail: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  payButton: {
    // backgroundColor set dynamically
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
