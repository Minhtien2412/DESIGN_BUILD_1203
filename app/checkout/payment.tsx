import { Container } from '@/components/ui/container';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type PaymentType = 'card' | 'bank' | 'wallet' | 'qr' | 'cod';

interface PaymentMethod {
  id: string;
  type: PaymentType;
  name: string;
  last4?: string;
  icon: string;
  color: string;
  badge?: string;
  logo?: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  isDefault: boolean;
}

export default function CheckoutPaymentScreen() {
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('momo');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>('addr-1');
  const [showAddressModal, setShowAddressModal] = useState(false);
  
  // Animation refs
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Mock addresses
  const addresses: Address[] = [
    {
      id: 'addr-1',
      name: 'Nguyễn Văn A',
      phone: '0912 345 678',
      address: '123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM',
      isDefault: true,
    },
    {
      id: 'addr-2',
      name: 'Nguyễn Văn A',
      phone: '0987 654 321',
      address: '456 Nguyễn Huệ, Phường 1, Quận 3, TP.HCM',
      isDefault: false,
    },
  ];

  // Enhanced payment methods with logos and colors
  const paymentMethods: PaymentMethod[] = [
    // E-Wallets
    { id: 'momo', type: 'wallet', name: 'MoMo', icon: 'wallet', color: '#A50064', badge: 'Giảm 50K', logo: '💜' },
    { id: 'zalopay', type: 'wallet', name: 'ZaloPay', icon: 'wallet', color: '#0068FF', badge: 'Hoàn 5%', logo: '💙' },
    { id: 'vnpay', type: 'wallet', name: 'VNPay QR', icon: 'qr-code', color: '#1A1F71', logo: '🔵' },
    { id: 'shopeepay', type: 'wallet', name: 'ShopeePay', icon: 'wallet', color: '#EE4D2D', badge: 'Xu x2', logo: '🧡' },
    { id: 'viettelpay', type: 'wallet', name: 'Viettel Money', icon: 'wallet', color: '#E50019', logo: '❤️' },
    // Cards
    { id: 'visa', type: 'card', name: 'Visa ****4242', last4: '4242', icon: 'card', color: '#1A1F71', logo: '💳' },
    { id: 'mastercard', type: 'card', name: 'Mastercard ****5678', last4: '5678', icon: 'card', color: '#EB001B', logo: '💳' },
    // Banks
    { id: 'vcb', type: 'bank', name: 'Vietcombank', last4: '1234', icon: 'business', color: '#00843D', logo: '🏦' },
    { id: 'tcb', type: 'bank', name: 'Techcombank', last4: '9876', icon: 'business', color: '#ED1C24', logo: '🏦' },
    // International
    { id: 'applepay', type: 'wallet', name: 'Apple Pay', icon: 'logo-apple', color: '#000000', logo: '🍎' },
    { id: 'googlepay', type: 'wallet', name: 'Google Pay', icon: 'logo-google', color: '#4285F4', logo: '🟢' },
    { id: 'samsungpay', type: 'wallet', name: 'Samsung Pay', icon: 'phone-portrait', color: '#1428A0', logo: '💠' },
    // COD
    { id: 'cod', type: 'cod', name: 'Thanh toán khi nhận hàng', icon: 'cash', color: '#10B981', logo: '💵' },
  ];

  const cartItems: CartItem[] = [
    { id: '1', name: 'Xi măng Hà Tiên PCB40', price: 95000, quantity: 50 },
    { id: '2', name: 'Gạch ống 2 lỗ', price: 1800, quantity: 1000 },
    { id: '3', name: 'Sắt phi 10', price: 280000, quantity: 20 },
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 150000;
  const promoDiscount = promoApplied ? 200000 : 0;
  const total = subtotal + shipping - promoDiscount;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' ₫';
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      shakeAnimation();
      return;
    }
    
    setPromoLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (promoCode.toUpperCase() === 'GIAM200K' || promoCode.toUpperCase() === 'SALE50') {
      setPromoApplied(true);
      Alert.alert('Thành công', 'Mã giảm giá đã được áp dụng!');
    } else {
      shakeAnimation();
      Alert.alert('Lỗi', 'Mã giảm giá không hợp lệ hoặc đã hết hạn');
    }
    setPromoLoading(false);
  };

  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handlePayment = async () => {
    const selectedPayment = paymentMethods.find(m => m.id === selectedMethod);
    
    // Show QR for VNPay
    if (selectedMethod === 'vnpay') {
      setShowQRModal(true);
      return;
    }

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert(
        '🎉 Thanh toán thành công',
        `Đơn hàng của bạn đã được xác nhận qua ${selectedPayment?.name}.\n\nMã đơn hàng: #ORD${Date.now().toString().slice(-6)}\n\nCảm ơn bạn đã mua hàng!`,
        [{ text: 'Về trang chủ', onPress: () => router.push('/(tabs)') }]
      );
    } catch {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi thanh toán. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = (type: 'card' | 'bank' | 'wallet') => {
    setShowAddPayment(false);
    if (type === 'card') {
      router.push('/profile/payment/add-card');
    } else if (type === 'bank') {
      router.push('/profile/payment/add-bank');
    } else {
      router.push('/profile/payment/add-wallet');
    }
  };

  const handleScanQR = () => {
    Alert.alert('Quét QR', 'Tính năng quét QR sẽ được mở...');
  };

  const currentAddress = addresses.find(a => a.id === selectedAddress);
  const selectedPayment = paymentMethods.find(m => m.id === selectedMethod);

  const groupedMethods = {
    wallets: paymentMethods.filter(m => m.type === 'wallet'),
    cards: paymentMethods.filter(m => m.type === 'card'),
    banks: paymentMethods.filter(m => m.type === 'bank'),
    cod: paymentMethods.filter(m => m.type === 'cod'),
  };

  return (
    <Container fullWidth>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thanh toán</Text>
          <TouchableOpacity onPress={handleScanQR} style={styles.scanButton}>
            <Ionicons name="qr-code-outline" size={22} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Delivery Address */}
          <TouchableOpacity 
            style={styles.addressSection}
            onPress={() => setShowAddressModal(true)}
          >
            <View style={styles.addressHeader}>
              <View style={styles.addressIcon}>
                <Ionicons name="location" size={20} color={Colors.light.primary} />
              </View>
              <Text style={styles.addressLabel}>Địa chỉ giao hàng</Text>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </View>
            {currentAddress && (
              <View style={styles.addressContent}>
                <View style={styles.addressInfo}>
                  <Text style={styles.addressName}>{currentAddress.name}</Text>
                  <View style={styles.phoneBadge}>
                    <Ionicons name="call" size={12} color="#64748B" />
                    <Text style={styles.addressPhone}>{currentAddress.phone}</Text>
                  </View>
                </View>
                <Text style={styles.addressText} numberOfLines={2}>{currentAddress.address}</Text>
                {currentAddress.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Mặc định</Text>
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>

          {/* Order Summary */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cart" size={18} color={Colors.light.primary} />
              <Text style={styles.sectionTitle}>Đơn hàng ({cartItems.length} sản phẩm)</Text>
            </View>
            {cartItems.map((item, index) => (
              <View key={item.id} style={[styles.orderItem, index === cartItems.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.itemImage}>
                  <Ionicons name="cube" size={20} color="#94A3B8" />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>SL: {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
              </View>
            ))}
          </View>

          {/* Promo Code */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="pricetag" size={18} color={Colors.light.primary} />
              <Text style={styles.sectionTitle}>Mã giảm giá</Text>
            </View>
            <Animated.View style={[styles.promoInputWrapper, { transform: [{ translateX: shakeAnim }] }]}>
              <TextInput
                style={[styles.promoInput, promoApplied && styles.promoInputSuccess]}
                placeholder="Nhập mã GIAM200K hoặc SALE50"
                placeholderTextColor="#94A3B8"
                value={promoCode}
                onChangeText={setPromoCode}
                editable={!promoApplied}
                autoCapitalize="characters"
              />
              {promoApplied ? (
                <View style={styles.promoSuccess}>
                  <Ionicons name="checkmark-circle" size={22} color="#10B981" />
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.promoButton} 
                  onPress={handleApplyPromo}
                  disabled={promoLoading}
                >
                  {promoLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.promoButtonText}>Áp dụng</Text>
                  )}
                </TouchableOpacity>
              )}
            </Animated.View>
            {promoApplied && (
              <View style={styles.promoAppliedBadge}>
                <Ionicons name="gift" size={16} color="#10B981" />
                <Text style={styles.promoAppliedText}>Giảm {formatCurrency(promoDiscount)}</Text>
                <TouchableOpacity onPress={() => { setPromoApplied(false); setPromoCode(''); }}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Payment Methods */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="wallet" size={18} color={Colors.light.primary} />
              <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
            </View>

            {/* E-Wallets */}
            <Text style={styles.methodGroupTitle}>Ví điện tử</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.walletScroll}>
              {groupedMethods.wallets.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.walletCard,
                    selectedMethod === method.id && styles.walletCardActive,
                    { borderColor: selectedMethod === method.id ? method.color : '#e5e5e5' },
                  ]}
                  onPress={() => setSelectedMethod(method.id)}
                >
                  <View style={[styles.walletLogo, { backgroundColor: `${method.color}15` }]}>
                    <Text style={styles.walletEmoji}>{method.logo}</Text>
                  </View>
                  <Text style={[
                    styles.walletName,
                    selectedMethod === method.id && { color: method.color, fontWeight: '600' }
                  ]} numberOfLines={1}>
                    {method.name}
                  </Text>
                  {method.badge && (
                    <View style={[styles.methodBadge, { backgroundColor: method.color }]}>
                      <Text style={styles.methodBadgeText}>{method.badge}</Text>
                    </View>
                  )}
                  {selectedMethod === method.id && (
                    <View style={[styles.walletCheck, { backgroundColor: method.color }]}>
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Cards & Banks */}
            <Text style={styles.methodGroupTitle}>Thẻ & Ngân hàng</Text>
            {[...groupedMethods.cards, ...groupedMethods.banks].map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodCard,
                  selectedMethod === method.id && styles.methodCardActive,
                  selectedMethod === method.id && { borderColor: method.color },
                ]}
                onPress={() => setSelectedMethod(method.id)}
              >
                <View style={[styles.methodIcon, { backgroundColor: `${method.color}15` }]}>
                  <Text style={styles.methodEmoji}>{method.logo}</Text>
                </View>
                <View style={styles.methodInfo}>
                  <Text style={[
                    styles.methodName,
                    selectedMethod === method.id && { color: method.color },
                  ]}>
                    {method.name}
                  </Text>
                  {method.last4 && (
                    <Text style={styles.methodDetail}>****{method.last4}</Text>
                  )}
                </View>
                <View style={[
                  styles.radioButton,
                  selectedMethod === method.id && { borderColor: method.color },
                ]}>
                  {selectedMethod === method.id && (
                    <View style={[styles.radioInner, { backgroundColor: method.color }]} />
                  )}
                </View>
              </TouchableOpacity>
            ))}

            {/* COD */}
            <Text style={styles.methodGroupTitle}>Khác</Text>
            {groupedMethods.cod.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodCard,
                  selectedMethod === method.id && styles.methodCardActive,
                  selectedMethod === method.id && { borderColor: method.color },
                ]}
                onPress={() => setSelectedMethod(method.id)}
              >
                <View style={[styles.methodIcon, { backgroundColor: `${method.color}15` }]}>
                  <Ionicons name="cash" size={22} color={method.color} />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={[
                    styles.methodName,
                    selectedMethod === method.id && { color: method.color },
                  ]}>
                    {method.name}
                  </Text>
                  <Text style={styles.methodDetail}>Thanh toán khi nhận hàng</Text>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedMethod === method.id && { borderColor: method.color },
                ]}>
                  {selectedMethod === method.id && (
                    <View style={[styles.radioInner, { backgroundColor: method.color }]} />
                  )}
                </View>
              </TouchableOpacity>
            ))}

            {/* Add Payment Method */}
            <TouchableOpacity 
              style={styles.addMethod}
              onPress={() => setShowAddPayment(true)}
            >
              <View style={styles.addMethodIcon}>
                <Ionicons name="add" size={20} color={Colors.light.primary} />
              </View>
              <Text style={styles.addMethodText}>Thêm phương thức thanh toán</Text>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Price Breakdown */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="receipt" size={18} color={Colors.light.primary} />
              <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tạm tính</Text>
              <Text style={styles.priceValue}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Phí vận chuyển</Text>
              <Text style={styles.priceValue}>{formatCurrency(shipping)}</Text>
            </View>
            {promoApplied && (
              <View style={styles.priceRow}>
                <View style={styles.discountLabel}>
                  <Ionicons name="pricetag" size={14} color="#10B981" />
                  <Text style={[styles.priceLabel, { color: '#10B981' }]}>Giảm giá</Text>
                </View>
                <Text style={[styles.priceValue, { color: '#10B981' }]}>-{formatCurrency(promoDiscount)}</Text>
              </View>
            )}
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            </View>
          </View>

          {/* Security Info */}
          <View style={styles.securityInfo}>
            <View style={styles.securityBadges}>
              <View style={styles.securityBadge}>
                <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                <Text style={styles.securityBadgeText}>SSL 256-bit</Text>
              </View>
              <View style={styles.securityBadge}>
                <Ionicons name="lock-closed" size={16} color="#10B981" />
                <Text style={styles.securityBadgeText}>PCI DSS</Text>
              </View>
              <View style={styles.securityBadge}>
                <Ionicons name="finger-print" size={16} color="#10B981" />
                <Text style={styles.securityBadgeText}>3D Secure</Text>
              </View>
            </View>
            <Text style={styles.securityText}>
              Thanh toán an toàn và bảo mật. Thông tin của bạn được mã hóa hoàn toàn.
            </Text>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Bottom Payment Button */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomInfo}>
            <View style={styles.selectedPayment}>
              {selectedPayment && (
                <>
                  <Text style={styles.selectedPaymentEmoji}>{selectedPayment.logo}</Text>
                  <Text style={styles.selectedPaymentName} numberOfLines={1}>{selectedPayment.name}</Text>
                </>
              )}
            </View>
            <View style={styles.bottomTotal}>
              <Text style={styles.bottomLabel}>Tổng thanh toán</Text>
              <Text style={styles.bottomValue}>{formatCurrency(total)}</Text>
            </View>
          </View>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[styles.payButton, loading && styles.payButtonDisabled]}
              onPress={handlePayment}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="lock-closed" size={18} color="#fff" />
                  <Text style={styles.payButtonText}>Thanh toán ngay</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Add Payment Method Modal */}
        <Modal
          visible={showAddPayment}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAddPayment(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowAddPayment(false)}>
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Thêm phương thức thanh toán</Text>
              
              <TouchableOpacity style={styles.modalOption} onPress={() => handleAddPaymentMethod('card')}>
                <View style={[styles.modalOptionIcon, { backgroundColor: '#EEF2FF' }]}>
                  <Ionicons name="card" size={24} color="#4F46E5" />
                </View>
                <View style={styles.modalOptionInfo}>
                  <Text style={styles.modalOptionTitle}>Thẻ tín dụng / Ghi nợ</Text>
                  <Text style={styles.modalOptionDesc}>Visa, Mastercard, JCB, Amex</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalOption} onPress={() => handleAddPaymentMethod('bank')}>
                <View style={[styles.modalOptionIcon, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="business" size={24} color="#10B981" />
                </View>
                <View style={styles.modalOptionInfo}>
                  <Text style={styles.modalOptionTitle}>Liên kết ngân hàng</Text>
                  <Text style={styles.modalOptionDesc}>Vietcombank, TCB, ACB, BIDV...</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalOption} onPress={() => handleAddPaymentMethod('wallet')}>
                <View style={[styles.modalOptionIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="wallet" size={24} color="#F59E0B" />
                </View>
                <View style={styles.modalOptionInfo}>
                  <Text style={styles.modalOptionTitle}>Ví điện tử</Text>
                  <Text style={styles.modalOptionDesc}>MoMo, ZaloPay, VNPay, ShopeePay</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowAddPayment(false)}>
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

        {/* QR Payment Modal */}
        <Modal
          visible={showQRModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowQRModal(false)}
        >
          <View style={styles.qrModalOverlay}>
            <View style={styles.qrModalContent}>
              <TouchableOpacity style={styles.qrCloseBtn} onPress={() => setShowQRModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.qrTitle}>Quét mã QR để thanh toán</Text>
              <View style={styles.qrContainer}>
                <View style={styles.qrPlaceholder}>
                  <Ionicons name="qr-code" size={120} color={Colors.light.primary} />
                </View>
              </View>
              <Text style={styles.qrAmount}>{formatCurrency(total)}</Text>
              <Text style={styles.qrHint}>Mở ứng dụng ngân hàng hoặc ví điện tử và quét mã QR</Text>
              <View style={styles.qrExpiry}>
                <Ionicons name="time" size={16} color="#F59E0B" />
                <Text style={styles.qrExpiryText}>Mã có hiệu lực trong 5 phút</Text>
              </View>
            </View>
          </View>
        </Modal>

        {/* Address Selection Modal */}
        <Modal
          visible={showAddressModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAddressModal(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowAddressModal(false)}>
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Chọn địa chỉ giao hàng</Text>
              
              {addresses.map((addr) => (
                <TouchableOpacity 
                  key={addr.id} 
                  style={[
                    styles.addressOption,
                    selectedAddress === addr.id && styles.addressOptionActive
                  ]}
                  onPress={() => {
                    setSelectedAddress(addr.id);
                    setShowAddressModal(false);
                  }}
                >
                  <View style={styles.addressOptionRadio}>
                    <View style={[
                      styles.radioButton,
                      selectedAddress === addr.id && styles.radioButtonActive
                    ]}>
                      {selectedAddress === addr.id && <View style={styles.radioInner} />}
                    </View>
                  </View>
                  <View style={styles.addressOptionContent}>
                    <View style={styles.addressOptionHeader}>
                      <Text style={styles.addressOptionName}>{addr.name}</Text>
                      {addr.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultText}>Mặc định</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.addressOptionPhone}>{addr.phone}</Text>
                    <Text style={styles.addressOptionText} numberOfLines={2}>{addr.address}</Text>
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity 
                style={styles.addAddressBtn}
                onPress={() => {
                  setShowAddressModal(false);
                  router.push('/profile/addresses/new');
                }}
              >
                <Ionicons name="add-circle" size={22} color={Colors.light.primary} />
                <Text style={styles.addAddressBtnText}>Thêm địa chỉ mới</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
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
  scanButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  // Address Section
  addressSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: `${Colors.light.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  addressLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  addressContent: {
    marginLeft: 42,
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  addressName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginRight: 10,
  },
  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressPhone: {
    fontSize: 13,
    color: '#64748B',
  },
  addressText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
  },
  defaultBadge: {
    backgroundColor: `${Colors.light.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  defaultText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  // Sections
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  // Order Items
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  itemImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#94A3B8',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  // Promo
  promoInputWrapper: {
    flexDirection: 'row',
    gap: 10,
  },
  promoInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  promoInputSuccess: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  promoButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  promoSuccess: {
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoAppliedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
  },
  promoAppliedText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  // Payment Methods
  methodGroupTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 12,
    marginBottom: 10,
  },
  walletScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  walletCard: {
    width: 90,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
  },
  walletCardActive: {
    backgroundColor: '#f8fafc',
  },
  walletLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  walletEmoji: {
    fontSize: 20,
  },
  walletName: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  walletCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  methodBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    marginBottom: 10,
    gap: 12,
  },
  methodCardActive: {
    backgroundColor: '#f8fafc',
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodEmoji: {
    fontSize: 22,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  methodDetail: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonActive: {
    borderColor: Colors.light.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.primary,
  },
  addMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e5e5e5',
    marginTop: 4,
    gap: 12,
  },
  addMethodIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: `${Colors.light.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMethodText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  // Price
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  discountLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  // Security
  securityInfo: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  securityBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 16,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  securityBadgeText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  securityText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  // Bottom Bar
  bottomBar: {
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  bottomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedPayment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  selectedPaymentEmoji: {
    fontSize: 20,
  },
  selectedPaymentName: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
  },
  bottomTotal: {
    alignItems: 'flex-end',
  },
  bottomLabel: {
    fontSize: 12,
    color: '#666',
  },
  bottomValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    marginBottom: 12,
    gap: 14,
  },
  modalOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOptionInfo: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  modalOptionDesc: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  modalCancel: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  // Address Options
  addressOption: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    marginBottom: 12,
  },
  addressOptionActive: {
    borderColor: Colors.light.primary,
    backgroundColor: `${Colors.light.primary}05`,
  },
  addressOptionRadio: {
    marginRight: 12,
    paddingTop: 2,
  },
  addressOptionContent: {
    flex: 1,
  },
  addressOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  addressOptionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  addressOptionPhone: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  addressOptionText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
  },
  addAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.light.primary,
    marginTop: 4,
    gap: 8,
  },
  addAddressBtnText: {
    fontSize: 15,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  // QR Modal
  qrModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  qrModalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  qrCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    marginTop: 10,
  },
  qrContainer: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  qrPlaceholder: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 8,
  },
  qrHint: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  qrExpiry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  qrExpiryText: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '500',
  },
});
