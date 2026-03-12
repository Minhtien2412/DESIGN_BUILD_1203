/**
 * Invoice Detail Screen
 * =======================
 * Displays invoice details: items, amounts, status, payment history.
 * Actions: Send, Record Payment, Delete, Print/Share.
 */
import * as budgetService from "@/services/budget";
import type {
    Invoice,
    InvoiceStatus,
    Payment,
    PaymentMethod,
    RecordPaymentRequest,
} from "@/types/budget";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const THEME = {
  primary: "#0D9488",
  bg: "#F8FAFB",
  card: "#FFFFFF",
  text: "#1A1A2E",
  textSec: "#6B7280",
  border: "#E5E7EB",
  error: "#EF4444",
  success: "#10B981",
  warning: "#F59E0B",
};

const STATUS_CONFIG: Record<
  InvoiceStatus,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  DRAFT: {
    label: "Nháp",
    color: "#999",
    bgColor: "#F5F5F5",
    icon: "document-outline",
  },
  SENT: { label: "Đã gửi", color: "#0D9488", bgColor: "#F0FDFA", icon: "send" },
  VIEWED: {
    label: "Đã xem",
    color: "#3B82F6",
    bgColor: "#EFF6FF",
    icon: "eye",
  },
  PAID: {
    label: "Đã thanh toán",
    color: "#10B981",
    bgColor: "#ECFDF5",
    icon: "checkmark-circle",
  },
  OVERDUE: {
    label: "Quá hạn",
    color: "#EF4444",
    bgColor: "#FEF2F2",
    icon: "alert-circle",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "#6B7280",
    bgColor: "#F3F4F6",
    icon: "close-circle",
  },
};

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "BANK_TRANSFER" as PaymentMethod, label: "Chuyển khoản" },
  { value: "CASH" as PaymentMethod, label: "Tiền mặt" },
  { value: "CREDIT_CARD" as PaymentMethod, label: "Thẻ tín dụng" },
  { value: "CHECK" as PaymentMethod, label: "Séc" },
  { value: "MOBILE_PAYMENT" as PaymentMethod, label: "Ví điện tử" },
];

