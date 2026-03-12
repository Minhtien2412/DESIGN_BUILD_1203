/**
 * Bank Transfer / Top-Up Screen
 * =============================
 * Displays VietQR code + bank transfer info for wallet top-up.
 * Matches the Napas 247 / ACB payment confirmation UI.
 *
 * Route: /payment/bank-transfer?amount=110000&orderId=ORDER123
 */

import { useThemeColor } from "@/hooks/use-theme-color";
import {
    BankAccount,
    buildVietQRImageUrl,
    DEFAULT_BANK,
    formatVND,
    generateTransactionCode,
    TOP_UP_AMOUNTS,
} from "@/services/vietqr";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    Pressable,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================
// Theme Colors
// ============================================
const C = {
  primary: "#10b981", // emerald green (success / bank brand)
  primaryDark: "#059669",
  accent: "#0ea5e9", // sky blue
  bg: "#f0fdf4",
  card: "#ffffff",
  text: "#111827",
  textSecondary: "#6b7280",
  border: "#e5e7eb",
  warning: "#f59e0b",
  error: "#ef4444",
  vietqrRed: "#E1251B",
};

export default function BankTransferScreen() {
  // ---- Route params ----
  const params = useLocalSearchParams<{
    amount?: string;
    orderId?: string;
    type?: string; // "topup" | "order"
  }>();

  // ---- State ----
  const [amount, setAmount] = useState<number>(
    params.amount ? parseInt(params.amount, 10) : 0,
  );
  const [customAmount, setCustomAmount] = useState("");
  const [transactionCode, setTransactionCode] = useState(
    params.orderId || generateTransactionCode(),
  );
  const [step, setStep] = useState<"select" | "confirm">(
    params.amount ? "confirm" : "select",
  );
  const [imageLoading, setImageLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const bank: BankAccount = DEFAULT_BANK;

  // ---- Animations ----
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const successBannerAnim = useRef(new Animated.Value(0)).current;

  // ---- Theme ----
  const backgroundColor = useThemeColor({}, "background");

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Show success banner
  useEffect(() => {
    if (step === "confirm") {
      Animated.sequence([
        Animated.timing(successBannerAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [step]);

  // ---- VietQR Image URL ----
  const qrImageUrl = useMemo(() => {
    if (!amount || amount <= 0) return null;
    return buildVietQRImageUrl({
      bank,
      amount,
      memo: transactionCode,
      template: "compact2",
    });
  }, [amount, transactionCode, bank]);

  // ---- Clipboard ----
  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      const Clipboard = require("react-native").Clipboard;
      Clipboard.setString(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      Alert.alert("Lỗi", "Không thể sao chép");
    }
  }, []);

  // ---- Share ----
  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: [
          `💰 Thông tin chuyển khoản`,
          `Ngân hàng: ${bank.bankName} (${bank.bankCode})`,
          `Số TK: ${bank.accountNumber}`,
          `Tên TK: ${bank.accountName}`,
          `Số tiền: ${formatVND(amount)}`,
          `Nội dung CK: ${transactionCode}`,
        ].join("\n"),
      });
    } catch {
      // user cancelled
    }
  }, [amount, transactionCode, bank]);

  // ---- Amount Selection (Step 1) ----
  const handleSelectAmount = (val: number) => {
    setAmount(val);
    setCustomAmount("");
  };

  const handleCustomAmount = () => {
    const parsed = parseInt(customAmount.replace(/\D/g, ""), 10);
    if (!parsed || parsed < 10000) {
      Alert.alert("Lỗi", "Số tiền tối thiểu là 10.000 VNĐ");
      return;
    }
    setAmount(parsed);
  };

  const handleConfirm = () => {
    if (amount <= 0) {
      Alert.alert("Lỗi", "Vui lòng chọn số tiền nạp");
      return;
    }
    setTransactionCode(generateTransactionCode());
    setStep("confirm");
  };

  // ============================================
  // STEP 1: Amount Selection
  // ============================================
  if (step === "select") {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <StatusBar barStyle="dark-content" />
        <Stack.Screen
          options={{
            title: "Nạp tiền",
            headerStyle: { backgroundColor: C.primary },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "700" },
          }}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Card */}
          <LinearGradient
            colors={[C.primary, C.primaryDark]}
            style={styles.headerCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons
              name="wallet-plus-outline"
              size={40}
              color="#fff"
            />
            <Text style={styles.headerTitle}>Nạp tiền vào tài khoản</Text>
            <Text style={styles.headerSubtitle}>
              Chọn số tiền hoặc nhập số tùy chỉnh
            </Text>
          </LinearGradient>

          {/* Preset Amounts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chọn mệnh giá</Text>
            <View style={styles.amountGrid}>
              {TOP_UP_AMOUNTS.map((val) => {
                const isSelected = amount === val;
                return (
                  <TouchableOpacity
                    key={val}
                    style={[
                      styles.amountChip,
                      isSelected && styles.amountChipSelected,
                    ]}
                    onPress={() => handleSelectAmount(val)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.amountChipText,
                        isSelected && styles.amountChipTextSelected,
                      ]}
                    >
                      {formatVND(val)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Custom Amount */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hoặc nhập số tiền khác</Text>
            <View style={styles.customAmountRow}>
              <TextInput
                style={styles.customInput}
                placeholder="Nhập số tiền (VNĐ)"
                placeholderTextColor={C.textSecondary}
                keyboardType="numeric"
                value={customAmount}
                onChangeText={setCustomAmount}
              />
              <TouchableOpacity
                style={styles.customBtn}
                onPress={handleCustomAmount}
              >
                <Ionicons name="checkmark" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Selected Summary */}
          {amount > 0 && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Số tiền nạp</Text>
                <Text style={styles.summaryValue}>{formatVND(amount)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Phương thức</Text>
                <Text style={styles.summaryMethod}>Chuyển khoản ngân hàng</Text>
              </View>
            </View>
          )}

          {/* Confirm Button */}
          <TouchableOpacity
            style={[
              styles.confirmBtn,
              amount <= 0 && styles.confirmBtnDisabled,
            ]}
            onPress={handleConfirm}
            disabled={amount <= 0}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                amount > 0 ? [C.primary, C.primaryDark] : ["#d1d5db", "#9ca3af"]
              }
              style={styles.confirmBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="arrow-forward" size={20} color="#fff" />
              <Text style={styles.confirmBtnText}>Tiếp tục thanh toán</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ============================================
  // STEP 2: Payment Confirmation + QR
  // ============================================
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#f8fafc" }]}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen
        options={{
          title: "Thông tin chuyển khoản",
          headerStyle: { backgroundColor: C.primary },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "700" },
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Banner */}
        <Animated.View
          style={[
            styles.successBanner,
            {
              opacity: successBannerAnim,
              transform: [
                {
                  translateY: successBannerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[C.primary, C.primaryDark]}
            style={styles.successBannerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
            <Text style={styles.successBannerText}>
              Yêu cầu nạp tiền vào tài khoản thành công
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Two-Column Layout */}
        <View style={styles.mainContent}>
          {/* LEFT: Bank Transfer Info */}
          <View style={styles.transferInfoCard}>
            <Text style={styles.cardTitle}>Thông tin chuyển khoản</Text>

            <InfoRow
              label="Bank Name"
              value={bank.bankCode}
              bold
              onCopy={() => copyToClipboard(bank.bankCode, "Bank")}
              isCopied={copied === "Bank"}
            />
            <InfoRow
              label="Account Name"
              value={bank.accountName}
              bold
              onCopy={() => copyToClipboard(bank.accountName, "Name")}
              isCopied={copied === "Name"}
            />
            <InfoRow
              label="Account Number"
              value={bank.accountNumber}
              bold
              onCopy={() => copyToClipboard(bank.accountNumber, "AccountNo")}
              isCopied={copied === "AccountNo"}
            />

            <View style={styles.divider} />

            <Text style={styles.detailHeader}>Thông tin chi tiết:</Text>

            <DetailRow label="Loại giao dịch" value="Chuyển khoản ngân hàng" />
            <DetailRow
              label="Số tiền nạp"
              value={formatVND(amount)}
              highlight
            />
            <DetailRow
              label="Mã giao dịch"
              value={transactionCode}
              onCopy={() => copyToClipboard(transactionCode, "TxCode")}
              isCopied={copied === "TxCode"}
              highlight
            />

            <View style={styles.noteBox}>
              <Text style={styles.noteLabel}>Lưu ý: </Text>
              <Text style={styles.noteText}>
                Quý khách ghi nội dung mã giao dịch khi thực hiện chuyển khoản.
                Hệ thống sẽ tự động cập nhật số dư tài khoản
              </Text>
            </View>
          </View>

          {/* RIGHT: QR Code */}
          <View style={styles.qrCard}>
            <Text style={styles.qrTitle}>
              Hoặc quét mã QR bên dưới để tự động điền nội dung chuyển khoản
            </Text>

            {/* VietQR Logo */}
            <View style={styles.vietqrBrand}>
              <Text style={styles.vietqrLogo}>
                <Text style={{ color: C.vietqrRed, fontWeight: "900" }}>V</Text>
                <Text style={{ color: "#1a56db", fontWeight: "700" }}>IET</Text>
                <Text style={{ color: C.vietqrRed, fontWeight: "900" }}>
                  QR
                </Text>
              </Text>
            </View>

            {/* QR Image from VietQR API */}
            <View style={styles.qrContainer}>
              {imageLoading && (
                <View style={styles.qrLoader}>
                  <ActivityIndicator size="large" color={C.primary} />
                  <Text style={styles.qrLoaderText}>Đang tạo mã QR...</Text>
                </View>
              )}
              {qrImageUrl && (
                <Image
                  source={{ uri: qrImageUrl }}
                  style={styles.qrImage}
                  resizeMode="contain"
                  onLoadStart={() => setImageLoading(true)}
                  onLoadEnd={() => setImageLoading(false)}
                  onError={() => {
                    setImageLoading(false);
                    Alert.alert(
                      "Lỗi",
                      "Không thể tải mã QR. Vui lòng chuyển khoản thủ công.",
                    );
                  }}
                />
              )}
            </View>

            {/* Napas + Bank logos */}
            <View style={styles.partnerLogos}>
              <Text style={styles.napasText}>
                napas <Text style={{ fontWeight: "900" }}>247</Text>
              </Text>
              <View style={styles.logoDivider} />
              <Text style={styles.bankLogoText}>{bank.bankCode}</Text>
            </View>

            {/* QR Details */}
            <View style={styles.qrDetails}>
              <QRDetailRow label="Số tiền" value={formatVND(amount)} />
              <QRDetailRow label="Nội dung CK" value={transactionCode} />
              <QRDetailRow label="Tên chủ TK" value={bank.accountName} />
              <QRDetailRow label="Số TK" value={bank.accountNumber} bold />
              <QRDetailRow label="Ngân hàng" value={bank.bankName} />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={20} color={C.primary} />
            <Text style={styles.shareBtnText}>Chia sẻ thông tin CK</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => router.replace("/(tabs)")}
          >
            <Ionicons name="arrow-back" size={18} color={C.accent} />
            <Text style={styles.homeBtnText}>Trở về trang chủ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// Sub-components
// ============================================

function InfoRow({
  label,
  value,
  bold,
  onCopy,
  isCopied,
}: {
  label: string;
  value: string;
  bold?: boolean;
  onCopy?: () => void;
  isCopied?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <View style={styles.infoValueWrap}>
        <Text style={[styles.infoValue, bold && styles.infoValueBold]}>
          {value}
        </Text>
        {onCopy && (
          <Pressable onPress={onCopy} hitSlop={8}>
            <Ionicons
              name={isCopied ? "checkmark-circle" : "copy-outline"}
              size={16}
              color={isCopied ? C.primary : C.textSecondary}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

function DetailRow({
  label,
  value,
  highlight,
  onCopy,
  isCopied,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  onCopy?: () => void;
  isCopied?: boolean;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>- {label}:</Text>
      <View style={styles.detailValueWrap}>
        <Text
          style={[styles.detailValue, highlight && styles.detailValueHighlight]}
        >
          {value}
        </Text>
        {onCopy && (
          <Pressable onPress={onCopy} hitSlop={8} style={{ marginLeft: 6 }}>
            <Ionicons
              name={isCopied ? "checkmark-circle" : "copy-outline"}
              size={14}
              color={isCopied ? C.primary : C.textSecondary}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

function QRDetailRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <Text style={styles.qrDetailText}>
      {label}:{" "}
      <Text style={bold ? styles.qrDetailBold : undefined}>{value}</Text>
    </Text>
  );
}

// ============================================
// Styles
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // === Header Card (Step 1) ===
  headerCard: {
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    marginTop: 6,
  },

  // === Sections ===
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
    marginBottom: 12,
  },

  // === Amount Grid ===
  amountGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  amountChip: {
    width: (SCREEN_WIDTH - 32 - 30) / 4,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  amountChipSelected: {
    borderColor: C.primary,
    backgroundColor: C.bg,
  },
  amountChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: C.text,
  },
  amountChipTextSelected: {
    color: C.primary,
  },

  // === Custom Amount ===
  customAmountRow: {
    flexDirection: "row",
    gap: 10,
  },
  customInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 16,
    fontSize: 16,
    color: C.text,
    backgroundColor: "#fff",
  },
  customBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: C.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  // === Summary Card ===
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: C.textSecondary,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "800",
    color: C.primary,
  },
  summaryMethod: {
    fontSize: 14,
    fontWeight: "600",
    color: C.text,
  },

  // === Confirm Button ===
  confirmBtn: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 8,
  },
  confirmBtnDisabled: {
    opacity: 0.6,
  },
  confirmBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },

  // === Success Banner ===
  successBanner: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  successBannerGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 10,
  },
  successBannerText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
  },

  // === Main Content (two columns on tablet, stacked on phone) ===
  mainContent: {
    gap: 16,
  },

  // === Transfer Info Card ===
  transferInfoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: C.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
  },
  infoValueWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoValue: {
    fontSize: 14,
    color: C.text,
  },
  infoValueBold: {
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 14,
  },
  detailHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    flexWrap: "wrap",
  },
  detailLabel: {
    fontSize: 14,
    color: C.text,
  },
  detailValueWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 4,
  },
  detailValue: {
    fontSize: 14,
    color: C.text,
  },
  detailValueHighlight: {
    fontWeight: "700",
    color: C.primaryDark,
  },
  noteBox: {
    flexDirection: "row",
    backgroundColor: "#fffbeb",
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
    borderLeftWidth: 3,
    borderLeftColor: C.warning,
  },
  noteLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: C.warning,
    fontStyle: "italic",
  },
  noteText: {
    fontSize: 13,
    color: C.text,
    flex: 1,
    lineHeight: 19,
  },

  // === QR Card ===
  qrCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  qrTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 22,
  },
  vietqrBrand: {
    marginBottom: 12,
  },
  vietqrLogo: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 1,
  },
  qrContainer: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  qrImage: {
    width: "100%",
    height: "100%",
  },
  qrLoader: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  qrLoaderText: {
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 8,
  },

  // === Partner Logos ===
  partnerLogos: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  napasText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a56db",
  },
  logoDivider: {
    width: 1,
    height: 24,
    backgroundColor: C.border,
  },
  bankLogoText: {
    fontSize: 22,
    fontWeight: "900",
    color: C.text,
  },

  // === QR Details ===
  qrDetails: {
    alignItems: "center",
    gap: 2,
  },
  qrDetailText: {
    fontSize: 12,
    color: C.textSecondary,
    textAlign: "center",
  },
  qrDetailBold: {
    fontWeight: "800",
    color: C.text,
  },

  // === Action Buttons ===
  actionButtons: {
    marginTop: 24,
    gap: 12,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.primary,
    backgroundColor: "#fff",
  },
  shareBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: C.primary,
  },
  homeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  homeBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: C.accent,
  },
});
