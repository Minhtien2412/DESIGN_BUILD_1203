import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const loyaltyInfo = {
  points: 12500,
  tier: "Gold",
  tierProgress: 75,
  nextTier: "Platinum",
  pointsToNextTier: 7500,
};

const rewards = [
  {
    id: "1",
    name: "Voucher 50K",
    points: 500,
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=80&q=80",
  },
  {
    id: "2",
    name: "Voucher 100K",
    points: 1000,
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=80&q=80",
  },
  {
    id: "3",
    name: "Freeship",
    points: 300,
    image:
      "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=80&q=80",
  },
  {
    id: "4",
    name: "Voucher 200K",
    points: 2000,
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=80&q=80",
  },
];

const history = [
  {
    id: "1",
    type: "earn",
    description: "Đơn hàng #ORD001",
    points: 285,
    date: "05/01/2026",
  },
  {
    id: "2",
    type: "spend",
    description: "Đổi voucher 100K",
    points: -1000,
    date: "03/01/2026",
  },
  {
    id: "3",
    type: "earn",
    description: "Đơn hàng #ORD002",
    points: 450,
    date: "28/12/2025",
  },
  {
    id: "4",
    type: "earn",
    description: "Đánh giá sản phẩm",
    points: 50,
    date: "25/12/2025",
  },
  {
    id: "5",
    type: "bonus",
    description: "Thưởng sinh nhật",
    points: 500,
    date: "20/12/2025",
  },
];

const tiers = [
  { name: "Bronze", minPoints: 0, color: "#CD7F32" },
  { name: "Silver", minPoints: 5000, color: "#C0C0C0" },
  { name: "Gold", minPoints: 10000, color: "#FFD700" },
  { name: "Platinum", minPoints: 20000, color: "#E5E4E2" },
  { name: "Diamond", minPoints: 50000, color: "#B9F2FF" },
];

