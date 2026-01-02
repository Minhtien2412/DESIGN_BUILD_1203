import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

// Mock service data structure
const SERVICES_DATA: Record<string, any> = {
  'house-design': {
    id: 'house-design',
    name: 'Thiết kế Nhà Phố',
    category: 'Thiết kế',
    rating: 4.8,
    reviewCount: 156,
    description: 'Dịch vụ thiết kế nhà phố chuyên nghiệp với đội ngũ kiến trúc sư giàu kinh nghiệm, cam kết mang đến không gian sống hoàn hảo cho gia đình bạn.',
    images: [
      require('@/assets/images/react-logo.webp'),
      require('@/assets/images/react-logo.webp'),
      require('@/assets/images/react-logo.webp'),
    ],
    features: [
      { icon: 'cube-outline', text: 'Bản vẽ 3D chân thực' },
      { icon: 'document-text-outline', text: 'Bản vẽ thi công chi tiết' },
      { icon: 'shield-checkmark-outline', text: 'Hỗ trợ xin phép' },
      { icon: 'people-outline', text: 'Tư vấn 1-1' },
      { icon: 'refresh-outline', text: 'Miễn phí chỉnh sửa' },
      { icon: 'time-outline', text: 'Đúng tiến độ cam kết' },
    ],
    pricing: [
      {
        id: 1,
        name: 'Gói Cơ Bản',
        price: '300.000đ/m²',
        duration: '30 ngày',
        features: [
          'Bản vẽ 2D (mặt bằng, mặt đứng)',
          'Bản vẽ 3D cơ bản (2 góc nhìn)',
          '1 lần chỉnh sửa miễn phí',
        ],
        recommended: false,
      },
      {
        id: 2,
        name: 'Gói Tiêu Chuẩn',
        price: '500.000đ/m²',
        duration: '45 ngày',
        features: [
          'Tất cả dịch vụ gói Cơ Bản',
          'Bản vẽ 3D chi tiết (4 góc nhìn)',
          'Bản vẽ thi công cơ điện nước',
          '2 lần chỉnh sửa miễn phí',
          'Tư vấn phong thủy cơ bản',
        ],
        recommended: true,
      },
      {
        id: 3,
        name: 'Gói Cao Cấp',
        price: '800.000đ/m²',
        duration: '60 ngày',
        features: [
          'Tất cả dịch vụ gói Tiêu Chuẩn',
          'Chỉnh sửa không giới hạn',
          'Hỗ trợ xin giấy phép xây dựng',
          'Video 3D walkthrough',
          'Thiết kế cảnh quan sân vườn',
        ],
        recommended: false,
      },
    ],
    reviews: [
      {
        id: 1,
        userName: 'Nguyễn Văn A',
        rating: 5,
        comment: 'Dịch vụ tuyệt vời! Thiết kế đẹp, tư vấn nhiệt tình, đúng tiến độ.',
        date: '15/11/2024',
        avatar: '👤',
      },
      {
        id: 2,
        userName: 'Trần Thị B',
        rating: 5,
        comment: 'Rất hài lòng với bản vẽ 3D. Đội ngũ chuyên nghiệp và tận tâm.',
        date: '08/11/2024',
        avatar: '👤',
      },
      {
        id: 3,
        userName: 'Lê Văn C',
        rating: 4,
        comment: 'Thiết kế đẹp, giá cả hợp lý. Tuy nhiên chỉnh sửa hơi lâu.',
        date: '02/11/2024',
        avatar: '👤',
      },
    ],
  },
  'interior-design': {
    id: 'interior-design',
    name: 'Thiết kế Nội Thất',
    category: 'Nội thất',
    rating: 4.9,
    reviewCount: 234,
    description: 'Thiết kế nội thất theo phong cách cá nhân hóa, tối ưu không gian và công năng sử dụng.',
    images: [
      require('@/assets/images/react-logo.webp'),
      require('@/assets/images/react-logo.webp'),
      require('@/assets/images/react-logo.webp'),
    ],
    features: [
      { icon: 'color-palette-outline', text: 'Phối màu chuyên nghiệp' },
      { icon: 'cube-outline', text: 'Bản vẽ 3D chi tiết' },
      { icon: 'cart-outline', text: 'Báo giá nội thất' },
      { icon: 'hammer-outline', text: 'Giám sát thi công' },
      { icon: 'leaf-outline', text: 'Vật liệu thân thiện' },
      { icon: 'sparkles-outline', text: 'Phong cách đa dạng' },
    ],
    pricing: [
      {
        id: 1,
        name: 'Gói Cơ Bản',
        price: '250.000đ/m²',
        duration: '20 ngày',
        features: [
          'Thiết kế 2D mặt bằng bố trí',
          'Phối màu cơ bản',
          '1 lần chỉnh sửa miễn phí',
        ],
        recommended: false,
      },
      {
        id: 2,
        name: 'Gói Tiêu Chuẩn',
        price: '450.000đ/m²',
        duration: '35 ngày',
        features: [
          'Tất cả dịch vụ gói Cơ Bản',
          'Bản vẽ 3D phòng khách + phòng ngủ',
          'Bảng báo giá nội thất chi tiết',
          '2 lần chỉnh sửa miễn phí',
        ],
        recommended: true,
      },
      {
        id: 3,
        name: 'Gói Cao Cấp',
        price: '700.000đ/m²',
        duration: '50 ngày',
        features: [
          'Tất cả dịch vụ gói Tiêu Chuẩn',
          'Bản vẽ 3D toàn bộ căn hộ',
          'Hỗ trợ mua sắm nội thất',
          'Giám sát thi công',
          'Chỉnh sửa không giới hạn',
        ],
        recommended: false,
      },
    ],
    reviews: [
      {
        id: 1,
        userName: 'Phạm Thị D',
        rating: 5,
        comment: 'Thiết kế nội thất rất đẹp, phù hợp với không gian nhà tôi.',
        date: '20/11/2024',
        avatar: '👤',
      },
      {
        id: 2,
        userName: 'Hoàng Văn E',
        rating: 5,
        comment: 'Tư vấn tận tình, giá cả hợp lý. Sẽ giới thiệu cho bạn bè.',
        date: '12/11/2024',
        avatar: '👤',
      },
    ],
  },
  'permit': {
    id: 'permit',
    name: 'Hỗ trợ Xin Phép',
    category: 'Pháp lý',
    rating: 4.7,
    reviewCount: 89,
    description: 'Hỗ trợ hoàn thiện hồ sơ và xin giấy phép xây dựng tại cơ quan có thẩm quyền.',
    images: [
      require('@/assets/images/react-logo.webp'),
      require('@/assets/images/react-logo.webp'),
    ],
    features: [
      { icon: 'document-text-outline', text: 'Chuẩn bị hồ sơ đầy đủ' },
      { icon: 'checkmark-done-outline', text: 'Thẩm định hồ sơ trước khi nộp' },
      { icon: 'briefcase-outline', text: 'Đại diện nộp hồ sơ' },
      { icon: 'time-outline', text: 'Theo dõi tiến độ' },
      { icon: 'shield-checkmark-outline', text: 'Cam kết đậu phép' },
      { icon: 'refresh-outline', text: 'Bổ sung miễn phí nếu thiếu sót' },
    ],
    pricing: [
      {
        id: 1,
        name: 'Gói Tự túc',
        price: '5.000.000đ',
        duration: '15 ngày',
        features: [
          'Tư vấn thủ tục và chuẩn bị hồ sơ',
          'Thẩm định hồ sơ trước khi nộp',
          'Hướng dẫn nộp hồ sơ',
          '(Chủ đầu tư tự nộp hồ sơ)',
        ],
        recommended: false,
      },
      {
        id: 2,
        name: 'Gói Trọn gói',
        price: '10.000.000đ',
        duration: '20 ngày',
        features: [
          'Tất cả dịch vụ gói Tự túc',
          'Đại diện nộp và nhận hồ sơ',
          'Theo dõi tiến độ xử lý',
          'Bổ sung hồ sơ nếu cần',
          'Cam kết đậu phép (hoàn tiền nếu không đậu)',
        ],
        recommended: true,
      },
    ],
    reviews: [
      {
        id: 1,
        userName: 'Đỗ Văn F',
        rating: 5,
        comment: 'Xin phép nhanh chóng, không phải lo lắng gì. Rất hài lòng!',
        date: '18/11/2024',
        avatar: '👤',
      },
    ],
  },
  'feng-shui': {
    id: 'feng-shui',
    name: 'Tư vấn Phong Thủy',
    category: 'Tư vấn',
    rating: 4.6,
    reviewCount: 67,
    description: 'Tư vấn phong thủy cho nhà ở, văn phòng để mang lại sự thịnh vượng và hòa hợp.',
    images: [
      require('@/assets/images/react-logo.webp'),
      require('@/assets/images/react-logo.webp'),
    ],
    features: [
      { icon: 'compass-outline', text: 'Xem hướng nhà' },
      { icon: 'color-palette-outline', text: 'Tư vấn màu sắc theo mệnh' },
      { icon: 'star-outline', text: 'Chọn ngày tốt khởi công' },
      { icon: 'home-outline', text: 'Bố trí nội thất hợp phong thủy' },
      { icon: 'people-outline', text: 'Tư vấn trực tiếp tại nhà' },
      { icon: 'book-outline', text: 'Báo cáo chi tiết' },
    ],
    pricing: [
      {
        id: 1,
        name: 'Gói Online',
        price: '2.000.000đ',
        duration: '7 ngày',
        features: [
          'Tư vấn online qua video call',
          'Xem bản vẽ và định hướng',
          'Báo cáo phong thủy cơ bản (PDF)',
        ],
        recommended: false,
      },
      {
        id: 2,
        name: 'Gói Tại nhà',
        price: '5.000.000đ',
        duration: '10 ngày',
        features: [
          'Tất cả dịch vụ gói Online',
          'Tư vấn trực tiếp tại nhà (1 lần)',
          'Báo cáo chi tiết với hình ảnh minh họa',
          'Tư vấn bố trí nội thất',
          'Chọn ngày tốt khởi công',
        ],
        recommended: true,
      },
    ],
    reviews: [
      {
        id: 1,
        userName: 'Vũ Thị G',
        rating: 5,
        comment: 'Thầy tư vấn rất tận tâm, giải đáp mọi thắc mắc. Nhà tôi giờ rất hợp phong thủy.',
        date: '10/11/2024',
        avatar: '👤',
      },
    ],
  },
};

