import { useThemeColor } from "@/hooks/use-theme-color";
import { get } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

const bookings = [
  {
    id: "1",
    type: "worker",
    title: "Lắp đặt bồn cầu TOTO",
    worker: {
      name: "Thợ Nguyễn An",
      avatar: "https://ui-avatars.com/api/?name=An",
      rating: 4.9,
    },
    date: "10/01/2026",
    time: "09:00 - 11:00",
    status: "confirmed",
    address: "123 Nguyễn Văn Linh, Q.7, TP.HCM",
    price: 350000,
  },
  {
    id: "2",
    type: "consultation",
    title: "Tư vấn thiết kế phòng khách",
    worker: {
      name: "KTS. Minh Phong",
      avatar: "https://ui-avatars.com/api/?name=Phong",
      rating: 4.8,
    },
    date: "12/01/2026",
    time: "14:00 - 15:00",
    status: "pending",
    address: "Online - Google Meet",
    price: 0,
  },
  {
    id: "3",
    type: "contractor",
    title: "Khảo sát công trình xây dựng",
    worker: {
      name: "CT XD An Phát",
      avatar: "https://ui-avatars.com/api/?name=AP",
      rating: 4.9,
    },
    date: "08/01/2026",
    time: "08:00 - 10:00",
    status: "completed",
    address: "456 Lê Văn Việt, Q.9, TP.HCM",
    price: 500000,
  },
];

const statusConfig = {
  pending: { label: "Chờ xác nhận", color: "#FF9800", bg: "#FFF3E0" },
  confirmed: { label: "Đã xác nhận", color: "#4CAF50", bg: "#E8F5E9" },
  completed: { label: "Hoàn thành", color: "#2196F3", bg: "#E3F2FD" },
  cancelled: { label: "Đã hủy", color: "#F44336", bg: "#FFEBEE" },
};

const filterTabs = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ XN" },
  { id: "confirmed", label: "Sắp tới" },
  { id: "completed", label: "Hoàn thành" },
];

