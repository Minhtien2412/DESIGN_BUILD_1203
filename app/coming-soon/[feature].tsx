import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const FEATURE_META: Record<
  string,
  { title: string; icon: string; description: string; color: string }
> = {
  labor: {
    title: "Quản lý Nhân công",
    icon: "people-outline",
    description:
      "Theo dõi và quản lý nhân công trên công trường, phân ca, chấm công",
    color: "#4CAF50",
  },
  inventory: {
    title: "Quản lý Kho bãi",
    icon: "cube-outline",
    description: "Theo dõi tồn kho, nhập/xuất vật tư, kiểm kê hàng hóa",
    color: "#FF9800",
  },
  weather: {
    title: "Thời tiết Công trường",
    icon: "partly-sunny-outline",
    description: "Dự báo thời tiết, cảnh báo mưa bão ảnh hưởng thi công",
    color: "#2196F3",
  },
  rfi: {
    title: "RFI - Yêu cầu Thông tin",
    icon: "help-circle-outline",
    description: "Gửi và theo dõi yêu cầu thông tin (Request for Information)",
    color: "#9C27B0",
  },
  submittals: {
    title: "Submittals",
    icon: "paper-plane-outline",
    description: "Quản lý hồ sơ trình duyệt vật tư, bản vẽ shop drawing",
    color: "#E91E63",
  },
  meetings: {
    title: "Cuộc họp",
    icon: "people-outline",
    description: "Lên lịch họp, ghi biên bản, theo dõi nhiệm vụ giao ban",
    color: "#00BCD4",
  },
  reminders: {
    title: "Nhắc nhở",
    icon: "notifications-outline",
    description: "Đặt nhắc nhở công việc, deadline, và sự kiện quan trọng",
    color: "#FF5722",
  },
};

const DEFAULT_META = {
  title: "Tính năng mới",
  icon: "rocket-outline",
  description: "Tính năng này đang được phát triển, sẽ sớm ra mắt",
  color: "#14B8A6",
};

export default function ComingSoonFeatureScreen() {
  const { feature } = useLocalSearchParams<{ feature: string }>();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();

  const meta = FEATURE_META[feature ?? ""] ?? DEFAULT_META;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: meta.title, headerShown: true }} />

      <View style={styles.content}>
        {/* Icon */}
        <View
          style={[styles.iconCircle, { backgroundColor: meta.color + "15" }]}
        >
          <View
            style={[styles.iconInner, { backgroundColor: meta.color + "25" }]}
          >
            <Ionicons name={meta.icon as any} size={48} color={meta.color} />
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: textColor }]}>{meta.title}</Text>

        {/* Badge */}
        <View style={[styles.badge, { backgroundColor: meta.color + "15" }]}>
          <Ionicons name="time-outline" size={14} color={meta.color} />
          <Text style={[styles.badgeText, { color: meta.color }]}>
            Đang phát triển
          </Text>
        </View>

        {/* Description */}
        <Text style={styles.description}>{meta.description}</Text>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: cardBg }]}>
          <View style={styles.infoRow}>
            <Ionicons name="construct-outline" size={20} color="#999" />
            <Text style={styles.infoText}>
              Tính năng đang trong giai đoạn phát triển
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="notifications-outline" size={20} color="#999" />
            <Text style={styles.infoText}>
              Bạn sẽ nhận thông báo khi sẵn sàng
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="sparkles-outline" size={20} color="#999" />
            <Text style={styles.infoText}>
              Chúng tôi đang nỗ lực hoàn thiện
            </Text>
          </View>
        </View>

        {/* Back Button */}
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: meta.color }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back-outline" size={18} color="#fff" />
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>

        {/* Home Button */}
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => router.push("/(tabs)")}
        >
          <Text style={[styles.homeBtnText, { color: meta.color }]}>
            Về trang chủ
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  iconInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: { fontSize: 13, fontWeight: "600" },
  description: {
    color: "#666",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  infoCard: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    gap: 14,
    marginBottom: 32,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  infoText: { color: "#666", fontSize: 13, flex: 1 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  backBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  homeBtn: { paddingVertical: 10 },
  homeBtnText: { fontSize: 14, fontWeight: "500" },
});
