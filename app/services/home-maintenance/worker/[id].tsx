/**
 * Worker Detail Screen
 * Chi tiết thợ dịch vụ bảo trì nhà
 */

import { DSEmptyState } from "@/components/ds";
import { DSModuleScreen } from "@/components/ds/layouts";
import { useDS } from "@/hooks/useDS";
import {
    SERVICE_WORKERS,
    ServiceWorker,
} from "@/services/api/homeMaintenanceApi";
import { mediumImpact, successNotification } from "@/utils/haptics";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Image,
    Linking,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function WorkerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, radius, font, text: textStyles } = useDS();
  const [worker, setWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    const found = SERVICE_WORKERS.find((w) => w.id === id);
    setWorker(found || null);
  }, [id]);

  const handleCall = () => {
    mediumImpact();
    if (worker?.phone) {
      Linking.openURL(`tel:${worker.phone}`);
    }
  };

  const handleMessage = () => {
    mediumImpact();
    router.push(`/messages/${id}`);
  };

  const handleBooking = () => {
    mediumImpact();
    successNotification();
    Alert.alert(
      "Đặt lịch thành công!",
      `Yêu cầu đặt lịch với ${worker?.name} đã được gửi. Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất.`,
      [{ text: "OK" }],
    );
  };

  if (!worker) {
    return (
      <DSModuleScreen title="Chi tiết thợ">
        <DSEmptyState icon="person-outline" title="Không tìm thấy thông tin" />
      </DSModuleScreen>
    );
  }

  return (
    <>
      <DSModuleScreen
        title="Chi tiết thợ"
        headerRight={
          <TouchableOpacity style={{ padding: spacing.xs }}>
            <Ionicons
              name="share-outline"
              size={24}
              color={colors.textInverse}
            />
          </TouchableOpacity>
        }
      >
        {/* Profile Card */}
        <View
          style={{
            backgroundColor: colors.card,
            alignItems: "center",
            paddingVertical: spacing.xxl,
            paddingHorizontal: spacing.lg,
          }}
        >
          <Image
            source={worker.avatar ? { uri: worker.avatar } : undefined}
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: colors.bgMuted,
              marginBottom: spacing.lg,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.sm,
              marginBottom: spacing.xs,
            }}
          >
            <Text style={[textStyles.h2, { color: colors.text }]}>
              {worker.name}
            </Text>
            {worker.isVerified && (
              <Ionicons name="checkmark-circle" size={20} color={colors.info} />
            )}
          </View>

          <Text
            style={[
              textStyles.body,
              {
                color: colors.textSecondary,
                textAlign: "center",
                marginBottom: spacing.xl,
              },
            ]}
          >
            {worker.specialty}
          </Text>

          {/* Stats */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.bgMuted,
              borderRadius: radius.lg,
              paddingVertical: spacing.lg,
              paddingHorizontal: spacing.xxl,
            }}
          >
            <View style={{ alignItems: "center", flex: 1 }}>
              <Ionicons name="star" size={20} color={colors.warning} />
              <Text
                style={[
                  textStyles.bodySemibold,
                  { color: colors.text, marginTop: spacing.xs },
                ]}
              >
                {worker.rating}
              </Text>
              <Text
                style={[
                  textStyles.badge,
                  { color: colors.textSecondary, marginTop: 2 },
                ]}
              >
                Đánh giá
              </Text>
            </View>
            <View
              style={{
                width: 1,
                height: 40,
                backgroundColor: colors.border,
                marginHorizontal: spacing.lg,
              }}
            />
            <View style={{ alignItems: "center", flex: 1 }}>
              <Ionicons name="chatbubbles" size={20} color={colors.info} />
              <Text
                style={[
                  textStyles.bodySemibold,
                  { color: colors.text, marginTop: spacing.xs },
                ]}
              >
                {worker.reviews}
              </Text>
              <Text
                style={[
                  textStyles.badge,
                  { color: colors.textSecondary, marginTop: 2 },
                ]}
              >
                Nhận xét
              </Text>
            </View>
            <View
              style={{
                width: 1,
                height: 40,
                backgroundColor: colors.border,
                marginHorizontal: spacing.lg,
              }}
            />
            <View style={{ alignItems: "center", flex: 1 }}>
              <Ionicons name="time" size={20} color={colors.success} />
              <Text
                style={[
                  textStyles.bodySemibold,
                  { color: colors.text, marginTop: spacing.xs },
                ]}
              >
                {worker.experience}
              </Text>
              <Text
                style={[
                  textStyles.badge,
                  { color: colors.textSecondary, marginTop: 2 },
                ]}
              >
                Kinh nghiệm
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: spacing.xxl,
            paddingVertical: spacing.xl,
            backgroundColor: colors.card,
            marginTop: spacing.sm,
          }}
        >
          <TouchableOpacity
            style={{ alignItems: "center" }}
            onPress={handleCall}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: spacing.sm,
                backgroundColor: colors.successBg,
              }}
            >
              <Ionicons name="call" size={22} color={colors.success} />
            </View>
            <Text
              style={[
                textStyles.badge,
                { color: colors.textSecondary, fontWeight: "500" },
              ]}
            >
              Gọi điện
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ alignItems: "center" }}
            onPress={handleMessage}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: spacing.sm,
                backgroundColor: colors.infoBg,
              }}
            >
              <Ionicons name="chatbubble" size={22} color={colors.info} />
            </View>
            <Text
              style={[
                textStyles.badge,
                { color: colors.textSecondary, fontWeight: "500" },
              ]}
            >
              Nhắn tin
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ alignItems: "center" }}>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: spacing.sm,
                backgroundColor: colors.warningBg,
              }}
            >
              <Ionicons name="bookmark" size={22} color={colors.warning} />
            </View>
            <Text
              style={[
                textStyles.badge,
                { color: colors.textSecondary, fontWeight: "500" },
              ]}
            >
              Lưu
            </Text>
          </TouchableOpacity>
        </View>

        {/* Services */}
        {worker.services && worker.services.length > 0 && (
          <View
            style={{
              backgroundColor: colors.card,
              marginTop: spacing.sm,
              paddingVertical: spacing.lg,
              paddingHorizontal: spacing.lg,
            }}
          >
            <Text
              style={[
                textStyles.sectionTitle,
                { color: colors.text, marginBottom: spacing.md },
              ]}
            >
              Dịch vụ cung cấp
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: spacing.sm,
              }}
            >
              {worker.services.map((service, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: colors.successBg,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderRadius: radius.full,
                    gap: spacing.xs,
                  }}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color={colors.success}
                  />
                  <Text
                    style={[
                      textStyles.badge,
                      { color: colors.success, fontWeight: "500" },
                    ]}
                  >
                    {service}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Price */}
        {worker.price && (
          <View
            style={{
              backgroundColor: colors.card,
              marginTop: spacing.sm,
              paddingVertical: spacing.lg,
              paddingHorizontal: spacing.lg,
            }}
          >
            <Text
              style={[
                textStyles.sectionTitle,
                { color: colors.text, marginBottom: spacing.md },
              ]}
            >
              Bảng giá tham khảo
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.infoBg,
                padding: spacing.lg,
                borderRadius: radius.lg,
                marginBottom: spacing.sm,
              }}
            >
              <Ionicons name="pricetag" size={24} color={colors.info} />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "baseline",
                  marginLeft: spacing.md,
                }}
              >
                <Text style={[textStyles.h3, { color: colors.info }]}>
                  {worker.price.min.toLocaleString("vi-VN")}đ -{" "}
                  {worker.price.max.toLocaleString("vi-VN")}đ
                </Text>
                <Text
                  style={[
                    textStyles.body,
                    { color: colors.info, marginLeft: spacing.xs },
                  ]}
                >
                  /{worker.price.unit}
                </Text>
              </View>
            </View>
            <Text
              style={[
                textStyles.badge,
                { color: colors.textTertiary, fontStyle: "italic" },
              ]}
            >
              * Giá có thể thay đổi tùy theo độ phức tạp của công việc
            </Text>
          </View>
        )}

        {/* Reviews Preview */}
        <View
          style={{
            backgroundColor: colors.card,
            marginTop: spacing.sm,
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.lg,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: spacing.md,
            }}
          >
            <Text style={[textStyles.sectionTitle, { color: colors.text }]}>
              Đánh giá ({worker.reviews})
            </Text>
            <TouchableOpacity>
              <Text
                style={[
                  textStyles.bodySemibold,
                  { color: colors.primary, fontSize: font.size.sm },
                ]}
              >
                Xem tất cả
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              backgroundColor: colors.bgMuted,
              borderRadius: radius.lg,
              padding: spacing.md,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: spacing.sm,
              }}
            >
              <Image
                source={{ uri: "https://i.pravatar.cc/100?img=10" }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  marginRight: spacing.sm,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    textStyles.bodySemibold,
                    { color: colors.text, fontSize: font.size.sm },
                  ]}
                >
                  Nguyễn Thị Mai
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 2,
                    marginTop: 2,
                  }}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name="star"
                      size={12}
                      color={colors.warning}
                    />
                  ))}
                  <Text
                    style={[
                      textStyles.badge,
                      { color: colors.textSecondary, marginLeft: spacing.sm },
                    ]}
                  >
                    2 ngày trước
                  </Text>
                </View>
              </View>
            </View>
            <Text
              style={[
                textStyles.body,
                {
                  color: colors.textSecondary,
                  fontSize: font.size.sm,
                  lineHeight: 20,
                },
              ]}
            >
              Thợ làm việc rất chuyên nghiệp, nhanh chóng và giá cả hợp lý. Sẽ
              tiếp tục sử dụng dịch vụ!
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </DSModuleScreen>

      {/* Bottom CTA */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.card,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: spacing.xxl,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.primary,
            paddingVertical: spacing.md,
            borderRadius: radius.lg,
            gap: spacing.sm,
          }}
          onPress={handleBooking}
          activeOpacity={0.85}
        >
          <Ionicons name="calendar" size={20} color={colors.textInverse} />
          <Text
            style={[
              textStyles.bodySemibold,
              { color: colors.textInverse, fontSize: font.size.md },
            ]}
          >
            Đặt lịch ngay
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
