import { GRADIENTS } from "@/constants/modern-ui-styles";
import { useThemeColor } from "@/hooks/use-theme-color";
import { get } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

const walletData = {
  balance: 2500000,
  pendingCashback: 150000,
  points: 12500,
};

const transactions = [
  {
    id: "1",
    type: "payment",
    title: "Thanh toán đơn #ORD001",
    amount: -850000,
    date: "08/01/2026",
    status: "completed",
  },
  {
    id: "2",
    type: "cashback",
    title: "Hoàn tiền 5%",
    amount: 42500,
    date: "08/01/2026",
    status: "completed",
  },
  {
    id: "3",
    type: "topup",
    title: "Nạp tiền từ BIDV",
    amount: 1000000,
    date: "05/01/2026",
    status: "completed",
  },
  {
    id: "4",
    type: "payment",
    title: "Thanh toán đơn #ORD089",
    amount: -320000,
    date: "03/01/2026",
    status: "completed",
  },
  {
    id: "5",
    type: "refund",
    title: "Hoàn tiền đơn #ORD076",
    amount: 250000,
    date: "01/01/2026",
    status: "completed",
  },
];

const quickActions = [
  { id: "1", icon: "add-circle-outline", label: "Nạp tiền", color: "#4CAF50" },
  {
    id: "2",
    icon: "arrow-up-circle-outline",
    label: "Chuyển tiền",
    color: "#2196F3",
  },
  { id: "3", icon: "gift-outline", label: "Quà tặng", color: "#FF9800" },
  { id: "4", icon: "receipt-outline", label: "Hóa đơn", color: "#9C27B0" },
];

const linkedBanks = [
  { id: "1", name: "BIDV", lastDigits: "4589", icon: "card-outline" },
  { id: "2", name: "Vietcombank", lastDigits: "7823", icon: "card-outline" },
];

