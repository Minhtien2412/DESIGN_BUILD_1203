import { useUnifiedMessaging } from "@/hooks/crm/useUnifiedMessaging";
import { useDS } from "@/hooks/useDS";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Linking,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const PERMIT_STEPS = [
  {
    id: 1,
    title: "Chuẩn bị hồ sơ",
    duration: "1-2 tuần",
    status: "completed",
    description: "Thu thập và chuẩn bị đầy đủ giấy tờ cần thiết",
    details: [
      "Đơn xin phép xây dựng (theo mẫu)",
      "Bản vẽ thiết kế kiến trúc (bản chính)",
      "Giấy tờ về quyền sử dụng đất",
      "Giấy phép khác (nếu có)",
    ],
    documents: [
      { name: "Mẫu đơn xin phép.pdf", size: "2.5 MB" },
      { name: "Hướng dẫn chuẩn bị hồ sơ.docx", size: "1.2 MB" },
    ],
  },
  {
    id: 2,
    title: "Nộp hồ sơ",
    duration: "1-3 ngày",
    status: "active",
    description: "Nộp hồ sơ tại Phòng Quản lý đô thị hoặc Sở Xây dựng",
    details: [
      "Nộp trực tiếp tại cơ quan có thẩm quyền",
      "Hoặc nộp online qua Cổng dịch vụ công",
      "Nhận biên nhận và mã hồ sơ",
      "Theo dõi tiến độ xử lý",
    ],
    documents: [
      { name: "Danh sách cơ quan tiếp nhận.pdf", size: "0.8 MB" },
      { name: "Hướng dẫn nộp online.pdf", size: "1.5 MB" },
    ],
  },
  {
    id: 3,
    title: "Thẩm định",
    duration: "20-30 ngày",
    status: "pending",
    description: "Cơ quan có thẩm quyền thẩm định hồ sơ",
    details: [
      "Kiểm tra tính hợp lệ của hồ sơ",
      "Thẩm định thiết kế về quy hoạch, PCCC",
      "Yêu cầu bổ sung hồ sơ (nếu cần)",
      "Khảo sát thực địa (nếu cần)",
    ],
    documents: [],
  },
  {
    id: 4,
    title: "Phê duyệt",
    duration: "5-7 ngày",
    status: "pending",
    description: "Ban hành giấy phép xây dựng",
    details: [
      "Nhận thông báo kết quả",
      "Đóng phí cấp giấy phép",
      "Nhận giấy phép xây dựng",
      "Bắt đầu triển khai thi công",
    ],
    documents: [{ name: "Biểu phí giấy phép.pdf", size: "0.5 MB" }],
  },
];

const PERMIT_TYPES = [
  {
    id: 1,
    title: "Nhà ở riêng lẻ",
    description: "Dưới 7 tầng, diện tích < 250m²",
    icon: "home-outline",
  },
  {
    id: 2,
    title: "Nhà ở liên kế",
    description: "Nhà phố, liền kề",
    icon: "business-outline",
  },
  {
    id: 3,
    title: "Công trình lớn",
    description: "Từ 7 tầng trở lên, công trình công cộng",
    icon: "business",
  },
  {
    id: 4,
    title: "Sửa chữa, cải tạo",
    description: "Thay đổi kết cấu, nâng tầng",
    icon: "construct-outline",
  },
];

const FAQ_ITEMS = [
  {
    id: 1,
    question: "Những trường hợp nào cần xin phép xây dựng?",
    answer:
      "Tất cả công trình xây dựng mới, sửa chữa nâng tầng hoặc cải tạo có thay đổi kết cấu đều cần xin phép theo Luật Xây dựng 2014.",
  },
  {
    id: 2,
    question: "Thời gian cấp giấy phép mất bao lâu?",
    answer:
      "Tùy loại công trình: Nhà ở riêng lẻ 20-30 ngày, công trình lớn 30-45 ngày kể từ ngày nhận đủ hồ sơ hợp lệ.",
  },
  {
    id: 3,
    question: "Chi phí xin phép là bao nhiêu?",
    answer:
      "Phí cấp giấy phép: 50.000-500.000đ tùy quy mô. Chi phí làm hồ sơ thiết kế: 5-15 triệu đồng.",
  },
  {
    id: 4,
    question: "Nếu không xin phép có bị xử phạt không?",
    answer:
      "Có. Phạt từ 50-100 triệu đồng hoặc buộc tháo dỡ công trình theo Nghị định 139/2017/NĐ-CP.",
  },
];

interface TimelineStepProps {
  step: any;
  isLast: boolean;
}

