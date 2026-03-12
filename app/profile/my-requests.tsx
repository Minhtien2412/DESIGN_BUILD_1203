/**
 * My Quote Requests Screen
 * Danh sách các yêu cầu báo giá của người dùng
 */

import { useAuth } from "@/context/AuthContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
    acceptQuote,
    cancelQuoteRequest,
    deleteQuoteRequest,
    getMyQuoteRequests,
    QuoteRequest,
    QuoteRequestStatus,
} from "@/services/quoteRequestService";
import { Ionicons } from "@expo/vector-icons";
import { Href, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Using QuoteRequest from service

const STATUS_CONFIG: Record<
  QuoteRequestStatus,
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
    color: "#0D9488",
    bgColor: "#CCFBF1",
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
  completed: {
    label: "Hoàn thành",
    color: "#059669",
    bgColor: "#d1fae5",
    icon: "checkmark-done-outline",
  },
};

export default function MyRequestsScreen() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const primary = useThemeColor({}, "primary");
  const background = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  const fetchRequests = async (isRefresh = false) => {
    if (!user?.id) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const result = await getMyQuoteRequests();
      if (result.ok && result.data) {
        setRequests(result.data.data || []);
      } else {
        throw new Error(result.error?.message || "Failed to fetch");
      }
    } catch (error: unknown) {
      console.error("Error fetching quote requests:", error);
      if (!isRefresh) {
        Alert.alert("Lỗi", "Không thể tải danh sách yêu cầu báo giá");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [user?.id]),
  );

  const handleCancelRequest = (request: QuoteRequest) => {
    if (request.status !== "pending") {
      Alert.alert("Không thể hủy", "Chỉ có thể hủy yêu cầu đang chờ xử lý");
      return;
    }

    Alert.alert(
      "Xác nhận hủy",
      `Bạn có chắc muốn hủy yêu cầu "${request.projectName}"?`,
      [
        { text: "Không", style: "cancel" },
        {
          text: "Hủy yêu cầu",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await cancelQuoteRequest(request.id);
              if (result.ok) {
                fetchRequests();
                Alert.alert("Thành công", "Đã hủy yêu cầu báo giá");
              } else {
                throw new Error(result.error?.message);
              }
            } catch (error) {
              Alert.alert("Lỗi", "Không thể hủy yêu cầu");
            }
          },
        },
      ],
    );
  };

  const handleDeleteRequest = (request: QuoteRequest) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc muốn xóa yêu cầu "${request.projectName}"?`,
      [
        { text: "Không", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await deleteQuoteRequest(request.id);
              if (result.ok) {
                setRequests((prev) => prev.filter((r) => r.id !== request.id));
                Alert.alert("Thành công", "Đã xóa yêu cầu báo giá");
              } else {
                throw new Error(result.error?.message);
              }
            } catch (error) {
              Alert.alert("Lỗi", "Không thể xóa yêu cầu");
            }
          },
        },
      ],
    );
  };

  const handleViewDetail = (request: QuoteRequest) => {
    router.push(`/profile/requests/${request.id}` as Href);
  };

  const handleAcceptQuote = async (request: QuoteRequest) => {
    if (request.status !== "quoted") {
      return;
    }

    Alert.alert(
      "Xác nhận chấp nhận báo giá",
      `Báo giá: ${formatCurrency(request.quotedAmount || 0)}\n\nBạn có chắc muốn chấp nhận báo giá này?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Chấp nhận",
          onPress: async () => {
            try {
              const result = await acceptQuote(request.id);
              if (result.ok) {
                fetchRequests();
                Alert.alert(
                  "Thành công",
                  "Đã chấp nhận báo giá. Đội ngũ sẽ liên hệ với bạn sớm.",
                );
              } else {
                throw new Error(result.error?.message);
              }
            } catch (error) {
              Alert.alert("Lỗi", "Không thể chấp nhận báo giá");
            }
          },
        },
      ],
    );
  };

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

  const renderRequestItem = ({ item }: { item: QuoteRequest }) => {
    const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;

    return (
      <TouchableOpacity
        style={styles.requestCard}
        onPress={() => handleViewDetail(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.codeContainer}>
            <Text style={styles.requestCode}>{item.code}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusConfig.bgColor },
              ]}
            >
              <Ionicons
                name={statusConfig.icon as any}
                size={12}
                color={statusConfig.color}
              />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.projectName} numberOfLines={2}>
            {item.projectName}
          </Text>

          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={14} color="#666" />
            <Text style={styles.infoText}>{item.projectType}</Text>
          </View>

          {item.budget && (
            <View style={styles.infoRow}>
              <Ionicons name="wallet-outline" size={14} color="#666" />
              <Text style={styles.infoText}>
                Ngân sách: {formatCurrency(item.budget)}
              </Text>
            </View>
          )}

          {item.quotedAmount && (
            <View
              style={[
                styles.quotedPriceContainer,
                { backgroundColor: primary + "15" },
              ]}
            >
              <Text style={styles.quotedPriceLabel}>Báo giá:</Text>
              <Text style={[styles.quotedPrice, { color: primary }]}>
                {formatCurrency(item.quotedAmount)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardActions}>
          {item.status === "pending" && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleCancelRequest(item)}
            >
              <Ionicons name="close-circle-outline" size={18} color="#ef4444" />
              <Text style={[styles.actionText, { color: "#ef4444" }]}>Hủy</Text>
            </TouchableOpacity>
          )}

          {item.status === "quoted" && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.acceptButton,
                { backgroundColor: primary },
              ]}
              onPress={() => handleAcceptQuote(item)}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color="#fff"
              />
              <Text style={[styles.actionText, { color: "#fff" }]}>
                Chấp nhận
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleViewDetail(item)}
          >
            <Ionicons name="chevron-forward" size={18} color="#666" />
            <Text style={styles.actionText}>Chi tiết</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>Chưa có yêu cầu báo giá</Text>
      <Text style={styles.emptySubtitle}>
        Tạo yêu cầu báo giá đầu tiên để nhận báo giá từ đội ngũ chuyên gia
      </Text>
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: primary }]}
        onPress={() => router.push("/quote-request" as Href)}
      >
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={styles.createButtonText}>Tạo yêu cầu báo giá</Text>
      </TouchableOpacity>
    </View>
  );

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
            Yêu cầu báo giá của tôi
          </Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primary} />
        </View>
      </View>
    );
  }

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
          Yêu cầu báo giá của tôi
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/quote-request" as Href)}
        >
          <Ionicons name="add" size={24} color={primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRequestItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchRequests(true)}
            colors={[primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
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
  addButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  requestCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  requestCode: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  dateText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  cardBody: {
    padding: 12,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  infoText: {
    fontSize: 13,
    color: "#666",
  },
  quotedPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
  },
  quotedPriceLabel: {
    fontSize: 13,
    color: "#666",
  },
  quotedPrice: {
    fontSize: 16,
    fontWeight: "700",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  acceptButton: {
    paddingHorizontal: 16,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 24,
    gap: 8,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});
