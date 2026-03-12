/**
 * Payment Progress Screen - Tiến độ thanh toán
 * Shopee/Grab-style payment milestone tracker for construction projects
 *
 * Features:
 * - Multi-phase payment milestones with timeline
 * - Payment status indicators (paid/pending/upcoming)
 * - Animated progress bar
 * - Bank transfer & e-wallet integration
 * - Invoice download
 * - Pull-to-refresh
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================================================
// Types
// ============================================================================

type PaymentStatus = "paid" | "pending" | "processing" | "upcoming" | "overdue";

interface PaymentMilestone {
  id: string;
  phase: string;
  title: string;
  description: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
  percentage: number;
  invoiceId?: string;
  paymentMethod?: string;
  receipt?: string;
}

interface ProjectPayment {
  id: string;
  projectName: string;
  contractorName: string;
  contractorAvatar: string;
  totalAmount: number;
  paidAmount: number;
  milestones: PaymentMilestone[];
  currency: string;
}

// ============================================================================
// Colors
// ============================================================================

const COLORS = {
  primary: "#0D9488",
  primaryLight: "#F0FDFA",
  primaryDark: "#0F766E",
  success: "#10B981",
  successLight: "#D1FAE5",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  error: "#EF4444",
  errorLight: "#FEE2E2",
  info: "#3B82F6",
  infoLight: "#DBEAFE",
  text: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  bg: "#F8FAFB",
  white: "#FFFFFF",
  border: "#E5E7EB",
  surface: "#FFFFFF",
  overlay: "rgba(0,0,0,0.5)",
};

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_PROJECT: ProjectPayment = {
  id: "proj-001",
  projectName: "Biệt thự Vinhomes Ocean Park",
  contractorName: "Công ty TNHH Xây dựng An Phát",
  contractorAvatar:
    "https://ui-avatars.com/api/?name=AP&background=0D9488&color=fff&size=100",
  totalAmount: 2500000000,
  paidAmount: 1750000000,
  currency: "VND",
  milestones: [
    {
      id: "m1",
      phase: "Đợt 1",
      title: "Ký hợp đồng & Thiết kế",
      description: "Đặt cọc + phí thiết kế kiến trúc",
      amount: 500000000,
      paidAmount: 500000000,
      dueDate: "2025-06-15",
      paidDate: "2025-06-12",
      status: "paid",
      percentage: 20,
      invoiceId: "INV-2025-001",
      paymentMethod: "Chuyển khoản ngân hàng",
    },
    {
      id: "m2",
      phase: "Đợt 2",
      title: "Móng & Cọc bê tông",
      description: "Thi công phần móng, đổ bê tông cọc",
      amount: 625000000,
      paidAmount: 625000000,
      dueDate: "2025-08-20",
      paidDate: "2025-08-18",
      status: "paid",
      percentage: 25,
      invoiceId: "INV-2025-002",
      paymentMethod: "VNPay",
    },
    {
      id: "m3",
      phase: "Đợt 3",
      title: "Phần thô & Kết cấu",
      description: "Xây tường, đổ sàn, lắp khung thép",
      amount: 625000000,
      paidAmount: 625000000,
      dueDate: "2025-11-15",
      paidDate: "2025-11-10",
      status: "paid",
      percentage: 25,
      invoiceId: "INV-2025-003",
      paymentMethod: "Chuyển khoản ngân hàng",
    },
    {
      id: "m4",
      phase: "Đợt 4",
      title: "Hoàn thiện & Nội thất",
      description: "Sơn, lát gạch, lắp đặt điện nước, nội thất cơ bản",
      amount: 500000000,
      paidAmount: 150000000,
      dueDate: "2026-03-15",
      status: "pending",
      percentage: 20,
    },
    {
      id: "m5",
      phase: "Đợt 5",
      title: "Nghiệm thu & Bàn giao",
      description: "Kiểm tra chất lượng, bàn giao nhà, bảo hành",
      amount: 250000000,
      paidAmount: 0,
      dueDate: "2026-05-30",
      status: "upcoming",
      percentage: 10,
    },
  ],
};

// ============================================================================
// Helpers
// ============================================================================

function formatCurrency(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)} tỷ`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(0)} triệu`;
  }
  return new Intl.NumberFormat("vi-VN").format(amount);
}

function formatFullCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getStatusConfig(status: PaymentStatus) {
  switch (status) {
    case "paid":
      return {
        label: "Đã thanh toán",
        color: COLORS.success,
        bgColor: COLORS.successLight,
        icon: "checkmark-circle" as const,
      };
    case "pending":
      return {
        label: "Đang chờ",
        color: COLORS.warning,
        bgColor: COLORS.warningLight,
        icon: "time" as const,
      };
    case "processing":
      return {
        label: "Đang xử lý",
        color: COLORS.info,
        bgColor: COLORS.infoLight,
        icon: "sync" as const,
      };
    case "overdue":
      return {
        label: "Quá hạn",
        color: COLORS.error,
        bgColor: COLORS.errorLight,
        icon: "alert-circle" as const,
      };
    default:
      return {
        label: "Sắp tới",
        color: COLORS.textMuted,
        bgColor: "#F3F4F6",
        icon: "ellipse-outline" as const,
      };
  }
}

// ============================================================================
// Sub-Components
// ============================================================================

function ProgressHeader({
  project,
  animValue,
}: {
  project: ProjectPayment;
  animValue: Animated.Value;
}) {
  const insets = useSafeAreaInsets();
  const paidPercent = (project.paidAmount / project.totalAmount) * 100;
  const paidCount = project.milestones.filter(
    (m) => m.status === "paid",
  ).length;

  return (
    <LinearGradient
      colors={["#0D9488", "#0F766E", "#115E59"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.header, { paddingTop: insets.top + 8 }]}
    >
      <View style={styles.headerNav}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tiến độ thanh toán</Text>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="document-text-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Project Info */}
      <View style={styles.projectInfo}>
        <Image
          source={{ uri: project.contractorAvatar }}
          style={styles.contractorAvatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.projectName} numberOfLines={1}>
            {project.projectName}
          </Text>
          <Text style={styles.contractorName}>{project.contractorName}</Text>
        </View>
      </View>

      {/* Overall Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Tổng tiến độ thanh toán</Text>
          <Text style={styles.progressPercent}>{paidPercent.toFixed(0)}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", `${paidPercent}%`],
                }),
              },
            ]}
          />
        </View>
        <View style={styles.progressStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatCurrency(project.paidAmount)}
            </Text>
            <Text style={styles.statLabel}>Đã thanh toán</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatCurrency(project.totalAmount - project.paidAmount)}
            </Text>
            <Text style={styles.statLabel}>Còn lại</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {paidCount}/{project.milestones.length}
            </Text>
            <Text style={styles.statLabel}>Đợt đã TT</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

function MilestoneCard({
  milestone,
  index,
  isLast,
  onPayNow,
  onViewInvoice,
}: {
  milestone: PaymentMilestone;
  index: number;
  isLast: boolean;
  onPayNow: (m: PaymentMilestone) => void;
  onViewInvoice: (m: PaymentMilestone) => void;
}) {
  const config = getStatusConfig(milestone.status);
  const partialPaid =
    milestone.status === "pending" && milestone.paidAmount > 0;
  const partialPercent = partialPaid
    ? (milestone.paidAmount / milestone.amount) * 100
    : 0;

  return (
    <View style={styles.milestoneRow}>
      {/* Timeline */}
      <View style={styles.timeline}>
        <View
          style={[
            styles.timelineDot,
            {
              backgroundColor:
                milestone.status === "paid"
                  ? COLORS.success
                  : milestone.status === "pending"
                    ? COLORS.warning
                    : milestone.status === "overdue"
                      ? COLORS.error
                      : COLORS.border,
            },
          ]}
        >
          {milestone.status === "paid" && (
            <Ionicons name="checkmark" size={12} color="#fff" />
          )}
          {milestone.status === "pending" && (
            <Ionicons name="time" size={10} color="#fff" />
          )}
          {milestone.status === "overdue" && (
            <Ionicons name="alert" size={10} color="#fff" />
          )}
        </View>
        {!isLast && (
          <View
            style={[
              styles.timelineLine,
              {
                backgroundColor:
                  milestone.status === "paid" ? COLORS.success : COLORS.border,
              },
            ]}
          />
        )}
      </View>

      {/* Card */}
      <View
        style={[
          styles.milestoneCard,
          milestone.status === "pending" && styles.milestoneCardActive,
          milestone.status === "overdue" && styles.milestoneCardOverdue,
        ]}
      >
        <View style={styles.milestoneHeader}>
          <View style={{ flex: 1 }}>
            <View style={styles.phaseRow}>
              <Text style={styles.phaseLabel}>{milestone.phase}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: config.bgColor },
                ]}
              >
                <Ionicons name={config.icon} size={12} color={config.color} />
                <Text style={[styles.statusText, { color: config.color }]}>
                  {config.label}
                </Text>
              </View>
            </View>
            <Text style={styles.milestoneTitle}>{milestone.title}</Text>
            <Text style={styles.milestoneDesc}>{milestone.description}</Text>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.amountSection}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Số tiền:</Text>
            <Text style={styles.amountValue}>
              {formatFullCurrency(milestone.amount)}
            </Text>
          </View>
          {partialPaid && (
            <>
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Đã trả:</Text>
                <Text style={[styles.amountValue, { color: COLORS.success }]}>
                  {formatFullCurrency(milestone.paidAmount)}
                </Text>
              </View>
              <View style={styles.partialProgress}>
                <View style={styles.partialTrack}>
                  <View
                    style={[
                      styles.partialFill,
                      { width: `${partialPercent}%` },
                    ]}
                  />
                </View>
                <Text style={styles.partialText}>
                  {partialPercent.toFixed(0)}%
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Date & Actions */}
        <View style={styles.milestoneFooter}>
          <View style={styles.dateRow}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={COLORS.textSecondary}
            />
            <Text style={styles.dateText}>
              {milestone.paidDate
                ? `Thanh toán: ${formatDate(milestone.paidDate)}`
                : `Hạn: ${formatDate(milestone.dueDate)}`}
            </Text>
          </View>
          <View style={styles.actions}>
            {milestone.invoiceId && (
              <TouchableOpacity
                style={styles.invoiceBtn}
                onPress={() => onViewInvoice(milestone)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="receipt-outline"
                  size={14}
                  color={COLORS.primary}
                />
                <Text style={styles.invoiceBtnText}>Hóa đơn</Text>
              </TouchableOpacity>
            )}
            {(milestone.status === "pending" ||
              milestone.status === "overdue") && (
              <TouchableOpacity
                style={styles.payNowBtn}
                onPress={() => onPayNow(milestone)}
                activeOpacity={0.7}
              >
                <Ionicons name="wallet-outline" size={14} color="#fff" />
                <Text style={styles.payNowBtnText}>Thanh toán</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Payment Method (for paid) */}
        {milestone.paymentMethod && milestone.status === "paid" && (
          <View style={styles.methodRow}>
            <Ionicons name="card-outline" size={13} color={COLORS.textMuted} />
            <Text style={styles.methodText}>{milestone.paymentMethod}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function PaymentMethodModal({
  visible,
  milestone,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  milestone: PaymentMilestone | null;
  onClose: () => void;
  onConfirm: (method: string) => void;
}) {
  const [selected, setSelected] = useState("bank");
  const methods = [
    {
      id: "bank",
      name: "Chuyển khoản ngân hàng",
      icon: "business-outline",
      desc: "Vietcombank, Techcombank, BIDV...",
    },
    {
      id: "vnpay",
      name: "VNPay QR",
      icon: "qr-code-outline",
      desc: "Quét mã QR thanh toán nhanh",
    },
    {
      id: "momo",
      name: "Ví MoMo",
      icon: "wallet-outline",
      desc: "Thanh toán qua ví điện tử MoMo",
    },
    {
      id: "zalopay",
      name: "ZaloPay",
      icon: "phone-portrait-outline",
      desc: "Thanh toán qua ZaloPay",
    },
  ];

  if (!milestone) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Chọn phương thức thanh toán</Text>
          <Text style={styles.modalSubtitle}>
            {milestone.phase} —{" "}
            {formatFullCurrency(milestone.amount - milestone.paidAmount)}
          </Text>

          {methods.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[
                styles.methodCard,
                selected === m.id && styles.methodCardSelected,
              ]}
              onPress={() => setSelected(m.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.methodIcon,
                  selected === m.id && { backgroundColor: COLORS.primaryLight },
                ]}
              >
                <Ionicons
                  name={m.icon as any}
                  size={22}
                  color={
                    selected === m.id ? COLORS.primary : COLORS.textSecondary
                  }
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.methodName,
                    selected === m.id && { color: COLORS.primary },
                  ]}
                >
                  {m.name}
                </Text>
                <Text style={styles.methodDesc}>{m.desc}</Text>
              </View>
              <View
                style={[
                  styles.radio,
                  selected === m.id && styles.radioSelected,
                ]}
              >
                {selected === m.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() => onConfirm(selected)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.confirmGradient}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#fff"
              />
              <Text style={styles.confirmText}>Xác nhận thanh toán</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ============================================================================
// Main Screen
// ============================================================================

export default function PaymentProgressScreen() {
  const [project, setProject] = useState<ProjectPayment>(MOCK_PROJECT);
  const [refreshing, setRefreshing] = useState(false);
  const [payModal, setPayModal] = useState<PaymentMilestone | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handlePayNow = (milestone: PaymentMilestone) => {
    setPayModal(milestone);
  };

  const handleViewInvoice = (milestone: PaymentMilestone) => {
    // Navigate to invoice detail
    router.push(`/orders/${milestone.invoiceId}`);
  };

  const handleConfirmPayment = (method: string) => {
    setPayModal(null);
    // In real app, trigger payment flow
    setTimeout(() => {
      router.push("/payment/success");
    }, 500);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <ProgressHeader project={project} animValue={progressAnim} />

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View
            style={[styles.summaryCard, { borderLeftColor: COLORS.success }]}
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={COLORS.success}
            />
            <Text style={styles.summaryValue}>
              {formatCurrency(project.paidAmount)}
            </Text>
            <Text style={styles.summaryLabel}>Đã thanh toán</Text>
          </View>
          <View
            style={[styles.summaryCard, { borderLeftColor: COLORS.warning }]}
          >
            <Ionicons name="time" size={20} color={COLORS.warning} />
            <Text style={styles.summaryValue}>
              {formatCurrency(
                project.milestones
                  .filter((m) => m.status === "pending")
                  .reduce((s, m) => s + m.amount - m.paidAmount, 0),
              )}
            </Text>
            <Text style={styles.summaryLabel}>Đang chờ</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: COLORS.info }]}>
            <Ionicons name="calendar" size={20} color={COLORS.info} />
            <Text style={styles.summaryValue}>
              {formatCurrency(
                project.milestones
                  .filter((m) => m.status === "upcoming")
                  .reduce((s, m) => s + m.amount, 0),
              )}
            </Text>
            <Text style={styles.summaryLabel}>Sắp tới</Text>
          </View>
        </View>

        {/* Milestones Timeline */}
        <View style={styles.milestonesSection}>
          <Text style={styles.sectionTitle}>Chi tiết các đợt thanh toán</Text>
          {project.milestones.map((m, i) => (
            <MilestoneCard
              key={m.id}
              milestone={m}
              index={i}
              isLast={i === project.milestones.length - 1}
              onPayNow={handlePayNow}
              onViewInvoice={handleViewInvoice}
            />
          ))}
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <TouchableOpacity style={styles.helpCard} activeOpacity={0.7}>
            <View style={styles.helpIcon}>
              <Ionicons
                name="chatbubbles-outline"
                size={22}
                color={COLORS.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.helpTitle}>Hỗ trợ thanh toán</Text>
              <Text style={styles.helpDesc}>
                Liên hệ tư vấn viên để được hỗ trợ các vấn đề thanh toán
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.helpCard} activeOpacity={0.7}>
            <View style={styles.helpIcon}>
              <Ionicons
                name="document-text-outline"
                size={22}
                color={COLORS.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.helpTitle}>Điều khoản thanh toán</Text>
              <Text style={styles.helpDesc}>
                Xem chi tiết điều khoản hợp đồng thanh toán
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <PaymentMethodModal
        visible={!!payModal}
        milestone={payModal}
        onClose={() => setPayModal(null)}
        onConfirm={handleConfirmPayment}
      />
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  // Header
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingTop: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },

  // Project info
  projectInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  contractorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  projectName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
  },
  contractorName: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },

  // Progress
  progressSection: { marginTop: 4 },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  progressPercent: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#34D399",
  },
  progressStats: {
    flexDirection: "row",
    marginTop: 14,
    alignItems: "center",
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  // Summary cards
  summaryRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginTop: -8,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderLeftWidth: 3,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 6,
  },
  summaryLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Milestones
  milestonesSection: { paddingHorizontal: 16, marginTop: 8 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 16,
  },

  // Timeline
  milestoneRow: { flexDirection: "row", minHeight: 140 },
  timeline: { width: 32, alignItems: "center" },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: -2,
  },

  // Milestone Card
  milestoneCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginLeft: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 1 },
    }),
  },
  milestoneCardActive: {
    borderColor: COLORS.warning,
    borderWidth: 1.5,
    backgroundColor: "#FFFDF7",
  },
  milestoneCardOverdue: {
    borderColor: COLORS.error,
    borderWidth: 1.5,
    backgroundColor: "#FFFBFB",
  },
  milestoneHeader: { flexDirection: "row", marginBottom: 10 },
  phaseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  phaseLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: { fontSize: 10, fontWeight: "600" },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  milestoneDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },

  // Amount
  amountSection: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  amountLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  amountValue: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
  },

  // Partial progress
  partialProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  partialTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  partialFill: {
    height: "100%",
    backgroundColor: COLORS.success,
    borderRadius: 2,
  },
  partialText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },

  // Footer
  milestoneFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  dateText: { fontSize: 11, color: COLORS.textSecondary },
  actions: { flexDirection: "row", gap: 6 },
  invoiceBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  invoiceBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.primary,
  },
  payNowBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  payNowBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  methodText: { fontSize: 11, color: COLORS.textMuted },

  // Help
  helpSection: { paddingHorizontal: 16, marginTop: 24 },
  helpCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  helpIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  helpDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 20,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: 10,
    gap: 12,
  },
  methodCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  methodName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  methodDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: COLORS.primary },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  confirmBtn: { marginTop: 16 },
  confirmGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 15,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 4,
  },
  cancelText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
});
