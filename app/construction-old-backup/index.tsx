import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
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

const { width, height } = Dimensions.get('window');

interface Location {
  address: string;
  coordinates: { lat: number; lng: number };
}

interface VehicleType {
  id: string;
  name: string;
  icon: string;
  capacity: string;
  pricePerKm: number;
  eta: string;
  image: any;
}

const VEHICLE_TYPES: VehicleType[] = [
  {
    id: 'bike',
    name: 'GrabBike',
    icon: 'bicycle',
    capacity: '1 người',
    pricePerKm: 5000,
    eta: '2 phút',
    image: require('@/assets/images/react-logo.png')
  },
  {
    id: 'car',
    name: 'GrabCar',
    icon: 'car',
    capacity: '4 người',
    pricePerKm: 12000,
    eta: '3 phút',
    image: require('@/assets/images/react-logo.png')
  },
  {
    id: 'car-plus',
    name: 'GrabCar Plus',
    icon: 'car-sport',
    capacity: '4 người',
    pricePerKm: 15000,
    eta: '5 phút',
    image: require('@/assets/images/react-logo.png')
  },
  {
    id: 'suv',
    name: 'GrabCar 7',
    icon: 'bus',
    capacity: '7 người',
    pricePerKm: 18000,
    eta: '7 phút',
    image: require('@/assets/images/react-logo.png')
  }
];

