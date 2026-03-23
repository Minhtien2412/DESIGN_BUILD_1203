/**
 * Service Detail Screen
 * Hiển thị chi tiết dịch vụ theo ID, gồm hình ảnh, tính năng, gói giá, đánh giá,
 * và form đặt dịch vụ.
 *
 * ⚠️  MOCK DATA: Screen hiện dùng hoàn toàn mock data (SERVICES_DATA).
 *     Cần thay bằng API khi backend endpoint sẵn sàng.
 *     TODO: Replace SERVICES_DATA with GET /api/v1/services/:id
 *
 * Refactored: migrated to DS design system. All business logic, form validation,
 * and navigation preserved from original.
 */

import { DSButton, DSCard, DSInput } from "@/components/ds";
import { useDS } from "@/hooks/useDS";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// Mock service data structure
const SERVICES_DATA: Record<string, any> = {
  "house-design": {
    id: "house-design",
    name: "Thiết kế Nhà Phố",
    category: "Thiết kế",
    rating: 4.8,
    reviewCount: 156,
    description:
      "Dịch vụ thiết kế nhà phố chuyên nghiệp với đội ngũ kiến trúc sư giàu kinh nghiệm, cam kết mang đến không gian sống hoàn hảo cho gia đình bạn.",
    images: [
      require("@/assets/images/react-logo.webp"),
      require("@/assets/images/react-logo.webp"),
      require("@/assets/images/react-logo.webp"),
    ],
    features: [
      { icon: "cube-outline", text: "Bản vẽ 3D chân thực" },
      { icon: "document-text-outline", text: "Bản vẽ thi công chi tiết" },
      { icon: "shield-checkmark-outline", text: "Hỗ trợ xin phép" },
      { icon: "people-outline", text: "Tư vấn 1-1" },
      { icon: "refresh-outline", text: "Miễn phí chỉnh sửa" },
      { icon: "time-outline", text: "Đúng tiến độ cam kết" },
    ],
    pricing: [
      {
        id: 1,
        name: "Gói Cơ Bản",
        price: "300.000đ/m²",
        duration: "30 ngày",
        features: [
          "Bản vẽ 2D (mặt bằng, mặt đứng)",
          "Bản vẽ 3D cơ bản (2 góc nhìn)",
          "1 lần chỉnh sửa miễn phí",
        ],
        recommended: false,
      },
      {
        id: 2,
        name: "Gói Tiêu Chuẩn",
        price: "500.000đ/m²",
        duration: "45 ngày",
        features: [
          "Tất cả dịch vụ gói Cơ Bản",
          "Bản vẽ 3D chi tiết (4 góc nhìn)",
          "Bản vẽ thi công cơ điện nước",
          "2 lần chỉnh sửa miễn phí",
          "Tư vấn phong thủy cơ bản",
        ],
        recommended: true,
      },
      {
        id: 3,
        name: "Gói Cao Cấp",
        price: "800.000đ/m²",
        duration: "60 ngày",
        features: [
          "Tất cả dịch vụ gói Tiêu Chuẩn",
          "Chỉnh sửa không giới hạn",
          "Hỗ trợ xin giấy phép xây dựng",
          "Video 3D walkthrough",
          "Thiết kế cảnh quan sân vườn",
        ],
        recommended: false,
      },
    ],
    reviews: [
      {
        id: 1,
        userName: "Nguyễn Văn A",
        rating: 5,
        comment:
          "Dịch vụ tuyệt vời! Thiết kế đẹp, tư vấn nhiệt tình, đúng tiến độ.",
        date: "15/11/2024",
        avatar: "👤",
      },
      {
        id: 2,
        userName: "Trần Thị B",
        rating: 5,
        comment:
          "Rất hài lòng với bản vẽ 3D. Đội ngũ chuyên nghiệp và tận tâm.",
        date: "08/11/2024",
        avatar: "👤",
      },
      {
        id: 3,
        userName: "Lê Văn C",
        rating: 4,
        comment: "Thiết kế đẹp, giá cả hợp lý. Tuy nhiên chỉnh sửa hơi lâu.",
        date: "02/11/2024",
        avatar: "👤",
      },
    ],
  },
  "interior-design": {
    id: "interior-design",
    name: "Thiết kế Nội Thất",
    category: "Nội thất",
    rating: 4.9,
    reviewCount: 234,
    description:
      "Thiết kế nội thất theo phong cách cá nhân hóa, tối ưu không gian và công năng sử dụng.",
    images: [
      require("@/assets/images/react-logo.webp"),
      require("@/assets/images/react-logo.webp"),
      require("@/assets/images/react-logo.webp"),
    ],
    features: [
      { icon: "color-palette-outline", text: "Phối màu chuyên nghiệp" },
      { icon: "cube-outline", text: "Bản vẽ 3D chi tiết" },
      { icon: "cart-outline", text: "Báo giá nội thất" },
      { icon: "hammer-outline", text: "Giám sát thi công" },
      { icon: "leaf-outline", text: "Vật liệu thân thiện" },
      { icon: "sparkles-outline", text: "Phong cách đa dạng" },
    ],
    pricing: [
      {
        id: 1,
        name: "Gói Cơ Bản",
        price: "250.000đ/m²",
        duration: "20 ngày",
        features: [
          "Thiết kế 2D mặt bằng bố trí",
          "Phối màu cơ bản",
          "1 lần chỉnh sửa miễn phí",
        ],
        recommended: false,
      },
      {
        id: 2,
        name: "Gói Tiêu Chuẩn",
        price: "450.000đ/m²",
        duration: "35 ngày",
        features: [
          "Tất cả dịch vụ gói Cơ Bản",
          "Bản vẽ 3D phòng khách + phòng ngủ",
          "Bảng báo giá nội thất chi tiết",
          "2 lần chỉnh sửa miễn phí",
        ],
        recommended: true,
      },
      {
        id: 3,
        name: "Gói Cao Cấp",
        price: "700.000đ/m²",
        duration: "50 ngày",
        features: [
          "Tất cả dịch vụ gói Tiêu Chuẩn",
          "Bản vẽ 3D toàn bộ căn hộ",
          "Hỗ trợ mua sắm nội thất",
          "Giám sát thi công",
          "Chỉnh sửa không giới hạn",
        ],
        recommended: false,
      },
    ],
    reviews: [
      {
        id: 1,
        userName: "Phạm Thị D",
        rating: 5,
        comment: "Thiết kế nội thất rất đẹp, phù hợp với không gian nhà tôi.",
        date: "20/11/2024",
        avatar: "👤",
      },
      {
        id: 2,
        userName: "Hoàng Văn E",
        rating: 5,
        comment: "Tư vấn tận tình, giá cả hợp lý. Sẽ giới thiệu cho bạn bè.",
        date: "12/11/2024",
        avatar: "👤",
      },
    ],
  },
  permit: {
    id: "permit",
    name: "Hỗ trợ Xin Phép",
    category: "Pháp lý",
    rating: 4.7,
    reviewCount: 89,
    description:
      "Hỗ trợ hoàn thiện hồ sơ và xin giấy phép xây dựng tại cơ quan có thẩm quyền.",
    images: [
      require("@/assets/images/react-logo.webp"),
      require("@/assets/images/react-logo.webp"),
    ],
    features: [
      { icon: "document-text-outline", text: "Chuẩn bị hồ sơ đầy đủ" },
      { icon: "checkmark-done-outline", text: "Thẩm định hồ sơ trước khi nộp" },
      { icon: "briefcase-outline", text: "Đại diện nộp hồ sơ" },
      { icon: "time-outline", text: "Theo dõi tiến độ" },
      { icon: "shield-checkmark-outline", text: "Cam kết đậu phép" },
      { icon: "refresh-outline", text: "Bổ sung miễn phí nếu thiếu sót" },
    ],
    pricing: [
      {
        id: 1,
        name: "Gói Tự túc",
        price: "5.000.000đ",
        duration: "15 ngày",
        features: [
          "Tư vấn thủ tục và chuẩn bị hồ sơ",
          "Thẩm định hồ sơ trước khi nộp",
          "Hướng dẫn nộp hồ sơ",
          "(Chủ đầu tư tự nộp hồ sơ)",
        ],
        recommended: false,
      },
      {
        id: 2,
        name: "Gói Trọn gói",
        price: "10.000.000đ",
        duration: "20 ngày",
        features: [
          "Tất cả dịch vụ gói Tự túc",
          "Đại diện nộp và nhận hồ sơ",
          "Theo dõi tiến độ xử lý",
          "Bổ sung hồ sơ nếu cần",
          "Cam kết đậu phép (hoàn tiền nếu không đậu)",
        ],
        recommended: true,
      },
    ],
    reviews: [
      {
        id: 1,
        userName: "Đỗ Văn F",
        rating: 5,
        comment: "Xin phép nhanh chóng, không phải lo lắng gì. Rất hài lòng!",
        date: "18/11/2024",
        avatar: "👤",
      },
    ],
  },
  "feng-shui": {
    id: "feng-shui",
    name: "Tư vấn Phong Thủy",
    category: "Tư vấn",
    rating: 4.6,
    reviewCount: 67,
    description:
      "Tư vấn phong thủy cho nhà ở, văn phòng để mang lại sự thịnh vượng và hòa hợp.",
    images: [
      require("@/assets/images/react-logo.webp"),
      require("@/assets/images/react-logo.webp"),
    ],
    features: [
      { icon: "compass-outline", text: "Xem hướng nhà" },
      { icon: "color-palette-outline", text: "Tư vấn màu sắc theo mệnh" },
      { icon: "star-outline", text: "Chọn ngày tốt khởi công" },
      { icon: "home-outline", text: "Bố trí nội thất hợp phong thủy" },
      { icon: "people-outline", text: "Tư vấn trực tiếp tại nhà" },
      { icon: "book-outline", text: "Báo cáo chi tiết" },
    ],
    pricing: [
      {
        id: 1,
        name: "Gói Online",
        price: "2.000.000đ",
        duration: "7 ngày",
        features: [
          "Tư vấn online qua video call",
          "Xem bản vẽ và định hướng",
          "Báo cáo phong thủy cơ bản (PDF)",
        ],
        recommended: false,
      },
      {
        id: 2,
        name: "Gói Tại nhà",
        price: "5.000.000đ",
        duration: "10 ngày",
        features: [
          "Tất cả dịch vụ gói Online",
          "Tư vấn trực tiếp tại nhà (1 lần)",
          "Báo cáo chi tiết với hình ảnh minh họa",
          "Tư vấn bố trí nội thất",
          "Chọn ngày tốt khởi công",
        ],
        recommended: true,
      },
    ],
    reviews: [
      {
        id: 1,
        userName: "Vũ Thị G",
        rating: 5,
        comment:
          "Thầy tư vấn rất tận tâm, giải đáp mọi thắc mắc. Nhà tôi giờ rất hợp phong thủy.",
        date: "10/11/2024",
        avatar: "👤",
      },
    ],
  },
};

