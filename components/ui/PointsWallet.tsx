/**
 * Points & Wallet Components
 * Display points balance, transactions, and conversion
 */

import type { PointsBalance, PointTransaction } from "@/types/profile";
import { POINTS_CONVERSION } from "@/types/profile";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

// ============================================================================
// Points Balance Card
// ============================================================================

interface PointsBalanceCardProps {
  balance: PointsBalance;
  primaryColor?: string;
  onConvert?: () => void;
  onHistory?: () => void;
}

export function PointsBalanceCard({
  balance,
  primaryColor = "#FF6B35",
  onConvert,
  onHistory,
}: PointsBalanceCardProps) {
  const formatNumber = (num: number) => num.toLocaleString("vi-VN");
  const formatCurrency = (num: number) => `${formatNumber(num)}đ`;

  return (
    <View style={styles.balanceCard}>
      {/* Wallet Balance - Main */}
      <LinearGradient
        colors={[primaryColor, "#FF8A50"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.walletSection}
      >
        <View style={styles.walletHeader}>
          <View style={styles.walletIcon}>
            <Ionicons name="wallet" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.walletLabel}>Số dư ví</Text>
        </View>
        <Text style={styles.walletAmount}>
          {formatCurrency(balance.walletBalance)}
        </Text>
        <View style={styles.walletActions}>
          <TouchableOpacity style={styles.walletBtn} onPress={onConvert}>
            <Ionicons name="swap-horizontal" size={16} color="#FFFFFF" />
            <Text style={styles.walletBtnText}>Quy đổi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.walletBtn} onPress={onHistory}>
            <Ionicons name="time" size={16} color="#FFFFFF" />
            <Text style={styles.walletBtnText}>Lịch sử</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Points Grid */}
      <View style={styles.pointsGrid}>
        {/* Reward Points */}
        <View style={styles.pointBox}>
          <View style={[styles.pointIcon, { backgroundColor: "#FFF3E0" }]}>
            <Ionicons name="gift" size={20} color="#FF9800" />
          </View>
          <Text style={styles.pointValue}>
            {formatNumber(balance.rewardPoints)}
          </Text>
          <Text style={styles.pointLabel}>Điểm thưởng</Text>
          <Text style={styles.pointConvert}>
            ≈ {formatCurrency(balance.rewardPoints * 10)}
          </Text>
        </View>

        {/* Credit Points */}
        <View style={styles.pointBox}>
          <View style={[styles.pointIcon, { backgroundColor: "#E3F2FD" }]}>
            <Ionicons name="shield-checkmark" size={20} color="#2196F3" />
          </View>
          <Text style={styles.pointValue}>
            {formatNumber(balance.creditPoints)}
          </Text>
          <Text style={styles.pointLabel}>Điểm tín dụng</Text>
          <View style={styles.creditLevel}>
            <Text style={styles.creditText}>
              {balance.creditPoints >= 800
                ? "Xuất sắc"
                : balance.creditPoints >= 600
                  ? "Tốt"
                  : balance.creditPoints >= 400
                    ? "Khá"
                    : "Bình thường"}
            </Text>
          </View>
        </View>

        {/* Bonus Points */}
        <View style={styles.pointBox}>
          <View style={[styles.pointIcon, { backgroundColor: "#E8F5E9" }]}>
            <Ionicons name="star" size={20} color="#4CAF50" />
          </View>
          <Text style={styles.pointValue}>
            {formatNumber(balance.bonusPoints)}
          </Text>
          <Text style={styles.pointLabel}>Điểm bonus</Text>
          <Text style={styles.pointConvert}>
            ≈ {formatCurrency(balance.bonusPoints * 10)}
          </Text>
        </View>

        {/* Total Converted */}
        <View style={styles.pointBox}>
          <View style={[styles.pointIcon, { backgroundColor: "#F3E5F5" }]}>
            <Ionicons name="cash" size={20} color="#9C27B0" />
          </View>
          <Text style={styles.pointValue}>
            {formatNumber(balance.totalConverted / 1000)}K
          </Text>
          <Text style={styles.pointLabel}>Đã quy đổi</Text>
          <Text style={styles.pointSubtext}>Tổng cộng</Text>
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// Points Conversion Modal
// ============================================================================

interface PointsConversionModalProps {
  visible: boolean;
  onClose: () => void;
  onConvert: (amount: number) => Promise<boolean>;
  availablePoints: number;
  primaryColor?: string;
}

