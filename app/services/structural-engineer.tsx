/**
 * Structural Engineer Listing Screen — Kỹ sư kết cấu
 * Route: /services/structural-engineer
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

const DEMO_IMAGES = [
  "https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/585419/pexels-photo-585419.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/544966/pexels-photo-544966.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/2760243/pexels-photo-2760243.jpeg?auto=compress&cs=tinysrgb&w=600",
];

const LOCATIONS = ["Tất cả", "Hà Nội", "TP.HCM", "Đà Nẵng", "Cần Thơ"];

interface StructuralEngineer {
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
  certification?: string;
}

function transformData(
  companies: CompanyListItem[],
  offset: number,
): StructuralEngineer[] {
  return companies.map((c, i) => ({
    id: c.id,
    name: c.name,
    avatar:
      c.logo ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=0D9488&color=fff&size=128`,
    rating: c.rating || 4.5,
    reviewCount: c.reviewCount || 0,
    projectCount: Math.floor(Math.random() * 100) + 20,
    pricePerM2: "150.000",
    location: c.location || "TP.HCM",
    specialties: c.specialties || ["Kết cấu"],
    experience: "5+ năm",
    image: DEMO_IMAGES[(i + offset) % DEMO_IMAGES.length],
    verified: c.verified,
    certification: "Chứng chỉ hành nghề",
  }));
}

const FALLBACK: StructuralEngineer[] = [
  {
    id: 1,
    name: "KS. Nguyễn Đức Tính",
    avatar: "https://ui-avatars.com/api/?name=NDT&background=0D9488&color=fff",
    rating: 4.9,
    reviewCount: 245,
    projectCount: 110,
    pricePerM2: "180.000",
    location: "Hà Nội",
    specialties: ["Kết cấu thép", "Nhà cao tầng"],
    experience: "15 năm",
    image: DEMO_IMAGES[0],
    verified: true,
    certification: "Hạng I - Kết cấu",
  },
  {
    id: 2,
    name: "KS. Trần Quốc Hưng",
    avatar: "https://ui-avatars.com/api/?name=TQH&background=115E59&color=fff",
    rating: 4.8,
    reviewCount: 310,
    projectCount: 145,
    pricePerM2: "200.000",
    location: "TP.HCM",
    specialties: ["Nền móng", "Cọc khoan nhồi"],
    experience: "18 năm",
    image: DEMO_IMAGES[1],
    verified: true,
    certification: "Hạng I - Kết cấu",
  },
  {
    id: 3,
    name: "KS. Lê Thanh Bình",
    avatar: "https://ui-avatars.com/api/?name=LTB&background=14B8A6&color=fff",
    rating: 4.7,
    reviewCount: 180,
    projectCount: 80,
    pricePerM2: "150.000",
    location: "Đà Nẵng",
    specialties: ["BTCT", "Nhà dân"],
    experience: "8 năm",
    image: DEMO_IMAGES[2],
    verified: false,
    certification: "Hạng II",
  },
  {
    id: 4,
    name: "KS. Phạm Minh Tuấn",
    avatar: "https://ui-avatars.com/api/?name=PMT&background=0F766E&color=fff",
    rating: 4.9,
    reviewCount: 350,
    projectCount: 160,
    pricePerM2: "220.000",
    location: "TP.HCM",
    specialties: ["Kết cấu đặc biệt", "Hầm ngầm"],
    experience: "20 năm",
    image: DEMO_IMAGES[3],
    verified: true,
    certification: "Hạng I - Kết cấu",
  },
  {
    id: 5,
    name: "KS. Hoàng Văn Mạnh",
    avatar: "https://ui-avatars.com/api/?name=HVM&background=134E4A&color=fff",
    rating: 4.6,
    reviewCount: 125,
    projectCount: 55,
    pricePerM2: "140.000",
    location: "Cần Thơ",
    specialties: ["Nhà phố", "Biệt thự"],
    experience: "6 năm",
    image: DEMO_IMAGES[4],
    verified: false,
    certification: "Hạng II",
  },
  {
    id: 6,
    name: "KS. Vũ Anh Dũng",
    avatar: "https://ui-avatars.com/api/?name=VAD&background=0D9488&color=fff",
    rating: 4.8,
    reviewCount: 290,
    projectCount: 130,
    pricePerM2: "190.000",
    location: "Hà Nội",
    specialties: ["Khung thép", "Tiền chế"],
    experience: "12 năm",
    image: DEMO_IMAGES[5],
    verified: true,
    certification: "Hạng I - Kết cấu",
  },
];

export default function StructuralEngineerScreen() {
  const [engineers, setEngineers] = useState<StructuralEngineer[]>([]);
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
        setEngineers(transformData(res.data, 0));
      else setEngineers(FALLBACK);
    } catch {
      setError("Đang sử dụng dữ liệu demo.");
      setEngineers(FALLBACK);
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

  const handleContact = async (item: StructuralEngineer) => {
    try {
      setConsultingId(item.id);
      const cid = await getOrCreateConversation({
        userId: Number(item.id),
        userName: item.name,
        userRole: "STRUCTURAL_ENGINEER",
      });
      router.push(`/messages/chat/${cid}` as `/messages/chat/${string}`);
    } catch (e) {
      console.error(e);
    } finally {
      setConsultingId(null);
    }
  };

  const filtered = engineers.filter((e) => {
    const matchLoc =
      selectedLocation === "Tất cả" || e.location === selectedLocation;
    const matchSearch =
      !searchQuery || e.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLoc && matchSearch;
  });

  const renderCard = ({ item: e }: { item: StructuralEngineer }) => (
    <TouchableOpacity
      style={st.card}
      onPress={() => router.push(`/services/company-detail?id=${e.id}`)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: e.image }}
        style={st.cardImage}
        resizeMode="cover"
      />
      {e.verified && (
        <View style={st.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={14} color="#fff" />
          <Text style={st.verifiedText}>Xác thực</Text>
        </View>
      )}
      <View style={st.expBadge}>
        <Text style={st.expText}>{e.experience}</Text>
      </View>
      <View style={st.cardBody}>
        <View style={st.header}>
          <Image source={{ uri: e.avatar }} style={st.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={st.name} numberOfLines={1}>
              {e.name}
            </Text>
            <View style={st.locRow}>
              <Ionicons name="location-outline" size={12} color="#666" />
              <Text style={st.locText}>{e.location}</Text>
            </View>
          </View>
        </View>
        {e.certification && (
          <View style={st.certRow}>
            <Ionicons
              name="ribbon-outline"
              size={14}
              color={Colors.light.primary}
            />
            <Text style={st.certText}>{e.certification}</Text>
          </View>
        )}
        <View style={st.statsRow}>
          <View style={st.stat}>
            <Ionicons name="star" size={14} color={Colors.light.primary} />
            <Text style={st.ratingText}>{e.rating.toFixed(1)}</Text>
            <Text style={st.reviewText}>({e.reviewCount})</Text>
          </View>
          <View style={st.divider} />
          <View style={st.stat}>
            <Ionicons name="briefcase-outline" size={14} color="#666" />
            <Text style={st.projectText}>{e.projectCount} dự án</Text>
          </View>
        </View>
        <View style={st.tagRow}>
          {e.specialties.slice(0, 3).map((sp, i) => (
            <View key={i} style={st.tag}>
              <Text style={st.tagText}>{sp}</Text>
            </View>
          ))}
        </View>
        <View style={st.footer}>
          <View>
            <Text style={st.priceLabel}>Từ</Text>
            <Text style={st.priceValue}>{e.pricePerM2}₫/m²</Text>
          </View>
          <TouchableOpacity
            style={st.contactBtn}
            onPress={() => handleContact(e)}
            disabled={consultingId === e.id}
          >
            {consultingId === e.id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={st.contactText}>Tư vấn</Text>
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
            title: "Kỹ sư kết cấu",
            headerStyle: { backgroundColor: Colors.light.primary },
            headerTintColor: "#fff",
          }}
        />
        <View style={st.center}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={st.loadText}>Đang tải danh sách kỹ sư kết cấu...</Text>
        </View>
      </>
    );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Kỹ sư kết cấu",
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "600" },
        }}
      />
      <View style={st.container}>
        {error && (
          <View style={st.errorBanner}>
            <Ionicons name="information-circle" size={16} color="#856404" />
            <Text style={st.errorText}>{error}</Text>
          </View>
        )}
        <View style={st.searchSection}>
          <View style={st.searchBar}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={st.searchInput}
              placeholder="Tìm kỹ sư kết cấu..."
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
        <View style={st.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={st.filterScroll}
          >
            {LOCATIONS.map((loc) => (
              <TouchableOpacity
                key={loc}
                style={[st.chip, selectedLocation === loc && st.chipActive]}
                onPress={() => setSelectedLocation(loc)}
              >
                <Text
                  style={[
                    st.chipText,
                    selectedLocation === loc && st.chipTextActive,
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
            <View style={st.empty}>
              <Ionicons name="search-outline" size={64} color="#ccc" />
              <Text style={st.emptyText}>
                Không tìm thấy kỹ sư kết cấu phù hợp
              </Text>
              <TouchableOpacity
                style={st.resetBtn}
                onPress={() => {
                  setSelectedLocation("Tất cả");
                  setSearchQuery("");
                }}
              >
                <Text style={st.resetText}>Đặt lại bộ lọc</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    </>
  );
}

const st = StyleSheet.create({
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
  cardImage: { width: "100%", height: 160 },
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
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expText: { color: "#fff", fontSize: 11, fontWeight: "500" },
  cardBody: { padding: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
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
  certRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  certText: { fontSize: 12, color: Colors.light.primary, fontWeight: "600" },
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
