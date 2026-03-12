/**
 * Design Process & Payment Screen
 * Quy trình thiết kế - Thanh toán
 */

import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
} from "@/constants/modern-minimal-styles";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import { useCallback, useState } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Design process steps
const PROCESS_STEPS = [
  {
    id: 1,
    title: "Tư vấn & Khảo sát",
    description: "Gặp gỡ, trao đổi yêu cầu và khảo sát thực địa",
    duration: "1-2 ngày",
    payment: 0,
    status: "completed",
    icon: "chatbubbles-outline",
  },
  {
    id: 2,
    title: "Ký hợp đồng",
    description: "Thống nhất phương án và ký hợp đồng thiết kế",
    duration: "1 ngày",
    payment: 30,
    status: "completed",
    icon: "document-text-outline",
  },
  {
    id: 3,
    title: "Thiết kế phương án",
    description: "Lên phương án thiết kế sơ bộ và bản vẽ 3D",
    duration: "7-14 ngày",
    payment: 0,
    status: "current",
    icon: "color-palette-outline",
  },
  {
    id: 4,
    title: "Chỉnh sửa & Hoàn thiện",
    description: "Điều chỉnh theo yêu cầu và hoàn thiện bản vẽ",
    duration: "5-7 ngày",
    payment: 40,
    status: "pending",
    icon: "create-outline",
  },
  {
    id: 5,
    title: "Bàn giao hồ sơ",
    description: "Bàn giao toàn bộ hồ sơ thiết kế và hướng dẫn",
    duration: "1-2 ngày",
    payment: 30,
    status: "pending",
    icon: "folder-open-outline",
  },
];

// Payment milestones
const PAYMENT_MILESTONES = [
  { label: "Đợt 1 - Ký HĐ", percent: 30, paid: true },
  { label: "Đợt 2 - Hoàn thiện", percent: 40, paid: false },
  { label: "Đợt 3 - Bàn giao", percent: 30, paid: false },
];

