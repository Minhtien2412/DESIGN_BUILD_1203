/**
 * Contract Quotes Screen - Báo giá nhận
 * Danh sách báo giá đã nhận từ nhà thầu
 * @updated 2026-02-04
 */
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#7CB342",
  secondary: "#2196F3",
  accent: "#FF9800",
  danger: "#F44336",
  success: "#4CAF50",
  purple: "#9C27B0",
  text: "#212121",
  textLight: "#757575",
  border: "#E0E0E0",
  white: "#FFFFFF",
};

// Quote status
const STATUS = {
  pending: { color: COLORS.accent, label: "Chờ duyệt", bg: "#FFF3E0" },
  approved: { color: COLORS.success, label: "Đã chấp nhận", bg: "#E8F5E9" },
  rejected: { color: COLORS.danger, label: "Từ chối", bg: "#FFEBEE" },
  expired: { color: COLORS.textLight, label: "Hết hạn", bg: "#F5F5F5" },
  negotiating: {
    color: COLORS.secondary,
    label: "Đang đàm phán",
    bg: "#E3F2FD",
  },
};

// Mock quotes
const quotes = [
  {
    id: "1",
    title: "Báo giá thi công phần thô",
    contractor: "Công ty XD Đại Phát",
    project: "Nhà phố Q7",
    amount: 850000000,
    validUntil: "15/02/2026",
    submittedDate: "08/01/2026",
    status: "pending",
    items: 12,
    rating: 4.5,
  },
  {
    id: "2",
    title: "Báo giá nội thất toàn bộ",
    contractor: "Nội thất Hoàng Gia",
    project: "Biệt thự Thảo Điền",
    amount: 320000000,
    validUntil: "20/02/2026",
    submittedDate: "07/01/2026",
    status: "negotiating",
    items: 45,
    rating: 4.8,
  },
  {
    id: "3",
    title: "Báo giá hệ thống điện",
    contractor: "Điện lực Sài Gòn",
    project: "Nhà phố Q7",
    amount: 95000000,
    validUntil: "25/01/2026",
    submittedDate: "05/01/2026",
    status: "approved",
    items: 8,
    rating: 4.2,
  },
  {
    id: "4",
    title: "Báo giá sơn hoàn thiện",
    contractor: "Sơn Nippon Pro",
    project: "Căn hộ Sala",
    amount: 45000000,
    validUntil: "10/01/2026",
    submittedDate: "28/12/2025",
    status: "expired",
    items: 5,
    rating: 4.0,
  },
  {
    id: "5",
    title: "Báo giá gia công cửa nhôm",
    contractor: "Nhôm Xingfa VN",
    project: "Biệt thự Thảo Điền",
    amount: 125000000,
    validUntil: "30/01/2026",
    submittedDate: "03/01/2026",
    status: "rejected",
    items: 15,
    rating: 3.8,
  },
];

const tabs = ["Tất cả", "Chờ duyệt", "Đã chấp nhận", "Đàm phán"];

