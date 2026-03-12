/**
 * Contract Settlement Screen - Thanh lý hợp đồng
 * Quản lý thanh lý và đóng hợp đồng
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

// Settlement status
const STATUS = {
  pending: { color: COLORS.accent, label: "Chờ thanh lý", bg: "#FFF3E0" },
  reviewing: { color: COLORS.secondary, label: "Đang xem xét", bg: "#E3F2FD" },
  approved: { color: COLORS.success, label: "Đã thanh lý", bg: "#E8F5E9" },
  disputed: { color: COLORS.danger, label: "Tranh chấp", bg: "#FFEBEE" },
};

// Mock settlements
const settlements = [
  {
    id: "1",
    contractName: "HĐ thi công nhà phố Q7",
    contractCode: "HD-2025-001",
    contractor: "Công ty XD Đại Phát",
    totalValue: 1200000000,
    completedValue: 1150000000,
    retainedValue: 50000000,
    startDate: "01/03/2025",
    endDate: "31/12/2025",
    status: "pending",
    warrantyPeriod: "12 tháng",
    defects: 2,
  },
  {
    id: "2",
    contractName: "HĐ thiết kế biệt thự TD",
    contractCode: "HD-2025-015",
    contractor: "Kiến trúc Việt",
    totalValue: 150000000,
    completedValue: 150000000,
    retainedValue: 0,
    startDate: "01/06/2025",
    endDate: "30/09/2025",
    status: "approved",
    warrantyPeriod: "6 tháng",
    defects: 0,
  },
  {
    id: "3",
    contractName: "HĐ cung cấp vật liệu",
    contractCode: "HD-2025-022",
    contractor: "VLXD Miền Nam",
    totalValue: 450000000,
    completedValue: 430000000,
    retainedValue: 20000000,
    startDate: "01/04/2025",
    endDate: "30/11/2025",
    status: "reviewing",
    warrantyPeriod: "24 tháng",
    defects: 1,
  },
  {
    id: "4",
    contractName: "HĐ điện nước căn hộ",
    contractCode: "HD-2025-033",
    contractor: "MEP Solutions",
    totalValue: 95000000,
    completedValue: 85000000,
    retainedValue: 10000000,
    startDate: "01/07/2025",
    endDate: "31/10/2025",
    status: "disputed",
    warrantyPeriod: "12 tháng",
    defects: 3,
  },
];

const tabs = ["Tất cả", "Chờ thanh lý", "Đang xem xét", "Đã thanh lý"];

export default function ContractSettlementScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Tất cả");

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return (price / 1000000000).toFixed(2) + " tỷ";
    }
    return (price / 1000000).toFixed(0) + " triệu";
  };

  const filteredSettlements = settlements.filter((item) => {
    if (activeTab === "Tất cả") return true;
    if (activeTab === "Chờ thanh lý") return item.status === "pending";
    if (activeTab === "Đang xem xét") return item.status === "reviewing";
    if (activeTab === "Đã thanh lý") return item.status === "approved";
    return true;
  });

  const handleSettlementPress = (item: (typeof settlements)[0]) => {
    Alert.alert(
      item.contractName,
      `Mã HĐ: ${item.contractCode}\nGiá trị: ${formatPrice(item.totalValue)}`,
    );
  };

  const handleCreateSettlement = () => {
    Alert.alert("Tạo thanh lý", "Chọn hợp đồng cần thanh lý");
  };

  const renderSettlement = ({ item }: { item: (typeof settlements)[0] }) => {
    const status = STATUS[item.status as keyof typeof STATUS];
    const completionRate = Math.round(
      (item.completedValue / item.totalValue) * 100,
    );

    return (
      <TouchableOpacity
        style={[styles.settlementCard, { backgroundColor: cardBg }]}
        onPress={() => handleSettlementPress(item)}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <View
              style={[styles.statusDot, { backgroundColor: status.color }]}
            />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
          <Text style={styles.contractCode}>{item.contractCode}</Text>
        </View>

        <Text style={[styles.contractName, { color: textColor }]}>
          {item.contractName}
        </Text>

        <View style={styles.contractorRow}>
          <Ionicons
            name="business-outline"
            size={14}
            color={COLORS.textLight}
          />
          <Text style={styles.contractorName}>{item.contractor}</Text>
        </View>

        {/* Values Grid */}
        <View style={styles.valuesGrid}>
          <View style={styles.valueItem}>
            <Text style={styles.valueLabel}>Giá trị HĐ</Text>
            <Text style={[styles.valueAmount, { color: COLORS.text }]}>
              {formatPrice(item.totalValue)}
            </Text>
          </View>
          <View style={styles.valueItem}>
            <Text style={styles.valueLabel}>Đã thanh toán</Text>
            <Text style={[styles.valueAmount, { color: COLORS.success }]}>
              {formatPrice(item.completedValue)}
            </Text>
          </View>
          <View style={styles.valueItem}>
            <Text style={styles.valueLabel}>Giữ lại</Text>
            <Text style={[styles.valueAmount, { color: COLORS.accent }]}>
              {formatPrice(item.retainedValue)}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Tiến độ thanh toán</Text>
            <Text style={styles.progressValue}>{completionRate}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${completionRate}%` }]}
            />
          </View>
        </View>

        {/* Meta Info */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={COLORS.textLight}
            />
            <Text style={styles.metaText}>
              {item.startDate} - {item.endDate}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons
              name="shield-checkmark-outline"
              size={14}
              color={COLORS.textLight}
            />
            <Text style={styles.metaText}>BH: {item.warrantyPeriod}</Text>
          </View>
          {item.defects > 0 && (
            <View
              style={[
                styles.defectBadge,
                { backgroundColor: COLORS.danger + "15" },
              ]}
            >
              <Ionicons name="warning" size={12} color={COLORS.danger} />
              <Text style={[styles.defectText, { color: COLORS.danger }]}>
                {item.defects} lỗi
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        {item.status === "pending" && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.viewBtn]}>
              <Ionicons name="eye-outline" size={16} color={COLORS.secondary} />
              <Text style={[styles.actionBtnText, { color: COLORS.secondary }]}>
                Xem chi tiết
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.settleBtn]}>
              <Ionicons name="checkmark-done" size={16} color="#fff" />
              <Text style={[styles.actionBtnText, { color: "#fff" }]}>
                Thanh lý
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Summary stats
  const totalValue = settlements.reduce((sum, s) => sum + s.totalValue, 0);
  const totalRetained = settlements.reduce(
    (sum, s) => sum + s.retainedValue,
    0,
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: "Thanh lý hợp đồng",
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.purple },
          headerTintColor: "#fff",
          headerRight: () => (
            <TouchableOpacity
              onPress={handleCreateSettlement}
              style={{ marginRight: 12 }}
            >
              <Ionicons name="add-circle" size={28} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: COLORS.purple + "15" },
          ]}
        >
          <Ionicons name="document-text" size={24} color={COLORS.purple} />
          <Text style={[styles.summaryValue, { color: COLORS.purple }]}>
            {settlements.length}
          </Text>
          <Text style={styles.summaryLabel}>Tổng HĐ</Text>
        </View>
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: COLORS.success + "15" },
          ]}
        >
          <Ionicons name="cash" size={24} color={COLORS.success} />
          <Text style={[styles.summaryValue, { color: COLORS.success }]}>
            {formatPrice(totalValue)}
          </Text>
          <Text style={styles.summaryLabel}>Tổng giá trị</Text>
        </View>
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: COLORS.accent + "15" },
          ]}
        >
          <Ionicons name="lock-closed" size={24} color={COLORS.accent} />
          <Text style={[styles.summaryValue, { color: COLORS.accent }]}>
            {formatPrice(totalRetained)}
          </Text>
          <Text style={styles.summaryLabel}>Tiền giữ lại</Text>
        </View>
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

      {/* Settlements List */}
      <FlatList
        data={filteredSettlements}
        keyExtractor={(item) => item.id}
        renderItem={renderSettlement}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="clipboard-outline"
              size={48}
              color={COLORS.textLight}
            />
            <Text style={styles.emptyText}>Không có hợp đồng cần thanh lý</Text>
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
  summaryRow: {
    flexDirection: "row",
    padding: 12,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 6,
  },
  summaryLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 2,
  },
  tabsContainer: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: COLORS.purple,
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
  settlementCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardHeader: {
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
  contractCode: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  contractName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },
  contractorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  contractorName: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  valuesGrid: {
    flexDirection: "row",
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  valueItem: {
    flex: 1,
    alignItems: "center",
  },
  valueLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  valueAmount: {
    fontSize: 14,
    fontWeight: "700",
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.success,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.success,
    borderRadius: 3,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  defectBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  defectText: {
    fontSize: 11,
    fontWeight: "500",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
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
    gap: 6,
  },
  viewBtn: {
    backgroundColor: COLORS.secondary + "15",
  },
  settleBtn: {
    backgroundColor: COLORS.purple,
  },
  actionBtnText: {
    fontSize: 13,
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
