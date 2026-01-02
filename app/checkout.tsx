/**
 * Checkout Screen - Multi-step Wizard
 * Updated: 13/12/2025
 * 
 * Features:
 * - Step 1: Shipping Address
 * - Step 2: Payment Method
 * - Step 3: Order Review
 * - Step 4: Success Animation
 * - Nordic Green theme
 */

import ModernButton from '@/components/ui/modern-button';
import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
    MODERN_TYPOGRAPHY,
} from '@/constants/modern-theme';
import { useCart } from '@/context/cart-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

type CheckoutStep = 'address' | 'payment' | 'review' | 'success';

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  district: string;
  city: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const MOCK_ADDRESSES: Address[] = [
  {
    id: '1',
    name: 'Văn phòng',
    phone: '0912345678',
    address: '123 Nguyễn Huệ',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    isDefault: true,
  },
  {
    id: '2',
    name: 'Nhà riêng',
    phone: '0987654321',
    address: '456 Lê Lợi',
    district: 'Quận 3',
    city: 'TP. Hồ Chí Minh',
    isDefault: false,
  },
];

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'cod',
    name: 'Thanh toán khi nhận hàng',
    icon: 'cash-outline',
    description: 'Thanh toán bằng tiền mặt khi nhận hàng',
  },
  {
    id: 'momo',
    name: 'Ví MoMo',
    icon: 'wallet-outline',
    description: 'Thanh toán qua ví điện tử MoMo',
  },
  {
    id: 'card',
    name: 'Thẻ tín dụng/Ghi nợ',
    icon: 'card-outline',
    description: 'Visa, Mastercard, JCB',
  },
  {
    id: 'banking',
    name: 'Chuyển khoản ngân hàng',
    icon: 'business-outline',
    description: 'Chuyển khoản qua Internet Banking',
  },
];

