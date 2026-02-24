import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  restaurantName: string;
  restaurantImage: string;
  items: OrderItem[];
  totalPrice: number;
  deliveryFee: number;
  status: 'preparing' | 'ready' | 'picked-up' | 'delivering' | 'delivered';
  estimatedTime: string;
  deliveryAddress: string;
  driverName?: string;
  driverPhone?: string;
  driverImage?: string;
  driverRating?: number;
}

const MOCK_ORDER: Order = {
  id: 'ORD12345',
  restaurantName: 'Phở Hà Nội',
  restaurantImage: 'https://picsum.photos/100/100?random=1',
  items: [
    { id: '1', name: 'Phở Bò Tái', quantity: 2, price: 65000 },
    { id: '2', name: 'Nem Rán', quantity: 1, price: 40000 },
    { id: '3', name: 'Trà Đá', quantity: 2, price: 10000 },
  ],
  totalPrice: 190000,
  deliveryFee: 15000,
  status: 'preparing',
  estimatedTime: '25 phút',
  deliveryAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
  driverName: 'Nguyễn Văn A',
  driverPhone: '0901234567',
  driverImage: 'https://i.pravatar.cc/150?img=12',
  driverRating: 4.9,
};

export default function OrderTrackingScreen() {
  const [order, setOrder] = useState<Order>(MOCK_ORDER);
  const [currentStep, setCurrentStep] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const driverPinAnim = useRef(new Animated.Value(0)).current;

  const steps = [
    { key: 'preparing', label: 'Đang chuẩn bị', icon: 'restaurant' },
    { key: 'ready', label: 'Sẵn sàng', icon: 'checkmark-circle' },
    { key: 'picked-up', label: 'Đã lấy hàng', icon: 'bicycle' },
    { key: 'delivering', label: 'Đang giao', icon: 'location' },
    { key: 'delivered', label: 'Đã giao', icon: 'checkmark-done-circle' },
  ];

  useEffect(() => {
    // Simulate order status progression
    const statusSequence = [
      { status: 'preparing', delay: 0 },
      { status: 'ready', delay: 3000 },
      { status: 'picked-up', delay: 6000 },
      { status: 'delivering', delay: 9000 },
      { status: 'delivered', delay: 12000 },
    ];

    statusSequence.forEach(({ status, delay }) => {
      setTimeout(() => {
        setOrder((prev) => ({ ...prev, status: status as Order['status'] }));
        const stepIndex = steps.findIndex((s) => s.key === status);
        setCurrentStep(stepIndex);
        animateProgress(stepIndex);
      }, delay);
    });

    // Pulse animation for active step
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Driver pin bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(driverPinAnim, {
          toValue: -10,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(driverPinAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const animateProgress = (step: number) => {
    Animated.timing(progressAnim, {
      toValue: step,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const handleCallDriver = () => {
    Alert.alert('Gọi tài xế', `Số điện thoại: ${order.driverPhone}`);
  };

  const handleChatDriver = () => {
    router.push('/messages');
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Hủy đơn hàng',
      'Bạn có chắc muốn hủy đơn hàng này?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy đơn',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Đã hủy', 'Đơn hàng đã được hủy thành công');
            router.back();
          },
        },
      ]
    );
  };

  const handleRateOrder = () => {
    Alert.alert(
      'Đánh giá đơn hàng',
      'Cảm ơn bạn đã sử dụng dịch vụ!',
      [
        {
          text: 'Đánh giá ngay',
          onPress: () => {
            // Navigate to rating screen - using component directly
            Alert.alert('Thành công', 'Cảm ơn đánh giá của bạn!');
          },
        },
        { text: 'Để sau' },
      ]
    );
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, steps.length - 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Theo dõi đơn hàng</Text>
        <TouchableOpacity>
          <Ionicons name="help-circle-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Map Placeholder */}
        <View style={styles.mapPlaceholder}>
          <View style={styles.mapOverlay}>
            <Ionicons name="map" size={60} color="#00B14F" />
            <Text style={styles.mapText}>Bản đồ theo dõi</Text>
            <Text style={styles.mapSubtext}>Vị trí thời gian thực</Text>
          </View>
          
          {/* Driver Pin Animation */}
          {order.status === 'delivering' && (
            <Animated.View
              style={[
                styles.driverPin,
                { transform: [{ translateY: driverPinAnim }] },
              ]}
            >
              <Ionicons name="bicycle" size={30} color="#00B14F" />
            </Animated.View>
          )}
        </View>

        {/* Order Status Timeline */}
        <View style={styles.timelineContainer}>
          <Text style={styles.sectionTitle}>Trạng thái đơn hàng</Text>
          <View style={styles.timeline}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[styles.progressFill, { width: progressWidth }]}
              />
            </View>
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              const isFuture = index > currentStep;

              return (
                <View key={step.key} style={styles.timelineStep}>
                  <Animated.View
                    style={[
                      styles.stepDot,
                      isCompleted && styles.stepDotCompleted,
                      isActive && styles.stepDotActive,
                      isActive && {
                        transform: [{ scale: pulseAnim }],
                      },
                    ]}
                  >
                    <Ionicons
                      name={step.icon as any}
                      size={20}
                      color={isFuture ? '#ccc' : '#fff'}
                    />
                  </Animated.View>
                  <Text
                    style={[
                      styles.stepLabel,
                      (isActive || isCompleted) && styles.stepLabelActive,
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Driver Info */}
        {(order.status === 'picked-up' || order.status === 'delivering') && (
          <View style={styles.driverCard}>
            <Image
              source={{ uri: order.driverImage }}
              style={styles.driverAvatar}
            />
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{order.driverName}</Text>
              <View style={styles.driverRating}>
                <Ionicons name="star" size={14} color="#0D9488" />
                <Text style={styles.ratingText}>{order.driverRating}</Text>
              </View>
            </View>
            <View style={styles.driverActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleCallDriver}
              >
                <Ionicons name="call" size={20} color="#00B14F" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleChatDriver}
              >
                <Ionicons name="chatbubble" size={20} color="#00B14F" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Restaurant Info */}
        <View style={styles.restaurantCard}>
          <Image
            source={{ uri: order.restaurantImage }}
            style={styles.restaurantImage}
          />
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>{order.restaurantName}</Text>
            <Text style={styles.orderId}>Mã đơn: {order.id}</Text>
            <View style={styles.etaContainer}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.etaText}>
                Thời gian dự kiến: {order.estimatedTime}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.orderItems}>
          <Text style={styles.sectionTitle}>Chi tiết đơn hàng</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Text style={styles.itemQuantity}>{item.quantity}x</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>
                {(item.price * item.quantity).toLocaleString('vi-VN')}đ
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tạm tính</Text>
            <Text style={styles.priceValue}>
              {order.totalPrice.toLocaleString('vi-VN')}đ
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Phí giao hàng</Text>
            <Text style={styles.priceValue}>
              {order.deliveryFee.toLocaleString('vi-VN')}đ
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>
              {(order.totalPrice + order.deliveryFee).toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <Ionicons name="location" size={24} color="#00B14F" />
            <Text style={styles.addressTitle}>Địa chỉ giao hàng</Text>
          </View>
          <Text style={styles.addressText}>{order.deliveryAddress}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {order.status !== 'delivered' ? (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelOrder}
            >
              <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.rateButton}
              onPress={handleRateOrder}
            >
              <Ionicons name="star" size={20} color="#fff" />
              <Text style={styles.rateButtonText}>Đánh giá</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  mapPlaceholder: {
    height: 250,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapOverlay: {
    alignItems: 'center',
  },
  mapText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00B14F',
    marginTop: 8,
  },
  mapSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  driverPin: {
    position: 'absolute',
    top: 100,
    left: '50%',
    marginLeft: -15,
    backgroundColor: '#fff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  timelineContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  timeline: {
    position: 'relative',
  },
  progressBar: {
    position: 'absolute',
    top: 24,
    left: 24,
    right: 24,
    height: 2,
    backgroundColor: '#e0e0e0',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00B14F',
  },
  timelineStep: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepDotCompleted: {
    backgroundColor: '#00B14F',
  },
  stepDotActive: {
    backgroundColor: '#00B14F',
    shadowColor: '#00B14F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  stepLabel: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#00B14F',
    fontWeight: '600',
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  driverInfo: {
    flex: 1,
    marginLeft: 12,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  driverActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  restaurantCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  restaurantImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  restaurantInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  etaText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  orderItems: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    width: 40,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    color: '#333',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00B14F',
  },
  addressCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionButtons: {
    padding: 16,
    marginTop: 8,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0D9488',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D9488',
  },
  rateButton: {
    backgroundColor: '#00B14F',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  rateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
});
