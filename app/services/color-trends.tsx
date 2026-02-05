import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

// Mock data for color trends
const TREND_YEARS = [
  { id: "2025", label: "2025", active: true },
  { id: "2024", label: "2024", active: false },
  { id: "2023", label: "2023", active: false },
];

const INTERIOR_STYLES = [
  { id: "all", name: "Tất cả", icon: "apps" },
  { id: "modern", name: "Hiện đại", icon: "cube-outline" },
  { id: "classic", name: "Cổ điển", icon: "business-outline" },
  { id: "minimal", name: "Tối giản", icon: "remove-outline" },
  { id: "luxury", name: "Sang trọng", icon: "diamond-outline" },
  { id: "tropical", name: "Nhiệt đới", icon: "leaf-outline" },
];

interface ColorTrend {
  id: string;
  name: string;
  hexCode: string;
  pantone: string;
  year: string;
  style: string[];
  popularity: number;
  description: string;
  usageRooms: string[];
  combinations: string[];
  image?: string;
}

const COLOR_TRENDS: ColorTrend[] = [
  {
    id: "1",
    name: "Peach Fuzz",
    hexCode: "#FFBE98",
    pantone: "PANTONE 13-1023",
    year: "2025",
    style: ["modern", "minimal", "luxury"],
    popularity: 95,
    description: "Màu cam đào nhẹ nhàng, mang lại cảm giác ấm áp và thư giãn",
    usageRooms: ["Phòng khách", "Phòng ngủ", "Phòng ăn"],
    combinations: ["#FFFFFF", "#F5E6D3", "#8B7355"],
  },
  {
    id: "2",
    name: "Digital Lavender",
    hexCode: "#B9A0D4",
    pantone: "PANTONE 18-3838",
    year: "2025",
    style: ["modern", "luxury"],
    popularity: 88,
    description: "Tím lavender kỹ thuật số, hiện đại và thanh lịch",
    usageRooms: ["Phòng ngủ", "Phòng làm việc", "Spa"],
    combinations: ["#FFFFFF", "#E8DFF5", "#4A4A4A"],
  },
  {
    id: "3",
    name: "Terracotta",
    hexCode: "#E07856",
    pantone: "PANTONE 16-1440",
    year: "2025",
    style: ["tropical", "classic"],
    popularity: 82,
    description: "Cam đất nung ấm áp, gợi nhớ đến thiên nhiên",
    usageRooms: ["Phòng khách", "Ban công", "Sân vườn"],
    combinations: ["#F8F5F0", "#2C5F2D", "#D4AF37"],
  },
  {
    id: "4",
    name: "Forest Green",
    hexCode: "#2C5F2D",
    pantone: "PANTONE 19-0230",
    year: "2025",
    style: ["tropical", "minimal"],
    popularity: 79,
    description: "Xanh rừng sâu, mang lại sự tĩnh lặng và gần gũi thiên nhiên",
    usageRooms: ["Phòng khách", "Phòng ngủ", "Phòng tắm"],
    combinations: ["#FFFFFF", "#F5E6D3", "#D4AF37"],
  },
  {
    id: "5",
    name: "Butter Yellow",
    hexCode: "#F5DEB3",
    pantone: "PANTONE 13-0739",
    year: "2025",
    style: ["modern", "tropical"],
    popularity: 75,
    description: "Vàng bơ tươi sáng, tạo không gian vui tươi",
    usageRooms: ["Bếp", "Phòng ăn", "Phòng trẻ em"],
    combinations: ["#FFFFFF", "#4A4A4A", "#E07856"],
  },
  {
    id: "6",
    name: "Velvet Blue",
    hexCode: "#1E3A5F",
    pantone: "PANTONE 19-4052",
    year: "2024",
    style: ["luxury", "classic"],
    popularity: 85,
    description: "Xanh nhung sang trọng và bí ẩn",
    usageRooms: ["Phòng ngủ master", "Phòng khách", "Thư viện"],
    combinations: ["#D4AF37", "#FFFFFF", "#8B7355"],
  },
  {
    id: "7",
    name: "Sage Green",
    hexCode: "#9CAF88",
    pantone: "PANTONE 15-6316",
    year: "2024",
    style: ["minimal", "tropical"],
    popularity: 81,
    description: "Xanh sage nhẹ nhàng, thư giãn",
    usageRooms: ["Phòng ngủ", "Phòng tắm", "Yoga room"],
    combinations: ["#F8F5F0", "#FFFFFF", "#8B7355"],
  },
  {
    id: "8",
    name: "Warm Taupe",
    hexCode: "#8B7355",
    pantone: "PANTONE 17-1417",
    year: "2024",
    style: ["classic", "luxury", "minimal"],
    popularity: 77,
    description: "Nâu taupe ấm áp, trung tính và sang trọng",
    usageRooms: ["Tất cả phòng"],
    combinations: ["#FFFFFF", "#2C5F2D", "#D4AF37"],
  },
];

