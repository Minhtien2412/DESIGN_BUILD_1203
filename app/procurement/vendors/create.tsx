import { Container } from '@/components/ui/container';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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

export default function CreateVendorScreen() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    taxCode: '',
    category: '',
    rating: 0,
    notes: '',
    paymentTerms: '',
    bankName: '',
    bankAccount: '',
  });

  const categories = [
    'Vật liệu xây dựng',
    'Thiết bị điện',
    'Thiết bị nước',
    'Nội thất',
    'PCCC',
    'Dịch vụ vận chuyển',
    'Nhà thầu phụ',
    'Khác',
  ];

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên nhà cung cấp');
      return;
    }

    if (!formData.phone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert('Thành công', 'Nhà cung cấp đã được thêm', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi thêm nhà cung cấp');
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
          <Text style={styles.headerTitle}>Thêm nhà cung cấp</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên công ty/cửa hàng *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập tên nhà cung cấp"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Người liên hệ</Text>
              <TextInput
                style={styles.input}
                placeholder="Họ tên người liên hệ"
                value={formData.contactPerson}
                onChangeText={(text) => setFormData(prev => ({ ...prev, contactPerson: text }))}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Điện thoại *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0xxx xxx xxx"
                  value={formData.phone}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                  keyboardType="phone-pad"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="email@example.com"
                  value={formData.email}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Địa chỉ</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Địa chỉ đầy đủ"
                value={formData.address}
                onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mã số thuế</Text>
              <TextInput
                style={styles.input}
                placeholder="Mã số thuế"
                value={formData.taxCode}
                onChangeText={(text) => setFormData(prev => ({ ...prev, taxCode: text }))}
              />
            </View>
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Danh mục sản phẩm/dịch vụ</Text>
            <View style={styles.chipContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    formData.category === cat && styles.chipActive,
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, category: cat }))}
                >
                  <Text
                    style={[
                      styles.chipText,
                      formData.category === cat && styles.chipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Payment Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin thanh toán</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Điều khoản thanh toán</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: Thanh toán sau 30 ngày"
                value={formData.paymentTerms}
                onChangeText={(text) => setFormData(prev => ({ ...prev, paymentTerms: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ngân hàng</Text>
              <TextInput
                style={styles.input}
                placeholder="Tên ngân hàng"
                value={formData.bankName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, bankName: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số tài khoản</Text>
              <TextInput
                style={styles.input}
                placeholder="Số tài khoản ngân hàng"
                value={formData.bankAccount}
                onChangeText={(text) => setFormData(prev => ({ ...prev, bankAccount: text }))}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ghi chú</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ghi chú thêm về nhà cung cấp..."
              value={formData.notes}
              onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Thêm nhà cung cấp</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
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
  formContainer: {
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
  inputGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  chipActive: {
    backgroundColor: Colors.light.primary,
  },
  chipText: {
    fontSize: 13,
    color: '#666',
  },
  chipTextActive: {
    color: '#fff',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
