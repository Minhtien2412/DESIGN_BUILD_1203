/**
 * AI Analysis Hub Screen
 * Trung tâm phân tích AI cho xây dựng
 *
 * @author AI Assistant
 * @date 19/01/2026
 */

import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FeatureItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  gradient: readonly [string, string];
  route: string;
}

const ANALYSIS_FEATURES: FeatureItem[] = [
  {
    id: "photo",
    icon: "camera",
    title: "Phân tích ảnh công trường",
    description: "AI nhận diện tiến độ, vật liệu từ ảnh",
    gradient: ["#6366f1", "#818cf8"] as const,
    route: "/ai-analysis/photo",
  },
  {
    id: "progress",
    icon: "trending-up",
    title: "Phân tích tiến độ",
    description: "Dự báo và đánh giá tiến độ thi công",
    gradient: ["#10b981", "#34d399"] as const,
    route: "/ai-analysis/progress",
  },
  {
    id: "material",
    icon: "cube",
    title: "Phân tích vật liệu",
    description: "Kiểm tra chất lượng, ước tính khối lượng",
    gradient: ["#f59e0b", "#fbbf24"] as const,
    route: "/ai-analysis/material",
  },
  {
    id: "cost",
    icon: "calculator",
    title: "Phân tích chi phí",
    description: "Dự toán, so sánh chi phí thực tế",
    gradient: ["#3b82f6", "#60a5fa"] as const,
    route: "/ai-analysis/cost",
  },
  {
    id: "safety",
    icon: "shield-checkmark",
    title: "Phân tích an toàn",
    description: "Phát hiện rủi ro, vi phạm an toàn",
    gradient: ["#ef4444", "#f87171"] as const,
    route: "/ai-analysis/safety",
  },
];

export default function AIAnalysisScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={["#1e40af", "#3b82f6"]} style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Ionicons name="analytics" size={64} color="#fff" />
          <Text style={styles.headerTitle}>🤖 AI Analysis Hub</Text>
          <Text style={styles.headerSubtitle}>
            Phân tích thông minh cho ngành xây dựng
          </Text>
        </LinearGradient>

        {/* Features Grid */}
        <View style={styles.content}>
          {ANALYSIS_FEATURES.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={[styles.featureCard, { backgroundColor: cardBg }]}
              onPress={() => router.push(feature.route as any)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={feature.gradient}
                style={styles.iconContainer}
              >
                <Ionicons name={feature.icon as any} size={28} color="#fff" />
              </LinearGradient>
              <View style={styles.featureInfo}>
                <Text style={[styles.featureTitle, { color: textColor }]}>
                  {feature.title}
                </Text>
                <Text style={styles.featureDesc}>{feature.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            📊 Thống kê sử dụng
          </Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: cardBg }]}>
              <Text style={styles.statNumber}>1,234</Text>
              <Text style={styles.statLabel}>Ảnh đã phân tích</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: cardBg }]}>
              <Text style={styles.statNumber}>98%</Text>
              <Text style={styles.statLabel}>Độ chính xác</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: cardBg }]}>
              <Text style={styles.statNumber}>56</Text>
              <Text style={styles.statLabel}>Cảnh báo an toàn</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 16,
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: "#6b7280",
  },
  statsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3b82f6",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "center",
  },
});
