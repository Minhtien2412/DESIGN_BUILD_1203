import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

interface WorkerType {
  id: string;
  name: string;
  icon: string;
  basePrice: number;
  unit: string;
  description: string;
}

const WORKER_TYPES: WorkerType[] = [
  {
    id: 'mason',
    name: 'Thợ Xây',
    icon: '🧱',
    basePrice: 500000,
    unit: 'ngày',
    description: 'Xây tường, đổ bê tông, làm móng',
  },
  {
    id: 'electrician',
    name: 'Thợ Điện',
    icon: '⚡',
    basePrice: 600000,
    unit: 'ngày',
    description: 'Lắp đặt hệ thống điện, sửa chữa',
  },
  {
    id: 'plumber',
    name: 'Thợ Nước',
    icon: '🚰',
    basePrice: 550000,
    unit: 'ngày',
    description: 'Lắp đặt ống nước, sửa chữa',
  },
  {
    id: 'painter',
    name: 'Thợ Sơn',
    icon: '🎨',
    basePrice: 450000,
    unit: 'ngày',
    description: 'Sơn tường, sơn cửa, hoàn thiện',
  },
];

const PROMO_CODES = [
  { code: 'BUILD15', discount: 15, description: 'Giảm 15% tổng chi phí' },
  { code: 'NEWYEAR', discount: 20, description: 'Giảm 20% dịch vụ mới' },
];

