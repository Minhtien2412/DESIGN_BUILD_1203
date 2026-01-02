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

export default function NewAddressScreen() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    ward: '',
    district: '',
    city: '',
    isDefault: false,
    type: 'home',
  });

  const addressTypes = [
    { key: 'home', label: 'Nhà riêng', icon: 'home' },
    { key: 'office', label: 'Văn phòng', icon: 'business' },
    { key: 'site', label: 'Công trường', icon: 'construct' },
    { key: 'other', label: 'Khác', icon: 'location' },
  ];

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên người nhận');
      return;
    }

    if (!formData.phone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }

    if (!formData.address.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert('Thành công', 'Địa chỉ đã được lưu', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi lưu địa chỉ');
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
          <Text style={styles.headerTitle}>Thêm địa chỉ mới</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          {/* Contact Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Họ và tên *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập họ và tên người nhận"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại *</Text>
              <TextInput
                style={styles.input}
                placeholder="0xxx xxx xxx"
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Address Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Loại địa chỉ</Text>
            <View style={styles.typeGrid}>
              {addressTypes.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.typeCard,
                    formData.type === type.key && styles.typeCardActive,
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, type: type.key }))}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={24}
                    color={formData.type === type.key ? Colors.light.primary : '#94A3B8'}
                  />
                  <Text style={[
                    styles.typeLabel,
                    formData.type === type.key && styles.typeLabelActive,
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Address Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chi tiết địa chỉ</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Địa chỉ *</Text>
              <TextInput
                style={styles.input}
                placeholder="Số nhà, tên đường..."
                value={formData.address}
                onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phường/Xã</Text>
              <TextInput
                style={styles.input}
                placeholder="Chọn Phường/Xã"
                value={formData.ward}
                onChangeText={(text) => setFormData(prev => ({ ...prev, ward: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quận/Huyện</Text>
              <TextInput
                style={styles.input}
                placeholder="Chọn Quận/Huyện"
                value={formData.district}
                onChangeText={(text) => setFormData(prev => ({ ...prev, district: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tỉnh/Thành phố</Text>
              <TextInput
                style={styles.input}
                placeholder="Chọn Tỉnh/Thành phố"
                value={formData.city}
                onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
              />
            </View>
          </View>

          {/* Default Toggle */}
          <TouchableOpacity
            style={styles.defaultToggle}
            onPress={() => setFormData(prev => ({ ...prev, isDefault: !prev.isDefault }))}
          >
            <View style={[
              styles.checkbox,
              formData.isDefault && styles.checkboxActive,
            ]}>
              {formData.isDefault && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <Text style={styles.defaultText}>Đặt làm địa chỉ mặc định</Text>
          </TouchableOpacity>

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
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Lưu địa chỉ</Text>
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 10,
  },
  typeCardActive: {
    borderColor: Colors.light.primary,
    backgroundColor: `${Colors.light.primary}08`,
  },
  typeLabel: {
    fontSize: 14,
    color: '#666',
  },
  typeLabelActive: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  defaultToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  defaultText: {
    fontSize: 15,
    color: '#333',
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
