import { useThemeColor } from '@/hooks/use-theme-color';
import { usePaymentCreate } from '@/hooks/usePayment';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaymentCreateScreen() {
  const [orderCode, setOrderCode] = useState(`DH${Date.now()}`);
  const [amount, setAmount] = useState('150000');
  const [currency] = useState('VND');
  const [provider] = useState('manual');
  
  const { createPayment, payment, loading, error, reset } = usePaymentCreate();
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'icon');

  const handleSubmit = async () => {
    if (!orderCode.trim() || !amount.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 1000) {
      Alert.alert('Lỗi', 'Số tiền phải từ 1,000 VND trở lên');
      return;
    }

    await createPayment({
      order_code: orderCode,
      amount: numAmount,
      currency,
      provider,
      meta: { note: 'Created from mobile app' }
    });
  };

  const handleReset = () => {
    reset();
    setOrderCode(`DH${Date.now()}`);
    setAmount('150000');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Tạo giao dịch</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Form Section */}
        <View style={[styles.formCard, { backgroundColor: cardColor, borderColor }]}>
          <View style={styles.formHeader}>
            <Ionicons name="card-outline" size={24} color={tintColor} />
            <Text style={[styles.formTitle, { color: textColor }]}>Thông tin giao dịch</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={[styles.label, { color: textColor }]}>Mã đơn hàng</Text>
              <View style={[styles.inputContainer, { borderColor: borderColor }]}>
                <Ionicons name="document-text-outline" size={20} color={borderColor} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={orderCode}
                  onChangeText={setOrderCode}
                  placeholder="Nhập mã đơn hàng"
                  placeholderTextColor={textColor + '80'}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: textColor }]}>Số tiền ({currency})</Text>
              <View style={[styles.inputContainer, { borderColor: borderColor }]}>
                <Ionicons name="cash-outline" size={20} color={borderColor} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="Nhập số tiền"
                  placeholderTextColor={textColor + '80'}
                  keyboardType="numeric"
                />
              </View>
              <Text style={[styles.hint, { color: textColor }]}>
                Số tiền tối thiểu: 1,000 VND
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: textColor }]}>Nhà cung cấp</Text>
              <View style={[styles.providerCard, { backgroundColor: tintColor + '10', borderColor: tintColor + '30' }]}>
                <Ionicons name="business-outline" size={20} color={tintColor} />
                <Text style={[styles.providerText, { color: textColor }]}>Manual Payment</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Preview Section */}
        <View style={[styles.previewCard, { backgroundColor: cardColor, borderColor }]}>
          <Text style={[styles.previewTitle, { color: textColor }]}>Xem trước giao dịch</Text>
          
          <View style={styles.previewItem}>
            <Text style={[styles.previewLabel, { color: textColor }]}>Mã đơn hàng:</Text>
            <Text style={[styles.previewValue, { color: tintColor }]}>{orderCode || '---'}</Text>
          </View>
          
          <View style={styles.previewItem}>
            <Text style={[styles.previewLabel, { color: textColor }]}>Số tiền:</Text>
            <Text style={[styles.previewValue, { color: tintColor }]}>
              {amount ? `${parseFloat(amount).toLocaleString('vi-VN')} ${currency}` : '---'}
            </Text>
          </View>
          
          <View style={styles.previewItem}>
            <Text style={[styles.previewLabel, { color: textColor }]}>Nhà cung cấp:</Text>
            <Text style={[styles.previewValue, { color: textColor }]}>Manual Payment</Text>
          </View>
        </View>

        {/* Success Result */}
        {payment && (
          <View style={[styles.resultCard, styles.successCard]}>
            <View style={styles.resultHeader}>
              <Ionicons name="checkmark-circle" size={32} color="#0066CC" />
              <Text style={styles.successTitle}>Tạo thành công!</Text>
            </View>
            
            <View style={styles.resultDetails}>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>ID giao dịch:</Text>
                <Text style={[styles.resultValue, { color: textColor }]}>{payment.id}</Text>
              </View>
              
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Mã đơn hàng:</Text>
                <Text style={[styles.resultValue, { color: textColor }]}>{payment.order_code}</Text>
              </View>
              
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Số tiền:</Text>
                <Text style={[styles.resultValue, { color: textColor }]}>
                  {payment.amount.toLocaleString('vi-VN')} {payment.currency}
                </Text>
              </View>
              
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Trạng thái:</Text>
                <View style={[styles.statusBadge, { backgroundColor: '#0066CC20' }]}>
                  <Text style={[styles.statusText, { color: '#0066CC' }]}>{payment.status}</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.resetButton, { backgroundColor: '#0066CC' }]} 
              onPress={handleReset}
            >
              <Ionicons name="add-outline" size={20} color="white" />
              <Text style={styles.resetButtonText}>Tạo giao dịch mới</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Error Result */}
        {error && (
          <View style={[styles.resultCard, styles.errorCard]}>
            <View style={styles.resultHeader}>
              <Ionicons name="alert-circle" size={32} color="#000000" />
              <Text style={styles.errorTitle}>Có lỗi xảy ra</Text>
            </View>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action */}
      {!payment && (
        <View style={[styles.bottomBar, { backgroundColor, borderTopColor: borderColor }]}>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: tintColor }, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <Ionicons name="reload-outline" size={20} color="white" />
            ) : (
              <Ionicons name="card-outline" size={20} color="white" />
            )}
            <Text style={styles.createButtonText}>
              {loading ? 'Đang tạo...' : 'Tạo giao dịch'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  formCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  form: {
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    opacity: 0.7,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  providerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  previewCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  previewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewLabel: {
    fontSize: 14,
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successCard: {
    backgroundColor: '#E8F5E8',
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  resultDetails: {
    gap: 12,
    marginBottom: 20,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#000000',
    fontSize: 14,
    lineHeight: 20,
  },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