export default function ConstructionBookingScreen() {
  // Get workerType from route params
  const { workerType } = useLocalSearchParams<{ workerType?: string }>();
  
  const [selectedWorker, setSelectedWorker] = useState<WorkerType | null>(null);
  const [address, setAddress] = useState('');
  const [workDays, setWorkDays] = useState('1');
  const [description, setDescription] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<typeof PROMO_CODES[0] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');

  const bottomSheetAnim = useRef(new Animated.Value(0)).current;

  // Auto-select worker if workerType param provided
  useEffect(() => {
    if (workerType && !selectedWorker) {
      const worker = WORKER_TYPES.find(w => w.id === workerType);
      if (worker) {
        setSelectedWorker(worker);
      }
    }
  }, [workerType]);

  const calculatePrice = () => {
    if (!selectedWorker) return 0;
    const days = parseInt(workDays) || 1;
    const baseTotal = selectedWorker.basePrice * days;
    const discount = appliedPromo ? (baseTotal * appliedPromo.discount) / 100 : 0;
    return baseTotal - discount;
  };

  const handleWorkerSelect = (worker: WorkerType) => {
    setSelectedWorker(worker);
    Animated.spring(bottomSheetAnim, {
      toValue: 1,
      useNativeDriver: true,
      bounciness: 10,
    }).start();
  };

  const handleApplyPromo = () => {
    const promo = PROMO_CODES.find((p) => p.code === promoCode.toUpperCase());
    if (promo) {
      setAppliedPromo(promo);
      Alert.alert('Thành công!', `Đã áp dụng mã ${promo.code} - ${promo.description}`);
    } else {
      Alert.alert('Lỗi', 'Mã giảm giá không hợp lệ');
    }
  };

  const handleBooking = () => {
    if (!selectedWorker || !address || !workDays) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    Alert.alert(
      'Xác nhận đặt dịch vụ',
      `${selectedWorker.name}\n${address}\n${workDays} ngày\nTổng: ${calculatePrice().toLocaleString('vi-VN')}đ`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: () => {
            router.push('/construction/tracking' as any);
          },
        },
      ]
    );
  };

  const totalPrice = calculatePrice();
  const basePrice = selectedWorker ? selectedWorker.basePrice * (parseInt(workDays) || 1) : 0;
  const discount = appliedPromo ? (basePrice * appliedPromo.discount) / 100 : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đặt Dịch Vụ Xây Dựng</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Address Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Địa chỉ công trường</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="location" size={20} color="#00B14F" />
            <TextInput
              style={styles.input}
              placeholder="Nhập địa chỉ công trường"
              value={address}
              onChangeText={setAddress}
            />
          </View>
        </View>

        {/* Worker Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn loại dịch vụ</Text>
          <View style={styles.workerGrid}>
            {WORKER_TYPES.map((worker) => (
              <TouchableOpacity
                key={worker.id}
                style={[
                  styles.workerCard,
                  selectedWorker?.id === worker.id && styles.workerCardActive,
                ]}
                onPress={() => handleWorkerSelect(worker)}
              >
                <Text style={styles.workerIcon}>{worker.icon}</Text>
                <Text style={styles.workerName}>{worker.name}</Text>
                <Text style={styles.workerPrice}>
                  {worker.basePrice.toLocaleString('vi-VN')}đ/{worker.unit}
                </Text>
                {selectedWorker?.id === worker.id && (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#00B14F" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {selectedWorker && (
          <>
            {/* Work Days */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Số ngày làm việc</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="calendar" size={20} color="#00B14F" />
                <TextInput
                  style={styles.input}
                  placeholder="Số ngày"
                  value={workDays}
                  onChangeText={setWorkDays}
                  keyboardType="numeric"
                />
                <Text style={styles.inputSuffix}>ngày</Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mô tả công việc</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Mô tả chi tiết công việc cần làm..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Promo Code */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mã giảm giá</Text>
              <View style={styles.promoContainer}>
                <View style={styles.promoInputContainer}>
                  <Ionicons name="pricetag" size={20} color="#FF6B35" />
                  <TextInput
                    style={styles.promoInput}
                    placeholder="Nhập mã giảm giá"
                    value={promoCode}
                    onChangeText={setPromoCode}
                    autoCapitalize="characters"
                  />
                </View>
                <TouchableOpacity style={styles.applyButton} onPress={handleApplyPromo}>
                  <Text style={styles.applyButtonText}>Áp dụng</Text>
                </TouchableOpacity>
              </View>
              {appliedPromo && (
                <View style={styles.promoApplied}>
                  <Ionicons name="checkmark-circle" size={16} color="#00B14F" />
                  <Text style={styles.promoAppliedText}>
                    Đã áp dụng: {appliedPromo.code} (-{appliedPromo.discount}%)
                  </Text>
                </View>
              )}
            </View>

            {/* Payment Method */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
              <View style={styles.paymentMethods}>
                <TouchableOpacity
                  style={[
                    styles.paymentMethod,
                    paymentMethod === 'cash' && styles.paymentMethodActive,
                  ]}
                  onPress={() => setPaymentMethod('cash')}
                >
                  <Ionicons name="cash" size={24} color={paymentMethod === 'cash' ? '#00B14F' : '#666'} />
                  <Text style={[
                    styles.paymentMethodText,
                    paymentMethod === 'cash' && styles.paymentMethodTextActive,
                  ]}>
                    Tiền mặt
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.paymentMethod,
                    paymentMethod === 'transfer' && styles.paymentMethodActive,
                  ]}
                  onPress={() => setPaymentMethod('transfer')}
                >
                  <Ionicons name="card" size={24} color={paymentMethod === 'transfer' ? '#00B14F' : '#666'} />
                  <Text style={[
                    styles.paymentMethodText,
                    paymentMethod === 'transfer' && styles.paymentMethodTextActive,
                  ]}>
                    Chuyển khoản
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Price Breakdown */}
            <View style={styles.priceBreakdown}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Chi phí cơ bản</Text>
                <Text style={styles.priceValue}>
                  {basePrice.toLocaleString('vi-VN')}đ
                </Text>
              </View>
              {appliedPromo && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Giảm giá ({appliedPromo.discount}%)</Text>
                  <Text style={styles.discountValue}>
                    -{discount.toLocaleString('vi-VN')}đ
                  </Text>
                </View>
              )}
              <View style={styles.divider} />
              <View style={styles.priceRow}>
                <Text style={styles.totalLabel}>Tổng cộng</Text>
                <Text style={styles.totalValue}>
                  {totalPrice.toLocaleString('vi-VN')}đ
                </Text>
              </View>
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Booking Button */}
      {selectedWorker && (
        <View style={styles.bookingButtonContainer}>
          <TouchableOpacity style={styles.bookingButton} onPress={handleBooking}>
            <Text style={styles.bookingButtonText}>Đặt Dịch Vụ</Text>
            <Text style={styles.bookingButtonPrice}>
              {totalPrice.toLocaleString('vi-VN')}đ
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  inputSuffix: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  workerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  workerCard: {
    width: (width - 48) / 2,
    margin: 4,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  workerCardActive: {
    borderColor: '#00B14F',
    backgroundColor: '#E8F5E9',
  },
  workerIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  workerName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  workerPrice: {
    fontSize: 13,
    color: '#666',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
  },
  promoContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  promoInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  promoInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  applyButton: {
    backgroundColor: '#00B14F',
    paddingHorizontal: 20,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  promoApplied: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 6,
  },
  promoAppliedText: {
    fontSize: 13,
    color: '#00B14F',
    marginLeft: 6,
    fontWeight: '500',
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentMethod: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    gap: 8,
  },
  paymentMethodActive: {
    borderColor: '#00B14F',
    backgroundColor: '#E8F5E9',
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#666',
  },
  paymentMethodTextActive: {
    color: '#00B14F',
    fontWeight: '600',
  },
  priceBreakdown: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  discountValue: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  bookingButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  bookingButton: {
    backgroundColor: '#00B14F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  bookingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  bookingButtonPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