// ========== Component ==========
export default function ServiceDetailScreen() {
  const { colors, spacing, radius, text: textStyles, shadow } = useDS();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Booking form data
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    area: "",
    location: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const serviceData = SERVICES_DATA[id || ""] || SERVICES_DATA["house-design"];

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
      errors.name = "Vui lòng nhập họ tên";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Họ tên phải có ít nhất 2 ký tự";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(formData.phone)) {
      errors.phone = "Số điện thoại không hợp lệ";
    }

    if (!formData.area.trim()) {
      errors.area = "Vui lòng nhập diện tích";
    } else if (isNaN(Number(formData.area)) || Number(formData.area) <= 0) {
      errors.area = "Diện tích phải là số dương";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitBooking = async () => {
    if (!validateForm()) {
      Alert.alert("Lỗi", "Vui lòng kiểm tra lại thông tin");
      return;
    }

    if (!selectedPackage) {
      Alert.alert("Lỗi", "Vui lòng chọn gói dịch vụ");
      return;
    }

    try {
      // TODO: Call API to submit booking
      // await servicesApi.createBooking({ ...formData, packageId: selectedPackage });

      Alert.alert(
        "Thành công",
        "Yêu cầu đặt dịch vụ của bạn đã được gửi. Chúng tôi sẽ liên hệ với bạn trong 24h.",
        [
          {
            text: "OK",
            onPress: () => {
              // Reset form
              setFormData({
                name: "",
                phone: "",
                email: "",
                area: "",
                location: "",
                notes: "",
              });
              setSelectedPackage(null);
              setShowBookingForm(false);
              router.back();
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi yêu cầu. Vui lòng thử lại sau.");
    }
  };

  // ===== Render Booking Form =====
  if (showBookingForm) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.bgSurface }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Stack.Screen
          options={{
            title: "Đặt dịch vụ",
            headerBackTitle: "Quay lại",
          }}
        />
        <ScrollView
          style={{ flex: 1, backgroundColor: colors.bgSurface }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Form Header */}
          <View
            style={{
              padding: spacing.xl,
              backgroundColor: colors.primaryBg,
              borderBottomWidth: 1,
              borderBottomColor: colors.primaryBg,
            }}
          >
            <Text
              style={[
                textStyles.h3,
                { color: colors.text, marginBottom: spacing.xs },
              ]}
            >
              Thông tin đặt dịch vụ
            </Text>
            <Text style={[textStyles.body, { color: colors.textSecondary }]}>
              {serviceData.name}
            </Text>
            {selectedPackage && (
              <View
                style={{
                  marginTop: spacing.md,
                  backgroundColor: colors.primary,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.xs,
                  borderRadius: radius.md,
                  alignSelf: "flex-start",
                }}
              >
                <Text style={[textStyles.badge, { color: colors.textInverse }]}>
                  Gói:{" "}
                  {
                    serviceData.pricing.find(
                      (p: any) => p.id === selectedPackage,
                    )?.name
                  }
                </Text>
              </View>
            )}
          </View>

          {/* Form Fields */}
          <View style={{ padding: spacing.xl }}>
            <DSInput
              label="Họ và tên *"
              placeholder="Nguyễn Văn A"
              value={formData.name}
              onChangeText={(text: string) =>
                setFormData({ ...formData, name: text })
              }
              error={formErrors.name}
            />

            <DSInput
              label="Số điện thoại *"
              placeholder="0901234567"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(text: string) =>
                setFormData({ ...formData, phone: text })
              }
              error={formErrors.phone}
            />

            <DSInput
              label="Email"
              placeholder="example@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text: string) =>
                setFormData({ ...formData, email: text })
              }
            />

            <DSInput
              label="Diện tích (m²) *"
              placeholder="120"
              keyboardType="numeric"
              value={formData.area}
              onChangeText={(text: string) =>
                setFormData({ ...formData, area: text })
              }
              error={formErrors.area}
            />

            <DSInput
              label="Địa điểm"
              placeholder="Hà Nội, TP.HCM, ..."
              value={formData.location}
              onChangeText={(text: string) =>
                setFormData({ ...formData, location: text })
              }
            />

            <DSInput
              label="Ghi chú thêm"
              placeholder="Yêu cầu đặc biệt, thời gian liên hệ, ..."
              multiline
              numberOfLines={4}
              value={formData.notes}
              onChangeText={(text: string) =>
                setFormData({ ...formData, notes: text })
              }
              containerStyle={{ marginBottom: spacing.xl }}
            />

            {/* Submit Button */}
            <DSButton
              title="Gửi yêu cầu"
              onPress={handleSubmitBooking}
              variant="primary"
              fullWidth
            />

            {/* Cancel Button */}
            <DSButton
              title="Hủy bỏ"
              onPress={() => setShowBookingForm(false)}
              variant="outline"
              fullWidth
              style={{ marginTop: spacing.md }}
            />

            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ===== Render Service Detail =====
  return (
    <View style={{ flex: 1, backgroundColor: colors.bgSurface }}>
      <Stack.Screen
        options={{
          title: serviceData.name,
          headerBackTitle: "Quay lại",
        }}
      />
      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        {/* Hero Image Gallery */}
        <View style={{ position: "relative" }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleImageScroll}
            scrollEventThrottle={16}
          >
            {serviceData.images.map((img: any, index: number) => (
              <Image
                key={index}
                source={img}
                style={{ width, height: 280, resizeMode: "cover" }}
              />
            ))}
          </ScrollView>

          {/* Dots indicator */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              bottom: spacing.md,
              left: 0,
              right: 0,
            }}
          >
            {serviceData.images.map((_: any, index: number) => (
              <View
                key={index}
                style={{
                  width: activeImageIndex === index ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor:
                    activeImageIndex === index
                      ? colors.textInverse
                      : "rgba(255,255,255,0.5)",
                  marginHorizontal: 4,
                }}
              />
            ))}
          </View>
        </View>

        {/* Service Info */}
        <View
          style={{
            padding: spacing.xl,
            borderBottomWidth: 1,
            borderBottomColor: colors.divider,
          }}
        >
          <View
            style={{
              alignSelf: "flex-start",
              backgroundColor: colors.primaryBg,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.xs,
              borderRadius: radius.full,
              marginBottom: spacing.md,
            }}
          >
            <Text style={[textStyles.badge, { color: colors.primary }]}>
              {serviceData.category}
            </Text>
          </View>
          <Text
            style={[
              textStyles.h2,
              { color: colors.text, marginBottom: spacing.md },
            ]}
          >
            {serviceData.name}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: spacing.md,
            }}
          >
            <Ionicons name="star" size={18} color={colors.primary} />
            <Text
              style={[
                textStyles.bodySemibold,
                { color: colors.text, marginLeft: spacing.xs },
              ]}
            >
              {serviceData.rating.toFixed(1)}/5.0
            </Text>
            <Text
              style={[
                textStyles.body,
                { color: colors.textSecondary, marginLeft: spacing.sm },
              ]}
            >
              ({serviceData.reviewCount} đánh giá)
            </Text>
          </View>
          <Text
            style={[
              textStyles.body,
              { color: colors.textSecondary, lineHeight: 20 },
            ]}
          >
            {serviceData.description}
          </Text>
        </View>

        {/* Features Grid */}
        <View style={{ padding: spacing.xl, backgroundColor: colors.bgMuted }}>
          <Text
            style={[
              textStyles.h3,
              { color: colors.text, marginBottom: spacing.md },
            ]}
          >
            Dịch vụ bao gồm
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginHorizontal: -6,
            }}
          >
            {serviceData.features.map((feature: any, index: number) => (
              <View
                key={index}
                style={{
                  width: "33.33%",
                  paddingHorizontal: 6,
                  paddingVertical: spacing.md,
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name={feature.icon}
                  size={28}
                  color={colors.primary}
                />
                <Text
                  style={[
                    textStyles.caption,
                    {
                      color: colors.textSecondary,
                      textAlign: "center",
                      marginTop: spacing.sm,
                    },
                  ]}
                >
                  {feature.text}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pricing Packages */}
        <View style={{ padding: spacing.xl }}>
          <Text
            style={[
              textStyles.h3,
              { color: colors.text, marginBottom: spacing.md },
            ]}
          >
            Gói dịch vụ
          </Text>
          {serviceData.pricing.map((pkg: any) => {
            const isSelected = selectedPackage === pkg.id;
            return (
              <TouchableOpacity
                key={pkg.id}
                style={{
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderRadius: radius.lg,
                  padding: spacing.xl,
                  marginBottom: spacing.md,
                  backgroundColor: isSelected ? colors.primaryBg : colors.card,
                  position: "relative",
                }}
                onPress={() => handleSelectPackage(pkg.id)}
                activeOpacity={0.7}
              >
                {pkg.recommended && (
                  <View
                    style={{
                      position: "absolute",
                      top: -8,
                      right: spacing.xl,
                      backgroundColor: colors.primary,
                      paddingHorizontal: spacing.lg,
                      paddingVertical: spacing.xs,
                      borderRadius: radius.full,
                    }}
                  >
                    <Text
                      style={[textStyles.badge, { color: colors.textInverse }]}
                    >
                      Phổ biến nhất
                    </Text>
                  </View>
                )}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: spacing.md,
                  }}
                >
                  <View>
                    <Text
                      style={[
                        textStyles.bodySemibold,
                        { color: colors.text, marginBottom: spacing.xs },
                      ]}
                    >
                      {pkg.name}
                    </Text>
                    <Text style={[textStyles.h3, { color: colors.primary }]}>
                      {pkg.price}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: colors.bgMuted,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.xs,
                      borderRadius: radius.md,
                    }}
                  >
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={[
                        textStyles.caption,
                        { color: colors.textSecondary, marginLeft: spacing.xs },
                      ]}
                    >
                      {pkg.duration}
                    </Text>
                  </View>
                </View>
                <View style={{ marginTop: spacing.md }}>
                  {pkg.features.map((feature: string, idx: number) => (
                    <View
                      key={idx}
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        marginBottom: spacing.md,
                      }}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={isSelected ? colors.primary : colors.success}
                      />
                      <Text
                        style={[
                          textStyles.small,
                          {
                            color: colors.textSecondary,
                            marginLeft: spacing.md,
                            flex: 1,
                          },
                        ]}
                      >
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Reviews */}
        <View style={{ padding: spacing.xl, backgroundColor: colors.bgMuted }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: spacing.md,
            }}
          >
            <Text style={[textStyles.h3, { color: colors.text }]}>
              Đánh giá ({serviceData.reviewCount})
            </Text>
            <TouchableOpacity>
              <Text
                style={[textStyles.bodySemibold, { color: colors.primary }]}
              >
                Xem tất cả
              </Text>
            </TouchableOpacity>
          </View>
          {serviceData.reviews.map((review: any) => (
            <DSCard
              key={review.id}
              variant="flat"
              style={{ marginBottom: spacing.md }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: spacing.md,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: colors.bgMuted,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: spacing.lg,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>{review.avatar}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[textStyles.bodySemibold, { color: colors.text }]}
                  >
                    {review.userName}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 2,
                    }}
                  >
                    {[...Array(5)].map((_, i) => (
                      <Ionicons
                        key={i}
                        name={i < review.rating ? "star" : "star-outline"}
                        size={14}
                        color={colors.primary}
                      />
                    ))}
                    <Text
                      style={[
                        textStyles.caption,
                        { color: colors.textTertiary, marginLeft: spacing.xs },
                      ]}
                    >
                      {" "}
                      • {review.date}
                    </Text>
                  </View>
                </View>
              </View>
              <Text
                style={[
                  textStyles.small,
                  { color: colors.textSecondary, lineHeight: 18 },
                ]}
              >
                {review.comment}
              </Text>
            </DSCard>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.bgSurface,
          borderTopWidth: 1,
          borderTopColor: colors.divider,
          padding: spacing.xl,
          paddingBottom: Platform.OS === "ios" ? 24 : spacing.xl,
        }}
      >
        <DSButton
          title={
            selectedPackage ? "Đặt dịch vụ ngay" : "Vui lòng chọn gói dịch vụ"
          }
          onPress={handleBookNow}
          variant="primary"
          fullWidth
          disabled={!selectedPackage}
        />
      </View>
    </View>
  );
}
