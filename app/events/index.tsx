import { TappableImage } from "@/components/ui/full-media-viewer";
import { useThemeColor } from "@/hooks/use-theme-color";
import { get } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Dimensions,
    FlatList,
    RefreshControl,
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
  const [refreshing, setRefreshing] = useState(false);
  const [eventList, setEventList] = useState(events);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await get("/api/events");
      if (res?.data) setEventList(res.data);
    } catch {
      /* mock */
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  }, [fetchEvents]);

  const handleRegister = useCallback((event: (typeof events)[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (event.isRegistered) {
      Alert.alert("Hủy đăng ký", `Bạn muốn hủy đăng ký ${event.title}?`, [
        { text: "Không" },
        {
          text: "Hủy",
          style: "destructive",
          onPress: () =>
            setEventList((prev) =>
              prev.map((e) =>
                e.id === event.id
                  ? { ...e, isRegistered: false, attendees: e.attendees - 1 }
                  : e,
              ),
            ),
        },
      ]);
    } else {
      Alert.alert("Đăng ký thành công! 🎉", `Bạn đã đăng ký ${event.title}`);
      setEventList((prev) =>
        prev.map((e) =>
          e.id === event.id
            ? { ...e, isRegistered: true, attendees: e.attendees + 1 }
            : e,
        ),
      );
    }
  }, []);

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
        <View style={[styles.categoryBadge, { backgroundColor: "#0D9488" }]}>
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
            <Ionicons name="calendar-outline" size={14} color="#14B8A6" />
            <Text style={styles.infoText}>{item.date}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={14} color="#14B8A6" />
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
          onPress={() => handleRegister(item)}
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
        data={eventList}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#14B8A6"
          />
        }
        ListHeaderComponent={
          <View style={styles.headerInfo}>
            <Ionicons name="calendar" size={20} color="#14B8A6" />
            <Text style={[styles.headerText, { color: textColor }]}>
              {eventList.length} sự kiện sắp diễn ra
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFB" },
  categoriesContainer: { maxHeight: 54 },
  categoriesContent: { paddingHorizontal: 12, paddingVertical: 8 },
  categoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    marginRight: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  categoryBtnActive: { backgroundColor: "#0D9488", borderColor: "#0D9488" },
  categoryText: { color: "#6B7280", fontSize: 13, fontWeight: "500" },
  categoryTextActive: { color: "#fff", fontWeight: "600" },
  listContent: { padding: 16 },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  headerText: { fontSize: 14 },
  eventCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
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
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
    lineHeight: 22,
    letterSpacing: -0.2,
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
  priceText: {
    color: "#0D9488",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  attendeesBox: { flexDirection: "row", alignItems: "center", gap: 4 },
  attendeesText: { color: "#666", fontSize: 13 },
  registerBtn: {
    backgroundColor: "#0D9488",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  registerBtnDisabled: { backgroundColor: "#D1D5DB", shadowOpacity: 0 },
  registerBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
