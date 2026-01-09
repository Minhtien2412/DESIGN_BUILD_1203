import { MODERN_COLORS } from '@/constants/modern-theme';
import { apiFetch } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export interface PriceQuoteTemplateProps {
  serviceType: string;
  serviceName: string;
  basePrice?: number;
  priceUnit?: string;
  calculator?: boolean;
  bookingEnabled?: boolean;
  apiEndpoint: string;
  description?: string;
}

interface FormField {
  name: string;
  type: 'text' | 'number' | 'select' | 'date' | 'textarea';
  label: string;
  required?: boolean;
  options?: string[];
}

export function PriceQuoteTemplate({
  serviceType,
  serviceName,
  basePrice = 0,
  priceUnit = 'đ',
  calculator = false,
  bookingEnabled = true,
  apiEndpoint,
  description,
}: PriceQuoteTemplateProps) {
  const [quantity, setQuantity] = useState('1');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    area: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(basePrice);

  const handleCalculate = () => {
    const qty = parseFloat(quantity) || 1;
    const price = basePrice * qty;
    setEstimatedPrice(price);
  };

  const handleSubmitQuote = async () => {
    // Validation
    if (!formData.name || !formData.phone) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên và số điện thoại');
      return;
    }

    try {
      setLoading(true);
      const response = await apiFetch('/quotes/submit', {
        method: 'POST',
        body: JSON.stringify({
          serviceType,
          serviceName,
          quantity: parseFloat(quantity),
          estimatedPrice,
          ...formData,
        }),
      });

      Alert.alert(
        'Thành công',
        'Yêu cầu báo giá đã được gửi! Chúng tôi sẽ liên hệ với bạn sớm.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          }
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi yêu cầu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{serviceName}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Service Info */}
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{serviceName}</Text>
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Đơn giá:</Text>
            <Text style={styles.priceValue}>
              {formatCurrency(basePrice)}/{priceUnit}
            </Text>
          </View>
        </View>

        {/* Calculator (if enabled) */}
        {calculator && (
          <View style={styles.calculatorSection}>
            <Text style={styles.sectionTitle}>Tính toán dự toán</Text>
            <View style={styles.calculatorRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Số lượng ({priceUnit})</Text>
                <TextInput
                  style={styles.input}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="decimal-pad"
                  placeholder="Nhập số lượng"
                />
              </View>
              <TouchableOpacity
                style={styles.calculateButton}
                onPress={handleCalculate}
              >
                <Ionicons name="calculator" size={20} color="#fff" />
                <Text style={styles.calculateText}>Tính</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Dự kiến:</Text>
              <Text style={styles.resultValue}>{formatCurrency(estimatedPrice)}</Text>
            </View>
          </View>
        )}

        {/* Quote Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Họ và tên <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Nhập họ và tên"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Số điện thoại <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Nhập email (không bắt buộc)"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Địa điểm thi công</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
              placeholder="Nhập địa điểm"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Diện tích (m²)</Text>
            <TextInput
              style={styles.input}
              value={formData.area}
              onChangeText={(text) => setFormData({ ...formData, area: text })}
              placeholder="Nhập diện tích"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mô tả chi tiết</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Mô tả yêu cầu của bạn..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Info Note */}
        <View style={styles.noteBox}>
          <Ionicons name="information-circle" size={20} color={MODERN_COLORS.primary} />
          <Text style={styles.noteText}>
            Chúng tôi sẽ liên hệ với bạn trong vòng 24h để tư vấn chi tiết
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmitQuote}
          disabled={loading}
        >
          <Text style={styles.submitText}>
            {loading ? 'Đang gửi...' : 'Gửi yêu cầu báo giá'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center' as const,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1a1a1a',
  },
  serviceInfo: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: MODERN_COLORS.primary,
  },
  calculatorSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1a1a1a',
    marginBottom: 12,
  },
  calculatorRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#ff4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
  },
  calculateButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
    height: 42,
  },
  calculateText: {
    marginLeft: 4,
    color: '#fff',
    fontWeight: '600' as const,
    fontSize: 14,
  },
  resultBox: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
  },
  resultValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: MODERN_COLORS.primary,
  },
  formSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  noteBox: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 12,
    marginHorizontal: 16,
    backgroundColor: '#E8F4FF',
    borderRadius: 8,
  },
  noteText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  submitButton: {
    backgroundColor: MODERN_COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center' as const,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
};