export default function WalletScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [wallet, setWallet] = useState(walletData);
  const [txList, setTxList] = useState(transactions);

  const fetchWallet = useCallback(async () => {
    try {
      const res = await get("/api/wallet");
      if (res?.data) {
        setWallet(res.data);
      }
      const txRes = await get("/api/wallet/transactions");
      if (txRes?.data) {
        setTxList(txRes.data);
      }
    } catch {
      /* use mock data */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWallet();
    setRefreshing(false);
  }, [fetchWallet]);

  const handleQuickAction = (label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (label) {
      case "Nạp tiền":
        Alert.alert("Nạp tiền", "Chức năng đang kết nối ngân hàng...");
        break;
      case "Chuyển tiền":
        Alert.alert("Chuyển tiền", "Nhập số tài khoản người nhận");
        break;
      case "Quà tặng":
        router.push("/profile/vouchers");
        break;
      case "Hóa đơn":
        router.push("/profile/orders");
        break;
      default:
        break;
    }
  };

  const formatPrice = (price: number) => {
    const absPrice = Math.abs(price);
    return (price < 0 ? "-" : "+") + absPrice.toLocaleString("vi-VN") + "đ";
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "payment":
        return { icon: "cart-outline", color: "#F44336" };
      case "cashback":
        return { icon: "gift-outline", color: "#4CAF50" };
      case "topup":
        return { icon: "add-circle-outline", color: "#2196F3" };
      case "refund":
        return { icon: "refresh-outline", color: "#FF9800" };
      default:
        return { icon: "cash-outline", color: "#666" };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: "Ví của tôi", headerShown: true }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#14B8A6"
          />
        }
      >
        {/* Balance Card */}
        <LinearGradient
          colors={GRADIENTS.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Số dư khả dụng</Text>
            <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
              <Ionicons
                name={showBalance ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>
            {showBalance
              ? wallet.balance.toLocaleString("vi-VN") + "đ"
              : "••••••••"}
          </Text>
          <View style={styles.balanceFooter}>
            <View style={styles.balanceItem}>
              <Ionicons name="gift" size={16} color="#FFD700" />
              <Text style={styles.balanceItemText}>
                Cashback chờ: {wallet.pendingCashback.toLocaleString("vi-VN")}đ
              </Text>
            </View>
            <View style={styles.balanceItem}>
              <Ionicons name="diamond" size={16} color="#FFD700" />
              <Text style={styles.balanceItemText}>
                {wallet.points.toLocaleString("vi-VN")} điểm
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionItem}
                onPress={() => handleQuickAction(action.label)}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: action.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={action.icon as any}
                    size={24}
                    color={action.color}
                  />
                </View>
                <Text style={[styles.quickActionLabel, { color: textColor }]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Linked Banks */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Liên kết ngân hàng
            </Text>
            <TouchableOpacity>
              <Ionicons name="add-circle-outline" size={22} color="#14B8A6" />
            </TouchableOpacity>
          </View>
          {linkedBanks.map((bank) => (
            <View key={bank.id} style={styles.bankItem}>
              <View style={[styles.bankIcon, { backgroundColor: "#f0f0f0" }]}>
                <Ionicons name={bank.icon as any} size={20} color="#333" />
              </View>
              <View style={styles.bankInfo}>
                <Text style={[styles.bankName, { color: textColor }]}>
                  {bank.name}
                </Text>
                <Text style={styles.bankNumber}>**** {bank.lastDigits}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
          ))}
        </View>

        {/* Transactions */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Lịch sử giao dịch
            </Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {transactions.map((tx) => {
            const txIcon = getTransactionIcon(tx.type);
            return (
              <View key={tx.id} style={styles.transactionItem}>
                <View
                  style={[
                    styles.txIcon,
                    { backgroundColor: txIcon.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={txIcon.icon as any}
                    size={18}
                    color={txIcon.color}
                  />
                </View>
                <View style={styles.txInfo}>
                  <Text style={[styles.txTitle, { color: textColor }]}>
                    {tx.title}
                  </Text>
                  <Text style={styles.txDate}>{tx.date}</Text>
                </View>
                <Text
                  style={[
                    styles.txAmount,
                    { color: tx.amount > 0 ? "#4CAF50" : "#F44336" },
                  ]}
                >
                  {formatPrice(tx.amount)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Promo */}
        <TouchableOpacity
          style={[styles.promoCard, { backgroundColor: "#4CAF50" }]}
        >
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>🎉 Nạp tiền nhận cashback 10%</Text>
            <Text style={styles.promoDesc}>
              Áp dụng cho lần nạp đầu tiên từ 500.000đ
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFB" },
  balanceCard: {
    margin: 16,
    padding: 24,
    borderRadius: 24,
    overflow: "hidden" as const,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: { color: "#fff", opacity: 0.9 },
  balanceAmount: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "800",
    marginTop: 8,
    letterSpacing: -1,
  },
  balanceFooter: {
    flexDirection: "row",
    marginTop: 16,
    gap: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  balanceItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  balanceItemText: { color: "#fff", opacity: 0.9, fontSize: 12 },
  section: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600" },
  viewAll: { color: "#0D9488", fontSize: 14 },
  quickActionsGrid: { flexDirection: "row", justifyContent: "space-between" },
  quickActionItem: { alignItems: "center", width: "23%" },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionLabel: { fontSize: 12 },
  bankItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  bankIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  bankInfo: { flex: 1, marginLeft: 12 },
  bankName: { fontSize: 14, fontWeight: "500" },
  bankNumber: { color: "#666", fontSize: 12, marginTop: 2 },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  txInfo: { flex: 1, marginLeft: 12 },
  txTitle: { fontSize: 14 },
  txDate: { color: "#999", fontSize: 12, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: "600" },
  promoCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  promoContent: { flex: 1 },
  promoTitle: { color: "#fff", fontSize: 15, fontWeight: "600" },
  promoDesc: { color: "#fff", opacity: 0.9, fontSize: 12, marginTop: 4 },
});
