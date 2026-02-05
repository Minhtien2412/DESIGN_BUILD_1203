/**
 * Quote Request Detail Screen
 * Chi tiết yêu cầu báo giá
 */

import { useAuth } from "@/context/AuthContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { get, post } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import {
    Href,
    router,
    useFocusEffect,
    useLocalSearchParams,
} from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface QuoteRequest {
  id: number;
  code: string;
  projectName: string;
  projectType: string;
  projectTypeLabel?: string;
  area?: number;
  budget?: string;
  description: string;
  address?: string;
  contactName?: string;
  contactPhone: string;
  contactEmail?: string;
  status:
    | "pending"
    | "reviewing"
    | "quoted"
    | "accepted"
    | "rejected"
    | "cancelled";
  quotedPrice?: number;
  quotedAt?: string;
  quotedBy?: string;
  adminNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  pending: {
    label: "Chờ xử lý",
    color: "#f59e0b",
    bgColor: "#fef3c7",
    icon: "time-outline",
  },
  reviewing: {
    label: "Đang xem xét",
    color: "#3b82f6",
    bgColor: "#dbeafe",
    icon: "eye-outline",
  },
  quoted: {
    label: "Đã báo giá",
    color: "#8b5cf6",
    bgColor: "#ede9fe",
    icon: "pricetag-outline",
  },
  accepted: {
    label: "Đã chấp nhận",
    color: "#10b981",
    bgColor: "#d1fae5",
    icon: "checkmark-circle-outline",
  },
  rejected: {
    label: "Đã từ chối",
    color: "#ef4444",
    bgColor: "#fee2e2",
    icon: "close-circle-outline",
  },
  cancelled: {
    label: "Đã hủy",
    color: "#6b7280",
    bgColor: "#f3f4f6",
    icon: "ban-outline",
  },
};

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [request, setRequest] = useState<QuoteRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const primary = useThemeColor({}, "primary");
  const background = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  const fetchRequest = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await get<QuoteRequest>(`/quote-requests/${id}`);
      setRequest(response);
    } catch (error: any) {
      console.error("Error fetching quote request:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin yêu cầu báo giá");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRequest();
    }, [id]),
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

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

  const handleAcceptQuote = () => {
    if (!request || request.status !== "quoted") return;

    Alert.alert(
      "Xác nhận chấp nhận báo giá",
      `Báo giá: ${formatCurrency(request.quotedPrice || 0)}\n\nBạn có chắc muốn chấp nhận báo giá này? Đội ngũ sẽ liên hệ với bạn để tiến hành các bước tiếp theo.`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Chấp nhận",
          onPress: async () => {
            setActionLoading(true);
            try {
              await post(`/quote-requests/${id}/accept`, {});
              await fetchRequest();
              Alert.alert(
                "Thành công",
                "Đã chấp nhận báo giá. Đội ngũ sẽ liên hệ với bạn sớm.",
              );
            } catch (error) {
              Alert.alert("Lỗi", "Không thể chấp nhận báo giá");
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleRejectQuote = async () => {
    if (!request || request.status !== "quoted") return;

    if (!rejectReason.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập lý do từ chối");
      return;
    }

    setActionLoading(true);
    try {
      await post(`/quote-requests/${id}/reject`, { reason: rejectReason });
      setShowRejectModal(false);
      setRejectReason("");
      await fetchRequest();
      Alert.alert("Thành công", "Đã từ chối báo giá");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể từ chối báo giá");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRequest = () => {
    if (!request || request.status !== "pending") return;

    Alert.alert(
      "Xác nhận hủy yêu cầu",
      "Bạn có chắc muốn hủy yêu cầu báo giá này?",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Hủy yêu cầu",
          style: "destructive",
          onPress: async () => {
            setActionLoading(true);
            try {
              await post(`/quote-requests/${id}/cancel`, {});
              await fetchRequest();
              Alert.alert("Thành công", "Đã hủy yêu cầu báo giá");
            } catch (error) {
              Alert.alert("Lỗi", "Không thể hủy yêu cầu");
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleContactSupport = () => {
    router.push("/customer-support" as Href);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: background }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Chi tiết yêu cầu
          </Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primary} />
        </View>
      </View>
    );
  }

  if (!request) {
    return (
      <View style={[styles.container, { backgroundColor: background }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Chi tiết yêu cầu
          </Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={styles.errorText}>Không tìm thấy yêu cầu báo giá</Text>
        </View>
      </View>
    );
  }

  const statusConfig = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Chi tiết yêu cầu
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <View
          style={[
            styles.statusBanner,
            { backgroundColor: statusConfig.bgColor },
          ]}
        >
          <Ionicons
            name={statusConfig.icon as any}
            size={24}
            color={statusConfig.color}
          />
          <View style={styles.statusInfo}>
            <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
            <Text style={styles.requestCode}>{request.code}</Text>
          </View>
        </View>

        {/* Quote Price (if quoted) */}
        {request.quotedPrice && (
          <View style={[styles.quoteSection, { borderColor: primary }]}>
            <View style={styles.quoteHeader}>
              <Ionicons name="pricetag" size={20} color={primary} />
              <Text style={[styles.quoteTitle, { color: primary }]}>
                Báo giá
              </Text>
            </View>
            <Text style={[styles.quotePrice, { color: primary }]}>
              {formatCurrency(request.quotedPrice)}
            </Text>
            {request.quotedAt && (
              <Text style={styles.quoteDate}>
                Báo giá lúc: {formatDate(request.quotedAt)}
              </Text>
            )}
            {request.adminNotes && (
              <View style={styles.noteBox}>
                <Text style={styles.noteLabel}>Ghi chú từ đội ngũ:</Text>
                <Text style={styles.noteText}>{request.adminNotes}</Text>
              </View>
            )}
          </View>
        )}

        {/* Rejection Reason (if rejected) */}
        {request.status === "rejected" && request.rejectionReason && (
          <View style={styles.rejectionBox}>
            <Ionicons name="information-circle" size={20} color="#ef4444" />
            <View style={styles.rejectionContent}>
              <Text style={styles.rejectionLabel}>Lý do từ chối:</Text>
              <Text style={styles.rejectionText}>
                {request.rejectionReason}
              </Text>
            </View>
          </View>
        )}

        {/* Project Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin dự án</Text>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Tên dự án</Text>
            <Text style={styles.infoValue}>{request.projectName}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Loại dự án</Text>
            <Text style={styles.infoValue}>
              {request.projectTypeLabel || request.projectType}
            </Text>
          </View>

          {request.area && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Diện tích</Text>
              <Text style={styles.infoValue}>{request.area} m²</Text>
            </View>
          )}

          {request.budget && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Ngân sách dự kiến</Text>
              <Text style={styles.infoValue}>{request.budget}</Text>
            </View>
          )}

          {request.address && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Địa chỉ</Text>
              <Text style={styles.infoValue}>{request.address}</Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả yêu cầu</Text>
          <Text style={styles.descriptionText}>{request.description}</Text>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>

          {request.contactName && (
            <View style={styles.contactItem}>
              <Ionicons name="person-outline" size={18} color="#666" />
              <Text style={styles.contactText}>{request.contactName}</Text>
            </View>
          )}

          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={18} color="#666" />
            <Text style={styles.contactText}>{request.contactPhone}</Text>
          </View>

          {request.contactEmail && (
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={18} color="#666" />
              <Text style={styles.contactText}>{request.contactEmail}</Text>
            </View>
          )}
        </View>

        {/* Timestamps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thời gian</Text>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Tạo lúc</Text>
            <Text style={styles.infoValue}>
              {formatDate(request.createdAt)}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Cập nhật lúc</Text>
            <Text style={styles.infoValue}>
              {formatDate(request.updatedAt)}
            </Text>
          </View>
        </View>

        {/* Support */}
        <TouchableOpacity
          style={styles.supportButton}
          onPress={handleContactSupport}
        >
          <Ionicons name="headset-outline" size={20} color={primary} />
          <Text style={[styles.supportText, { color: primary }]}>
            Liên hệ hỗ trợ
          </Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Action Buttons */}
      {(request.status === "pending" || request.status === "quoted") && (
        <View style={styles.footer}>
          {request.status === "pending" && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelRequest}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <>
                  <Ionicons
                    name="close-circle-outline"
                    size={20}
                    color="#ef4444"
                  />
                  <Text style={styles.cancelButtonText}>Hủy yêu cầu</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {request.status === "quoted" && (
            <>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => setShowRejectModal(true)}
                disabled={actionLoading}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={20}
                  color="#ef4444"
                />
                <Text style={styles.rejectButtonText}>Từ chối</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.acceptButton, { backgroundColor: primary }]}
                onPress={handleAcceptQuote}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={20}
                      color="#fff"
                    />
                    <Text style={styles.acceptButtonText}>
                      Chấp nhận báo giá
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Từ chối báo giá</Text>
            <Text style={styles.modalSubtitle}>
              Vui lòng cho chúng tôi biết lý do bạn từ chối báo giá này
            </Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="Nhập lý do từ chối..."
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalConfirmButton,
                  { backgroundColor: "#ef4444" },
                ]}
                onPress={handleRejectQuote}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmText}>Xác nhận từ chối</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
  },
  content: {
    flex: 1,
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    gap: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  requestCode: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  quoteSection: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  quoteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  quoteTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  quotePrice: {
    fontSize: 28,
    fontWeight: "700",
  },
  quoteDate: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  noteBox: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  rejectionBox: {
    flexDirection: "row",
    backgroundColor: "#fee2e2",
    margin: 16,
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  rejectionContent: {
    flex: 1,
  },
  rejectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ef4444",
  },
  rejectionText: {
    fontSize: 14,
    color: "#b91c1c",
    marginTop: 4,
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 22,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 14,
    color: "#333",
  },
  supportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    gap: 8,
  },
  supportText: {
    fontSize: 15,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ef4444",
    gap: 6,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ef4444",
  },
  rejectButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ef4444",
    gap: 6,
  },
  rejectButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ef4444",
  },
  acceptButton: {
    flex: 2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 10,
    gap: 6,
  },
  acceptButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  reasonInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    minHeight: 100,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});