export default function RideBookingScreen() {
  const [pickup, setPickup] = useState<Location>({
    address: '',
    coordinates: { lat: 10.762622, lng: 106.660172 }
  });
  const [dropoff, setDropoff] = useState<Location>({
    address: '',
    coordinates: { lat: 0, lng: 0 }
  });
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>(VEHICLE_TYPES[0]);
  const [distance, setDistance] = useState(5.2); // km
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const slideAnim = React.useRef(new Animated.Value(height)).current;

  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8
    }).start();
  }, []);

  const calculatePrice = () => {
    const basePrice = selectedVehicle.pricePerKm * distance;
    const discount = promoApplied ? basePrice * 0.15 : 0;
    return {
      base: Math.round(basePrice),
      discount: Math.round(discount),
      total: Math.round(basePrice - discount)
    };
  };

  const price = calculatePrice();

  const handleBookRide = () => {
    if (!pickup.address || !dropoff.address) {
      Alert.alert('Thông báo', 'Vui lòng nhập điểm đón và điểm trả');
      return;
    }

    Alert.alert(
      'Xác nhận đặt xe',
      `Xe ${selectedVehicle.name}\nGiá: ${price.total.toLocaleString('vi-VN')}đ\nThời gian tới: ${selectedVehicle.eta}`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đặt xe',
          onPress: () => {
            router.push('/ride/tracking');
          }
        }
      ]
    );
  };

  const applyPromo = () => {
    if (promoCode.toLowerCase() === 'grab15') {
      setPromoApplied(true);
      Alert.alert('Thành công', 'Đã áp dụng mã giảm 15%');
    } else {
      Alert.alert('Lỗi', 'Mã khuyến mãi không hợp lệ');
    }
  };

  return (
    <View style={styles.container}>
      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="location" size={100} color="#0891B2" />
          <Text style={styles.mapText}>Bản đồ sẽ hiển thị ở đây</Text>
          <Text style={styles.mapSubtext}>Tích hợp Google Maps/Mapbox</Text>
        </View>

        {/* Current Location Button */}
        <TouchableOpacity style={styles.currentLocationBtn} activeOpacity={0.7}>
          <Ionicons name="locate" size={24} color="#0891B2" />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      <Animated.View 
        style={[
          styles.bottomSheet,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.handle} />

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Location Inputs */}
          <View style={styles.locationSection}>
            <View style={styles.locationDots}>
              <View style={styles.pickupDot} />
              <View style={styles.routeLine} />
              <View style={styles.dropoffDot} />
            </View>

            <View style={styles.locationInputs}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Điểm đón"
                  placeholderTextColor="#9CA3AF"
                  value={pickup.address}
                  onChangeText={(text) => setPickup({ ...pickup, address: text })}
                />
                {pickup.address ? (
                  <TouchableOpacity onPress={() => setPickup({ ...pickup, address: '' })}>
                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                ) : null}
              </View>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Điểm đến"
                  placeholderTextColor="#9CA3AF"
                  value={dropoff.address}
                  onChangeText={(text) => setDropoff({ ...dropoff, address: text })}
                />
                {dropoff.address ? (
                  <TouchableOpacity onPress={() => setDropoff({ ...dropoff, address: '' })}>
                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>

          {/* Vehicle Types */}
          <View style={styles.vehicleSection}>
            <Text style={styles.sectionTitle}>Chọn loại xe</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.vehicleList}
            >
              {VEHICLE_TYPES.map((vehicle) => (
                <TouchableOpacity
                  key={vehicle.id}
                  style={[
                    styles.vehicleCard,
                    selectedVehicle.id === vehicle.id && styles.vehicleCardSelected
                  ]}
                  onPress={() => setSelectedVehicle(vehicle)}
                  activeOpacity={0.7}
                >
                  <View style={styles.vehicleIconContainer}>
                    <Ionicons 
                      name={vehicle.icon as any} 
                      size={32} 
                      color={selectedVehicle.id === vehicle.id ? '#0891B2' : '#6B7280'} 
                    />
                  </View>
                  <Text style={[
                    styles.vehicleName,
                    selectedVehicle.id === vehicle.id && styles.vehicleNameSelected
                  ]}>
                    {vehicle.name}
                  </Text>
                  <Text style={styles.vehicleCapacity}>{vehicle.capacity}</Text>
                  <View style={styles.vehiclePrice}>
                    <Text style={[
                      styles.vehiclePriceText,
                      selectedVehicle.id === vehicle.id && styles.vehiclePriceSelected
                    ]}>
                      {(vehicle.pricePerKm * distance).toLocaleString('vi-VN')}đ
                    </Text>
                  </View>
                  <View style={styles.vehicleEta}>
                    <Ionicons name="time-outline" size={12} color="#6B7280" />
                    <Text style={styles.vehicleEtaText}>{vehicle.eta}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Promo Code */}
          <View style={styles.promoSection}>
            <View style={styles.promoHeader}>
              <Ionicons name="pricetag" size={20} color="#F59E0B" />
              <Text style={styles.promoTitle}>Mã khuyến mãi</Text>
            </View>
            <View style={styles.promoInputWrapper}>
              <TextInput
                style={styles.promoInput}
                placeholder="Nhập mã (VD: GRAB15)"
                placeholderTextColor="#9CA3AF"
                value={promoCode}
                onChangeText={setPromoCode}
                autoCapitalize="characters"
                editable={!promoApplied}
              />
              {promoApplied ? (
                <View style={styles.promoAppliedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.promoAppliedText}>Đã áp dụng</Text>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.promoApplyBtn}
                  onPress={applyPromo}
                  activeOpacity={0.7}
                >
                  <Text style={styles.promoApplyText}>Áp dụng</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Price Breakdown */}
          <TouchableOpacity 
            style={styles.priceSection}
            onPress={() => setShowPriceBreakdown(!showPriceBreakdown)}
            activeOpacity={0.7}
          >
            <View style={styles.priceHeader}>
              <Text style={styles.priceLabel}>Chi tiết giá</Text>
              <Ionicons 
                name={showPriceBreakdown ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#6B7280" 
              />
            </View>
            {showPriceBreakdown && (
              <View style={styles.priceBreakdown}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceItem}>Giá cơ bản ({distance}km)</Text>
                  <Text style={styles.priceValue}>{price.base.toLocaleString('vi-VN')}đ</Text>
                </View>
                {promoApplied && (
                  <View style={styles.priceRow}>
                    <Text style={[styles.priceItem, { color: '#10B981' }]}>Giảm giá (15%)</Text>
                    <Text style={[styles.priceValue, { color: '#10B981' }]}>
                      -{price.discount.toLocaleString('vi-VN')}đ
                    </Text>
                  </View>
                )}
                <View style={styles.priceDivider} />
              </View>
            )}
            <View style={styles.priceTotalRow}>
              <Text style={styles.priceTotalLabel}>Tổng cộng</Text>
              <Text style={styles.priceTotalValue}>
                {price.total.toLocaleString('vi-VN')}đ
              </Text>
            </View>
          </TouchableOpacity>

          {/* Payment Method */}
          <TouchableOpacity style={styles.paymentSection} activeOpacity={0.7}>
            <Ionicons name="wallet-outline" size={24} color="#6B7280" />
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentLabel}>Phương thức thanh toán</Text>
              <Text style={styles.paymentMethod}>Tiền mặt</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Book Button */}
          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBookRide}
            activeOpacity={0.8}
          >
            <Text style={styles.bookButtonText}>Đặt xe ngay</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  mapText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  mapSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  currentLocationBtn: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    maxHeight: height * 0.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  locationSection: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  locationDots: {
    alignItems: 'center',
    marginRight: 12,
    paddingTop: 20,
  },
  pickupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0891B2',
  },
  routeLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#D1D5DB',
    marginVertical: 4,
  },
  dropoffDot: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#EF4444',
  },
  locationInputs: {
    flex: 1,
    gap: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  vehicleSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  vehicleList: {
    gap: 12,
  },
  vehicleCard: {
    width: 120,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  vehicleCardSelected: {
    borderColor: '#0891B2',
    backgroundColor: '#ECFEFF',
  },
  vehicleIconContainer: {
    marginBottom: 8,
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 2,
  },
  vehicleNameSelected: {
    color: '#0891B2',
  },
  vehicleCapacity: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  vehiclePrice: {
    marginBottom: 4,
  },
  vehiclePriceText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  vehiclePriceSelected: {
    color: '#0891B2',
  },
  vehicleEta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vehicleEtaText: {
    fontSize: 11,
    color: '#6B7280',
  },
  promoSection: {
    marginBottom: 24,
  },
  promoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  promoTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  promoInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  promoInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  promoApplyBtn: {
    paddingHorizontal: 20,
    height: 48,
    backgroundColor: '#0891B2',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoApplyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  promoAppliedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
  },
  promoAppliedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  priceSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  priceBreakdown: {
    marginTop: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceItem: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  priceTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  priceTotalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
  },
  priceTotalValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0891B2',
  },
  paymentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  paymentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  paymentLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  paymentMethod: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0891B2',
    borderRadius: 16,
    height: 56,
    gap: 8,
    shadowColor: '#0891B2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});