export default function CheckoutScreen() {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');
  const [selectedAddress, setSelectedAddress] = useState<Address>(MOCK_ADDRESSES[0]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(PAYMENT_METHODS[0]);
  const [note, setNote] = useState('');

  const formatPrice = (price: number) => price.toLocaleString('vi-VN');

  const handlePlaceOrder = () => {
    setCurrentStep('success');
    // Clear cart after 2 seconds
    setTimeout(() => {
      clearCart();
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1500);
    }, 2000);
  };

  const renderProgressBar = () => {
    const steps = [
      { key: 'address', label: 'Địa chỉ' },
      { key: 'payment', label: 'Thanh toán' },
      { key: 'review', label: 'Xác nhận' },
    ];

    const currentIndex = steps.findIndex(s => s.key === currentStep);

    return (
      <View style={styles.progressContainer}>
        {steps.map((step, index) => (
          <View key={step.key} style={styles.progressStep}>
            <View
              style={[
                styles.progressCircle,
                index <= currentIndex && styles.progressCircleActive,
              ]}
            >
              {index < currentIndex ? (
                <Ionicons name="checkmark" size={16} color={MODERN_COLORS.surface} />
              ) : (
                <Text style={[
                  styles.progressNumber,
                  index <= currentIndex && styles.progressNumberActive,
                ]}>
                  {index + 1}
                </Text>
              )}
            </View>
            <Text style={[
              styles.progressLabel,
              index <= currentIndex && styles.progressLabelActive,
            ]}>
              {step.label}
            </Text>
            {index < steps.length - 1 && (
              <View style={[
                styles.progressLine,
                index < currentIndex && styles.progressLineActive,
              ]} />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderAddressStep = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Chọn địa chỉ giao hàng</Text>

      {MOCK_ADDRESSES.map((address) => (
        <TouchableOpacity
          key={address.id}
          style={[
            styles.addressCard,
            selectedAddress.id === address.id && styles.addressCardActive,
          ]}
          onPress={() => setSelectedAddress(address)}
          activeOpacity={0.7}
        >
          <View style={styles.addressHeader}>
            <View style={styles.addressNameRow}>
              <Ionicons name="location" size={20} color={MODERN_COLORS.primary} />
              <Text style={styles.addressName}>{address.name}</Text>
              {address.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Mặc định</Text>
                </View>
              )}
            </View>
            <View style={[
              styles.radioButton,
              selectedAddress.id === address.id && styles.radioButtonActive,
            ]}>
              {selectedAddress.id === address.id && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
          </View>

          <Text style={styles.addressPhone}>{address.phone}</Text>
          <Text style={styles.addressText}>
            {address.address}, {address.district}, {address.city}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.addAddressButton} activeOpacity={0.7}>
        <Ionicons name="add-circle-outline" size={24} color={MODERN_COLORS.primary} />
        <Text style={styles.addAddressText}>Thêm địa chỉ mới</Text>
      </TouchableOpacity>

      <View style={styles.stepActions}>
        <ModernButton
          variant="primary"
          size="large"
          onPress={() => setCurrentStep('payment')}
          icon="arrow-forward"
          iconPosition="right"
        >
          Tiếp tục
        </ModernButton>
      </View>
    </ScrollView>
  );

  const renderPaymentStep = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Chọn phương thức thanh toán</Text>

      {PAYMENT_METHODS.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.paymentCard,
            selectedPayment.id === method.id && styles.paymentCardActive,
          ]}
          onPress={() => setSelectedPayment(method)}
          activeOpacity={0.7}
        >
          <View style={styles.paymentIconContainer}>
            <Ionicons name={method.icon as any} size={28} color={MODERN_COLORS.primary} />
          </View>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentName}>{method.name}</Text>
            <Text style={styles.paymentDescription}>{method.description}</Text>
          </View>
          <View style={[
            styles.radioButton,
            selectedPayment.id === method.id && styles.radioButtonActive,
          ]}>
            {selectedPayment.id === method.id && (
              <View style={styles.radioButtonInner} />
            )}
          </View>
        </TouchableOpacity>
      ))}

      <View style={styles.stepActions}>
        <ModernButton
          variant="outline"
          size="large"
          onPress={() => setCurrentStep('address')}
          icon="arrow-back"
          iconPosition="left"
          style={{ flex: 1, marginRight: MODERN_SPACING.sm }}
        >
          Quay lại
        </ModernButton>
        <ModernButton
          variant="primary"
          size="large"
          onPress={() => setCurrentStep('review')}
          icon="arrow-forward"
          iconPosition="right"
          style={{ flex: 1 }}
        >
          Tiếp tục
        </ModernButton>
      </View>
    </ScrollView>
  );

  const renderReviewStep = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Xác nhận đơn hàng</Text>

      {/* Shipping Address */}
      <View style={styles.reviewSection}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewSectionTitle}>Địa chỉ giao hàng</Text>
          <TouchableOpacity onPress={() => setCurrentStep('address')}>
            <Text style={styles.changeLink}>Thay đổi</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.reviewCard}>
          <Text style={styles.addressName}>{selectedAddress.name}</Text>
          <Text style={styles.addressPhone}>{selectedAddress.phone}</Text>
          <Text style={styles.addressText}>
            {selectedAddress.address}, {selectedAddress.district}, {selectedAddress.city}
          </Text>
        </View>
      </View>

      {/* Payment Method */}
      <View style={styles.reviewSection}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewSectionTitle}>Phương thức thanh toán</Text>
          <TouchableOpacity onPress={() => setCurrentStep('payment')}>
            <Text style={styles.changeLink}>Thay đổi</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.reviewCard}>
          <View style={styles.paymentReview}>
            <Ionicons name={selectedPayment.icon as any} size={24} color={MODERN_COLORS.primary} />
            <Text style={styles.paymentReviewText}>{selectedPayment.name}</Text>
          </View>
        </View>
      </View>

      {/* Order Items */}
      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Sản phẩm ({totalItems})</Text>
        {items.map((item) => (
          <View key={item.id} style={styles.orderItem}>
            <Image
              source={typeof item.product.image === 'string' ? { uri: item.product.image } : item.product.image}
              style={styles.orderItemImage}
            />
            <View style={styles.orderItemInfo}>
              <Text style={styles.orderItemName} numberOfLines={2}>{item.product.name}</Text>
              <Text style={styles.orderItemQty}>Số lượng: {item.quantity}</Text>
            </View>
            <Text style={styles.orderItemPrice}>₫{formatPrice(item.product.price * item.quantity)}</Text>
          </View>
        ))}
      </View>

      {/* Note */}
      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Ghi chú (Tùy chọn)</Text>
        <TextInput
          style={styles.noteInput}
          placeholder="Thêm ghi chú cho người bán..."
          placeholderTextColor={MODERN_COLORS.textSecondary}
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Order Summary */}
      <View style={styles.orderSummary}>
        <Text style={styles.summaryTitle}>Tổng cộng</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tạm tính</Text>
          <Text style={styles.summaryValue}>₫{formatPrice(totalPrice)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
          <Text style={styles.freeShipping}>Miễn phí</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Tổng thanh toán</Text>
          <Text style={styles.totalValue}>₫{formatPrice(totalPrice)}</Text>
        </View>
      </View>

      <View style={styles.stepActions}>
        <ModernButton
          variant="outline"
          size="large"
          onPress={() => setCurrentStep('payment')}
          icon="arrow-back"
          iconPosition="left"
          style={{ flex: 1, marginRight: MODERN_SPACING.sm }}
        >
          Quay lại
        </ModernButton>
        <ModernButton
          variant="primary"
          size="large"
          onPress={handlePlaceOrder}
          icon="checkmark-circle"
          iconPosition="right"
          style={{ flex: 1 }}
        >
          Đặt hàng
        </ModernButton>
      </View>
    </ScrollView>
  );

  const renderSuccessStep = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIconContainer}>
        <Ionicons name="checkmark-circle" size={100} color={MODERN_COLORS.primary} />
      </View>
      <Text style={styles.successTitle}>Đặt hàng thành công!</Text>
      <Text style={styles.successMessage}>
        Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất.
      </Text>
      <View style={styles.successInfo}>
        <View style={styles.successInfoRow}>
          <Text style={styles.successInfoLabel}>Mã đơn hàng:</Text>
          <Text style={styles.successInfoValue}>#DH{Date.now().toString().slice(-6)}</Text>
        </View>
        <View style={styles.successInfoRow}>
          <Text style={styles.successInfoLabel}>Tổng tiền:</Text>
          <Text style={styles.successInfoValue}>₫{formatPrice(totalPrice)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={MODERN_COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {currentStep === 'success' ? 'Hoàn tất' : 'Thanh toán'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress Bar */}
        {currentStep !== 'success' && renderProgressBar()}

        {/* Content */}
        {currentStep === 'address' && renderAddressStep()}
        {currentStep === 'payment' && renderPaymentStep()}
        {currentStep === 'review' && renderReviewStep()}
        {currentStep === 'success' && renderSuccessStep()}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MODERN_COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: MODERN_SPACING.md,
    paddingTop: 44,
    paddingBottom: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.divider,
  },
  backButton: { padding: MODERN_SPACING.xs },
  headerTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.lg,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.lg,
    backgroundColor: MODERN_COLORS.surface,
  },
  progressStep: { flex: 1, alignItems: 'center', position: 'relative' },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.background,
    borderWidth: 2,
    borderColor: MODERN_COLORS.divider,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: MODERN_SPACING.xs,
  },
  progressCircleActive: {
    backgroundColor: MODERN_COLORS.primary,
    borderColor: MODERN_COLORS.primary,
  },
  progressNumber: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.textSecondary,
  },
  progressNumberActive: { color: MODERN_COLORS.surface },
  progressLabel: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    color: MODERN_COLORS.textSecondary,
    marginTop: MODERN_SPACING.xxs,
  },
  progressLabelActive: {
    color: MODERN_COLORS.primary,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
  },
  progressLine: {
    position: 'absolute',
    top: 16,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: MODERN_COLORS.divider,
  },
  progressLineActive: { backgroundColor: MODERN_COLORS.primary },
  stepContent: { flex: 1, padding: MODERN_SPACING.md },
  stepTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xl,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.lg,
  },
  addressCard: {
    backgroundColor: MODERN_COLORS.surface,
    padding: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.lg,
    marginBottom: MODERN_SPACING.sm,
    borderWidth: 2,
    borderColor: MODERN_COLORS.divider,
  },
  addressCardActive: { borderColor: MODERN_COLORS.primary },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: MODERN_SPACING.sm,
  },
  addressNameRow: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: MODERN_SPACING.xs },
  addressName: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
  },
  defaultBadge: {
    backgroundColor: `${MODERN_COLORS.primary}20`,
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: 2,
    borderRadius: MODERN_RADIUS.sm,
  },
  defaultText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    color: MODERN_COLORS.primary,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: MODERN_RADIUS.full,
    borderWidth: 2,
    borderColor: MODERN_COLORS.divider,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonActive: { borderColor: MODERN_COLORS.primary },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.primary,
  },
  addressPhone: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
    marginBottom: MODERN_SPACING.xxs,
  },
  addressText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.text,
    lineHeight: MODERN_TYPOGRAPHY.lineHeight.relaxed,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: MODERN_SPACING.md,
    borderWidth: 1,
    borderColor: MODERN_COLORS.divider,
    borderRadius: MODERN_RADIUS.lg,
    borderStyle: 'dashed',
    marginBottom: MODERN_SPACING.lg,
    gap: MODERN_SPACING.sm,
  },
  addAddressText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.primary,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MODERN_COLORS.surface,
    padding: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.lg,
    marginBottom: MODERN_SPACING.sm,
    borderWidth: 2,
    borderColor: MODERN_COLORS.divider,
    gap: MODERN_SPACING.md,
  },
  paymentCardActive: { borderColor: MODERN_COLORS.primary },
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: `${MODERN_COLORS.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentInfo: { flex: 1 },
  paymentName: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.xxs,
  },
  paymentDescription: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
  },
  stepActions: {
    flexDirection: 'row',
    gap: MODERN_SPACING.sm,
    marginTop: MODERN_SPACING.lg,
    paddingBottom: MODERN_SPACING.xl,
  },
  reviewSection: { marginBottom: MODERN_SPACING.lg },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: MODERN_SPACING.sm,
  },
  reviewSectionTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
  },
  changeLink: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.primary,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
  },
  reviewCard: {
    backgroundColor: MODERN_COLORS.surface,
    padding: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.lg,
  },
  paymentReview: { flexDirection: 'row', alignItems: 'center', gap: MODERN_SPACING.sm },
  paymentReviewText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.text,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
  },
  orderItem: {
    flexDirection: 'row',
    backgroundColor: MODERN_COLORS.surface,
    padding: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.md,
    marginBottom: MODERN_SPACING.sm,
    gap: MODERN_SPACING.sm,
  },
  orderItemImage: {
    width: 60,
    height: 60,
    borderRadius: MODERN_RADIUS.sm,
    backgroundColor: MODERN_COLORS.background,
  },
  orderItemInfo: { flex: 1, justifyContent: 'space-between' },
  orderItemName: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
    color: MODERN_COLORS.text,
  },
  orderItemQty: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    color: MODERN_COLORS.textSecondary,
  },
  orderItemPrice: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.primary,
  },
  noteInput: {
    backgroundColor: MODERN_COLORS.surface,
    padding: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.lg,
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.text,
    borderWidth: 1,
    borderColor: MODERN_COLORS.divider,
    minHeight: 80,
  },
  orderSummary: {
    backgroundColor: MODERN_COLORS.surface,
    padding: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.lg,
    marginBottom: MODERN_SPACING.lg,
  },
  summaryTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: MODERN_SPACING.sm,
  },
  summaryLabel: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
    color: MODERN_COLORS.text,
  },
  freeShipping: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
    color: MODERN_COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: MODERN_COLORS.divider,
    marginVertical: MODERN_SPACING.sm,
  },
  totalLabel: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
  },
  totalValue: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xl,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.primary,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: MODERN_SPACING.xl,
  },
  successIconContainer: { marginBottom: MODERN_SPACING.lg },
  successTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xxl,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.sm,
  },
  successMessage: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: MODERN_TYPOGRAPHY.lineHeight.relaxed,
    marginBottom: MODERN_SPACING.xl,
  },
  successInfo: {
    backgroundColor: MODERN_COLORS.surface,
    padding: MODERN_SPACING.lg,
    borderRadius: MODERN_RADIUS.lg,
    width: '100%',
    ...MODERN_SHADOWS.sm,
  },
  successInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: MODERN_SPACING.sm,
  },
  successInfoLabel: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.textSecondary,
  },
  successInfoValue: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.text,
  },
});
