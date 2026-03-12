/**
 * House Design Screen - API-Integrated Version
 * Fetches data from server and displays design companies
 * Uses real images from API or Pexels for demos
 * @updated 2026-01-28
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

// Pexels API images for demo (architecture/interior design related)
const DEMO_IMAGES = [
  "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=600",
];

const LOCATIONS = ["Tất cả", "Hà Nội", "TP.HCM", "Đà Nẵng", "Cần Thơ"];
const PRICE_RANGES = [
  { label: "Tất cả", min: 0, max: Infinity },
  { label: "Dưới 5 triệu", min: 0, max: 5000000 },
  { label: "5-10 triệu", min: 5000000, max: 10000000 },
  { label: "Trên 10 triệu", min: 10000000, max: Infinity },
];

interface DesignCompany {
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

// Transform API data to display format
function transformCompanyData(
  companies: CompanyListItem[],
  startIndex: number,
): DesignCompany[] {
  return companies.map((company, idx) => ({
    id: company.id,
    name: company.name,
    logo:
      company.logo ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=7CB342&color=fff&size=128`,
    rating: company.rating || 4.5,
    reviewCount: company.reviewCount || 0,
    projectCount: Math.floor(Math.random() * 200) + 50,
    startPrice: "5.000.000",
    location: company.location || "Hà Nội",
    specialties: company.specialties || ["Thiết kế nhà"],
    image: DEMO_IMAGES[(idx + startIndex) % DEMO_IMAGES.length],
    verified: company.verified,
  }));
}

// Fallback demo companies if API fails
const FALLBACK_COMPANIES: DesignCompany[] = [
  {
    id: 1,
    name: "Công ty Thiết kế A&A",
    logo: "https://ui-avatars.com/api/?name=AA&background=7CB342&color=fff&size=128",
    rating: 4.8,
    reviewCount: 256,
    projectCount: 150,
    startPrice: "5.000.000",
    location: "Hà Nội",
    specialties: ["Biệt thự", "Nhà phố"],
    image: DEMO_IMAGES[0],
    verified: true,
  },
  {
    id: 2,
    name: "Kiến trúc Việt",
    logo: "https://ui-avatars.com/api/?name=KV&background=689F38&color=fff&size=128",
    rating: 4.9,
    reviewCount: 412,
    projectCount: 200,
    startPrice: "7.000.000",
    location: "TP.HCM",
    specialties: ["Nhà vườn", "Resort"],
    image: DEMO_IMAGES[1],
    verified: true,
  },
  {
    id: 3,
    name: "Homespace Design",
    logo: "https://ui-avatars.com/api/?name=HD&background=AED581&color=333&size=128",
    rating: 4.7,
    reviewCount: 189,
    projectCount: 120,
    startPrice: "4.500.000",
    location: "Đà Nẵng",
    specialties: ["Căn hộ", "Chung cư"],
    image: DEMO_IMAGES[2],
    verified: false,
  },
  {
    id: 4,
    name: "Kiến Việt Architecture",
    logo: "https://ui-avatars.com/api/?name=KVA&background=558B2F&color=fff&size=128",
    rating: 4.6,
    reviewCount: 145,
    projectCount: 95,
    startPrice: "6.000.000",
    location: "Hà Nội",
    specialties: ["Nhà cấp 4", "Nhà 2 tầng"],
    image: DEMO_IMAGES[3],
    verified: true,
  },
  {
    id: 5,
    name: "Modern Living Design",
    logo: "https://ui-avatars.com/api/?name=MLD&background=33691E&color=fff&size=128",
    rating: 4.5,
    reviewCount: 98,
    projectCount: 78,
    startPrice: "5.500.000",
    location: "TP.HCM",
    specialties: ["Hiện đại", "Minimalist"],
    image: DEMO_IMAGES[4],
    verified: false,
  },
  {
    id: 6,
    name: "Green Architecture",
    logo: "https://ui-avatars.com/api/?name=GA&background=8BC34A&color=fff&size=128",
    rating: 4.8,
    reviewCount: 234,
    projectCount: 165,
    startPrice: "8.000.000",
    location: "Cần Thơ",
    specialties: ["Eco-friendly", "Nhà xanh"],
    image: DEMO_IMAGES[5],
    verified: true,
  },
];

export default function HouseDesignScreen() {
  const [companies, setCompanies] = useState<DesignCompany[]>([]);
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

  // Fetch companies from API
  const fetchCompanies = useCallback(async () => {
    try {
      setError(null);
      const response = await getDesignCompanies({
        location: selectedLocation !== "Tất cả" ? selectedLocation : undefined,
        search: searchQuery || undefined,
      });

      if (response.data && response.data.length > 0) {
        setCompanies(transformCompanyData(response.data, 0));
      } else {
        setCompanies(FALLBACK_COMPANIES);
      }
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError("Không thể tải dữ liệu. Đang sử dụng dữ liệu demo.");
      setCompanies(FALLBACK_COMPANIES);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedLocation, searchQuery]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCompanies();
  }, [fetchCompanies]);

  // Handle contact button
  const handleContact = async (company: DesignCompany) => {
    try {
      setConsultingId(company.id);
      const conversationId = await getOrCreateConversation({
        userId: Number(company.id),
        userName: company.name,
        userRole: "HOUSE_DESIGN",
      });
      router.push(
        `/messages/chat/${conversationId}` as `/messages/chat/${string}`,
      );
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setConsultingId(null);
    }
  };

  const filteredCompanies = companies.filter((company) => {
    const matchLocation =
      selectedLocation === "Tất cả" || company.location === selectedLocation;
    const price = parseFloat(company.startPrice.replace(/\./g, ""));
    const matchPrice =
      price >= PRICE_RANGES[selectedPriceRange].min &&
      price <= PRICE_RANGES[selectedPriceRange].max;
    const matchSearch =
      searchQuery === "" ||
      company.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLocation && matchPrice && matchSearch;
  });

  const renderCompanyCard = ({ item: company }: { item: DesignCompany }) => (
    <TouchableOpacity
      style={styles.companyCard}
      onPress={() => router.push(`/services/company-detail?id=${company.id}`)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: company.image }}
        style={styles.companyImage}
        resizeMode="cover"
      />
      {company.verified && (
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={14} color="#fff" />
          <Text style={styles.verifiedText}>Đã xác thực</Text>
        </View>
      )}
      <View style={styles.companyInfo}>
        <View style={styles.companyHeader}>
          <Image
            source={{ uri: company.logo }}
            style={styles.companyLogo}
            defaultSource={require("@/assets/images/icon-dich-vu/thiet-ke-nha.webp")}
          />
          <View style={styles.companyNameSection}>
            <Text style={styles.companyName} numberOfLines={1}>
              {company.name}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color="#666" />
              <Text style={styles.locationText}>{company.location}</Text>
            </View>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={14} color={Colors.light.primary} />
            <Text style={styles.ratingText}>{company.rating.toFixed(1)}</Text>
            <Text style={styles.reviewText}>({company.reviewCount})</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Ionicons name="briefcase-outline" size={14} color="#666" />
            <Text style={styles.projectText}>{company.projectCount} dự án</Text>
          </View>
        </View>
        <View style={styles.specialtyRow}>
          {company.specialties.slice(0, 3).map((specialty, idx) => (
            <View key={idx} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          ))}
        </View>
        <View style={styles.footer}>
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Từ</Text>
            <Text style={styles.priceValue}>{company.startPrice}₫</Text>
          </View>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => handleContact(company)}
            disabled={consultingId === company.id}
          >
            {consultingId === company.id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.contactButtonText}>Liên hệ</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Thiết kế nhà",
            headerStyle: { backgroundColor: Colors.light.primary },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "600" },
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách công ty...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Thiết kế nhà",
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "600" },
        }}
      />
      <View style={styles.container}>
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="information-circle" size={16} color="#856404" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm công ty thiết kế..."
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
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {LOCATIONS.map((location) => (
              <TouchableOpacity
                key={location}
                style={[
                  styles.filterChip,
                  selectedLocation === location && styles.filterChipActive,
                ]}
                onPress={() => setSelectedLocation(location)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedLocation === location &&
                      styles.filterChipTextActive,
                  ]}
                >
                  {location}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {PRICE_RANGES.map((range, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.filterChip,
                  selectedPriceRange === index && styles.filterChipActive,
                ]}
                onPress={() => setSelectedPriceRange(index)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedPriceRange === index && styles.filterChipTextActive,
                  ]}
                >
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <FlatList
          data={filteredCompanies}
          renderItem={renderCompanyCard}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
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
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                Không tìm thấy kết quả phù hợp
              </Text>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setSelectedLocation("Tất cả");
                  setSelectedPriceRange(0);
                  setSearchQuery("");
                }}
              >
                <Text style={styles.resetButtonText}>Đặt lại bộ lọc</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3cd",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: "#856404",
  },
  searchSection: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
  filterSection: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filterScroll: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    marginHorizontal: 4,
  },
  filterChipActive: {
    backgroundColor: Colors.light.primary,
  },
  filterChipText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#fff",
  },
  listContent: {
    padding: 12,
    paddingBottom: 24,
  },
  companyCard: {
    backgroundColor: "#fff",
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  companyImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#f0f0f0",
  },
  verifiedBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
  companyInfo: {
    padding: 12,
  },
  companyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  companyNameSection: {
    flex: 1,
    marginLeft: 10,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.light.primary,
    marginLeft: 4,
  },
  reviewText: {
    fontSize: 12,
    color: "#999",
    marginLeft: 4,
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 12,
  },
  projectText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 4,
  },
  specialtyRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  specialtyTag: {
    backgroundColor: "#fff5f0",
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  specialtyText: {
    fontSize: 11,
    color: Colors.light.primary,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceSection: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceLabel: {
    fontSize: 12,
    color: "#999",
    marginRight: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.primary,
  },
  contactButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  contactButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: "#999",
    marginTop: 16,
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
