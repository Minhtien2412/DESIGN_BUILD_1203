/**
 * Architect Listing Screen — Danh sách Kiến trúc sư
 * Route: /services/architect-listing
 * @created 2026-03-05
 */

import { Colors } from "@/constants/theme";
import { useUnifiedMessaging } from "@/hooks/crm/useUnifiedMessaging";
import {
    getDesignCompanies,
    type CompanyListItem,
} from "@/services/company.service";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

const DEMO_IMAGES = [
  "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/2089698/pexels-photo-2089698.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/2119714/pexels-photo-2119714.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=600",
];

const LOCATIONS = ["Tất cả", "Hà Nội", "TP.HCM", "Đà Nẵng", "Cần Thơ"];
const EXPERIENCE = ["Tất cả", "1-3 năm", "3-5 năm", "5-10 năm", "Trên 10 năm"];

interface Architect {
  id: number | string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  projectCount: number;
  pricePerM2: string;
  location: string;
  specialties: string[];
  experience: string;
  image: string;
  verified?: boolean;
}

function transformData(
  companies: CompanyListItem[],
  offset: number,
): Architect[] {
  return companies.map((c, i) => ({
    id: c.id,
    name: c.name,
    avatar:
      c.logo ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=0D9488&color=fff&size=128`,
    rating: c.rating || 4.5,
    reviewCount: c.reviewCount || 0,
    projectCount: Math.floor(Math.random() * 150) + 30,
    pricePerM2: "300.000",
    location: c.location || "TP.HCM",
    specialties: c.specialties || ["Kiến trúc"],
    experience: "5+ năm",
    image: DEMO_IMAGES[(i + offset) % DEMO_IMAGES.length],
    verified: c.verified,
  }));
}

const FALLBACK: Architect[] = [
  {
    id: 1,
    name: "KTS. Nguyễn Văn An",
    avatar: "https://ui-avatars.com/api/?name=NVA&background=0D9488&color=fff",
    rating: 4.9,
    reviewCount: 280,
    projectCount: 120,
    pricePerM2: "350.000",
    location: "Hà Nội",
    specialties: ["Biệt thự", "Nhà phố hiện đại"],
    experience: "12 năm",
    image: DEMO_IMAGES[0],
    verified: true,
  },
  {
    id: 2,
    name: "KTS. Trần Minh Đức",
    avatar: "https://ui-avatars.com/api/?name=TMD&background=115E59&color=fff",
    rating: 4.8,
    reviewCount: 210,
    projectCount: 95,
    pricePerM2: "300.000",
    location: "TP.HCM",
    specialties: ["Resort", "Nhà vườn"],
    experience: "8 năm",
    image: DEMO_IMAGES[1],
    verified: true,
  },
  {
    id: 3,
    name: "KTS. Lê Thị Hồng",
    avatar: "https://ui-avatars.com/api/?name=LTH&background=14B8A6&color=fff",
    rating: 4.7,
    reviewCount: 165,
    projectCount: 78,
    pricePerM2: "250.000",
    location: "Đà Nẵng",
    specialties: ["Căn hộ", "Chung cư cao tầng"],
    experience: "6 năm",
    image: DEMO_IMAGES[2],
    verified: false,
  },
  {
    id: 4,
    name: "KTS. Phạm Quốc Bảo",
    avatar: "https://ui-avatars.com/api/?name=PQB&background=0F766E&color=fff",
    rating: 4.9,
    reviewCount: 340,
    projectCount: 180,
    pricePerM2: "400.000",
    location: "TP.HCM",
    specialties: ["Công trình công cộng", "Nhà hàng"],
    experience: "15 năm",
    image: DEMO_IMAGES[3],
    verified: true,
  },
  {
    id: 5,
    name: "KTS. Hoàng Anh Tuấn",
    avatar: "https://ui-avatars.com/api/?name=HAT&background=134E4A&color=fff",
    rating: 4.6,
    reviewCount: 130,
    projectCount: 60,
    pricePerM2: "280.000",
    location: "Cần Thơ",
    specialties: ["Eco-house", "Nhà xanh"],
    experience: "5 năm",
    image: DEMO_IMAGES[4],
    verified: false,
  },
  {
    id: 6,
    name: "KTS. Vũ Thanh Sơn",
    avatar: "https://ui-avatars.com/api/?name=VTS&background=0D9488&color=fff",
    rating: 4.8,
    reviewCount: 250,
    projectCount: 140,
    pricePerM2: "320.000",
    location: "Hà Nội",
    specialties: ["Biệt thự cổ điển", "Văn phòng"],
    experience: "10 năm",
    image: DEMO_IMAGES[5],
    verified: true,
  },
];

export default function ArchitectListingScreen() {
  const [architects, setArchitects] = useState<Architect[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [consultingId, setConsultingId] = useState<number | string | null>(
    null,
  );

  const { getOrCreateConversation } = useUnifiedMessaging();

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await getDesignCompanies({
        location: selectedLocation !== "Tất cả" ? selectedLocation : undefined,
        search: searchQuery || undefined,
      });
      if (res.data && res.data.length > 0)
        setArchitects(transformData(res.data, 0));
      else setArchitects(FALLBACK);
    } catch {
      setError("Đang sử dụng dữ liệu demo.");
      setArchitects(FALLBACK);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedLocation, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleContact = async (item: Architect) => {
    try {
      setConsultingId(item.id);
      const cid = await getOrCreateConversation({
        userId: Number(item.id),
        userName: item.name,
        userRole: "ARCHITECT",
      });
      router.push(`/messages/chat/${cid}` as `/messages/chat/${string}`);
    } catch (e) {
      console.error(e);
    } finally {
      setConsultingId(null);
    }
  };

  const filtered = architects.filter((a) => {
    const matchLoc =
      selectedLocation === "Tất cả" || a.location === selectedLocation;
    const matchSearch =
      !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLoc && matchSearch;
  });

  const renderCard = ({ item: a }: { item: Architect }) => (
    <TouchableOpacity
      style={s.card}
      onPress={() => router.push(`/services/company-detail?id=${a.id}`)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: a.image }} style={s.cardImage} resizeMode="cover" />
      {a.verified && (
        <View style={s.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={14} color="#fff" />
          <Text style={s.verifiedText}>Xác thực</Text>
        </View>
      )}
      <View style={s.expBadge}>
        <Ionicons name="time-outline" size={12} color="#fff" />
        <Text style={s.expText}>{a.experience}</Text>
      </View>
      <View style={s.cardBody}>
        <View style={s.header}>
          <Image source={{ uri: a.avatar }} style={s.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={s.name} numberOfLines={1}>
              {a.name}
            </Text>
            <View style={s.locRow}>
              <Ionicons name="location-outline" size={12} color="#666" />
              <Text style={s.locText}>{a.location}</Text>
            </View>
          </View>
        </View>
        <View style={s.statsRow}>
          <View style={s.stat}>
            <Ionicons name="star" size={14} color={Colors.light.primary} />
            <Text style={s.ratingText}>{a.rating.toFixed(1)}</Text>
            <Text style={s.reviewText}>({a.reviewCount})</Text>
          </View>
          <View style={s.divider} />
          <View style={s.stat}>
            <Ionicons name="briefcase-outline" size={14} color="#666" />
            <Text style={s.projectText}>{a.projectCount} dự án</Text>
          </View>
        </View>
        <View style={s.tagRow}>
          {a.specialties.slice(0, 3).map((sp, i) => (
            <View key={i} style={s.tag}>
              <Text style={s.tagText}>{sp}</Text>
            </View>
          ))}
        </View>
        <View style={s.footer}>
          <View>
            <Text style={s.priceLabel}>Từ</Text>
            <Text style={s.priceValue}>{a.pricePerM2}₫/m²</Text>
          </View>
          <TouchableOpacity
            style={s.contactBtn}
            onPress={() => handleContact(a)}
            disabled={consultingId === a.id}
          >
            {consultingId === a.id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={s.contactText}>Tư vấn</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading)
    return (
      <>
        <Stack.Screen
          options={{
            title: "Kiến trúc sư",
            headerStyle: { backgroundColor: Colors.light.primary },
            headerTintColor: "#fff",
          }}
        />
        <View style={s.center}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={s.loadText}>Đang tải danh sách kiến trúc sư...</Text>
        </View>
      </>
    );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Kiến trúc sư",
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "600" },
        }}
      />
      <View style={s.container}>
        {error && (
          <View style={s.errorBanner}>
            <Ionicons name="information-circle" size={16} color="#856404" />
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}
        <View style={s.searchSection}>
          <View style={s.searchBar}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={s.searchInput}
              placeholder="Tìm kiến trúc sư..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery !== "" && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={s.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.filterScroll}
          >
            {LOCATIONS.map((loc) => (
              <TouchableOpacity
                key={loc}
                style={[s.chip, selectedLocation === loc && s.chipActive]}
                onPress={() => setSelectedLocation(loc)}
              >
                <Text
                  style={[
                    s.chipText,
                    selectedLocation === loc && s.chipTextActive,
                  ]}
                >
                  {loc}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <FlatList
          data={filtered}
          renderItem={renderCard}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.light.primary]}
              tintColor={Colors.light.primary}
            />
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="search-outline" size={64} color="#ccc" />
              <Text style={s.emptyText}>
                Không tìm thấy kiến trúc sư phù hợp
              </Text>
              <TouchableOpacity
                style={s.resetBtn}
                onPress={() => {
                  setSelectedLocation("Tất cả");
                  setSearchQuery("");
                }}
              >
                <Text style={s.resetText}>Đặt lại bộ lọc</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadText: { marginTop: 12, fontSize: 14, color: "#666" },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3cd",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  errorText: { flex: 1, fontSize: 12, color: "#856404" },
  searchSection: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#333", marginLeft: 8 },
  filterSection: { backgroundColor: "#fff", paddingBottom: 8 },
  filterScroll: { paddingHorizontal: 12, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    marginHorizontal: 4,
  },
  chipActive: { backgroundColor: Colors.light.primary },
  chipText: { fontSize: 13, color: "#666" },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardImage: { width: "100%", height: 180 },
  verifiedBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(13,148,136,0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  expBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  expText: { color: "#fff", fontSize: 11, fontWeight: "500" },
  cardBody: { padding: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  name: { fontSize: 16, fontWeight: "700", color: "#1a1a1a" },
  locRow: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 2 },
  locText: { fontSize: 12, color: "#666" },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 12,
  },
  stat: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 14, fontWeight: "700", color: "#333" },
  reviewText: { fontSize: 12, color: "#999" },
  divider: { width: 1, height: 16, backgroundColor: "#e5e5e5" },
  projectText: { fontSize: 12, color: "#666" },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  tag: {
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: { fontSize: 12, color: Colors.light.primary, fontWeight: "500" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: { fontSize: 11, color: "#999" },
  priceValue: { fontSize: 16, fontWeight: "700", color: Colors.light.primary },
  contactBtn: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  contactText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 14, color: "#999", marginTop: 12 },
  resetBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
  },
  resetText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
