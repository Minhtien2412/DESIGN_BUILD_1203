/**
 * Tools Index - Công cụ hoàn thiện
 */
import { Container } from "@/components/ui/container";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const TOOLS = [
  {
    id: "lo-ban-ruler",
    emoji: "📏",
    title: "Thước Lỗ Ban",
    description: "Tính toán kích thước theo phong thủy Lỗ Ban",
    color: "#9C27B0",
    route: "/tools/lo-ban-ruler",
  },
  {
    id: "color-picker",
    emoji: "🎨",
    title: "Bảng màu Sơn",
    description: "Chọn màu sơn phù hợp cho từng không gian",
    color: "#E91E63",
    route: "/tools/color-picker",
  },
  {
    id: "interior-planner",
    emoji: "🛋️",
    title: "Bố trí Nội thất",
    description: "Hướng dẫn sắp xếp đồ nội thất",
    color: "#9C27B0",
    route: "/tools/interior-planner",
  },
  {
    id: "price-compare",
    emoji: "📊",
    title: "So sánh Giá",
    description: "So sánh giá vật liệu xây dựng",
    color: "#2196F3",
    route: "/tools/price-compare",
  },
  {
    id: "fengshui",
    emoji: "☯️",
    title: "Phong thủy AI",
    description: "Xem tuổi, hướng nhà, tư vấn AI",
    color: "#9C27B0",
    route: "/tools/feng-shui-ai",
  },
];

export default function ToolsIndexScreen() {
  return (
    <Container>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#0F766E" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>🛠️ Công cụ hoàn thiện</Text>
            <Text style={styles.headerSubtitle}>
              Tiện ích hỗ trợ hoàn thiện nhà
            </Text>
          </View>
        </View>

        {/* Tools Grid */}
        <View style={styles.grid}>
          {TOOLS.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={styles.card}
              onPress={() => router.push(tool.route as any)}
            >
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: tool.color + "20" },
                ]}
              >
                <Text style={styles.emoji}>{tool.emoji}</Text>
              </View>
              <Text style={styles.cardTitle}>{tool.title}</Text>
              <Text style={styles.cardDesc}>{tool.description}</Text>
              <View style={[styles.arrow, { backgroundColor: tool.color }]}>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Additional Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Mẹo sử dụng</Text>
          <Text style={styles.infoText}>
            Sử dụng các công cụ này để lên kế hoạch chi tiết trước khi bắt đầu
            công việc hoàn thiện. Điều này giúp tiết kiệm thời gian và chi phí.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
    backgroundColor: "#fff",
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    gap: 12,
  },
  card: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    minHeight: 160,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emoji: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
    flex: 1,
  },
  arrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    marginTop: 8,
  },
  infoCard: {
    margin: 16,
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1565C0",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: "#1976D2",
    lineHeight: 20,
  },
});
