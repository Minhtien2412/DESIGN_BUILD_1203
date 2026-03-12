/**
 * CheckoutStepTemplate - Reusable Step Layout for Checkout & Service Flows
 * Created: 06/06/2025
 *
 * EU/VN Standards Checkout Step Template
 * - Consistent header, progress, footer across all checkout flows
 * - Reusable for Product checkout, Service booking, Worker booking, etc.
 * - Built-in security indicators, back navigation, sticky footer
 *
 * Usage:
 * <CheckoutStepTemplate
 *   currentStep={2}
 *   totalSteps={4}
 *   stepLabels={['Địa chỉ', 'Vận chuyển', 'Thanh toán', 'Xác nhận']}
 *   title="Phương thức vận chuyển"
 *   subtitle="Chọn cách giao hàng phù hợp"
 *   onBack={() => goBack()}
 *   footer={<FooterContent />}
 *   securityBadge
 * >
 *   {children}
 * </CheckoutStepTemplate>
 */

import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
    MODERN_TYPOGRAPHY,
} from "@/constants/modern-theme";
import { Ionicons } from "@expo/vector-icons";
import React, { ReactNode } from "react";
import {
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export interface CheckoutStepTemplateProps {
  /** Current step index (1-based) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Labels for each step */
  stepLabels: string[];
  /** Step title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Step content */
  children: ReactNode;
  /** Back button handler. If null, back button hidden */
  onBack?: (() => void) | null;
  /** Sticky footer content (buttons, summary bar) */
  footer?: ReactNode;
  /** Show security/SSL badge at bottom */
  securityBadge?: boolean;
  /** Show pull-to-refresh */
  refreshing?: boolean;
  /** Pull-to-refresh handler */
  onRefresh?: () => void;
  /** Header title override (default: "Thanh toán") */
  headerTitle?: string;
  /** Show header close button instead of back */
  showClose?: boolean;
  /** Close button handler */
  onClose?: () => void;
  /** Optional info banner below progress */
  infoBanner?: ReactNode;
}

export default function CheckoutStepTemplate({
  currentStep,
  totalSteps,
  stepLabels,
  title,
  subtitle,
  children,
  onBack,
  footer,
  securityBadge = true,
  refreshing = false,
  onRefresh,
  headerTitle = "Thanh toán",
  showClose = false,
  onClose,
  infoBanner,
}: CheckoutStepTemplateProps) {
  // ── Progress Bar ──────────────────────────────────────────
  const renderProgress = () => (
    <View style={styles.progressContainer}>
      {/* Step indicators */}
      <View style={styles.progressRow}>
        {stepLabels.map((label, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          const isUpcoming = stepNum > currentStep;

          return (
            <React.Fragment key={label}>
              {index > 0 && (
                <View
                  style={[
                    styles.progressLine,
                    isCompleted && styles.progressLineCompleted,
                    isActive && styles.progressLineActive,
                  ]}
                />
              )}
              <View style={styles.progressStepCol}>
                <View
                  style={[
                    styles.progressCircle,
                    isCompleted && styles.progressCircleCompleted,
                    isActive && styles.progressCircleActive,
                    isUpcoming && styles.progressCircleUpcoming,
                  ]}
                >
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  ) : (
                    <Text
                      style={[
                        styles.progressNum,
                        isActive && styles.progressNumActive,
                      ]}
                    >
                      {stepNum}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.progressLabel,
                    isCompleted && styles.progressLabelCompleted,
                    isActive && styles.progressLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </View>
            </React.Fragment>
          );
        })}
      </View>

      {/* Step fraction */}
      <Text style={styles.stepFraction}>
        Bước {currentStep}/{totalSteps}
      </Text>
    </View>
  );

  // ── Security Badge ────────────────────────────────────────
  const renderSecurityBadge = () => (
    <View style={styles.securityRow}>
      <Ionicons
        name="shield-checkmark"
        size={14}
        color={MODERN_COLORS.success}
      />
      <Text style={styles.securityText}>
        Thanh toán được bảo mật bởi SSL 256-bit
      </Text>
      <Ionicons name="lock-closed" size={12} color={MODERN_COLORS.success} />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ── Header ─────────────────────────────────────────── */}
      <View style={styles.header}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={22} color={MODERN_COLORS.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerBtn} />
        )}

        <Text style={styles.headerTitle}>{headerTitle}</Text>

        {showClose && onClose ? (
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Ionicons name="close" size={22} color={MODERN_COLORS.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerBtn} />
        )}
      </View>

      {/* ── Progress ───────────────────────────────────────── */}
      {renderProgress()}

      {/* ── Info Banner ─────────────────────────────────────── */}
      {infoBanner}

      {/* ── Scrollable Content ─────────────────────────────── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={MODERN_COLORS.primary}
            />
          ) : undefined
        }
      >
        {/* Step Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.stepTitle}>{title}</Text>
          {subtitle && <Text style={styles.stepSubtitle}>{subtitle}</Text>}
        </View>

        {/* Step Body */}
        {children}

        {/* Security Badge inside scroll */}
        {securityBadge && renderSecurityBadge()}

        {/* Bottom padding for footer */}
        <View style={{ height: footer ? 100 : 20 }} />
      </ScrollView>

      {/* ── Sticky Footer ──────────────────────────────────── */}
      {footer && <View style={styles.footer}>{footer}</View>}
    </View>
  );
}

