/**
 * Achievements Screen
 * @route /profile/achievements
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { memo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  primary: "#10B981",
  bg: "#F8FAFC",
  card: "#FFFFFF",
  text: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  gold: "#F59E0B",
  silver: "#94A3B8",
  bronze: "#CD7F32",
};

interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  color: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  xp: number;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "1",
    icon: "star",
    title: "Thành viên mới",
    description: "Tạo tài khoản thành công",
    unlocked: true,
    unlockedAt: "15/01/2026",
    color: "#F59E0B",
    tier: "bronze",
    xp: 50,
  },
  {
    id: "2",
    icon: "shield-checkmark",
    title: "Bảo mật cao",
    description: "Bật xác thực 2 bước (2FA)",
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    color: "#10B981",
    tier: "silver",
    xp: 100,
  },
  {
    id: "3",
    icon: "cart",
    title: "Người mua sắm",
    description: "Hoàn thành 10 đơn hàng",
    unlocked: false,
    progress: 3,
    maxProgress: 10,
    color: "#6366F1",
    tier: "gold",
    xp: 200,
  },
  {
    id: "4",
    icon: "chatbubbles",
    title: "Kết nối",
    description: "Nhắn tin với 5 người khác nhau",
    unlocked: true,
    unlockedAt: "20/01/2026",
    color: "#EC4899",
    tier: "bronze",
    xp: 75,
  },
  {
    id: "5",
    icon: "trophy",
    title: "VIP",
    description: "Tổng chi tiêu trên 10 triệu đồng",
    unlocked: false,
    progress: 6500000,
    maxProgress: 10000000,
    color: "#F97316",
    tier: "platinum",
    xp: 500,
  },
  {
    id: "6",
    icon: "heart",
    title: "Yêu thích",
    description: "Lưu 20 sản phẩm vào yêu thích",
    unlocked: false,
    progress: 12,
    maxProgress: 20,
    color: "#EF4444",
    tier: "silver",
    xp: 100,
  },
  {
    id: "7",
    icon: "compass",
    title: "Nhà thám hiểm",
    description: "Xem 100 sản phẩm khác nhau",
    unlocked: true,
    unlockedAt: "22/01/2026",
    color: "#14B8A6",
    tier: "bronze",
    xp: 75,
  },
  {
    id: "8",
    icon: "star-half",
    title: "Nhà đánh giá",
    description: "Viết 10 đánh giá sản phẩm",
    unlocked: false,
    progress: 2,
    maxProgress: 10,
    color: "#8B5CF6",
    tier: "gold",
    xp: 150,
  },
];

const getTierColor = (tier: Achievement["tier"]): [string, string] => {
  switch (tier) {
    case "platinum":
      return ["#E5E4E2", "#A0AEC0"];
    case "gold":
      return ["#F59E0B", "#D97706"];
    case "silver":
      return ["#94A3B8", "#64748B"];
    case "bronze":
    default:
      return ["#CD7F32", "#A0522D"];
  }
};

const AchievementCard = memo(
  ({ achievement }: { achievement: Achievement }) => {
    const tierColors = getTierColor(achievement.tier);
    const progressPercent =
      achievement.progress && achievement.maxProgress
        ? (achievement.progress / achievement.maxProgress) * 100
        : 0;

    return (
      <View style={[styles.card, !achievement.unlocked && styles.cardLocked]}>
        {/* Badge */}
        <LinearGradient
          colors={achievement.unlocked ? tierColors : ["#CBD5E1", "#94A3B8"]}
          style={styles.badge}
        >
          <Ionicons name={achievement.icon as any} size={28} color="#FFFFFF" />
          {achievement.unlocked && (
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            </View>
          )}
        </LinearGradient>

        {/* Content */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text
              style={[
                styles.cardTitle,
                !achievement.unlocked && styles.textLocked,
              ]}
            >
              {achievement.title}
            </Text>
            <View
              style={[
                styles.xpBadge,
                !achievement.unlocked && styles.xpBadgeLocked,
              ]}
            >
              <Text style={styles.xpText}>+{achievement.xp} XP</Text>
            </View>
          </View>
          <Text
            style={[
              styles.cardDesc,
              !achievement.unlocked && styles.textLocked,
            ]}
          >
            {achievement.description}
          </Text>

          {/* Progress or Date */}
          {achievement.unlocked ? (
            <Text style={styles.dateText}>
              Đạt được: {achievement.unlockedAt}
            </Text>
          ) : achievement.progress !== undefined && achievement.maxProgress ? (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progressPercent}%`,
                      backgroundColor: achievement.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {achievement.progress.toLocaleString()} /{" "}
                {achievement.maxProgress.toLocaleString()}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  },
);

export default function AchievementsScreen() {
  const router = useRouter();

  const unlockedCount = ACHIEVEMENTS.filter((a) => a.unlocked).length;
  const totalXP = ACHIEVEMENTS.filter((a) => a.unlocked).reduce(
    (sum, a) => sum + a.xp,
    0,
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Thành tựu</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Stats */}
        <LinearGradient
          colors={[COLORS.primary, "#059669"]}
          style={styles.statsCard}
        >
          <View style={styles.statItem}>
            <Ionicons name="trophy" size={24} color="#FFFFFF" />
            <Text style={styles.statValue}>
              {unlockedCount}/{ACHIEVEMENTS.length}
            </Text>
            <Text style={styles.statLabel}>Đạt được</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="star" size={24} color="#FFFFFF" />
            <Text style={styles.statValue}>{totalXP}</Text>
            <Text style={styles.statLabel}>Tổng XP</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="medal" size={24} color="#FFFFFF" />
            <Text style={styles.statValue}>Bạc</Text>
            <Text style={styles.statLabel}>Cấp bậc</Text>
          </View>
        </LinearGradient>

        {/* Unlocked Section */}
        <Text style={styles.sectionTitle}>Đã đạt được ({unlockedCount})</Text>
        {ACHIEVEMENTS.filter((a) => a.unlocked).map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}

        {/* Locked Section */}
        <Text style={styles.sectionTitle}>
          Chưa đạt ({ACHIEVEMENTS.length - unlockedCount})
        </Text>
        {ACHIEVEMENTS.filter((a) => !a.unlocked).map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: COLORS.text },
  content: { padding: 20 },
  statsCard: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.3)" },
  statValue: { fontSize: 22, fontWeight: "700", color: "#FFFFFF" },
  statLabel: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLocked: { opacity: 0.7 },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    position: "relative",
  },
  checkBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  cardContent: { flex: 1 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  textLocked: { color: COLORS.textSecondary },
  xpBadge: {
    backgroundColor: COLORS.primary + "20",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  xpBadgeLocked: { backgroundColor: COLORS.border },
  xpText: { fontSize: 11, fontWeight: "600", color: COLORS.primary },
  cardDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 8,
  },
  dateText: { fontSize: 12, color: COLORS.primary, fontWeight: "500" },
  progressContainer: { gap: 4 },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3 },
  progressText: { fontSize: 11, color: COLORS.textSecondary },
});
