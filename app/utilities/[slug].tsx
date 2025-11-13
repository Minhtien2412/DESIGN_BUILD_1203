import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { getServiceBySlug, Service } from '@/data/services';
import { ApiError, apiFetch } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';

export default function UtilityDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const service = getServiceBySlug(slug);

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    address: '',
    date: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!service) {
    return (
      <Container>
        <Stack.Screen options={{ title: 'Dịch vụ không tồn tại' }} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
          <Text style={styles.errorTitle}>Không tìm thấy dịch vụ</Text>
          <Text style={styles.errorMessage}>
            Dịch vụ bạn tìm kiếm không tồn tại hoặc đã bị xóa.
          </Text>
          <Button title="Quay về trang chủ" onPress={() => router.back()} />
        </View>
      </Container>
    );
  }

  const handleBookingSubmit = async () => {
    // Validate
    if (!bookingData.name || !bookingData.phone || !bookingData.address) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit booking via API wrapper (uses timeout and normalized errors)
      const payload = {
        serviceSlug: slug,
        serviceName: service.name,
        ...bookingData,
      };
      await apiFetch('/bookings', { method: 'POST', data: payload, timeoutMs: 10000 });

      Alert.alert(
        'Đặt dịch vụ thành công!',
        'Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsBookingOpen(false);
              setBookingData({ name: '', phone: '', address: '', date: '', notes: '' });
            },
          },
        ]
      );
    } catch (e: any) {
      const detail = e instanceof ApiError ? (e.data?.detail || e.message) : 'Không thể đặt dịch vụ. Vui lòng thử lại sau.';
      Alert.alert('Lỗi', String(detail));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: service.name,
          headerBackTitle: 'Quay lại',
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{service.icon}</Text>
          </View>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.serviceNameEn}>{service.nameEn}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {getCategoryLabel(service.category)}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Section title="Mô tả dịch vụ">
          <Text style={styles.description}>{service.description}</Text>
          {service.deliveryTime && (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.infoText}>
                Thời gian: {service.deliveryTime}
              </Text>
            </View>
          )}
          {service.minOrder && (
            <View style={styles.infoRow}>
              <Ionicons name="cube-outline" size={20} color="#666" />
              <Text style={styles.infoText}>
                Đặt tối thiểu: {service.minOrder} {service.unit}
              </Text>
            </View>
          )}
        </Section>

        {/* Pricing */}
        <Section title="Bảng giá">
          {service.pricing.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.pricingCard,
                index === service.pricing.length - 1 && styles.pricingCardLast,
              ]}
            >
              <View style={styles.pricingHeader}>
                <Text style={styles.pricingName}>{item.name}</Text>
                <Text style={styles.pricingPrice}>
                  {formatPrice(item.price)} / {item.unit}
                </Text>
              </View>
              {item.description && (
                <Text style={styles.pricingDescription}>{item.description}</Text>
              )}
              {item.priceNote && (
                <Text style={styles.pricingNote}>* {item.priceNote}</Text>
              )}
            </View>
          ))}
        </Section>

        {/* Features */}
        <Section title="Ưu điểm nổi bật">
          {service.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </Section>

        {/* Booking Form */}
        {isBookingOpen ? (
          <Section title="Thông tin đặt dịch vụ">
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Họ và tên <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập họ và tên"
                  value={bookingData.name}
                  onChangeText={(text) =>
                    setBookingData({ ...bookingData, name: text })
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Số điện thoại <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập số điện thoại"
                  keyboardType="phone-pad"
                  value={bookingData.phone}
                  onChangeText={(text) =>
                    setBookingData({ ...bookingData, phone: text })
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Địa chỉ thi công <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập địa chỉ"
                  value={bookingData.address}
                  onChangeText={(text) =>
                    setBookingData({ ...bookingData, address: text })
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ngày dự kiến</Text>
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/YYYY"
                  value={bookingData.date}
                  onChangeText={(text) =>
                    setBookingData({ ...bookingData, date: text })
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ghi chú</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="Thông tin thêm (không bắt buộc)"
                  multiline
                  numberOfLines={4}
                  value={bookingData.notes}
                  onChangeText={(text) =>
                    setBookingData({ ...bookingData, notes: text })
                  }
                />
              </View>

              <View style={styles.buttonRow}>
                <Button
                  title="Hủy"
                  onPress={() => setIsBookingOpen(false)}
                  variant="secondary"
                  style={styles.cancelButton}
                />
                <Button
                  title={isSubmitting ? 'Đang gửi...' : 'Xác nhận đặt'}
                  onPress={handleBookingSubmit}
                  loading={isSubmitting}
                  style={styles.submitButton}
                />
              </View>
            </View>
          </Section>
        ) : (
          <View style={styles.ctaContainer}>
            <Button
              title="Đặt dịch vụ ngay"
              onPress={() => setIsBookingOpen(true)}
              style={styles.ctaButton}
            />
            <Pressable
              style={styles.callButton}
              onPress={() => Alert.alert('Liên hệ', 'Hotline: 0123 456 789')}
            >
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.callButtonText}>Gọi tư vấn</Text>
            </Pressable>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

function getCategoryLabel(category: Service['category']): string {
  const labels = {
    construction: 'Thi công',
    labor: 'Nhân công',
    material: 'Vật liệu',
    finishing: 'Hoàn thiện',
    tech: 'Kỹ thuật',
  };
  return labels[category];
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: '#F5F5F5',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  icon: {
    fontSize: 48,
  },
  serviceName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  serviceNameEn: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#90B44C',
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  pricingCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pricingCardLast: {
    marginBottom: 0,
  },
  pricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  pricingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  pricingPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#90B44C',
    marginLeft: 12,
  },
  pricingDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  pricingNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 8,
    flex: 1,
    lineHeight: 22,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#F44336',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
  ctaContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 12,
  },
  ctaButton: {
    backgroundColor: '#90B44C',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  callButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
