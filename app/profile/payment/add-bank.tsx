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

const BANKS = [
  { id: 'vcb', name: 'Vietcombank', code: 'VCB', color: '#00843D' },
  { id: 'tcb', name: 'Techcombank', code: 'TCB', color: '#ED1C24' },
  { id: 'acb', name: 'ACB', code: 'ACB', color: '#0B3D91' },
  { id: 'bidv', name: 'BIDV', code: 'BIDV', color: '#0055A4' },
  { id: 'vib', name: 'VIB', code: 'VIB', color: '#003366' },
  { id: 'vpb', name: 'VPBank', code: 'VPB', color: '#00A650' },
  { id: 'mb', name: 'MB Bank', code: 'MB', color: '#004990' },
  { id: 'tpb', name: 'TPBank', code: 'TPB', color: '#5D2684' },
];

interface BankForm {
  bankId: string;
  accountNumber: string;
  accountHolder: string;
  branch: string;
}

export default function AddBankScreen() {
  const [loading, setLoading] = useState(false);
  const [bankForm, setBankForm] = useState<BankForm>({
    bankId: '',
    accountNumber: '',
    accountHolder: '',
    branch: '',
  });
  const [isDefault, setIsDefault] = useState(false);

  const selectedBank = BANKS.find(b => b.id === bankForm.bankId);

  const handleSave = async () => {
    if (!bankForm.bankId || !bankForm.accountNumber || !bankForm.accountHolder) {
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.back();
    } catch (error) {
      console.error('Error adding bank:', error);
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
          <Text style={styles.headerTitle}>Liên kết ngân hàng</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Bank Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chọn ngân hàng</Text>
            <View style={styles.bankGrid}>
              {BANKS.map(bank => (
                <TouchableOpacity
                  key={bank.id}
                  style={[
                    styles.bankCard,
                    bankForm.bankId === bank.id && styles.bankCardActive,
                    bankForm.bankId === bank.id && { borderColor: bank.color },
                  ]}
                  onPress={() => setBankForm({ ...bankForm, bankId: bank.id })}
                >
                  <View style={[styles.bankLogo, { backgroundColor: bank.color }]}>
                    <Text style={styles.bankCode}>{bank.code}</Text>
                  </View>
                  <Text style={[
                    styles.bankName,
                    bankForm.bankId === bank.id && { color: bank.color, fontWeight: '600' },
                  ]}>
                    {bank.name}
                  </Text>
                  {bankForm.bankId === bank.id && (
                    <View style={[styles.checkIcon, { backgroundColor: bank.color }]}>
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Account Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>

            <Text style={styles.inputLabel}>Số tài khoản</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="keypad-outline" size={20} color="#94A3B8" />
              <TextInput
                style={styles.inputInner}
                value={bankForm.accountNumber}
                onChangeText={(text) =>
                  setBankForm({ ...bankForm, accountNumber: text.replace(/\D/g, '') })
                }
                placeholder="Nhập số tài khoản"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
              />
            </View>

            <Text style={styles.inputLabel}>Tên chủ tài khoản</Text>
            <TextInput
              style={styles.input}
              value={bankForm.accountHolder}
              onChangeText={(text) =>
                setBankForm({ ...bankForm, accountHolder: text.toUpperCase() })
              }
              placeholder="NGUYEN VAN A"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
            />

            <Text style={styles.inputLabel}>Chi nhánh (không bắt buộc)</Text>
            <TextInput
              style={styles.input}
              value={bankForm.branch}
              onChangeText={(text) => setBankForm({ ...bankForm, branch: text })}
              placeholder="VD: Hà Nội - Cầu Giấy"
              placeholderTextColor="#94A3B8"
            />

            <TouchableOpacity
              style={styles.defaultToggle}
              onPress={() => setIsDefault(!isDefault)}
            >
              <View style={[styles.checkbox, isDefault && styles.checkboxActive]}>
                {isDefault && <Ionicons name="checkmark" size={16} color="#fff" />}
              </View>
              <Text style={styles.defaultText}>Đặt làm tài khoản nhận tiền mặc định</Text>
            </TouchableOpacity>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={22} color={Colors.light.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Lưu ý quan trọng</Text>
              <Text style={styles.infoText}>
                • Tên chủ tài khoản phải trùng với tên đã đăng ký{'\n'}
                • Kiểm tra kỹ số tài khoản trước khi lưu{'\n'}
                • Liên hệ hỗ trợ nếu gặp vấn đề khi liên kết
              </Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Save Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              loading && styles.saveButtonDisabled,
              !bankForm.bankId && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={loading || !bankForm.bankId}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>
                {selectedBank ? `Liên kết ${selectedBank.name}` : 'Chọn ngân hàng'}
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
  bankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  bankCard: {
    width: '48%',
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    position: 'relative',
  },
  bankCardActive: {
    backgroundColor: '#F8FAFC',
  },
  bankLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  bankCode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  bankName: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  checkIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: `${Colors.light.primary}10`,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
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