export default function ContractQuotesScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [searchText, setSearchText] = useState("");

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return (price / 1000000000).toFixed(1) + " tỷ";
    }
    return (price / 1000000).toFixed(0) + " triệu";
  };

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      quote.title.toLowerCase().includes(searchText.toLowerCase()) ||
      quote.contractor.toLowerCase().includes(searchText.toLowerCase());
    if (activeTab === "Tất cả") return matchesSearch;
    if (activeTab === "Chờ duyệt")
      return matchesSearch && quote.status === "pending";
    if (activeTab === "Đã chấp nhận")
      return matchesSearch && quote.status === "approved";
    if (activeTab === "Đàm phán")
      return matchesSearch && quote.status === "negotiating";
    return matchesSearch;
  });

  const handleQuotePress = (quote: (typeof quotes)[0]) => {
    Alert.alert(
      quote.title,
      `Nhà thầu: ${quote.contractor}\nGiá: ${formatPrice(quote.amount)}\nHạn: ${quote.validUntil}`,
    );
  };

  const handleCompare = () => {
    Alert.alert(
      "So sánh báo giá",
      "Chức năng so sánh các báo giá sẽ được bổ sung",
    );
  };

  const renderQuote = ({ item }: { item: (typeof quotes)[0] }) => {
    const status = STATUS[item.status as keyof typeof STATUS];

    return (
      <TouchableOpacity
        style={[styles.quoteCard, { backgroundColor: cardBg }]}
        onPress={() => handleQuotePress(item)}
      >
        <View style={styles.quoteHeader}>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <View
              style={[styles.statusDot, { backgroundColor: status.color }]}
            />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
          <TouchableOpacity>
            <Ionicons
              name="ellipsis-vertical"
              size={18}
              color={COLORS.textLight}
            />
          </TouchableOpacity>
        </View>

        <Text style={[styles.quoteTitle, { color: textColor }]}>
          {item.title}
        </Text>

        <View style={styles.contractorRow}>
          <View style={styles.contractorInfo}>
            <View style={styles.contractorAvatar}>
              <Ionicons name="business" size={18} color={COLORS.secondary} />
            </View>
            <View>
              <Text style={styles.contractorName}>{item.contractor}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#FFB800" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.quoteDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="pricetag" size={16} color={COLORS.primary} />
            <Text style={[styles.detailValue, { color: COLORS.primary }]}>
              {formatPrice(item.amount)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="list" size={16} color={COLORS.textLight} />
            <Text style={styles.detailText}>{item.items} hạng mục</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="calendar" size={16} color={COLORS.textLight} />
            <Text style={styles.detailText}>HSD: {item.validUntil}</Text>
          </View>
        </View>

        <View style={styles.quoteFooter}>
          <View style={styles.projectBadge}>
            <Ionicons name="home" size={12} color={COLORS.secondary} />
            <Text style={styles.projectName}>{item.project}</Text>
          </View>
          <Text style={styles.submittedDate}>
            Ngày gửi: {item.submittedDate}
          </Text>
        </View>

        {item.status === "pending" && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]}>
              <Ionicons name="close" size={16} color={COLORS.danger} />
              <Text style={[styles.actionBtnText, { color: COLORS.danger }]}>
                Từ chối
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.negotiateBtn]}>
              <Ionicons name="chatbubbles" size={16} color={COLORS.secondary} />
              <Text style={[styles.actionBtnText, { color: COLORS.secondary }]}>
                Đàm phán
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]}>
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={[styles.actionBtnText, { color: "#fff" }]}>
                Chấp nhận
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: "Báo giá nhận",
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.secondary },
          headerTintColor: "#fff",
          headerRight: () => (
            <TouchableOpacity
              onPress={handleCompare}
              style={{ marginRight: 12 }}
            >
              <Ionicons name="git-compare" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View
          style={[styles.statBox, { backgroundColor: COLORS.accent + "15" }]}
        >
          <Text style={[styles.statValue, { color: COLORS.accent }]}>
            {quotes.filter((q) => q.status === "pending").length}
          </Text>
          <Text style={styles.statLabel}>Chờ duyệt</Text>
        </View>
        <View
          style={[styles.statBox, { backgroundColor: COLORS.secondary + "15" }]}
        >
          <Text style={[styles.statValue, { color: COLORS.secondary }]}>
            {quotes.filter((q) => q.status === "negotiating").length}
          </Text>
          <Text style={styles.statLabel}>Đàm phán</Text>
        </View>
        <View
          style={[styles.statBox, { backgroundColor: COLORS.success + "15" }]}
        >
          <Text style={[styles.statValue, { color: COLORS.success }]}>
            {quotes.filter((q) => q.status === "approved").length}
          </Text>
          <Text style={styles.statLabel}>Chấp nhận</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: cardBg }]}>
        <Ionicons name="search" size={20} color={COLORS.textLight} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Tìm báo giá..."
          placeholderTextColor={COLORS.textLight}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Quotes List */}
      <FlatList
        data={filteredQuotes}
        keyExtractor={(item) => item.id}
        renderItem={renderQuote}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="document-text-outline"
              size={48}
              color={COLORS.textLight}
            />
            <Text style={styles.emptyText}>Không có báo giá nào</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    padding: 12,
    gap: 10,
  },
  statBox: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  tabsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: COLORS.secondary,
  },
  tabText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#fff",
  },
  listContent: {
    padding: 12,
    paddingTop: 0,
    paddingBottom: 100,
  },
  quoteCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  quoteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  quoteTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
  },
  contractorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contractorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  contractorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondary + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  contractorName: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.text,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  quoteDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  detailText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  quoteFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  projectBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary + "15",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  projectName: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: "500",
  },
  submittedDate: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  rejectBtn: {
    backgroundColor: COLORS.danger + "15",
  },
  negotiateBtn: {
    backgroundColor: COLORS.secondary + "15",
  },
  approveBtn: {
    backgroundColor: COLORS.success,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 12,
  },
});
