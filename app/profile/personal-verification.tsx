import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ApiError, apiFetch } from '@/services/api';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const ACCOUNT_TYPES = [
  'Cá nhân',
  'Chủ đầu tư',
  'Công ty',
  'Ngân hàng',
  'Nhà thầu',
  'Giám sát',
  'Tư vấn',
];

export default function PersonalVerificationScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'tint');

  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedAccountTypes, setSelectedAccountTypes] = useState<string[]>([]);

  const toggleAccountType = (type: string) => {
    setSelectedAccountTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!fullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ và tên');
      return;
    }
    if (!idNumber.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập CCCD/CMND');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }
    if (selectedAccountTypes.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một loại tài khoản');
      return;
    }

    try {
      await apiFetch('/profile/verification', {
        method: 'POST',
        data: {
          fullName,
          idNumber,
          address,
          phone,
          email,
          accountTypes: selectedAccountTypes,
        },
      });

      Alert.alert('Thành công', 'Đã gửi yêu cầu xác minh tài khoản', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      const msg = (e as ApiError)?.data?.message || (e as Error)?.message || 'Không thể gửi xác minh';
      Alert.alert('Lỗi', msg);
    }
  };

  return (
    <Container style={{ backgroundColor }}>
      <ScrollView style={styles.container}>
        <Text style={[styles.title, { color: textColor }]}>
          Tài khoản xác minh
        </Text>

        {/* Personal Info */}
        <View style={styles.section}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: textColor }]}>Họ và tên</Text>
            <TextInput
              style={[
                styles.input,
                { color: textColor, borderColor: borderColor },
              ]}
              placeholder="Nhập họ và tên"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: textColor }]}>CCCD/CMND</Text>
            <TextInput
              style={[
                styles.input,
                { color: textColor, borderColor: borderColor },
              ]}
              placeholder="Nhập số CCCD"
              placeholderTextColor="#999"
              value={idNumber}
              onChangeText={setIdNumber}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: textColor }]}>Địa chỉ</Text>
            <TextInput
              style={[
                styles.input,
                { color: textColor, borderColor: borderColor },
              ]}
              placeholder="Số nhà, đường, thị xã, tỉnh thành"
              placeholderTextColor="#999"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: textColor }]}>Số điện thoại</Text>
            <TextInput
              style={[
                styles.input,
                { color: textColor, borderColor: borderColor },
              ]}
              placeholder="Nhập số điện thoại"
              placeholderTextColor="#999"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: textColor }]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                { color: textColor, borderColor: borderColor },
              ]}
              placeholder="Nhập email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Account Type Selection */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Tài khoản</Text>
          <View style={styles.accountTypesGrid}>
            {ACCOUNT_TYPES.map(type => {
              const isSelected = selectedAccountTypes.includes(type);
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.accountTypeChip,
                    {
                      backgroundColor: isSelected ? primaryColor : '#F5F5F5',
                      borderColor: isSelected ? primaryColor : borderColor,
                    },
                  ]}
                  onPress={() => toggleAccountType(type)}
                >
                  <Text
                    style={[
                      styles.accountTypeText,
                      { color: isSelected ? '#FFF' : textColor },
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Submit Button */}
        <Button
          title="Tiếp tục"
          onPress={handleSubmit}
          style={styles.submitButton}
        />
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  accountTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  accountTypeChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  accountTypeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
