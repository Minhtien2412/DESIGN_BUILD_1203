import { DSModuleScreen } from "@/components/ds/layouts";
import { useDS } from "@/hooks/useDS";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    Share,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

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
    hexCode: "#134E4A",
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
  const { colors, spacing, radius, text: textStyles, screen, shadow } = useDS();
  const CARD_WIDTH = (screen.width - 48) / 2;

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
    <DSModuleScreen title="Xu Hướng Màu Sắc" gradientHeader>
      {/* Year selector */}
      <View style={{ backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
        <View style={{ flexDirection: "row", gap: spacing.md }}>
          {TREND_YEARS.map((year) => (
            <TouchableOpacity
              key={year.id}
              style={{
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.xl,
                borderRadius: radius.full,
                backgroundColor:
                  selectedYear === year.id ? colors.card : "rgba(255,255,255,0.2)",
              }}
              onPress={() => setSelectedYear(year.id)}
            >
              <Text
                style={[
                  textStyles.bodySemibold,
                  {
                    color:
                      selectedYear === year.id
                        ? colors.primary
                        : colors.textInverse,
                  },
                ]}
              >
                {year.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Style filter */}
      <View style={{ padding: spacing.lg }}>
        <Text style={[textStyles.sectionTitle, { color: colors.text, marginBottom: spacing.md }]}>
          Phong cách
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            {INTERIOR_STYLES.map((style) => (
              <TouchableOpacity
                key={style.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.xs,
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.lg,
                  borderRadius: radius.full,
                  backgroundColor:
                    selectedStyle === style.id ? colors.primary : colors.card,
                  borderWidth: 1,
                  borderColor:
                    selectedStyle === style.id
                      ? colors.primary
                      : colors.border,
                }}
                onPress={() => setSelectedStyle(style.id)}
              >
                <Ionicons
                  name={style.icon as any}
                  size={18}
                  color={
                    selectedStyle === style.id
                      ? colors.textInverse
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    textStyles.body,
                    {
                      color:
                        selectedStyle === style.id
                          ? colors.textInverse
                          : colors.textSecondary,
                      fontWeight: selectedStyle === style.id ? "500" : "400",
                    },
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
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
        <Text style={[textStyles.sectionTitle, { color: colors.text, marginBottom: spacing.md }]}>
          Màu xu hướng {selectedYear} ({filteredTrends.length})
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>
          {filteredTrends.map((color) => (
            <TouchableOpacity
              key={color.id}
              style={{
                width: CARD_WIDTH,
                backgroundColor: colors.card,
                borderRadius: radius.lg,
                overflow: "hidden",
                ...shadow.sm,
              }}
              onPress={() => handleColorPress(color)}
              activeOpacity={0.7}
            >
              <View
                style={{
                  height: 120,
                  justifyContent: "space-between",
                  padding: spacing.md,
                  backgroundColor: color.hexCode,
                }}
              >
                <TouchableOpacity
                  style={{
                    alignSelf: "flex-end",
                    backgroundColor: "rgba(0,0,0,0.3)",
                    borderRadius: radius.full,
                    padding: spacing.xs,
                  }}
                  onPress={() => toggleFavorite(color.id)}
                >
                  <Ionicons
                    name={
                      favorites.includes(color.id) ? "heart" : "heart-outline"
                    }
                    size={20}
                    color={favorites.includes(color.id) ? colors.error : colors.textInverse}
                  />
                </TouchableOpacity>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.xxs,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    alignSelf: "flex-start",
                    paddingVertical: spacing.xxs,
                    paddingHorizontal: spacing.sm,
                    borderRadius: radius.lg,
                  }}
                >
                  <Ionicons name="trending-up" size={12} color={colors.textInverse} />
                  <Text
                    style={[
                      textStyles.caption,
                      { color: colors.textInverse, fontWeight: "600" },
                    ]}
                  >
                    {color.popularity}%
                  </Text>
                </View>
              </View>
              <View style={{ padding: spacing.md }}>
                <Text
                  style={[textStyles.bodySemibold, { color: colors.text, marginBottom: spacing.xxs }]}
                  numberOfLines={1}
                >
                  {color.name}
                </Text>
                <Text style={[textStyles.caption, { color: colors.textSecondary, marginBottom: spacing.xxs }]}>
                  {color.hexCode}
                </Text>
                <Text style={[textStyles.caption, { color: colors.textTertiary }]} numberOfLines={1}>
                  {color.pantone}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Trend articles */}
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: spacing.md,
          }}
        >
          <Text style={[textStyles.sectionTitle, { color: colors.text }]}>
            Bài viết xu hướng
          </Text>
          <TouchableOpacity>
            <Text style={[textStyles.body, { color: colors.textLink }]}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        {TREND_ARTICLES.map((article) => (
          <TouchableOpacity
            key={article.id}
            style={{
              backgroundColor: colors.card,
              borderRadius: radius.lg,
              overflow: "hidden",
              marginBottom: spacing.md,
              ...shadow.sm,
            }}
          >
            <Image
              source={{ uri: article.image }}
              style={{ width: "100%", height: 150, resizeMode: "cover" } as any}
            />
            <View style={{ padding: spacing.md }}>
              <Text
                style={[
                  textStyles.bodySemibold,
                  { color: colors.text, marginBottom: spacing.sm },
                ]}
              >
                {article.title}
              </Text>
              <View style={{ flexDirection: "row", gap: spacing.lg }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xxs }}>
                  <Ionicons name="calendar-outline" size={14} color={colors.textTertiary} />
                  <Text style={[textStyles.caption, { color: colors.textTertiary }]}>
                    {article.date}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xxs }}>
                  <Ionicons name="eye-outline" size={14} color={colors.textTertiary} />
                  <Text style={[textStyles.caption, { color: colors.textTertiary }]}>
                    {article.views}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Color detail modal */}
      <Modal
        visible={showDetail}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetail(false)}
      >
        <View style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" }}>
          <View
            style={{
              backgroundColor: colors.card,
              borderTopLeftRadius: radius.xxl,
              borderTopRightRadius: radius.xxl,
              maxHeight: "90%",
              paddingBottom: spacing.xl,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: spacing.lg,
                borderBottomWidth: 1,
                borderBottomColor: colors.divider,
              }}
            >
              <Text style={[textStyles.h3, { color: colors.text }]}>
                Chi tiết màu sắc
              </Text>
              <TouchableOpacity onPress={() => setShowDetail(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedColor && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View
                  style={{
                    height: 150,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: selectedColor.hexCode,
                  }}
                >
                  <Text style={[textStyles.h1, { color: colors.textInverse }]}>
                    {selectedColor.name}
                  </Text>
                </View>

                <View
                  style={{
                    padding: spacing.lg,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.divider,
                  }}
                >
                  <Text style={[textStyles.bodySemibold, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
                    Mã màu
                  </Text>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={[textStyles.body, { color: colors.text, fontFamily: "monospace" }]}>
                      HEX: {selectedColor.hexCode}
                    </Text>
                    <Text style={[textStyles.body, { color: colors.text, fontFamily: "monospace" }]}>
                      {selectedColor.pantone}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    padding: spacing.lg,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.divider,
                  }}
                >
                  <Text style={[textStyles.bodySemibold, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
                    Mô tả
                  </Text>
                  <Text style={[textStyles.body, { color: colors.textSecondary, lineHeight: 20 }]}>
                    {selectedColor.description}
                  </Text>
                </View>

                <View
                  style={{
                    padding: spacing.lg,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.divider,
                  }}
                >
                  <Text style={[textStyles.bodySemibold, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
                    Độ phổ biến
                  </Text>
                  <View
                    style={{
                      height: 8,
                      backgroundColor: colors.bgMuted,
                      borderRadius: radius.sm,
                      overflow: "hidden",
                      marginBottom: spacing.sm,
                    }}
                  >
                    <View
                      style={{
                        height: "100%",
                        width: `${selectedColor.popularity}%`,
                        backgroundColor: colors.primary,
                      }}
                    />
                  </View>
                  <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                    {selectedColor.popularity}% người dùng yêu thích
                  </Text>
                </View>

                <View
                  style={{
                    padding: spacing.lg,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.divider,
                  }}
                >
                  <Text style={[textStyles.bodySemibold, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
                    Phù hợp với
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
                    {selectedColor.usageRooms.map((room, index) => (
                      <View
                        key={index}
                        style={{
                          backgroundColor: colors.primaryBg,
                          paddingVertical: spacing.xs,
                          paddingHorizontal: spacing.md,
                          borderRadius: radius.full,
                          borderWidth: 1,
                          borderColor: colors.primary,
                        }}
                      >
                        <Text style={[textStyles.caption, { color: colors.primary }]}>
                          {room}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View
                  style={{
                    padding: spacing.lg,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.divider,
                  }}
                >
                  <Text style={[textStyles.bodySemibold, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
                    Kết hợp với
                  </Text>
                  <View style={{ flexDirection: "row", gap: spacing.md }}>
                    {selectedColor.combinations.map((combo, index) => (
                      <View
                        key={index}
                        style={{
                          flex: 1,
                          height: 60,
                          borderRadius: radius.md,
                          justifyContent: "center",
                          alignItems: "center",
                          borderWidth: 1,
                          borderColor: colors.border,
                          backgroundColor: combo,
                        }}
                      >
                        <Text
                          style={[
                            textStyles.caption,
                            { color: colors.textInverse, fontWeight: "600" },
                          ]}
                        >
                          {combo}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    gap: spacing.md,
                    padding: spacing.lg,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: spacing.sm,
                      paddingVertical: spacing.md,
                      borderRadius: radius.md,
                      backgroundColor: colors.primaryBg,
                      borderWidth: 1,
                      borderColor: colors.primary,
                    }}
                    onPress={() => toggleFavorite(selectedColor.id)}
                  >
                    <Ionicons
                      name={
                        favorites.includes(selectedColor.id)
                          ? "heart"
                          : "heart-outline"
                      }
                      size={24}
                      color={colors.primary}
                    />
                    <Text style={[textStyles.bodySemibold, { color: colors.primary }]}>
                      Yêu thích
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: spacing.sm,
                      paddingVertical: spacing.md,
                      borderRadius: radius.md,
                      backgroundColor: colors.primaryBg,
                      borderWidth: 1,
                      borderColor: colors.primary,
                    }}
                    onPress={() => handleShare(selectedColor)}
                  >
                    <Ionicons name="share-outline" size={24} color={colors.primary} />
                    <Text style={[textStyles.bodySemibold, { color: colors.primary }]}>
                      Chia sẻ
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </DSModuleScreen>
  );
}