// ── Reusable sub-components ─────────────────────────────────

/** Section card with optional title and "Change" link */
export function CheckoutSection({
  title,
  onEdit,
  editLabel = "Thay đổi",
  children,
  style,
}: {
  title?: string;
  onEdit?: () => void;
  editLabel?: string;
  children: ReactNode;
  style?: object;
}) {
  return (
    <View style={[sectionStyles.wrapper, style]}>
      {(title || onEdit) && (
        <View style={sectionStyles.header}>
          {title && <Text style={sectionStyles.title}>{title}</Text>}
          {onEdit && (
            <TouchableOpacity onPress={onEdit}>
              <Text style={sectionStyles.editLink}>{editLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <View style={sectionStyles.body}>{children}</View>
    </View>
  );
}

/** Summary row (label — value) */
export function SummaryRow({
  label,
  value,
  bold,
  accent,
  strikethrough,
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: boolean;
  strikethrough?: boolean;
}) {
  return (
    <View style={summaryStyles.row}>
      <Text style={[summaryStyles.label, bold && summaryStyles.labelBold]}>
        {label}
      </Text>
      <Text
        style={[
          summaryStyles.value,
          bold && summaryStyles.valueBold,
          accent && summaryStyles.valueAccent,
          strikethrough && summaryStyles.valueStrike,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

/** Divider line */
export function CheckoutDivider() {
  return <View style={dividerStyles.line} />;
}

/** Radio option card */
export function RadioCard({
  selected,
  onPress,
  children,
  disabled,
}: {
  selected: boolean;
  onPress: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        radioStyles.card,
        selected && radioStyles.cardSelected,
        disabled && radioStyles.cardDisabled,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={styles.radioRow}>
        <View style={[radioStyles.radio, selected && radioStyles.radioActive]}>
          {selected && <View style={radioStyles.radioDot} />}
        </View>
        <View style={radioStyles.content}>{children}</View>
      </View>
    </TouchableOpacity>
  );
}

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.gray50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: MODERN_SPACING.md,
    paddingTop: Platform.OS === "ios" ? 54 : 40,
    paddingBottom: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: MODERN_COLORS.divider,
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.lg,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
  },

  // Progress
  progressContainer: {
    backgroundColor: MODERN_COLORS.surface,
    paddingHorizontal: MODERN_SPACING.lg,
    paddingTop: MODERN_SPACING.md,
    paddingBottom: MODERN_SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: MODERN_COLORS.divider,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  progressStepCol: {
    alignItems: "center",
    width: 64,
  },
  progressCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.gray100,
    borderWidth: 2,
    borderColor: MODERN_COLORS.gray200,
  },
  progressCircleCompleted: {
    backgroundColor: MODERN_COLORS.success,
    borderColor: MODERN_COLORS.success,
  },
  progressCircleActive: {
    backgroundColor: MODERN_COLORS.primary,
    borderColor: MODERN_COLORS.primary,
  },
  progressCircleUpcoming: {
    backgroundColor: MODERN_COLORS.gray100,
    borderColor: MODERN_COLORS.gray200,
  },
  progressNum: {
    fontSize: 12,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.textTertiary,
  },
  progressNumActive: {
    color: "#fff",
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: MODERN_COLORS.gray200,
    marginTop: 13,
    marginHorizontal: -4,
  },
  progressLineCompleted: {
    backgroundColor: MODERN_COLORS.success,
  },
  progressLineActive: {
    backgroundColor: MODERN_COLORS.gray300,
  },
  progressLabel: {
    fontSize: 10,
    color: MODERN_COLORS.textTertiary,
    marginTop: 4,
    textAlign: "center",
  },
  progressLabelCompleted: {
    color: MODERN_COLORS.success,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
  },
  progressLabelActive: {
    color: MODERN_COLORS.primary,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
  },
  stepFraction: {
    fontSize: 10,
    color: MODERN_COLORS.textTertiary,
    textAlign: "center",
    marginTop: 6,
  },

  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingTop: MODERN_SPACING.lg,
  },
  titleBlock: {
    marginBottom: MODERN_SPACING.lg,
  },
  stepTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xl,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.text,
  },
  stepSubtitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
    marginTop: 4,
    lineHeight: MODERN_TYPOGRAPHY.lineHeight.normal,
  },

  // Security
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: MODERN_SPACING.md,
    marginTop: MODERN_SPACING.lg,
  },
  securityText: {
    fontSize: 11,
    color: MODERN_COLORS.textTertiary,
  },

  // Footer
  footer: {
    backgroundColor: MODERN_COLORS.surface,
    paddingHorizontal: MODERN_SPACING.md,
    paddingTop: MODERN_SPACING.sm,
    paddingBottom: Platform.OS === "ios" ? 34 : MODERN_SPACING.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: MODERN_COLORS.divider,
    ...MODERN_SHADOWS.md,
  },

  // Radio helper
  radioRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: MODERN_SPACING.sm,
  },
});

const sectionStyles = StyleSheet.create({
  wrapper: {
    marginBottom: MODERN_SPACING.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: MODERN_SPACING.xs,
  },
  title: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
  },
  editLink: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.primary,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
  },
  body: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    ...MODERN_SHADOWS.xs,
  },
});

const summaryStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  label: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
  },
  labelBold: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
  },
  value: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
    color: MODERN_COLORS.text,
  },
  valueBold: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.lg,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.primary,
  },
  valueAccent: {
    color: MODERN_COLORS.primary,
  },
  valueStrike: {
    textDecorationLine: "line-through",
    color: MODERN_COLORS.textTertiary,
  },
});

const dividerStyles = StyleSheet.create({
  line: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: MODERN_COLORS.divider,
    marginVertical: MODERN_SPACING.sm,
  },
});

const radioStyles = StyleSheet.create({
  card: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.sm,
    borderWidth: 2,
    borderColor: MODERN_COLORS.border,
    ...MODERN_SHADOWS.xs,
  },
  cardSelected: {
    borderColor: MODERN_COLORS.primary,
    backgroundColor: `${MODERN_COLORS.primary}06`,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: MODERN_COLORS.gray300,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  radioActive: {
    borderColor: MODERN_COLORS.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: MODERN_COLORS.primary,
  },
  content: {
    flex: 1,
  },
});