export default function DesignProcessScreen() {
  const insets = useSafeAreaInsets();
  const [activeStep, setActiveStep] = useState(2); // Current step (0-indexed)

  const handleBack = useCallback(() => router.back(), []);

  const handleStepPress = useCallback((index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveStep(index);
  }, []);

  const handleOpenKTSForm = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/consultation/kts-form");
  }, []);

  const handleMakePayment = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/checkout" as any);
  }, []);

  const getStepStatus = (step: (typeof PROCESS_STEPS)[0]) => {
    if (step.status === "completed")
      return { color: "#22c55e", icon: "checkmark-circle" };
    if (step.status === "current")
      return { color: MODERN_COLORS.primary, icon: "ellipse" };
    return { color: MODERN_COLORS.textDisabled, icon: "ellipse-outline" };
  };

  const totalPaid = PAYMENT_MILESTONES.filter((m) => m.paid).reduce(
    (sum, m) => sum + m.percent,
    0,
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={MODERN_COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quy trình thiết kế - Thanh toán</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Progress Overview */}
        <View style={styles.progressCard}>
          <LinearGradient
            colors={[MODERN_COLORS.primary, "#16a34a"]}
            style={styles.progressGradient}
          >
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Tiến độ dự án</Text>
              <Text style={styles.progressPercent}>
                {Math.round(
                  (PROCESS_STEPS.filter((s) => s.status === "completed")
                    .length /
                    PROCESS_STEPS.length) *
                    100,
                )}
                %
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(PROCESS_STEPS.filter((s) => s.status === "completed").length / PROCESS_STEPS.length) * 100}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.progressStats}>
              <View style={styles.progressStat}>
                <Text style={styles.progressStatValue}>
                  {PROCESS_STEPS.filter((s) => s.status === "completed").length}
                  /{PROCESS_STEPS.length}
                </Text>
                <Text style={styles.progressStatLabel}>Bước hoàn thành</Text>
              </View>
              <View style={styles.progressStat}>
                <Text style={styles.progressStatValue}>{totalPaid}%</Text>
                <Text style={styles.progressStatLabel}>Đã thanh toán</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* KTS Section - Hidden from customer note */}
        <TouchableOpacity style={styles.ktsCard} onPress={handleOpenKTSForm}>
          <View style={styles.ktsCardLeft}>
            <View style={styles.ktsIconContainer}>
              <Ionicons
                name="construct"
                size={24}
                color={MODERN_COLORS.primary}
              />
            </View>
            <View style={styles.ktsCardText}>
              <Text style={styles.ktsCardTitle}>Form báo giá KTS</Text>
              <Text style={styles.ktsCardSubtitle}>Tạo báo giá chi tiết</Text>
            </View>
          </View>
          <View style={styles.ktsHiddenBadge}>
            <Ionicons name="eye-off" size={14} color="#f59e0b" />
            <Text style={styles.ktsHiddenText}>Ẩn với KH</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={MODERN_COLORS.textSecondary}
          />
        </TouchableOpacity>

        {/* Process Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Các bước thực hiện</Text>

          {PROCESS_STEPS.map((step, index) => {
            const status = getStepStatus(step);
            const isLast = index === PROCESS_STEPS.length - 1;

            return (
              <TouchableOpacity
                key={step.id}
                style={styles.stepItem}
                onPress={() => handleStepPress(index)}
              >
                {/* Timeline Line */}
                {!isLast && (
                  <View
                    style={[
                      styles.stepLine,
                      step.status === "completed" && styles.stepLineCompleted,
                    ]}
                  />
                )}

                {/* Step Indicator */}
                <View
                  style={[
                    styles.stepIndicator,
                    { backgroundColor: status.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={status.icon as any}
                    size={20}
                    color={status.color}
                  />
                </View>

                {/* Step Content */}
                <View style={styles.stepContent}>
                  <View style={styles.stepHeader}>
                    <Text
                      style={[
                        styles.stepTitle,
                        step.status === "completed" &&
                          styles.stepTitleCompleted,
                      ]}
                    >
                      {step.title}
                    </Text>
                    {step.payment > 0 && (
                      <View style={styles.paymentBadge}>
                        <Text style={styles.paymentBadgeText}>
                          {step.payment}%
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                  <View style={styles.stepMeta}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={MODERN_COLORS.textSecondary}
                    />
                    <Text style={styles.stepDuration}>{step.duration}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Payment Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lịch thanh toán</Text>

          <View style={styles.paymentList}>
            {PAYMENT_MILESTONES.map((milestone, index) => (
              <View key={index} style={styles.paymentItem}>
                <View style={styles.paymentItemLeft}>
                  <View
                    style={[
                      styles.paymentCheck,
                      milestone.paid && styles.paymentCheckPaid,
                    ]}
                  >
                    {milestone.paid && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                  <View>
                    <Text style={styles.paymentLabel}>{milestone.label}</Text>
                    <Text style={styles.paymentValue}>
                      {milestone.percent}%
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.paymentStatus,
                    milestone.paid && styles.paymentStatusPaid,
                  ]}
                >
                  <Text
                    style={[
                      styles.paymentStatusText,
                      milestone.paid && styles.paymentStatusTextPaid,
                    ]}
                  >
                    {milestone.paid ? "Đã thanh toán" : "Chưa thanh toán"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomLabel}>Thanh toán đợt tiếp theo</Text>
          <Text style={styles.bottomValue}>40% - 8,000,000 đ</Text>
        </View>
        <TouchableOpacity style={styles.payBtn} onPress={handleMakePayment}>
          <LinearGradient
            colors={[MODERN_COLORS.primary, "#16a34a"]}
            style={styles.payBtnGradient}
          >
            <Text style={styles.payBtnText}>Thanh toán</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.md,
    paddingBottom: MODERN_SPACING.md,
    backgroundColor: MODERN_COLORS.surface,
    ...MODERN_SHADOWS.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: MODERN_COLORS.text,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: MODERN_SPACING.md,
    paddingHorizontal: MODERN_SPACING.md,
  },

  // Progress Card
  progressCard: {
    borderRadius: MODERN_RADIUS.lg,
    overflow: "hidden",
    marginBottom: MODERN_SPACING.md,
    ...MODERN_SHADOWS.md,
  },
  progressGradient: {
    padding: MODERN_SPACING.lg,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: MODERN_SPACING.md,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
    marginBottom: MODERN_SPACING.md,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: "row",
    gap: MODERN_SPACING.xl,
  },
  progressStat: {},
  progressStatValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  progressStatLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },

  // KTS Card
  ktsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    padding: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.lg,
    marginBottom: MODERN_SPACING.md,
    ...MODERN_SHADOWS.sm,
  },
  ktsCardLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.md,
  },
  ktsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${MODERN_COLORS.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  ktsCardText: {},
  ktsCardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },
  ktsCardSubtitle: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    marginTop: 2,
  },
  ktsHiddenBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: MODERN_RADIUS.sm,
    marginRight: MODERN_SPACING.sm,
  },
  ktsHiddenText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#92400e",
  },

  // Section
  section: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.md,
    ...MODERN_SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.md,
  },

  // Step Items
  stepItem: {
    flexDirection: "row",
    marginBottom: MODERN_SPACING.md,
    position: "relative",
  },
  stepLine: {
    position: "absolute",
    left: 19,
    top: 44,
    bottom: -16,
    width: 2,
    backgroundColor: MODERN_COLORS.divider,
  },
  stepLineCompleted: {
    backgroundColor: "#22c55e",
  },
  stepIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: MODERN_SPACING.md,
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: MODERN_COLORS.text,
    flex: 1,
  },
  stepTitleCompleted: {
    color: "#22c55e",
  },
  paymentBadge: {
    backgroundColor: `${MODERN_COLORS.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: MODERN_RADIUS.sm,
  },
  paymentBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: MODERN_COLORS.primary,
  },
  stepDescription: {
    fontSize: 13,
    color: MODERN_COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  stepMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  stepDuration: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
  },

  // Payment List
  paymentList: {
    gap: MODERN_SPACING.sm,
  },
  paymentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.md,
  },
  paymentItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.md,
  },
  paymentCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: MODERN_COLORS.divider,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentCheckPaid: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  paymentLabel: {
    fontSize: 13,
    color: MODERN_COLORS.textSecondary,
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: "700",
    color: MODERN_COLORS.text,
  },
  paymentStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.divider,
  },
  paymentStatusPaid: {
    backgroundColor: "#dcfce7",
  },
  paymentStatusText: {
    fontSize: 11,
    fontWeight: "600",
    color: MODERN_COLORS.textSecondary,
  },
  paymentStatusTextPaid: {
    color: "#22c55e",
  },

  // Bottom Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.md,
    paddingHorizontal: MODERN_SPACING.md,
    paddingTop: MODERN_SPACING.md,
    backgroundColor: MODERN_COLORS.surface,
    ...MODERN_SHADOWS.lg,
  },
  bottomInfo: {
    flex: 1,
  },
  bottomLabel: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
  },
  bottomValue: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_COLORS.primary,
  },
  payBtn: {
    borderRadius: MODERN_RADIUS.md,
    overflow: "hidden",
  },
  payBtnGradient: {
    paddingHorizontal: MODERN_SPACING.xl,
    paddingVertical: 14,
  },
  payBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});
