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
    View,
} from 'react-native';

type AddType = 'card' | 'bank' | 'wallet';

interface CardForm {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
}

export default function AddCardScreen() {
  const [loading, setLoading] = useState(false);
  const [cardForm, setCardForm] = useState<CardForm>({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: '',
  });
  const [isDefault, setIsDefault] = useState(false);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19);
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const getCardType = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'American Express';
    if (cleaned.startsWith('6')) return 'Discover';
    return '';
  };

  const handleSave = async () => {
    if (!cardForm.cardNumber || !cardForm.cardHolder || !cardForm.expiry || !cardForm.cvv) {
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.back();
    } catch (error) {
      console.error('Error adding card:', error);
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
          <Text style={styles.headerTitle}>Thêm thẻ mới</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Card Preview */}
          <View style={styles.cardPreview}>
            <View style={styles.cardBackground}>
              <View style={styles.cardChip} />
              <Text style={styles.cardNumber}>
                {cardForm.cardNumber || '•••• •••• •••• ••••'}
              </Text>
              <View style={styles.cardBottom}>
                <View>
                  <Text style={styles.cardLabel}>Chủ thẻ</Text>
                  <Text style={styles.cardValue}>
                    {cardForm.cardHolder.toUpperCase() || 'NGUYEN VAN A'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.cardLabel}>Hết hạn</Text>
                  <Text style={styles.cardValue}>{cardForm.expiry || 'MM/YY'}</Text>
                </View>
              </View>
              {getCardType(cardForm.cardNumber) && (
                <Text style={styles.cardType}>{getCardType(cardForm.cardNumber)}</Text>
              )}
            </View>
          </View>

          {/* Card Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin thẻ</Text>

            <Text style={styles.inputLabel}>Số thẻ</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="card-outline" size={20} color="#94A3B8" />
              <TextInput
                style={styles.inputInner}
                value={cardForm.cardNumber}
                onChangeText={(text) =>
                  setCardForm({ ...cardForm, cardNumber: formatCardNumber(text) })
                }
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                maxLength={19}
              />
            </View>

            <Text style={styles.inputLabel}>Tên chủ thẻ</Text>
            <TextInput
              style={styles.input}
              value={cardForm.cardHolder}
              onChangeText={(text) =>
                setCardForm({ ...cardForm, cardHolder: text })
              }
              placeholder="NGUYEN VAN A"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Ngày hết hạn</Text>
                <TextInput
                  style={styles.input}
                  value={cardForm.expiry}
                  onChangeText={(text) =>
                    setCardForm({ ...cardForm, expiry: formatExpiry(text) })
                  }
                  placeholder="MM/YY"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  value={cardForm.cvv}
                  onChangeText={(text) =>
                    setCardForm({ ...cardForm, cvv: text.replace(/\D/g, '') })
                  }
                  placeholder="123"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.defaultToggle}
              onPress={() => setIsDefault(!isDefault)}
            >
              <View
                style={[styles.checkbox, isDefault && styles.checkboxActive]}
              >
                {isDefault && <Ionicons name="checkmark" size={16} color="#fff" />}
              </View>
              <Text style={styles.defaultText}>Đặt làm phương thức thanh toán mặc định</Text>
            </TouchableOpacity>
          </View>

          {/* Security Info */}
          <View style={styles.securityInfo}>
            <Ionicons name="shield-checkmark" size={20} color="#0066CC" />
            <Text style={styles.securityText}>
              Thông tin thẻ của bạn được mã hóa và bảo mật theo tiêu chuẩn PCI DSS
            </Text>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Save Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Lưu thẻ</Text>
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
  cardPreview: {
    marginBottom: 20,
  },
  cardBackground: {
    backgroundColor: '#1E3A8A',
    borderRadius: 16,
    padding: 20,
    height: 200,
    justifyContent: 'space-between',
  },
  cardChip: {
    width: 45,
    height: 35,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    opacity: 0.8,
  },
  cardNumber: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 2,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  cardType: {
    position: 'absolute',
    top: 20,
    right: 20,
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    gap: 10,
  },
  inputInner: {
    flex: 1,
    padding: 14,
    paddingLeft: 0,
    fontSize: 15,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
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
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 14,
    borderRadius: 10,
    gap: 10,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: '#166534',
    lineHeight: 18,
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
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