// ========== Component ==========
export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Booking form data
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    area: '',
    location: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const serviceData = SERVICES_DATA[id || ''] || SERVICES_DATA['house-design'];

  // ===== Handlers =====
  const handleImageScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setActiveImageIndex(index);
  };

  const handleSelectPackage = (packageId: number) => {
    setSelectedPackage(packageId);
  };

  const handleBookNow = () => {
    setShowBookingForm(true);
    // Scroll to top when showing form
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Vui lòng nhập họ tên';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Họ tên phải có ít nhất 2 ký tự';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(formData.phone)) {
      errors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.area.trim()) {
      errors.area = 'Vui lòng nhập diện tích';
    } else if (isNaN(Number(formData.area)) || Number(formData.area) <= 0) {
      errors.area = 'Diện tích phải là số dương';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitBooking = async () => {
    if (!validateForm()) {
      Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin');
      return;
    }

    if (!selectedPackage) {
      Alert.alert('Lỗi', 'Vui lòng chọn gói dịch vụ');
      return;
    }

    try {
      // TODO: Call API to submit booking
      // await servicesApi.createBooking({ ...formData, packageId: selectedPackage });

      Alert.alert(
        'Thành công',
        'Yêu cầu đặt dịch vụ của bạn đã được gửi. Chúng tôi sẽ liên hệ với bạn trong 24h.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setFormData({
                name: '',
                phone: '',
                email: '',
                area: '',
                location: '',
                notes: '',
              });
              setSelectedPackage(null);
              setShowBookingForm(false);
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi yêu cầu. Vui lòng thử lại sau.');
    }
  };

  // ===== Render Booking Form =====
  if (showBookingForm) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#fff' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Stack.Screen
          options={{
            title: 'Đặt dịch vụ',
            headerBackTitle: 'Quay lại',
          }}
        />
        <ScrollView style={styles.formContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Thông tin đặt dịch vụ</Text>
            <Text style={styles.formSubtitle}>{serviceData.name}</Text>
            {selectedPackage && (
              <View style={styles.selectedPackageBadge}>
                <Text style={styles.selectedPackageText}>
                  Gói:{' '}
                  {serviceData.pricing.find((p: any) => p.id === selectedPackage)?.name}
                </Text>
              </View>
            )}
          </View>

          {/* Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Họ và tên <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, formErrors.name && styles.inputError]}
              placeholder="Nguyễn Văn A"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}
          </View>

          {/* Phone */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Số điện thoại <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, formErrors.phone && styles.inputError]}
              placeholder="0901234567"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
            />
            {formErrors.phone && <Text style={styles.errorText}>{formErrors.phone}</Text>}
          </View>

          {/* Email */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="example@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
            />
          </View>

          {/* Area */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Diện tích (m²) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, formErrors.area && styles.inputError]}
              placeholder="120"
              keyboardType="numeric"
              value={formData.area}
              onChangeText={(text) => setFormData({ ...formData, area: text })}
            />
            {formErrors.area && <Text style={styles.errorText}>{formErrors.area}</Text>}
          </View>

          {/* Location */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Địa điểm</Text>
            <TextInput
              style={styles.input}
              placeholder="Hà Nội, TP.HCM, ..."
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
            />
          </View>

          {/* Notes */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Ghi chú thêm</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Yêu cầu đặc biệt, thời gian liên hệ, ..."
              multiline
              numberOfLines={4}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitBooking}>
            <Text style={styles.submitButtonText}>Gửi yêu cầu</Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowBookingForm(false)}
          >
            <Text style={styles.cancelButtonText}>Hủy bỏ</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ===== Render Service Detail =====
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack.Screen
        options={{
          title: serviceData.name,
          headerBackTitle: 'Quay lại',
        }}
      />
      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        {/* Hero Image Gallery */}
        <View style={styles.imageGalleryContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleImageScroll}
            scrollEventThrottle={16}
          >
            {serviceData.images.map((img: any, index: number) => (
              <Image key={index} source={img} style={styles.heroImage} />
            ))}
          </ScrollView>

          {/* Dots indicator */}
          <View style={styles.dotsContainer}>
            {serviceData.images.map((_: any, index: number) => (
              <View
                key={index}
                style={[styles.dot, activeImageIndex === index && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        {/* Service Info */}
        <View style={styles.infoSection}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{serviceData.category}</Text>
          </View>
          <Text style={styles.serviceName}>{serviceData.name}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={18} color="#FFD700" />
            <Text style={styles.ratingText}>
              {serviceData.rating.toFixed(1)}/5.0
            </Text>
            <Text style={styles.reviewCount}>({serviceData.reviewCount} đánh giá)</Text>
          </View>
          <Text style={styles.description}>{serviceData.description}</Text>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Dịch vụ bao gồm</Text>
          <View style={styles.featuresGrid}>
            {serviceData.features.map((feature: any, index: number) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name={feature.icon} size={28} color="#FF6B00" />
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pricing Packages */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>Gói dịch vụ</Text>
          {serviceData.pricing.map((pkg: any) => (
            <TouchableOpacity
              key={pkg.id}
              style={[
                styles.packageCard,
                selectedPackage === pkg.id && styles.packageCardSelected,
                pkg.recommended && styles.packageCardRecommended,
              ]}
              onPress={() => handleSelectPackage(pkg.id)}
            >
              {pkg.recommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>Phổ biến nhất</Text>
                </View>
              )}
              <View style={styles.packageHeader}>
                <View>
                  <Text style={styles.packageName}>{pkg.name}</Text>
                  <Text style={styles.packagePrice}>{pkg.price}</Text>
                </View>
                <View style={styles.durationBadge}>
                  <Ionicons name="time-outline" size={14} color="#666" />
                  <Text style={styles.durationText}>{pkg.duration}</Text>
                </View>
              </View>
              <View style={styles.packageFeatures}>
                {pkg.features.map((feature: string, idx: number) => (
                  <View key={idx} style={styles.featureRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={selectedPackage === pkg.id ? '#FF6B00' : '#4CAF50'}
                    />
                    <Text style={styles.featureRowText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Reviews */}
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Đánh giá ({serviceData.reviewCount})</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {serviceData.reviews.map((review: any) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.avatarText}>{review.avatar}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewUserName}>{review.userName}</Text>
                  <View style={styles.reviewRating}>
                    {[...Array(5)].map((_, i) => (
                      <Ionicons
                        key={i}
                        name={i < review.rating ? 'star' : 'star-outline'}
                        size={14}
                        color="#FFD700"
                      />
                    ))}
                    <Text style={styles.reviewDate}> • {review.date}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={[styles.bookButton, !selectedPackage && styles.bookButtonDisabled]}
          onPress={handleBookNow}
          disabled={!selectedPackage}
        >
          <Text style={styles.bookButtonText}>
            {selectedPackage ? 'Đặt dịch vụ ngay' : 'Vui lòng chọn gói dịch vụ'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ========== Styles ==========
const styles = StyleSheet.create({
  // Image Gallery
  imageGalleryContainer: {
    position: 'relative',
  },
  heroImage: {
    width,
    height: 280,
    resizeMode: 'cover',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 24,
  },

  // Info Section
  infoSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#FF6B00',
    fontWeight: '600',
  },
  serviceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },

  // Features Section
  featuresSection: {
    padding: 16,
    backgroundColor: '#FAFAFA',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  featureItem: {
    width: '33.33%',
    paddingHorizontal: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    marginTop: 6,
  },

  // Pricing Section
  pricingSection: {
    padding: 16,
  },
  packageCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  packageCardSelected: {
    borderColor: '#FF6B00',
    borderWidth: 2,
    backgroundColor: '#FFF8F5',
  },
  packageCardRecommended: {
    position: 'relative',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#FF6B00',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  packageName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  packageFeatures: {
    marginTop: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  featureRowText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 8,
    flex: 1,
  },

  // Reviews Section
  reviewsSection: {
    padding: 16,
    backgroundColor: '#FAFAFA',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#FF6B00',
    fontWeight: '600',
  },
  reviewCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 18,
  },
  reviewUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewComment: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },

  // Bottom Button
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  bookButton: {
    backgroundColor: '#FF6B00',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: '#ccc',
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Booking Form
  formContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formHeader: {
    padding: 16,
    backgroundColor: '#FFF3E0',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0B2',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  selectedPackageBadge: {
    marginTop: 8,
    backgroundColor: '#FF6B00',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  selectedPackageText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  formGroup: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginBottom: 6,
  },
  required: {
    color: 'red',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#222',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    marginTop: 4,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: '#FF6B00',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  cancelButton: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});