export default function LoyaltyScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();

  const formatPoints = (points: number) => points.toLocaleString("vi-VN");

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: "Điểm thưởng", headerShown: true }} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Points Card */}
        <View style={styles.pointsCard}>
          <View style={styles.tierBadge}>
            <Ionicons name="diamond" size={20} color="#FFD700" />
            <Text style={styles.tierText}>{loyaltyInfo.tier}</Text>
          </View>

          <Text style={styles.pointsLabel}>Điểm hiện có</Text>
          <Text style={styles.pointsValue}>
            {formatPoints(loyaltyInfo.points)}
          </Text>

          <View style={styles.progressSection}>
            <View style={styles.progressLabels}>
              <Text style={styles.progressText}>{loyaltyInfo.tier}</Text>
              <Text style={styles.progressText}>{loyaltyInfo.nextTier}</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${loyaltyInfo.tierProgress}%` },
                ]}
              />
            </View>
            <Text style={styles.progressHint}>
              Còn {formatPoints(loyaltyInfo.pointsToNextTier)} điểm để lên{" "}
              {loyaltyInfo.nextTier}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction}>
              <View style={[styles.quickIcon, { backgroundColor: "#FFF3E0" }]}>
                <Ionicons name="gift-outline" size={24} color="#FF9800" />
              </View>
              <Text style={[styles.quickLabel, { color: textColor }]}>
                Đổi quà
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <View style={[styles.quickIcon, { backgroundColor: "#E8F5E9" }]}>
                <Ionicons name="calendar-outline" size={24} color="#4CAF50" />
              </View>
              <Text style={[styles.quickLabel, { color: textColor }]}>
                Điểm danh
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <View style={[styles.quickIcon, { backgroundColor: "#E3F2FD" }]}>
                <Ionicons name="trophy-outline" size={24} color="#2196F3" />
              </View>
              <Text style={[styles.quickLabel, { color: textColor }]}>
                Nhiệm vụ
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <View style={[styles.quickIcon, { backgroundColor: "#FCE4EC" }]}>
                <Ionicons
                  name="help-circle-outline"
                  size={24}
                  color="#E91E63"
                />
              </View>
              <Text style={[styles.quickLabel, { color: textColor }]}>
                Hướng dẫn
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Rewards */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Đổi điểm lấy quà
            </Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {rewards.map((reward) => (
              <TouchableOpacity key={reward.id} style={styles.rewardCard}>
                <Image
                  source={{ uri: reward.image }}
                  style={styles.rewardImage}
                />
                <Text style={[styles.rewardName, { color: textColor }]}>
                  {reward.name}
                </Text>
                <View style={styles.rewardPoints}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.rewardPointsText}>{reward.points}</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.redeemBtn,
                    loyaltyInfo.points < reward.points &&
                      styles.redeemBtnDisabled,
                  ]}
                  disabled={loyaltyInfo.points < reward.points}
                >
                  <Text style={styles.redeemBtnText}>Đổi</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tier Benefits */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Cấp bậc thành viên
          </Text>
          <View style={styles.tiersRow}>
            {tiers.map((tier, index) => (
              <View key={tier.name} style={styles.tierItem}>
                <View
                  style={[
                    styles.tierCircle,
                    { borderColor: tier.color },
                    tier.name === loyaltyInfo.tier && {
                      backgroundColor: tier.color,
                    },
                  ]}
                >
                  {tier.name === loyaltyInfo.tier && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <Text
                  style={[
                    styles.tierName,
                    tier.name === loyaltyInfo.tier && {
                      color: tier.color,
                      fontWeight: "bold",
                    },
                  ]}
                >
                  {tier.name}
                </Text>
                <Text style={styles.tierMinPoints}>
                  {formatPoints(tier.minPoints)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* History */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Lịch sử điểm
            </Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {history.map((item) => (
            <View key={item.id} style={styles.historyItem}>
              <View
                style={[
                  styles.historyIcon,
                  { backgroundColor: item.points > 0 ? "#E8F5E9" : "#FFEBEE" },
                ]}
              >
                <Ionicons
                  name={item.points > 0 ? "add" : "remove"}
                  size={20}
                  color={item.points > 0 ? "#4CAF50" : "#F44336"}
                />
              </View>
              <View style={styles.historyInfo}>
                <Text style={[styles.historyDesc, { color: textColor }]}>
                  {item.description}
                </Text>
                <Text style={styles.historyDate}>{item.date}</Text>
              </View>
              <Text
                style={[
                  styles.historyPoints,
                  { color: item.points > 0 ? "#4CAF50" : "#F44336" },
                ]}
              >
                {item.points > 0 ? "+" : ""}
                {formatPoints(item.points)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pointsCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    backgroundColor: "#FF6B35",
    alignItems: "center",
  },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 12,
  },
  tierText: { color: "#fff", fontWeight: "600" },
  pointsLabel: { color: "#fff", opacity: 0.9, fontSize: 14 },
  pointsValue: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "bold",
    marginVertical: 8,
  },
  progressSection: { width: "100%", marginTop: 12 },
  progressLabels: { flexDirection: "row", justifyContent: "space-between" },
  progressText: { color: "#fff", opacity: 0.9, fontSize: 12 },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 3,
    marginVertical: 8,
  },
  progressFill: { height: "100%", backgroundColor: "#fff", borderRadius: 3 },
  progressHint: {
    color: "#fff",
    opacity: 0.9,
    fontSize: 12,
    textAlign: "center",
  },
  section: { margin: 16, marginTop: 0, padding: 16, borderRadius: 12 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600" },
  viewAll: { color: "#FF6B35", fontSize: 14 },
  quickActions: { flexDirection: "row", justifyContent: "space-around" },
  quickAction: { alignItems: "center" },
  quickIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickLabel: { fontSize: 12 },
  rewardCard: { width: 120, marginRight: 12, alignItems: "center" },
  rewardImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    marginBottom: 8,
  },
  rewardName: { fontSize: 13, fontWeight: "500", marginBottom: 4 },
  rewardPoints: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  rewardPointsText: { color: "#666", fontSize: 12 },
  redeemBtn: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
  },
  redeemBtnDisabled: { backgroundColor: "#ccc" },
  redeemBtnText: { color: "#fff", fontSize: 12, fontWeight: "500" },
  tiersRow: { flexDirection: "row", justifyContent: "space-between" },
  tierItem: { alignItems: "center" },
  tierCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  tierName: { fontSize: 11, color: "#666", marginBottom: 2 },
  tierMinPoints: { fontSize: 10, color: "#999" },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  historyInfo: { flex: 1 },
  historyDesc: { fontSize: 14, fontWeight: "500" },
  historyDate: { color: "#999", fontSize: 12, marginTop: 2 },
  historyPoints: { fontSize: 16, fontWeight: "600" },
});
