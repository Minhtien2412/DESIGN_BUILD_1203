import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { useDS } from "@/hooks/useDS";

// Package data
const PACKAGES = [
  {
    id: "basic",
    name: "Cơ bản",
    price: "15.000.000₫",
    priceUnit: "/ dự án",
    popular: false,
    features: [
      { included: true, text: "Giám sát 2 lần/tuần" },
      { included: true, text: "Báo cáo tiến độ hàng tuần" },
      { included: true, text: "Kiểm tra chất lượng vật liệu" },
      { included: true, text: "Hỗ trợ qua điện thoại" },
      { included: false, text: "Kiểm tra kỹ thuật chuyên sâu" },
      { included: false, text: "Báo cáo ảnh/video chi tiết" },
      { included: false, text: "Đội ngũ giám sát chuyên nghiệp" },
      { included: false, text: "Bảo hành sau nghiệm thu" },
    ],
    description: "Phù hợp với dự án nhỏ, nhà ở riêng lẻ dưới 100m²",
  },
  {
    id: "standard",
    name: "Tiêu chuẩn",
    price: "30.000.000₫",
    priceUnit: "/ dự án",
    popular: true,
    features: [
      { included: true, text: "Giám sát 3-4 lần/tuần" },
      { included: true, text: "Báo cáo tiến độ 2 lần/tuần" },
      { included: true, text: "Kiểm tra chất lượng vật liệu" },
      { included: true, text: "Hỗ trợ 24/7" },
      { included: true, text: "Kiểm tra kỹ thuật chuyên sâu" },
      { included: true, text: "Báo cáo ảnh/video chi tiết" },
      { included: false, text: "Đội ngũ giám sát chuyên nghiệp" },
      { included: false, text: "Bảo hành sau nghiệm thu" },
    ],
    description: "Phù hợp với nhà phố, biệt thự 100-300m²",
  },
  {
    id: "premium",
    name: "Cao cấp",
    price: "50.000.000₫",
    priceUnit: "/ dự án",
    popular: false,
    features: [
      { included: true, text: "Giám sát toàn thời gian" },
      { included: true, text: "Báo cáo tiến độ hàng ngày" },
      { included: true, text: "Kiểm tra chất lượng vật liệu" },
      { included: true, text: "Hỗ trợ 24/7" },
      { included: true, text: "Kiểm tra kỹ thuật chuyên sâu" },
      { included: true, text: "Báo cáo ảnh/video chi tiết" },
      { included: true, text: "Đội ngũ giám sát chuyên nghiệp" },
      { included: true, text: "Bảo hành sau nghiệm thu 12 tháng" },
    ],
    description: "Phù hợp với biệt thự cao cấp, công trình lớn trên 300m²",
  },
];

interface PackageCardProps {
  package: any;
  onSelect: () => void;
}