export default function BookingScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookingList, setBookingList] = useState(bookings);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await get("/api/bookings");
      if (res?.data) {
        setBookingList(res.data);
      }
    } catch {
      /* use mock data */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  }, [fetchBookings]);

  const handleCancelBooking = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Hủy lịch hẹn", "Bạn có chắc muốn hủy lịch hẹn này?", [
      { text: "Không" },
      {
        text: "Hủy",
        style: "destructive",
        onPress: () =>
          setBookingList((prev) =>
            prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)),
          ),
      },
    ]);
  }, []);

  const handleRebook = useCallback((booking: (typeof bookings)[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Đặt lại", `Đặt lại ${booking.title}?`, [
      { text: "Hủy" },
      {
        text: "Đặt lại",
        onPress: () => Alert.alert("Thành công", "Đã tạo lịch hẹn mới!"),
      },
    ]);
  }, []);

  const formatPrice = (price: number) => {
    if (price === 0) return "Miễn phí";
    return price.toLocaleString("vi-VN") + "đ";
  };

  const filteredBookings = bookingList.filter((b) => {
    if (activeTab === "all") return true;
    return b.status === activeTab;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "worker":
        return "construct-outline";
      case "consultation":
        return "chatbubbles-outline";
      case "contractor":
        return "business-outline";
      default:
        return "calendar-outline";
    }
  };

  const renderBooking = ({ item }: { item: (typeof bookings)[0] }) => {
    const status = statusConfig[item.status as keyof typeof statusConfig];

    return (
      <View style={[styles.bookingCard, { backgroundColor: cardBg }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.typeIcon, { backgroundColor: "#14B8A615" }]}>
            <Ionicons
              name={getTypeIcon(item.type) as any}
              size={20}
              color="#14B8A6"
            />
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.bookingTitle, { color: textColor }]}>
              {item.title}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <View
                style={[styles.statusDot, { backgroundColor: status.color }]}
              />
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.label}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.workerInfo}>
          <Image
            source={{ uri: item.worker.avatar }}
            style={styles.workerAvatar}
          />
          <View style={styles.workerDetails}>
            <Text style={[styles.workerName, { color: textColor }]}>
              {item.worker.name}
            </Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#FFB800" />
              <Text style={styles.ratingText}>{item.worker.rating}</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.date}</Text>
            <Ionicons
              name="time-outline"
              size={16}
              color="#666"
              style={{ marginLeft: 16 }}
            />
            <Text style={styles.detailText}>{item.time}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.address}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.priceLabel}>Chi phí</Text>
            <Text
              style={[
                styles.priceValue,
                item.price === 0 && { color: "#4CAF50" },
              ]}
            >
              {formatPrice(item.price)}
            </Text>
          </View>

          <View style={styles.footerActions}>
            {item.status === "pending" && (
              <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]}>
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
            )}
            {item.status === "confirmed" && (
              <>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#f0f0f0" }]}
                >
                  <Ionicons name="chatbubble-outline" size={18} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#f0f0f0" }]}
                >
                  <Ionicons name="call-outline" size={18} color="#666" />
                </TouchableOpacity>
              </>
            )}
            {item.status === "completed" && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.reviewBtn]}
                onPress={() =>
                  router.push(
                    `/service-booking/write-review?workerId=${item.id}&workerName=${encodeURIComponent(item.worker.name)}&workerAvatar=${encodeURIComponent(item.worker.avatar)}&bookingId=${item.id}&category=${encodeURIComponent(item.title)}` as any,
                  )
                }
              >
                <Ionicons name="star-outline" size={16} color="#14B8A6" />
                <Text style={styles.reviewBtnText}>Đánh giá</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.actionBtn, styles.viewBtn]}>
              <Text style={styles.viewBtnText}>Chi tiết</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: "Đặt lịch", headerShown: true }} />

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: cardBg }]}>
        {filterTabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredBookings.length > 0 ? (
        <FlatList
          data={filteredBookings}
          renderItem={renderBooking}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color="#ccc" />
          <Text style={[styles.emptyTitle, { color: textColor }]}>
            Chưa có lịch hẹn
          </Text>
          <Text style={styles.emptyDesc}>
            Đặt lịch với thợ hoặc nhà thầu ngay
          </Text>
          <TouchableOpacity style={styles.emptyBtn}>
            <Text style={styles.emptyBtnText}>Đặt lịch ngay</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFB" },
  tabsContainer: {
    flexDirection: "row",
    padding: 4,
    margin: 16,
    borderRadius: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  tabBtnActive: { backgroundColor: "#0D9488" },
  tabText: { color: "#6B7280", fontSize: 13, fontWeight: "500" },
  tabTextActive: { color: "#fff", fontWeight: "700" },
  listContent: { padding: 16, paddingTop: 0 },
  bookingCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: { flex: 1, marginLeft: 12 },
  bookingTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: "500" },
  workerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  workerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  workerDetails: { marginLeft: 12 },
  workerName: { fontSize: 14, fontWeight: "500" },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  ratingText: { fontSize: 12, color: "#666", marginLeft: 4 },
  detailsSection: { marginBottom: 16 },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  detailText: { color: "#666", fontSize: 13, marginLeft: 8, flex: 1 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: { color: "#999", fontSize: 11 },
  priceValue: {
    color: "#0D9488",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  footerActions: { flexDirection: "row", gap: 8 },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  cancelBtn: { borderWidth: 1, borderColor: "#F44336" },
  cancelBtnText: { color: "#F44336", fontSize: 13 },
  reviewBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#0D9488",
    gap: 4,
  },
  reviewBtnText: { color: "#0D9488", fontSize: 13 },
  viewBtn: { backgroundColor: "#0D9488" },
  viewBtnText: { color: "#fff", fontSize: 13 },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: { fontSize: 18, fontWeight: "600", marginTop: 16 },
  emptyDesc: { color: "#666", marginTop: 8 },
  emptyBtn: {
    backgroundColor: "#0D9488",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 20,
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
