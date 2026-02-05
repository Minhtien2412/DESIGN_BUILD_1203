import { TappableImage } from "@/components/ui/full-media-viewer";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

const events = [
  {
    id: "1",
    title: "Triển lãm Vật liệu xây dựng 2026",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&q=80",
    date: "15-18/01/2026",
    location: "SECC, Quận 7, TP.HCM",
    category: "Triển lãm",
    price: "Miễn phí",
    attendees: 12500,
    isRegistered: false,
  },
  {
    id: "2",
    title: "Workshop: Thiết kế nội thất với Sketchup",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&q=80",
    date: "20/01/2026",
    location: "Online",
    category: "Workshop",
    price: "500.000đ",
    attendees: 234,
    isRegistered: true,
  },
  {
    id: "3",
    title: "Hội thảo: Xu hướng xây dựng xanh",
    image:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=200&q=80",
    date: "25/01/2026",
    location: "Khách sạn Rex, Q.1, TP.HCM",
    category: "Hội thảo",
    price: "200.000đ",
    attendees: 567,
    isRegistered: false,
  },
  {
    id: "4",
    title: "Lớp học: Kỹ thuật thi công sơn cao cấp",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=200&q=80",
    date: "28-30/01/2026",
    location: "Trung tâm đào tạo Nippon",
    category: "Khóa học",
    price: "1.500.000đ",
    attendees: 45,
    isRegistered: false,
  },
];

const categories = [
  { id: "all", label: "Tất cả", icon: "apps-outline" },
  { id: "exhibition", label: "Triển lãm", icon: "cube-outline" },
  { id: "workshop", label: "Workshop", icon: "construct-outline" },
  { id: "seminar", label: "Hội thảo", icon: "people-outline" },
  { id: "course", label: "Khóa học", icon: "school-outline" },
];

export default function EventsScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");

  const formatAttendees = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num.toString();
  };

  const renderEvent = ({ item }: { item: (typeof events)[0] }) => (
    <TouchableOpacity style={[styles.eventCard, { backgroundColor: cardBg }]}>
      <View style={styles.imageContainer}>
        <TappableImage
          source={{ uri: item.image }}
          style={styles.eventImage}
          title={item.title}
          description={item.location}
        />
        <View style={[styles.categoryBadge, { backgroundColor: "#FF6B35" }]}>
          <Text style={styles.categoryBadgeText}>{item.category}</Text>
        </View>
        {item.isRegistered && (
          <View style={styles.registeredBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#fff" />
            <Text style={styles.registeredText}>Đã đăng ký</Text>
          </View>
        )}
      </View>

      <View style={styles.eventContent}>
        <Text
          style={[styles.eventTitle, { color: textColor }]}
          numberOfLines={2}
        >
          {item.title}
        </Text>

        <View style={styles.eventInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={14} color="#FF6B35" />
            <Text style={styles.infoText}>{item.date}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={14} color="#FF6B35" />
            <Text style={styles.infoText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
        </View>

        <View style={styles.eventFooter}>
          <View style={styles.priceBox}>
            <Text
              style={[
                styles.priceText,
                item.price === "Miễn phí" && { color: "#4CAF50" },
              ]}
            >
              {item.price}
            </Text>
          </View>
          <View style={styles.attendeesBox}>
            <Ionicons name="people-outline" size={14} color="#666" />
            <Text style={styles.attendeesText}>
              {formatAttendees(item.attendees)} người
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.registerBtn,
            item.isRegistered && styles.registerBtnDisabled,
          ]}
        >
          <Text style={styles.registerBtnText}>
            {item.isRegistered ? "Đã đăng ký" : "Đăng ký ngay"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: "Sự kiện", headerShown: true }} />

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.categoriesContainer, { backgroundColor: cardBg }]}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryBtn,
              activeCategory === cat.id && styles.categoryBtnActive,
            ]}
            onPress={() => setActiveCategory(cat.id)}
          >
            <Ionicons
              name={cat.icon as any}
              size={16}
              color={activeCategory === cat.id ? "#fff" : "#666"}
            />
            <Text
              style={[
                styles.categoryText,
                activeCategory === cat.id && styles.categoryTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerInfo}>
            <Ionicons name="calendar" size={20} color="#FF6B35" />
            <Text style={[styles.headerText, { color: textColor }]}>
              {events.length} sự kiện sắp diễn ra
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  categoriesContainer: { maxHeight: 54 },
  categoriesContent: { paddingHorizontal: 12, paddingVertical: 8 },
  categoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
    gap: 6,
  },
  categoryBtnActive: { backgroundColor: "#FF6B35" },
  categoryText: { color: "#666", fontSize: 13 },
  categoryTextActive: { color: "#fff" },
  listContent: { padding: 16 },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  headerText: { fontSize: 14 },
  eventCard: { borderRadius: 16, overflow: "hidden", marginBottom: 16 },
  imageContainer: { position: "relative" },
  eventImage: { width: "100%", height: 150, backgroundColor: "#f0f0f0" },
  categoryBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: { color: "#fff", fontSize: 11, fontWeight: "500" },
  registeredBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  registeredText: { color: "#fff", fontSize: 11 },
  eventContent: { padding: 16 },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    lineHeight: 22,
  },
  eventInfo: { gap: 8, marginBottom: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoText: { color: "#666", fontSize: 13, flex: 1 },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  priceBox: {},
  priceText: { color: "#FF6B35", fontSize: 16, fontWeight: "bold" },
  attendeesBox: { flexDirection: "row", alignItems: "center", gap: 4 },
  attendeesText: { color: "#666", fontSize: 13 },
  registerBtn: {
    backgroundColor: "#FF6B35",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  registerBtnDisabled: { backgroundColor: "#ccc" },
  registerBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