const PackageCard: React.FC<PackageCardProps> = ({
  package: pkg,
  onSelect,
}) => {
  const { colors, spacing, radius, text, shadow } = useDS();
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: radius.lg,
          marginBottom: spacing.md,
          overflow: "hidden",
          ...shadow,
        },
        pkg.popular && { borderWidth: 2, borderColor: colors.primary },
      ]}
    >
      {pkg.popular && (
        <View
          style={{
            position: "absolute",
            top: spacing.sm,
            right: spacing.sm,
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            backgroundColor: colors.primary,
            paddingHorizontal: spacing.xs,
            paddingVertical: 4,
            borderRadius: radius.lg,
            zIndex: 1,
          }}
        >
          <Ionicons name="star" size={12} color={colors.textInverse} />
          <Text style={[text.badge, { color: colors.textInverse }]}>
            Phổ biến nhất
          </Text>
        </View>
      )}

      <View
        style={{
          backgroundColor: colors.primary,
          padding: 20,
          alignItems: "center",
        }}
      >
        <Text
          style={[
            text.h3,
            { color: colors.textInverse, marginBottom: spacing.xs },
          ]}
        >
          {pkg.name}
        </Text>
        <Text
          style={{ fontSize: 28, fontWeight: "700", color: colors.textInverse }}
        >
          {pkg.price}
        </Text>
        <Text style={[text.body, { color: colors.textInverse, opacity: 0.9 }]}>
          {pkg.priceUnit}
        </Text>
      </View>

      <View style={{ padding: 20 }}>
        <Text
          style={[
            text.small,
            {
              color: colors.textSecondary,
              marginBottom: spacing.md,
              lineHeight: 18,
            },
          ]}
        >
          {pkg.description}
        </Text>

        <View style={{ marginBottom: 20 }}>
          {pkg.features.map((feature: any, index: number) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
                gap: 10,
              }}
            >
              <Ionicons
                name={feature.included ? "checkmark-circle" : "close-circle"}
                size={18}
                color={feature.included ? colors.primary : colors.divider}
              />
              <Text
                style={[
                  text.small,
                  {
                    flex: 1,
                    color: feature.included ? colors.text : colors.border,
                  },
                ]}
              >
                {feature.text}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            paddingVertical: 12,
            borderRadius: radius.md,
            alignItems: "center",
          }}
          onPress={onSelect}
        >
          <Text style={[text.bodySemibold, { color: colors.textInverse }]}>
            Chọn gói này
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function QualitySupervisionScreen() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    area: "",
    startDate: "",
    notes: "",
  });

  const handleSelectPackage = (pkg: any) => {
    setSelectedPackage(pkg);
    setShowBookingModal(true);
  };

  const handleSubmit = () => {
    // Validate form
    if (!formData.name || !formData.phone || !formData.address) {
      Alert.alert("Thông báo", "Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    // Submit logic here
    Alert.alert(
      "Đăng ký thành công",
      "Chúng tôi sẽ liên hệ với bạn trong vòng 24h để xác nhận thông tin.",
      [
        {
          text: "OK",
          onPress: () => {
            setShowBookingModal(false);
            setFormData({
              name: "",
              phone: "",
              email: "",
              address: "",
              area: "",
              startDate: "",
              notes: "",
            });
          },
        },
      ],
    );
  };

  const { colors, spacing, radius, text: textStyles, shadow, font } = useDS();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Giám sát chất lượng",
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.textInverse,
          headerTitleStyle: { fontWeight: "600" },
        }}
      />
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View
            style={{
              backgroundColor: colors.card,
              alignItems: "center",
              paddingVertical: spacing.xxxl,
              paddingHorizontal: spacing.xl,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.bgMuted,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: spacing.xl,
              }}
            >
              <Ionicons
                name="shield-checkmark"
                size={48}
                color={colors.primary}
              />
            </View>
            <Text
              style={[
                textStyles.h3,
                { color: colors.text, marginBottom: spacing.sm },
              ]}
            >
              Dịch vụ giám sát thi công
            </Text>
            <Text
              style={[
                textStyles.body,
                { color: colors.textSecondary, textAlign: "center" },
              ]}
            >
              Đảm bảo chất lượng công trình từ móng đến hoàn thiện
            </Text>
          </View>

          {/* Benefits Section */}
          <View
            style={{
              backgroundColor: colors.card,
              padding: spacing.xl,
              marginTop: spacing.md,
            }}
          >
            <Text
              style={[
                textStyles.h4,
                { color: colors.text, marginBottom: spacing.xl },
              ]}
            >
              Lợi ích khi sử dụng dịch vụ
            </Text>
            <View style={{ gap: spacing.xl }}>
              {[
                {
                  icon: "checkmark-done" as const,
                  color: colors.success,
                  title: "Chất lượng đảm bảo",
                  desc: "Kiểm tra kỹ lưỡng từng công đoạn, phát hiện sớm sai sót",
                },
                {
                  icon: "time" as const,
                  color: colors.info,
                  title: "Tiết kiệm thời gian",
                  desc: "Tránh các rủi ro phải sửa chữa, làm lại tốn thời gian",
                },
                {
                  icon: "cash" as const,
                  color: colors.primary,
                  title: "Tiết kiệm chi phí",
                  desc: "Tránh lãng phí vật liệu, chi phí sửa chữa không đúng quy cách",
                },
                {
                  icon: "document-text" as const,
                  color: colors.primary,
                  title: "Báo cáo minh bạch",
                  desc: "Cập nhật tiến độ định kỳ với ảnh, video chi tiết",
                },
              ].map((b, i) => (
                <View key={i} style={{ flexDirection: "row", gap: spacing.lg }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: colors.bgMuted,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name={b.icon} size={24} color={b.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        textStyles.bodySemibold,
                        { color: colors.text, marginBottom: spacing.xs },
                      ]}
                    >
                      {b.title}
                    </Text>
                    <Text
                      style={[
                        textStyles.small,
                        { color: colors.textSecondary, lineHeight: 18 },
                      ]}
                    >
                      {b.desc}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Packages Section */}
          <View style={{ padding: spacing.xl, marginTop: spacing.md }}>
            <Text
              style={[
                textStyles.h4,
                { color: colors.text, marginBottom: spacing.xl },
              ]}
            >
              Chọn gói phù hợp
            </Text>
            {PACKAGES.map((pkg) => (
              <PackageCard
                key={pkg.id}
                package={pkg}
                onSelect={() => handleSelectPackage(pkg)}
              />
            ))}
          </View>

          {/* Comparison Table */}
          <View
            style={{
              backgroundColor: colors.card,
              padding: spacing.xl,
              marginTop: spacing.md,
            }}
          >
            <Text
              style={[
                textStyles.h4,
                { color: colors.text, marginBottom: spacing.xl },
              ]}
            >
              So sánh chi tiết
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: colors.divider,
                  borderRadius: radius.md,
                  overflow: "hidden",
                }}
              >
                {/* Header Row */}
                <View
                  style={{
                    flexDirection: "row",
                    borderBottomWidth: 1,
                    borderBottomColor: colors.divider,
                  }}
                >
                  <View
                    style={{
                      width: 120,
                      padding: spacing.lg,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: colors.bgMuted,
                    }}
                  >
                    <Text
                      style={[
                        textStyles.smallBold,
                        { color: colors.text, textAlign: "center" },
                      ]}
                    >
                      Tính năng
                    </Text>
                  </View>
                  {PACKAGES.map((pkg) => (
                    <View
                      key={pkg.id}
                      style={{
                        width: 120,
                        padding: spacing.lg,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: colors.bgMuted,
                      }}
                    >
                      <Text
                        style={[
                          textStyles.smallBold,
                          { color: colors.text, textAlign: "center" },
                        ]}
                      >
                        {pkg.name}
                      </Text>
                    </View>
                  ))}
                </View>
                {/* Feature Rows */}
                {PACKAGES[0].features.map((feature: any, index: number) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      borderBottomWidth: 1,
                      borderBottomColor: colors.divider,
                    }}
                  >
                    <View
                      style={{
                        width: 120,
                        padding: spacing.lg,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={[
                          textStyles.small,
                          { color: colors.textSecondary, textAlign: "center" },
                        ]}
                      >
                        {feature.text}
                      </Text>
                    </View>
                    {PACKAGES.map((pkg) => (
                      <View
                        key={pkg.id}
                        style={{
                          width: 120,
                          padding: spacing.lg,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Ionicons
                          name={
                            pkg.features[index].included
                              ? "checkmark-circle"
                              : "close-circle"
                          }
                          size={20}
                          color={
                            pkg.features[index].included
                              ? colors.primary
                              : colors.divider
                          }
                        />
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* FAQ Section */}
          <View
            style={{
              backgroundColor: colors.card,
              padding: spacing.xl,
              marginTop: spacing.md,
            }}
          >
            <Text
              style={[
                textStyles.h4,
                { color: colors.text, marginBottom: spacing.xl },
              ]}
            >
              Câu hỏi thường gặp
            </Text>
            {[
              {
                q: "Thời gian giám sát một dự án là bao lâu?",
                a: "Thời gian giám sát phụ thuộc vào quy mô công trình, thường từ 3-6 tháng cho nhà ở riêng lẻ.",
              },
              {
                q: "Có thể thay đổi gói dịch vụ giữa chừng không?",
                a: "Có thể nâng cấp gói dịch vụ bất cứ lúc nào, bạn chỉ cần thanh toán phần chênh lệch.",
              },
              {
                q: "Giám sát viên có kinh nghiệm như thế nào?",
                a: "Tất cả giám sát viên đều là kỹ sư xây dựng có tối thiểu 5 năm kinh nghiệm và được đào tạo chuyên sâu.",
              },
            ].map((faq, i) => (
              <View
                key={i}
                style={{
                  marginBottom: spacing.xl,
                  paddingBottom: spacing.xl,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.divider,
                }}
              >
                <Text
                  style={[
                    textStyles.bodySemibold,
                    { color: colors.text, marginBottom: spacing.sm },
                  ]}
                >
                  {faq.q}
                </Text>
                <Text
                  style={[
                    textStyles.small,
                    { color: colors.textSecondary, lineHeight: 20 },
                  ]}
                >
                  {faq.a}
                </Text>
              </View>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* CTA Footer */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: colors.card,
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.lg,
            borderTopWidth: 1,
            borderTopColor: colors.divider,
            ...shadow,
          }}
        >
          <View>
            <Text style={[textStyles.bodySemibold, { color: colors.text }]}>
              Tư vấn miễn phí
            </Text>
            <Text
              style={[
                textStyles.small,
                { color: colors.primary, marginTop: 2 },
              ]}
            >
              Hotline: 1900 123 456
            </Text>
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: spacing.xxl,
              paddingVertical: spacing.md,
              borderRadius: radius.md,
            }}
            onPress={() => {
              setSelectedPackage(PACKAGES[1]);
              setShowBookingModal(true);
            }}
          >
            <Text
              style={[textStyles.bodySemibold, { color: colors.textInverse }]}
            >
              Đăng ký ngay
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              maxHeight: "90%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: spacing.xl,
                borderBottomWidth: 1,
                borderBottomColor: colors.divider,
              }}
            >
              <Text style={[textStyles.h4, { color: colors.text }]}>
                Đăng ký dịch vụ
              </Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: spacing.xl }}>
              {/* Selected Package Info */}
              {selectedPackage && (
                <View style={{ marginBottom: spacing.xxl }}>
                  <Text
                    style={[
                      textStyles.smallBold,
                      { color: colors.textSecondary, marginBottom: spacing.sm },
                    ]}
                  >
                    Gói đã chọn:
                  </Text>
                  <View
                    style={{
                      backgroundColor: colors.primaryBg,
                      borderWidth: 1,
                      borderColor: colors.primary,
                      borderRadius: radius.md,
                      padding: spacing.lg,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={[textStyles.bodySemibold, { color: colors.text }]}
                    >
                      {selectedPackage.name}
                    </Text>
                    <Text
                      style={[
                        textStyles.bodyLarge,
                        { fontWeight: font.weight.bold, color: colors.primary },
                      ]}
                    >
                      {selectedPackage.price}
                    </Text>
                  </View>
                </View>
              )}

              {/* Form Fields */}
              {[
                {
                  label: "Họ và tên",
                  required: true,
                  placeholder: "Nguyễn Văn A",
                  key: "name",
                  keyboard: "default" as const,
                },
                {
                  label: "Số điện thoại",
                  required: true,
                  placeholder: "0901234567",
                  key: "phone",
                  keyboard: "phone-pad" as const,
                },
                {
                  label: "Email",
                  required: false,
                  placeholder: "email@example.com",
                  key: "email",
                  keyboard: "email-address" as const,
                },
              ].map((field) => (
                <View key={field.key} style={{ marginBottom: spacing.xl }}>
                  <Text
                    style={[
                      textStyles.smallBold,
                      { color: colors.text, marginBottom: spacing.sm },
                    ]}
                  >
                    {field.label}{" "}
                    {field.required && (
                      <Text style={{ color: colors.primary }}>*</Text>
                    )}
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: colors.bgInput,
                      borderRadius: radius.md,
                      paddingHorizontal: spacing.lg,
                      paddingVertical: spacing.md,
                      fontSize: 14,
                      color: colors.text,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.textTertiary}
                    keyboardType={field.keyboard}
                    value={(formData as any)[field.key]}
                    onChangeText={(t) =>
                      setFormData({ ...formData, [field.key]: t })
                    }
                  />
                </View>
              ))}

              {/* Address - textarea */}
              <View style={{ marginBottom: spacing.xl }}>
                <Text
                  style={[
                    textStyles.smallBold,
                    { color: colors.text, marginBottom: spacing.sm },
                  ]}
                >
                  Địa chỉ công trình{" "}
                  <Text style={{ color: colors.primary }}>*</Text>
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.bgInput,
                    borderRadius: radius.md,
                    paddingHorizontal: spacing.lg,
                    paddingVertical: spacing.md,
                    fontSize: 14,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.border,
                    height: 80,
                    textAlignVertical: "top",
                  }}
                  placeholder="Địa chỉ đầy đủ"
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={3}
                  value={formData.address}
                  onChangeText={(t) => setFormData({ ...formData, address: t })}
                />
              </View>

              {/* Area + Start Date */}
              <View style={{ marginBottom: spacing.xl }}>
                <Text
                  style={[
                    textStyles.smallBold,
                    { color: colors.text, marginBottom: spacing.sm },
                  ]}
                >
                  Diện tích (m²)
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.bgInput,
                    borderRadius: radius.md,
                    paddingHorizontal: spacing.lg,
                    paddingVertical: spacing.md,
                    fontSize: 14,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                  placeholder="100"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                  value={formData.area}
                  onChangeText={(t) => setFormData({ ...formData, area: t })}
                />
              </View>
              <View style={{ marginBottom: spacing.xl }}>
                <Text
                  style={[
                    textStyles.smallBold,
                    { color: colors.text, marginBottom: spacing.sm },
                  ]}
                >
                  Ngày dự kiến khởi công
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.bgInput,
                    borderRadius: radius.md,
                    paddingHorizontal: spacing.lg,
                    paddingVertical: spacing.md,
                    fontSize: 14,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.startDate}
                  onChangeText={(t) =>
                    setFormData({ ...formData, startDate: t })
                  }
                />
              </View>
              <View style={{ marginBottom: spacing.xl }}>
                <Text
                  style={[
                    textStyles.smallBold,
                    { color: colors.text, marginBottom: spacing.sm },
                  ]}
                >
                  Ghi chú
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.bgInput,
                    borderRadius: radius.md,
                    paddingHorizontal: spacing.lg,
                    paddingVertical: spacing.md,
                    fontSize: 14,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.border,
                    height: 100,
                    textAlignVertical: "top",
                  }}
                  placeholder="Yêu cầu hoặc ghi chú thêm..."
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={4}
                  value={formData.notes}
                  onChangeText={(t) => setFormData({ ...formData, notes: t })}
                />
              </View>

              {/* Submit */}
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  paddingVertical: spacing.lg,
                  borderRadius: radius.md,
                  alignItems: "center",
                  marginBottom: spacing.lg,
                }}
                onPress={handleSubmit}
              >
                <Text
                  style={[
                    textStyles.bodySemibold,
                    { color: colors.textInverse },
                  ]}
                >
                  Gửi đăng ký
                </Text>
              </TouchableOpacity>
              <Text
                style={[
                  textStyles.small,
                  {
                    color: colors.textTertiary,
                    textAlign: "center",
                    marginBottom: spacing.xxl,
                  },
                ]}
              >
                * Thông tin của bạn sẽ được bảo mật tuyệt đối
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
