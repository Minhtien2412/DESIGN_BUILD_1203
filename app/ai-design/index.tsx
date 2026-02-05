import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

const designStyles = [
  { id: "1", name: "Hiện đại", icon: "🏠" },
  { id: "2", name: "Tối giản", icon: "⬜" },
  { id: "3", name: "Cổ điển", icon: "🏛️" },
  { id: "4", name: "Scandinavian", icon: "🌲" },
  { id: "5", name: "Industrial", icon: "🏭" },
  { id: "6", name: "Bohemian", icon: "🎨" },
];

const roomTypes = [
  { id: "1", name: "Phòng khách", icon: "tv-outline" },
  { id: "2", name: "Phòng ngủ", icon: "bed-outline" },
  { id: "3", name: "Nhà bếp", icon: "restaurant-outline" },
  { id: "4", name: "Phòng tắm", icon: "water-outline" },
  { id: "5", name: "Sân vườn", icon: "leaf-outline" },
  { id: "6", name: "Văn phòng", icon: "desktop-outline" },
];

const generatedDesigns = [
  {
    id: "1",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=300&q=80",
    style: "Hiện đại",
    likes: 234,
  },
  {
    id: "2",
    image:
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=400&h=300&q=80",
    style: "Tối giản",
    likes: 189,
  },
  {
    id: "3",
    image:
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400&h=300&q=80",
    style: "Scandinavian",
    likes: 156,
  },
];

export default function AIDesignScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();

  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!selectedStyle || !selectedRoom) return;
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 3000);
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: "Thiết kế AI", headerShown: true }} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[styles.heroCard, { backgroundColor: "#FF6B35" }]}>
          <Ionicons name="sparkles" size={40} color="#FFD700" />
          <Text style={styles.heroTitle}>Tạo thiết kế với AI</Text>
          <Text style={styles.heroSubtitle}>
            Mô tả không gian mơ ước, AI sẽ tạo thiết kế trong vài giây
          </Text>
        </View>

        {/* Room Type Selection */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Chọn loại phòng
          </Text>
          <View style={styles.roomGrid}>
            {roomTypes.map((room) => (
              <TouchableOpacity
                key={room.id}
                style={[
                  styles.roomItem,
                  selectedRoom === room.id && styles.roomItemActive,
                ]}
                onPress={() => setSelectedRoom(room.id)}
              >
                <Ionicons
                  name={room.icon as any}
                  size={24}
                  color={selectedRoom === room.id ? "#fff" : "#FF6B35"}
                />
                <Text
                  style={[
                    styles.roomName,
                    { color: selectedRoom === room.id ? "#fff" : textColor },
                  ]}
                >
                  {room.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Style Selection */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Chọn phong cách
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {designStyles.map((style) => (
              <TouchableOpacity
                key={style.id}
                style={[
                  styles.styleItem,
                  selectedStyle === style.id && styles.styleItemActive,
                ]}
                onPress={() => setSelectedStyle(style.id)}
              >
                <Text style={styles.styleIcon}>{style.icon}</Text>
                <Text
                  style={[
                    styles.styleName,
                    {
                      color: selectedStyle === style.id ? "#FF6B35" : textColor,
                    },
                  ]}
                >
                  {style.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Prompt Input */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Mô tả thêm (tùy chọn)
          </Text>
          <TextInput
            style={[styles.promptInput, { color: textColor }]}
            placeholder="VD: Phòng khách 20m2, cửa sổ lớn, tông màu trắng be..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            value={prompt}
            onChangeText={setPrompt}
          />
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[
            styles.generateBtn,
            (!selectedStyle || !selectedRoom) && styles.generateBtnDisabled,
          ]}
          onPress={handleGenerate}
          disabled={!selectedStyle || !selectedRoom || isGenerating}
        >
          {isGenerating ? (
            <>
              <Ionicons name="sync" size={20} color="#fff" />
              <Text style={styles.generateBtnText}>Đang tạo...</Text>
            </>
          ) : (
            <>
              <Ionicons name="sparkles" size={20} color="#fff" />
              <Text style={styles.generateBtnText}>Tạo thiết kế</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Recent Designs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Thiết kế gần đây
            </Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.designsGrid}>
            {generatedDesigns.map((design) => (
              <TouchableOpacity key={design.id} style={styles.designCard}>
                <Image
                  source={{ uri: design.image }}
                  style={styles.designImage}
                />
                <View style={styles.designOverlay}>
                  <Text style={styles.designStyle}>{design.style}</Text>
                  <View style={styles.designLikes}>
                    <Ionicons name="heart" size={14} color="#fff" />
                    <Text style={styles.designLikesText}>{design.likes}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tips */}
        <View style={[styles.tipsCard, { backgroundColor: cardBg }]}>
          <Ionicons name="bulb-outline" size={24} color="#FFB800" />
          <View style={styles.tipsContent}>
            <Text style={[styles.tipsTitle, { color: textColor }]}>
              Mẹo tạo thiết kế đẹp
            </Text>
            <Text style={styles.tipsText}>
              • Mô tả kích thước phòng{"\n"}• Nêu rõ nguồn sáng (cửa sổ, đèn)
              {"\n"}• Chọn màu sắc chủ đạo
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "bold", marginTop: 12 },
  heroSubtitle: {
    color: "#fff",
    opacity: 0.9,
    textAlign: "center",
    marginTop: 8,
  },
  section: { margin: 16, marginTop: 0, padding: 16, borderRadius: 12 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 16 },
  viewAll: { color: "#FF6B35", fontSize: 14 },
  roomGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  roomItem: {
    width: "31%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#FF6B3510",
    marginBottom: 10,
  },
  roomItemActive: { backgroundColor: "#FF6B35" },
  roomName: { fontSize: 12, marginTop: 8 },
  styleItem: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#eee",
    minWidth: 80,
  },
  styleItemActive: { borderColor: "#FF6B35" },
  styleIcon: { fontSize: 28 },
  styleName: { fontSize: 12, marginTop: 8 },
  promptInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
  },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF6B35",
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  generateBtnDisabled: { backgroundColor: "#ccc" },
  generateBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  designsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  designCard: {
    width: "48%",
    height: 150,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  designImage: { width: "100%", height: "100%", backgroundColor: "#f0f0f0" },
  designOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  designStyle: { color: "#fff", fontSize: 12, fontWeight: "500" },
  designLikes: { flexDirection: "row", alignItems: "center" },
  designLikesText: { color: "#fff", fontSize: 12, marginLeft: 4 },
  tipsCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
  },
  tipsContent: { flex: 1, marginLeft: 12 },
  tipsTitle: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  tipsText: { color: "#666", fontSize: 13, lineHeight: 20 },
});