const TimelineStep: React.FC<TimelineStepProps> = ({ step, isLast }) => {
  const [expanded, setExpanded] = useState(step.status === "active");
  const { colors, spacing, radius, text } = useDS();

  const getStatusColor = () => {
    switch (step.status) {
      case "completed":
      case "active":
        return colors.primary;
      default:
        return colors.divider;
    }
  };

  const getStatusIcon = () => {
    switch (step.status) {
      case "completed":
        return "checkmark-circle";
      case "active":
        return "radio-button-on";
      default:
        return "radio-button-off-outline";
    }
  };

  return (
    <View style={{ flexDirection: "row", marginBottom: spacing.md }}>
      <View style={{ width: 40, alignItems: "center" }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: getStatusColor(),
          }}
        >
          <Ionicons
            name={getStatusIcon()}
            size={24}
            color={colors.textInverse}
          />
        </View>
        {!isLast && (
          <View
            style={{
              width: 2,
              flex: 1,
              marginTop: 4,
              backgroundColor: getStatusColor(),
            }}
          />
        )}
      </View>

      <View style={{ flex: 1, marginLeft: spacing.sm }}>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: colors.bgMuted,
            padding: spacing.sm,
            borderRadius: radius.md,
          }}
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.7}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={[
                text.bodySemibold,
                { color: colors.text, marginBottom: 6 },
              ]}
            >
              {step.title}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="time-outline"
                size={12}
                color={colors.textSecondary}
              />
              <Text
                style={[
                  text.small,
                  { color: colors.textSecondary, marginLeft: 4 },
                ]}
              >
                {step.duration}
              </Text>
            </View>
          </View>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.textTertiary}
          />
        </TouchableOpacity>

        {expanded && (
          <View style={{ marginTop: spacing.sm }}>
            <Text
              style={[
                text.body,
                {
                  color: colors.textSecondary,
                  marginBottom: spacing.sm,
                  lineHeight: 20,
                },
              ]}
            >
              {step.description}
            </Text>

            <View style={{ marginBottom: spacing.sm }}>
              {step.details.map((detail: string, idx: number) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    marginBottom: spacing.xs,
                  }}
                >
                  <Ionicons name="checkmark" size={16} color={colors.primary} />
                  <Text
                    style={[
                      text.small,
                      {
                        color: colors.text,
                        marginLeft: spacing.xs,
                        flex: 1,
                        lineHeight: 20,
                      },
                    ]}
                  >
                    {detail}
                  </Text>
                </View>
              ))}
            </View>

            {step.documents.length > 0 && (
              <View
                style={{
                  backgroundColor: colors.bgMuted,
                  padding: spacing.sm,
                  borderRadius: radius.md,
                }}
              >
                <Text
                  style={[
                    text.smallBold,
                    { color: colors.text, marginBottom: spacing.xs },
                  ]}
                >
                  Tài liệu tham khảo:
                </Text>
                {step.documents.map((doc: any, idx: number) => (
                  <TouchableOpacity
                    key={idx}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: colors.card,
                      padding: spacing.sm,
                      borderRadius: radius.md,
                      marginBottom: spacing.xs,
                    }}
                  >
                    <Ionicons
                      name="document-text"
                      size={20}
                      color={colors.primary}
                    />
                    <View style={{ flex: 1, marginLeft: spacing.sm }}>
                      <Text
                        style={[
                          text.small,
                          {
                            color: colors.text,
                            fontWeight: "500",
                            marginBottom: 2,
                          },
                        ]}
                      >
                        {doc.name}
                      </Text>
                      <Text
                        style={[
                          text.small,
                          { color: colors.textTertiary, fontSize: 11 },
                        ]}
                      >
                        {doc.size}
                      </Text>
                    </View>
                    <Ionicons
                      name="download-outline"
                      size={20}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default function PermitScreen() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isConsulting, setIsConsulting] = useState(false);
  const { colors, spacing, radius, text } = useDS();

  const { getOrCreateConversation } = useUnifiedMessaging();

  const handleConsultation = async () => {
    try {
      setIsConsulting(true);
      const conversationId = await getOrCreateConversation({
        userId: 999,
        userName: "Tư vấn Xin phép xây dựng",
        userRole: "PERMIT_SUPPORT",
      });
      router.push(
        `/messages/chat/${conversationId}` as `/messages/chat/${string}`,
      );
    } catch (error) {
      console.error("Error creating conversation:", error);
      Linking.openURL("tel:1900xxxx");
    } finally {
      setIsConsulting(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Xin phép xây dựng",
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.textInverse,
          headerTitleStyle: { fontWeight: "600" },
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bgMuted }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Info */}
        <View
          style={{
            backgroundColor: colors.card,
            padding: spacing.lg,
            alignItems: "center",
            marginBottom: spacing.sm,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: colors.primaryBg,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: spacing.md,
            }}
          >
            <Ionicons name="document-text" size={32} color={colors.primary} />
          </View>
          <Text
            style={[
              text.h4,
              {
                color: colors.text,
                marginBottom: spacing.xs,
                textAlign: "center",
              },
            ]}
          >
            Quy trình xin giấy phép xây dựng
          </Text>
          <Text
            style={[
              text.body,
              {
                color: colors.textSecondary,
                textAlign: "center",
                lineHeight: 20,
              },
            ]}
          >
            Hướng dẫn chi tiết 4 bước để xin giấy phép xây dựng hợp pháp
          </Text>
        </View>

        {/* Permit Types */}
        <View
          style={{
            backgroundColor: colors.card,
            padding: spacing.md,
            marginBottom: spacing.sm,
          }}
        >
          <Text
            style={[text.h4, { color: colors.text, marginBottom: spacing.md }]}
          >
            Loại giấy phép
          </Text>
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}
          >
            {PERMIT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={{
                  width: "48%",
                  backgroundColor: colors.bgMuted,
                  borderRadius: radius.lg,
                  padding: spacing.md,
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: colors.primaryBg,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: spacing.sm,
                  }}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <Text
                  style={[
                    text.bodySemibold,
                    {
                      color: colors.text,
                      marginBottom: 4,
                      textAlign: "center",
                      fontSize: 14,
                    },
                  ]}
                >
                  {type.title}
                </Text>
                <Text
                  style={[
                    text.small,
                    {
                      color: colors.textTertiary,
                      textAlign: "center",
                      lineHeight: 16,
                      fontSize: 11,
                    },
                  ]}
                >
                  {type.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Timeline */}
        <View
          style={{
            backgroundColor: colors.card,
            padding: spacing.md,
            marginBottom: spacing.sm,
          }}
        >
          <Text
            style={[text.h4, { color: colors.text, marginBottom: spacing.md }]}
          >
            Quy trình chi tiết
          </Text>
          <View style={{ paddingTop: spacing.xs }}>
            {PERMIT_STEPS.map((step, index) => (
              <TimelineStep
                key={step.id}
                step={step}
                isLast={index === PERMIT_STEPS.length - 1}
              />
            ))}
          </View>
        </View>

        {/* FAQ */}
        <View
          style={{
            backgroundColor: colors.card,
            padding: spacing.md,
            marginBottom: spacing.sm,
          }}
        >
          <Text
            style={[text.h4, { color: colors.text, marginBottom: spacing.md }]}
          >
            Câu hỏi thường gặp
          </Text>
          {FAQ_ITEMS.map((faq) => (
            <TouchableOpacity
              key={faq.id}
              style={{
                backgroundColor: colors.bgMuted,
                borderRadius: radius.md,
                padding: spacing.sm,
                marginBottom: spacing.xs,
              }}
              onPress={() =>
                setExpandedFaq(expandedFaq === faq.id ? null : faq.id)
              }
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="help-circle" size={20} color={colors.primary} />
                <Text
                  style={[
                    text.bodySemibold,
                    {
                      flex: 1,
                      color: colors.text,
                      marginLeft: spacing.xs,
                      marginRight: spacing.xs,
                      lineHeight: 20,
                      fontSize: 14,
                    },
                  ]}
                >
                  {faq.question}
                </Text>
                <Ionicons
                  name={expandedFaq === faq.id ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={colors.textTertiary}
                />
              </View>
              {expandedFaq === faq.id && (
                <Text
                  style={[
                    text.small,
                    {
                      color: colors.textSecondary,
                      marginTop: spacing.xs,
                      marginLeft: 28,
                      lineHeight: 20,
                    },
                  ]}
                >
                  {faq.answer}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA */}
        <View
          style={{
            backgroundColor: colors.card,
            padding: spacing.lg,
            alignItems: "center",
            marginBottom: spacing.sm,
          }}
        >
          <Text
            style={[text.h4, { color: colors.text, marginBottom: spacing.xs }]}
          >
            Cần hỗ trợ tư vấn?
          </Text>
          <Text
            style={[
              text.body,
              {
                color: colors.textSecondary,
                textAlign: "center",
                marginBottom: spacing.lg,
                lineHeight: 20,
              },
            ]}
          >
            Đội ngũ chuyên gia sẵn sàng tư vấn và hỗ trợ bạn hoàn thiện hồ sơ
          </Text>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.primary,
              paddingHorizontal: 32,
              paddingVertical: 14,
              borderRadius: radius.md,
            }}
            onPress={handleConsultation}
            disabled={isConsulting}
          >
            {isConsulting ? (
              <ActivityIndicator size="small" color={colors.textInverse} />
            ) : (
              <>
                <Ionicons
                  name="chatbubble-ellipses"
                  size={20}
                  color={colors.textInverse}
                />
                <Text
                  style={[
                    text.bodySemibold,
                    { color: colors.textInverse, marginLeft: spacing.xs },
                  ]}
                >
                  Liên hệ tư vấn ngay
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </>
  );
}