export function PointsConversionModal({
  visible,
  onClose,
  onConvert,
  availablePoints,
  primaryColor = "#FF6B35",
}: PointsConversionModalProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const formatNumber = (num: number) => num.toLocaleString("vi-VN");

  const numAmount = parseInt(amount.replace(/\D/g, "")) || 0;
  const convertedValue = numAmount * 10; // 100 points = 1000 VND => 1 point = 10 VND
  const isValid =
    numAmount >= POINTS_CONVERSION.minConvert && numAmount <= availablePoints;

  const handleConvert = async () => {
    if (!isValid) return;

    setLoading(true);
    try {
      const success = await onConvert(numAmount);
      if (success) {
        Alert.alert(
          "Quy đổi thành công",
          `Đã quy đổi ${formatNumber(numAmount)} điểm thành ${formatNumber(convertedValue)}đ`,
          [{ text: "OK", onPress: onClose }]
        );
        setAmount("");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể quy đổi điểm. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [1000, 5000, 10000, availablePoints];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Quy đổi điểm</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          <View style={styles.conversionInfo}>
            <Text style={styles.conversionRate}>100 điểm = 1.000đ</Text>
            <Text style={styles.availableText}>
              Điểm khả dụng:{" "}
              <Text style={{ color: primaryColor, fontWeight: "700" }}>
                {formatNumber(availablePoints)}
              </Text>
            </Text>
          </View>

          <Text style={styles.inputLabel}>Số điểm muốn quy đổi</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="Nhập số điểm"
              placeholderTextColor="#999"
            />
            <Text style={styles.inputSuffix}>điểm</Text>
          </View>

          <View style={styles.quickAmounts}>
            {quickAmounts.map((val, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.quickBtn,
                  val > availablePoints && styles.quickBtnDisabled,
                ]}
                onPress={() =>
                  setAmount(String(Math.min(val, availablePoints)))
                }
                disabled={val > availablePoints}
              >
                <Text
                  style={[
                    styles.quickBtnText,
                    val > availablePoints && styles.quickBtnTextDisabled,
                  ]}
                >
                  {idx === 3 ? "Tất cả" : formatNumber(val)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {numAmount > 0 && (
            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>Bạn sẽ nhận được</Text>
              <Text style={[styles.previewAmount, { color: primaryColor }]}>
                {formatNumber(convertedValue)}đ
              </Text>
            </View>
          )}

          {numAmount > 0 && numAmount < POINTS_CONVERSION.minConvert && (
            <Text style={styles.errorText}>
              Tối thiểu {formatNumber(POINTS_CONVERSION.minConvert)} điểm
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.convertBtn,
              { backgroundColor: isValid ? primaryColor : "#D1D1D6" },
            ]}
            onPress={handleConvert}
            disabled={!isValid || loading}
          >
            <Text style={styles.convertBtnText}>
              {loading ? "Đang xử lý..." : "Quy đổi ngay"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ============================================================================
// Transaction History Item
// ============================================================================

interface TransactionItemProps {
  transaction: PointTransaction;
  primaryColor?: string;
}

export function TransactionItem({
  transaction,
  primaryColor = "#FF6B35",
}: TransactionItemProps) {
  const formatNumber = (num: number) => num.toLocaleString("vi-VN");
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeInfo = () => {
    switch (transaction.type) {
      case "earn":
        return { icon: "add-circle", color: "#4CAF50", prefix: "+" };
      case "spend":
        return { icon: "remove-circle", color: "#F44336", prefix: "-" };
      case "convert":
        return { icon: "swap-horizontal", color: "#2196F3", prefix: "" };
      case "bonus":
        return { icon: "gift", color: "#FF9800", prefix: "+" };
      case "expire":
        return { icon: "time-outline", color: "#9E9E9E", prefix: "-" };
      case "refund":
        return { icon: "refresh", color: "#9C27B0", prefix: "+" };
      default:
        return { icon: "ellipse", color: "#757575", prefix: "" };
    }
  };

  const typeInfo = getTypeInfo();

  return (
    <View style={styles.transactionItem}>
      <View
        style={[
          styles.transactionIcon,
          { backgroundColor: `${typeInfo.color}20` },
        ]}
      >
        <Ionicons
          name={typeInfo.icon as any}
          size={20}
          color={typeInfo.color}
        />
      </View>

      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDesc} numberOfLines={1}>
          {transaction.description}
        </Text>
        <Text style={styles.transactionDate}>
          {formatDate(transaction.createdAt)}
        </Text>
      </View>

      <View style={styles.transactionAmount}>
        <Text style={[styles.amountText, { color: typeInfo.color }]}>
          {typeInfo.prefix}
          {formatNumber(transaction.amount)}
        </Text>
        <Text style={styles.pointTypeText}>
          {transaction.pointType === "wallet" ? "VND" : "điểm"}
        </Text>
      </View>
    </View>
  );
}

// ============================================================================
// Credit Score Indicator
// ============================================================================

interface CreditScoreProps {
  score: number; // 0-1000
  primaryColor?: string;
}

export function CreditScoreIndicator({
  score,
  primaryColor = "#FF6B35",
}: CreditScoreProps) {
  const percentage = (score / 1000) * 100;

  const getLevel = () => {
    if (score >= 800) return { label: "Xuất sắc", color: "#4CAF50" };
    if (score >= 600) return { label: "Tốt", color: "#8BC34A" };
    if (score >= 400) return { label: "Khá", color: "#FFC107" };
    if (score >= 200) return { label: "Trung bình", color: "#FF9800" };
    return { label: "Cần cải thiện", color: "#F44336" };
  };

  const level = getLevel();

  return (
    <View style={styles.creditContainer}>
      <View style={styles.creditHeader}>
        <Text style={styles.creditTitle}>Điểm tín dụng</Text>
        <View
          style={[styles.levelBadge, { backgroundColor: `${level.color}20` }]}
        >
          <Text style={[styles.levelText, { color: level.color }]}>
            {level.label}
          </Text>
        </View>
      </View>

      <View style={styles.creditScoreRow}>
        <Text style={[styles.creditScore, { color: level.color }]}>
          {score}
        </Text>
        <Text style={styles.creditMax}>/1000</Text>
      </View>

      <View style={styles.creditBar}>
        <View
          style={[
            styles.creditFill,
            { width: `${percentage}%`, backgroundColor: level.color },
          ]}
        />
      </View>

      <Text style={styles.creditTip}>
        💡 Hoàn thành công việc đúng hạn và nhận đánh giá tốt để tăng điểm tín
        dụng
      </Text>
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  // Balance Card
  balanceCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  walletSection: {
    padding: 20,
  },
  walletHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  walletIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  walletLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  walletAmount: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  walletActions: {
    flexDirection: "row",
    gap: 12,
  },
  walletBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  walletBtnText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  pointsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
  },
  pointBox: {
    width: "50%",
    padding: 12,
    alignItems: "center",
  },
  pointIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  pointValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  pointLabel: {
    fontSize: 12,
    color: "#757575",
    marginTop: 2,
  },
  pointConvert: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },
  pointSubtext: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },
  creditLevel: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "#E3F2FD",
    borderRadius: 10,
  },
  creditText: {
    fontSize: 10,
    color: "#2196F3",
    fontWeight: "600",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  conversionInfo: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  conversionRate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  availableText: {
    fontSize: 14,
    color: "#757575",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  inputSuffix: {
    fontSize: 14,
    color: "#757575",
  },
  quickAmounts: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  quickBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    alignItems: "center",
  },
  quickBtnDisabled: {
    opacity: 0.5,
  },
  quickBtnText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1A1A1A",
  },
  quickBtnTextDisabled: {
    color: "#999",
  },
  previewBox: {
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  previewLabel: {
    fontSize: 13,
    color: "#757575",
    marginBottom: 4,
  },
  previewAmount: {
    fontSize: 28,
    fontWeight: "700",
  },
  errorText: {
    fontSize: 12,
    color: "#F44336",
    textAlign: "center",
    marginBottom: 12,
  },
  convertBtn: {
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  convertBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Transaction Item
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDesc: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: "#757575",
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "700",
  },
  pointTypeText: {
    fontSize: 11,
    color: "#757575",
  },

  // Credit Score
  creditContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  creditHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  creditTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "600",
  },
  creditScoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
  },
  creditScore: {
    fontSize: 48,
    fontWeight: "700",
  },
  creditMax: {
    fontSize: 18,
    color: "#757575",
  },
  creditBar: {
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    marginBottom: 12,
  },
  creditFill: {
    height: "100%",
    borderRadius: 4,
  },
  creditTip: {
    fontSize: 12,
    color: "#757575",
    lineHeight: 18,
  },
});

export default PointsBalanceCard;