export default function InvoiceDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id, projectId, action } = useLocalSearchParams<{
    id: string;
    projectId?: string;
    action?: string;
  }>();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(
    action === "payment",
  );
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<PaymentMethod>(
    "BANK_TRANSFER" as PaymentMethod,
  );
  const [payRef, setPayRef] = useState("");
  const [payNotes, setPayNotes] = useState("");
  const [paySubmitting, setPaySubmitting] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [inv, pays] = await Promise.all([
        budgetService.getInvoice(id),
        budgetService.getInvoicePayments(id).catch(() => [] as Payment[]),
      ]);
      setInvoice(inv);
      setPayments(pays);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải hóa đơn");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("vi-VN") + " VNĐ";

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("vi-VN");
  };

  const handleSendInvoice = useCallback(async () => {
    if (!id) return;
    Alert.alert("Gửi hóa đơn", "Bạn có chắc muốn gửi hóa đơn này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Gửi",
        onPress: async () => {
          setSending(true);
          try {
            const updated = await budgetService.sendInvoice(id);
            setInvoice(updated);
            Alert.alert("Thành công", "Đã gửi hóa đơn");
          } catch {
            Alert.alert("Lỗi", "Không thể gửi hóa đơn");
          } finally {
            setSending(false);
          }
        },
      },
    ]);
  }, [id]);

  const handleDeleteInvoice = useCallback(async () => {
    if (!id) return;
    Alert.alert(
      "Xóa hóa đơn",
      "Hành động này không thể hoàn tác. Bạn có chắc?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await budgetService.deleteInvoice(id);
              Alert.alert("Đã xóa", "Hóa đơn đã được xóa", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch {
              Alert.alert("Lỗi", "Không thể xóa hóa đơn");
            }
          },
        },
      ],
    );
  }, [id]);

  const handleRecordPayment = useCallback(async () => {
    if (!id || !payAmount) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập số tiền thanh toán");
      return;
    }

    const amt = Number(payAmount.replace(/[^0-9]/g, ""));
    if (amt <= 0) {
      Alert.alert("Lỗi", "Số tiền không hợp lệ");
      return;
    }

    setPaySubmitting(true);
    try {
      const req: RecordPaymentRequest = {
        invoiceId: id,
        amount: amt,
        date: new Date(),
        method: payMethod,
        reference: payRef.trim() || `PAY-${Date.now()}`,
        notes: payNotes.trim() || undefined,
      };
      await budgetService.recordPayment(req);
      setShowPaymentModal(false);
      setPayAmount("");
      setPayRef("");
      setPayNotes("");
      Alert.alert("Thành công", "Đã ghi nhận thanh toán");
      loadData(); // Refresh
    } catch {
      Alert.alert("Lỗi", "Không thể ghi nhận thanh toán");
    } finally {
      setPaySubmitting(false);
    }
  }, [id, payAmount, payMethod, payRef, payNotes, loadData]);

  // ============================================================
  // Loading / Error states
  // ============================================================
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text style={styles.loadingText}>Đang tải hóa đơn...</Text>
      </View>
    );
  }

  if (error || !invoice) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={THEME.error} />
        <Text style={styles.errorText}>
          {error || "Không tìm thấy hóa đơn"}
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusCfg = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.DRAFT;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status header */}
        <View
          style={[styles.statusHeader, { backgroundColor: statusCfg.bgColor }]}
        >
          <View style={styles.statusRow}>
            <Ionicons
              name={statusCfg.icon as any}
              size={22}
              color={statusCfg.color}
            />
            <Text style={[styles.statusLabel, { color: statusCfg.color }]}>
              {statusCfg.label}
            </Text>
          </View>
          <Text style={styles.invoiceNumber}>#{invoice.invoiceNumber}</Text>
        </View>

        {/* Client info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Khách hàng</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={16} color={THEME.textSec} />
              <Text style={styles.infoText}>{invoice.clientName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={16} color={THEME.textSec} />
              <Text style={styles.infoText}>{invoice.clientEmail}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons
                name="location-outline"
                size={16}
                color={THEME.textSec}
              />
              <Text style={styles.infoText}>{invoice.clientAddress}</Text>
            </View>
          </View>
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thời gian</Text>
          <View style={styles.dateCards}>
            <View style={styles.dateCard}>
              <Text style={styles.dateLabel}>Ngày phát hành</Text>
              <Text style={styles.dateValue}>
                {formatDate(invoice.issueDate)}
              </Text>
            </View>
            <View style={styles.dateCard}>
              <Text style={styles.dateLabel}>Ngày đáo hạn</Text>
              <Text
                style={[
                  styles.dateValue,
                  invoice.status === "OVERDUE" && { color: THEME.error },
                ]}
              >
                {formatDate(invoice.dueDate)}
              </Text>
            </View>
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Chi tiết ({invoice.items.length} mục)
          </Text>
          {invoice.items.map((item, i) => (
            <View key={item.id || i} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemDesc} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemQty}>
                  {item.quantity} {item.unit} × {formatCurrency(item.unitPrice)}
                </Text>
                <Text style={styles.itemAmount}>
                  {formatCurrency(item.amount)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tạm tính</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(invoice.subtotal)}
            </Text>
          </View>
          {invoice.taxRate > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Thuế ({invoice.taxRate}%)</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(invoice.taxAmount)}
              </Text>
            </View>
          )}
          {invoice.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Giảm giá</Text>
              <Text style={[styles.totalValue, { color: THEME.success }]}>
                -{formatCurrency(invoice.discount)}
              </Text>
            </View>
          )}
          <View style={styles.totalDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>Tổng cộng</Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(invoice.total)}
            </Text>
          </View>
          {invoice.paidAmount > 0 && (
            <>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Đã thanh toán</Text>
                <Text style={[styles.totalValue, { color: THEME.success }]}>
                  {formatCurrency(invoice.paidAmount)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Còn lại</Text>
                <Text
                  style={[
                    styles.totalValue,
                    {
                      color:
                        invoice.remainingAmount > 0
                          ? THEME.error
                          : THEME.success,
                    },
                  ]}
                >
                  {formatCurrency(invoice.remainingAmount)}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Payment history */}
        {payments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lịch sử thanh toán</Text>
            {payments.map((pay, i) => (
              <View key={pay.id || i} style={styles.paymentCard}>
                <View style={styles.paymentLeft}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={THEME.success}
                  />
                  <View>
                    <Text style={styles.paymentAmount}>
                      {formatCurrency(pay.amount)}
                    </Text>
                    <Text style={styles.paymentMeta}>
                      {formatDate(pay.date)} • {pay.reference}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ghi chú</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Terms */}
        {invoice.terms && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Điều khoản</Text>
            <Text style={styles.notesText}>{invoice.terms}</Text>
          </View>
        )}
      </ScrollView>

      {/* Action buttons */}
      <View style={styles.actionBar}>
        {invoice.status === "DRAFT" && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.sendBtn]}
            onPress={handleSendInvoice}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Ionicons name="send" size={16} color="#FFF" />
                <Text style={styles.actionBtnText}>Gửi</Text>
              </>
            )}
          </TouchableOpacity>
        )}
        {["SENT", "VIEWED", "OVERDUE"].includes(invoice.status) && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.payBtn]}
            onPress={() => setShowPaymentModal(true)}
          >
            <Ionicons name="card-outline" size={16} color="#FFF" />
            <Text style={styles.actionBtnText}>Thanh toán</Text>
          </TouchableOpacity>
        )}
        {invoice.status === "DRAFT" && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={handleDeleteInvoice}
          >
            <Ionicons name="trash-outline" size={16} color={THEME.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ghi nhận thanh toán</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={22} color={THEME.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Remaining */}
              <View style={styles.remainingBanner}>
                <Text style={styles.remainingLabel}>Số tiền còn lại</Text>
                <Text style={styles.remainingValue}>
                  {formatCurrency(invoice.remainingAmount)}
                </Text>
              </View>

              {/* Amount */}
              <Text style={styles.fieldLabel}>Số tiền thanh toán *</Text>
              <TextInput
                style={styles.modalInput}
                value={payAmount}
                onChangeText={(v) => {
                  const num = v.replace(/[^0-9]/g, "");
                  setPayAmount(num ? Number(num).toLocaleString("vi-VN") : "");
                }}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor={THEME.textSec}
              />

              {/* Payment method */}
              <Text style={styles.fieldLabel}>Phương thức</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.methodRow}
              >
                {PAYMENT_METHODS.map((m) => (
                  <TouchableOpacity
                    key={m.value}
                    style={[
                      styles.methodChip,
                      payMethod === m.value && styles.methodChipActive,
                    ]}
                    onPress={() => setPayMethod(m.value)}
                  >
                    <Text
                      style={[
                        styles.methodChipText,
                        payMethod === m.value && styles.methodChipTextActive,
                      ]}
                    >
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Reference */}
              <Text style={styles.fieldLabel}>Mã tham chiếu</Text>
              <TextInput
                style={styles.modalInput}
                value={payRef}
                onChangeText={setPayRef}
                placeholder="VD: TK-123456"
                placeholderTextColor={THEME.textSec}
              />

              {/* Notes */}
              <Text style={styles.fieldLabel}>Ghi chú</Text>
              <TextInput
                style={[styles.modalInput, { minHeight: 60 }]}
                value={payNotes}
                onChangeText={setPayNotes}
                placeholder="Ghi chú thanh toán..."
                placeholderTextColor={THEME.textSec}
                multiline
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[styles.paySubmitBtn, paySubmitting && { opacity: 0.6 }]}
              onPress={handleRecordPayment}
              disabled={paySubmitting}
            >
              {paySubmitting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.paySubmitText}>Xác nhận thanh toán</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: THEME.bg,
  },
  loadingText: {
    fontSize: 14,
    color: THEME.textSec,
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: THEME.error,
    marginTop: 12,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: THEME.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
  },

  // Status
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.textSec,
  },

  // Section
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.text,
    marginBottom: 10,
  },

  // Info card
  infoCard: {
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: THEME.text,
    flex: 1,
  },

  // Dates
  dateCards: {
    flexDirection: "row",
    gap: 12,
  },
  dateCard: {
    flex: 1,
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 12,
    color: THEME.textSec,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.text,
  },

  // Items
  itemCard: {
    backgroundColor: THEME.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  itemHeader: {
    marginBottom: 6,
  },
  itemDesc: {
    fontSize: 14,
    fontWeight: "500",
    color: THEME.text,
  },
  itemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemQty: {
    fontSize: 12,
    color: THEME.textSec,
  },
  itemAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.primary,
  },

  // Totals
  totalsCard: {
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  totalLabel: {
    fontSize: 13,
    color: THEME.textSec,
  },
  totalValue: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.text,
  },
  totalDivider: {
    height: 1,
    backgroundColor: THEME.border,
    marginVertical: 8,
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.text,
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.primary,
  },

  // Payment history
  paymentCard: {
    flexDirection: "row",
    backgroundColor: THEME.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.text,
  },
  paymentMeta: {
    fontSize: 12,
    color: THEME.textSec,
    marginTop: 2,
  },

  // Notes
  notesText: {
    fontSize: 14,
    color: THEME.text,
    lineHeight: 20,
    backgroundColor: THEME.card,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
  },

  // Action bar
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: THEME.card,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
  },
  sendBtn: {
    backgroundColor: THEME.primary,
    flex: 1,
    justifyContent: "center",
  },
  payBtn: {
    backgroundColor: THEME.success,
    flex: 1,
    justifyContent: "center",
  },
  deleteBtn: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: THEME.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: THEME.text,
  },
  modalBody: {
    gap: 12,
  },
  remainingBanner: {
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  remainingLabel: {
    fontSize: 13,
    color: "#92400E",
  },
  remainingValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#92400E",
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.text,
  },
  modalInput: {
    backgroundColor: THEME.bg,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: THEME.text,
  },
  methodRow: {
    marginBottom: 4,
  },
  methodChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: THEME.bg,
    borderWidth: 1,
    borderColor: THEME.border,
    marginRight: 8,
  },
  methodChipActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  methodChipText: {
    fontSize: 13,
    color: THEME.text,
    fontWeight: "500",
  },
  methodChipTextActive: {
    color: "#FFF",
  },
  paySubmitBtn: {
    backgroundColor: THEME.success,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  paySubmitText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFF",
  },
});