const TREND_ARTICLES = [
  {
    id: "1",
    title: "Top 10 Màu Sắc Xu Hướng 2025",
    image:
      "https://images.unsplash.com/photo-1615873968403-89e068629265?w=400&h=200&q=80",
    date: "15/11/2025",
    views: 1234,
  },
  {
    id: "2",
    title: "Cách Phối Màu Cho Phòng Khách Hiện Đại",
    image:
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=400&h=200&q=80",
    date: "10/11/2025",
    views: 987,
  },
];

export default function ColorTrendsScreen() {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedStyle, setSelectedStyle] = useState("all");
  const [selectedColor, setSelectedColor] = useState<ColorTrend | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const filteredTrends = COLOR_TRENDS.filter((trend) => {
    const matchYear = trend.year === selectedYear;
    const matchStyle =
      selectedStyle === "all" || trend.style.includes(selectedStyle);
    return matchYear && matchStyle;
  });

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id],
    );
  };

  const handleShare = async (color: ColorTrend) => {
    try {
      await Share.share({
        message: `Màu ${color.name} (${color.hexCode}) - ${color.description}\nPantone: ${color.pantone}`,
      });
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chia sẻ");
    }
  };

  const handleColorPress = (color: ColorTrend) => {
    setSelectedColor(color);
    setShowDetail(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#0066CC", "#3399FF"]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Xu Hướng Màu Sắc</Text>
          <TouchableOpacity style={styles.headerRight}>
            <Ionicons name="heart-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Year selector */}
        <View style={styles.yearSelector}>
          {TREND_YEARS.map((year) => (
            <TouchableOpacity
              key={year.id}
              style={[
                styles.yearButton,
                selectedYear === year.id && styles.yearButtonActive,
              ]}
              onPress={() => setSelectedYear(year.id)}
            >
              <Text
                style={[
                  styles.yearText,
                  selectedYear === year.id && styles.yearTextActive,
                ]}
              >
                {year.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Style filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phong cách</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.styleRow}>
              {INTERIOR_STYLES.map((style) => (
                <TouchableOpacity
                  key={style.id}
                  style={[
                    styles.styleChip,
                    selectedStyle === style.id && styles.styleChipActive,
                  ]}
                  onPress={() => setSelectedStyle(style.id)}
                >
                  <Ionicons
                    name={style.icon as any}
                    size={18}
                    color={selectedStyle === style.id ? "#fff" : "#666"}
                  />
                  <Text
                    style={[
                      styles.styleChipText,
                      selectedStyle === style.id && styles.styleChipTextActive,
                    ]}
                  >
                    {style.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Color trends grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Màu xu hướng {selectedYear} ({filteredTrends.length})
          </Text>
          <View style={styles.trendsGrid}>
            {filteredTrends.map((color) => (
              <TouchableOpacity
                key={color.id}
                style={styles.colorCard}
                onPress={() => handleColorPress(color)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color.hexCode },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.favoriteIcon}
                    onPress={() => toggleFavorite(color.id)}
                  >
                    <Ionicons
                      name={
                        favorites.includes(color.id) ? "heart" : "heart-outline"
                      }
                      size={20}
                      color={favorites.includes(color.id) ? "#ff4444" : "#fff"}
                    />
                  </TouchableOpacity>
                  <View style={styles.popularityBadge}>
                    <Ionicons name="trending-up" size={12} color="#fff" />
                    <Text style={styles.popularityText}>
                      {color.popularity}%
                    </Text>
                  </View>
                </View>
                <View style={styles.colorInfo}>
                  <Text style={styles.colorName} numberOfLines={1}>
                    {color.name}
                  </Text>
                  <Text style={styles.colorCode}>{color.hexCode}</Text>
                  <Text style={styles.colorPantone} numberOfLines={1}>
                    {color.pantone}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Trend articles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bài viết xu hướng</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {TREND_ARTICLES.map((article) => (
            <TouchableOpacity key={article.id} style={styles.articleCard}>
              <Image
                source={{ uri: article.image }}
                style={styles.articleImage}
              />
              <View style={styles.articleContent}>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <View style={styles.articleMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={14} color="#999" />
                    <Text style={styles.metaText}>{article.date}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="eye-outline" size={14} color="#999" />
                    <Text style={styles.metaText}>{article.views}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Color detail modal */}
      <Modal
        visible={showDetail}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetail(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết màu sắc</Text>
              <TouchableOpacity onPress={() => setShowDetail(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedColor && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View
                  style={[
                    styles.modalColorSwatch,
                    { backgroundColor: selectedColor.hexCode },
                  ]}
                >
                  <Text style={styles.modalColorName}>
                    {selectedColor.name}
                  </Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Mã màu</Text>
                  <View style={styles.codeRow}>
                    <Text style={styles.codeText}>
                      HEX: {selectedColor.hexCode}
                    </Text>
                    <Text style={styles.codeText}>{selectedColor.pantone}</Text>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Mô tả</Text>
                  <Text style={styles.modalDescription}>
                    {selectedColor.description}
                  </Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Độ phổ biến</Text>
                  <View style={styles.popularityBar}>
                    <View
                      style={[
                        styles.popularityFill,
                        { width: `${selectedColor.popularity}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.popularityLabel}>
                    {selectedColor.popularity}% người dùng yêu thích
                  </Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Phù hợp với</Text>
                  <View style={styles.roomTags}>
                    {selectedColor.usageRooms.map((room, index) => (
                      <View key={index} style={styles.roomTag}>
                        <Text style={styles.roomTagText}>{room}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Kết hợp với</Text>
                  <View style={styles.combinationRow}>
                    {selectedColor.combinations.map((combo, index) => (
                      <View
                        key={index}
                        style={[
                          styles.combinationSwatch,
                          { backgroundColor: combo },
                        ]}
                      >
                        <Text style={styles.combinationCode}>{combo}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => toggleFavorite(selectedColor.id)}
                  >
                    <Ionicons
                      name={
                        favorites.includes(selectedColor.id)
                          ? "heart"
                          : "heart-outline"
                      }
                      size={24}
                      color="#0066CC"
                    />
                    <Text style={styles.actionButtonText}>Yêu thích</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleShare(selectedColor)}
                  >
                    <Ionicons name="share-outline" size={24} color="#0066CC" />
                    <Text style={styles.actionButtonText}>Chia sẻ</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  headerRight: {
    padding: 8,
  },
  yearSelector: {
    flexDirection: "row",
    gap: 12,
  },
  yearButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  yearButtonActive: {
    backgroundColor: "#fff",
  },
  yearText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  yearTextActive: {
    color: "#0066CC",
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: "#0066CC",
  },
  styleRow: {
    flexDirection: "row",
    gap: 8,
  },
  styleChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  styleChipActive: {
    backgroundColor: "#0066CC",
    borderColor: "#0066CC",
  },
  styleChipText: {
    fontSize: 14,
    color: "#666",
  },
  styleChipTextActive: {
    color: "#fff",
    fontWeight: "500",
  },
  trendsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  colorCard: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  colorSwatch: {
    height: 120,
    justifyContent: "space-between",
    padding: 12,
  },
  favoriteIcon: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    padding: 6,
  },
  popularityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  popularityText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
  },
  colorInfo: {
    padding: 12,
  },
  colorName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  colorCode: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  colorPantone: {
    fontSize: 11,
    color: "#999",
  },
  articleCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  articleImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  articleContent: {
    padding: 12,
  },
  articleTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  articleMeta: {
    flexDirection: "row",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#999",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalColorSwatch: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  modalColorName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  modalSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  codeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  codeText: {
    fontSize: 14,
    color: "#333",
    fontFamily: "monospace",
  },
  modalDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  popularityBar: {
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  popularityFill: {
    height: "100%",
    backgroundColor: "#0066CC",
  },
  popularityLabel: {
    fontSize: 12,
    color: "#666",
  },
  roomTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  roomTag: {
    backgroundColor: "#fff5f0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#0066CC",
  },
  roomTagText: {
    fontSize: 13,
    color: "#0066CC",
  },
  combinationRow: {
    flexDirection: "row",
    gap: 12,
  },
  combinationSwatch: {
    flex: 1,
    height: 60,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  combinationCode: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#fff5f0",
    borderWidth: 1,
    borderColor: "#0066CC",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0066CC",
  },
});
