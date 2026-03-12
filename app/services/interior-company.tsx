/**
 * Interior Company Listing Screen
 * Lists interior design companies with search & filters
 * Route: /services/interior-company
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
  "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/2082087/pexels-photo-2082087.jpeg?auto=compress&cs=tinysrgb&w=600",
];

const LOCATIONS = ["Tất cả", "Hà Nội", "TP.HCM", "Đà Nẵng", "Cần Thơ"];
const PRICE_RANGES = [
  { label: "Tất cả", min: 0, max: Infinity },
  { label: "Dưới 5 triệu", min: 0, max: 5000000 },
  { label: "5-15 triệu", min: 5000000, max: 15000000 },
  { label: "Trên 15 triệu", min: 15000000, max: Infinity },
];

interface Company {
  id: number | string;
  name: string;
  logo: string;
  rating: number;
  reviewCount: number;
  projectCount: number;
  startPrice: string;
  location: string;
  specialties: string[];
  image: string;
  verified?: boolean;
}

function transformData(
  companies: CompanyListItem[],
  offset: number,
): Company[] {
  return companies.map((c, i) => ({
    id: c.id,
    name: c.name,
    logo:
      c.logo ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=0D9488&color=fff&size=128`,
    rating: c.rating || 4.5,
    reviewCount: c.reviewCount || 0,
    projectCount: Math.floor(Math.random() * 200) + 50,
    startPrice: "8.000.000",
    location: c.location || "TP.HCM",
    specialties: c.specialties || ["Nội thất"],
    image: DEMO_IMAGES[(i + offset) % DEMO_IMAGES.length],
    verified: c.verified,
  }));
}

const FALLBACK: Company[] = [
  {
    id: 1,
    name: "Công ty TNHH Nội Thất An Khánh",
    logo: "https://ui-avatars.com/api/?name=AK&background=0D9488&color=fff&size=128",
    rating: 4.9,
    reviewCount: 320,
    projectCount: 200,
    startPrice: "10.000.000",
    location: "TP.HCM",
    specialties: ["Biệt thự", "Chung cư", "Văn phòng"],
    image: DEMO_IMAGES[0],
    verified: true,
  },
  {
    id: 2,
    name: "Nội Thất Hoàng Gia",
    logo: "https://ui-avatars.com/api/?name=HG&background=115E59&color=fff&size=128",
    rating: 4.8,
    reviewCount: 256,
    projectCount: 180,
    startPrice: "8.000.000",
    location: "Hà Nội",
    specialties: ["Tân cổ điển", "Luxury"],
    image: DEMO_IMAGES[1],
    verified: true,
  },
  {
    id: 3,
    name: "Home & Living Design",
    logo: "https://ui-avatars.com/api/?name=HLD&background=14B8A6&color=fff&size=128",
    rating: 4.7,
    reviewCount: 189,
    projectCount: 120,
    startPrice: "6.000.000",
    location: "Đà Nẵng",
    specialties: ["Minimalist", "Scandinavian"],
    image: DEMO_IMAGES[2],
    verified: false,
  },
  {
    id: 4,
    name: "Nội Thất Phú Mỹ",
    logo: "https://ui-avatars.com/api/?name=PM&background=0F766E&color=fff&size=128",
    rating: 4.6,
    reviewCount: 145,
    projectCount: 95,
    startPrice: "5.000.000",
    location: "TP.HCM",
    specialties: ["Căn hộ", "Nhà phố"],
    image: DEMO_IMAGES[3],
    verified: true,
  },
  {
    id: 5,
    name: "Vietspace Interior",
    logo: "https://ui-avatars.com/api/?name=VS&background=134E4A&color=fff&size=128",
    rating: 4.5,
    reviewCount: 98,
    projectCount: 78,
    startPrice: "7.000.000",
    location: "Hà Nội",
    specialties: ["Hiện đại", "Industrial"],
    image: DEMO_IMAGES[4],
    verified: false,
  },
  {
    id: 6,
    name: "Art Décor Nội Thất",
    logo: "https://ui-avatars.com/api/?name=AD&background=0D9488&color=fff&size=128",
    rating: 4.8,
    reviewCount: 210,
    projectCount: 160,
    startPrice: "12.000.000",
    location: "Cần Thơ",
    specialties: ["Art Deco", "Luxury"],
    image: DEMO_IMAGES[5],
    verified: true,
  },
];

export default function InteriorCompanyScreen() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("Tất cả");
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
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
      if (res.data && res.data.length > 0) {
        setCompanies(transformData(res.data, 0));
      } else {
        setCompanies(FALLBACK);
      }
    } catch {
      setError("Không thể tải dữ liệu. Đang sử dụng dữ liệu demo.");
      setCompanies(FALLBACK);
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

  const handleContact = async (company: Company) => {
    try {
      setConsultingId(company.id);
      const cid = await getOrCreateConversation({
        userId: Number(company.id),
        userName: company.name,
        userRole: "INTERIOR_COMPANY",
      });
      router.push(`/messages/chat/${cid}` as `/messages/chat/${string}`);
    } catch (e) {
      console.error("Error creating conversation:", e);
    } finally {
      setConsultingId(null);
    }
  };

  const filtered = companies.filter((c) => {
    const matchLoc =
      selectedLocation === "Tất cả" || c.location === selectedLocation;
    const price = parseFloat(c.startPrice.replace(/\./g, ""));
    const matchPrice =
      price >= PRICE_RANGES[selectedPriceRange].min &&
      price <= PRICE_RANGES[selectedPriceRange].max;
    const matchSearch =
      !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLoc && matchPrice && matchSearch;
  });

  const renderCard = ({ item: c }: { item: Company }) => (
    <TouchableOpacity
      style={s.card}
      onPress={() => router.push(`/services/company-detail?id=${c.id}`)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: c.image }} style={s.cardImage} resizeMode="cover" />
      {c.verified && (
        <View style={s.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={14} color="#fff" />
          <Text style={s.verifiedText}>Đã xác thực</Text>
        </View>
      )}
      <View style={s.cardBody}>
        <View style={s.header}>
          <Image source={{ uri: c.logo }} style={s.logo} />
          <View style={{ flex: 1 }}>
            <Text style={s.name} numberOfLines={1}>
              {c.name}
            </Text>
            <View style={s.locRow}>
              <Ionicons name="location-outline" size={12} color="#666" />
              <Text style={s.locText}>{c.location}</Text>
            </View>
          </View>
        </View>
        <View style={s.statsRow}>
          <View style={s.stat}>
            <Ionicons name="star" size={14} color={Colors.light.primary} />
            <Text style={s.ratingText}>{c.rating.toFixed(1)}</Text>
            <Text style={s.reviewText}>({c.reviewCount})</Text>
          </View>
          <View style={s.divider} />
          <View style={s.stat}>
            <Ionicons name="briefcase-outline" size={14} color="#666" />
            <Text style={s.projectText}>{c.projectCount} dự án</Text>
          </View>
        </View>
        <View style={s.tagRow}>
          {c.specialties.slice(0, 3).map((sp, i) => (
            <View key={i} style={s.tag}>
              <Text style={s.tagText}>{sp}</Text>
            </View>
          ))}
        </View>
        <View style={s.footer}>
          <View>
            <Text style={s.priceLabel}>Từ</Text>
            <Text style={s.priceValue}>{c.startPrice}₫</Text>
          </View>
          <TouchableOpacity
            style={s.contactBtn}
            onPress={() => handleContact(c)}
            disabled={consultingId === c.id}
          >
            {consultingId === c.id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={s.contactText}>Liên hệ</Text>
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
            title: "Công ty nội thất",
            headerStyle: { backgroundColor: Colors.light.primary },
            headerTintColor: "#fff",
          }}
        />
        <View style={s.center}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={s.loadText}>Đang tải danh sách...</Text>
        </View>
      </>
    );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Công ty nội thất",
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
              placeholder="Tìm công ty nội thất..."
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.filterScroll}
          >
            {PRICE_RANGES.map((r, i) => (
              <TouchableOpacity
                key={i}
                style={[s.chip, selectedPriceRange === i && s.chipActive]}
                onPress={() => setSelectedPriceRange(i)}
              >
                <Text
                  style={[
                    s.chipText,
                    selectedPriceRange === i && s.chipTextActive,
                  ]}
                >
                  {r.label}
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
              <Text style={s.emptyText}>Không tìm thấy kết quả phù hợp</Text>
              <TouchableOpacity
                style={s.resetBtn}
                onPress={() => {
                  setSelectedLocation("Tất cả");
                  setSelectedPriceRange(0);
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
  cardBody: { padding: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  logo: { width: 44, height: 44, borderRadius: 22 },
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
