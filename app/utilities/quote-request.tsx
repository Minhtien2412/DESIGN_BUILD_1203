import { Colors } from '@/constants/theme';
import { useUtilities } from '@/context/UtilitiesContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const SERVICES = [
  'Xây dựng mới',
  'Sửa chữa nhà',
  'Thiết kế kiến trúc',
  'Thiết kế nội thất',
  'Tư vấn công trình',
  'Khác',
];

export default function QuoteRequestScreen() {
  const { createQuote, quotes } = useUtilities();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name || !phone || !selectedService || !description) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setSubmitting(true);
    try {
      await createQuote({
        name,
        phone,
        email: email.trim() || undefined,
        selectedService,
        description,
      });

      Alert.alert(
        'Thành công',
        'Yêu cầu báo giá đã được gửi! Chúng tôi sẽ liên hệ lại với bạn trong 24h.',
        [
          { text: 'Xem yêu cầu', onPress: () => router.push('/utilities/history') },
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi yêu cầu. Vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.light.background }}>
      {/* Header */}
      <View style={{
        backgroundColor: Colors.light.primary,
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 16,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.2)',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFF', flex: 1 }}>
            Yêu cầu báo giá
          </Text>
        </View>
        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 20 }}>
          Nhận báo giá chi tiết miễn phí trong 24h
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          {/* Contact Info */}
          <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.light.text, marginBottom: 16 }}>
              Thông tin liên hệ
            </Text>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.light.text, marginBottom: 8 }}>
                Họ và tên <Text style={{ color: Colors.light.error }}>*</Text>
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Nhập họ tên"
                style={{
                  borderWidth: 1,
                  borderColor: Colors.light.border,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 15,
                  color: Colors.light.text
                }}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.light.text, marginBottom: 8 }}>
                Số điện thoại <Text style={{ color: Colors.light.error }}>*</Text>
              </Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
                style={{
                  borderWidth: 1,
                  borderColor: Colors.light.border,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 15,
                  color: Colors.light.text
                }}
              />
            </View>

            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.light.text, marginBottom: 8 }}>
                Email (tùy chọn)
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Nhập email"
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  borderWidth: 1,
                  borderColor: Colors.light.border,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 15,
                  color: Colors.light.text
                }}
              />
            </View>
          </View>

          {/* Service Selection */}
          <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.light.text, marginBottom: 16 }}>
              Dịch vụ cần báo giá <Text style={{ color: Colors.light.error }}>*</Text>
            </Text>
            <View style={{ gap: 8 }}>
              {SERVICES.map((service) => (
                <TouchableOpacity
                  key={service}
                  onPress={() => setSelectedService(service)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 14,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: selectedService === service ? Colors.light.primary : Colors.light.border,
                    backgroundColor: selectedService === service ? Colors.light.primary + '10' : '#FFF'
                  }}
                >
                  <Text style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: selectedService === service ? Colors.light.primary : Colors.light.text
                  }}>
                    {service}
                  </Text>
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: selectedService === service ? Colors.light.primary : Colors.light.border,
                    backgroundColor: selectedService === service ? Colors.light.primary : 'transparent',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    {selectedService === service && (
                      <Ionicons name="checkmark" size={12} color="#FFF" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.light.text, marginBottom: 16 }}>
              Mô tả chi tiết <Text style={{ color: Colors.light.error }}>*</Text>
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Mô tả công trình, yêu cầu của bạn..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              style={{
                borderWidth: 1,
                borderColor: Colors.light.border,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 15,
                color: Colors.light.text,
                minHeight: 120
              }}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={{
              backgroundColor: Colors.light.primary,
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              marginBottom: 12,
              opacity: submitting ? 0.6 : 1
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFF' }}>
              {submitting ? 'Đang gửi...' : 'Gửi yêu cầu báo giá'}
            </Text>
          </TouchableOpacity>

          {/* View Quotes */}
          {quotes.length > 0 && (
            <TouchableOpacity
              onPress={() => router.push('/utilities/history')}
              style={{
                backgroundColor: '#F3F4F6',
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
                marginBottom: 12,
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <Ionicons name="document-text" size={20} color={Colors.light.primary} />
              <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.light.primary }}>
                Xem yêu cầu đã gửi ({quotes.length})
              </Text>
            </TouchableOpacity>
          )}

          {/* Info Note */}
          <View style={{
            backgroundColor: '#FFF9E6',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            flexDirection: 'row',
            gap: 12
          }}>
            <Ionicons name="information-circle" size={24} color="#F59E0B" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: '#92400E', lineHeight: 18 }}>
                Chúng tôi sẽ liên hệ lại với bạn trong vòng 24 giờ để trao đổi chi tiết và gửi báo giá chính xác.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
