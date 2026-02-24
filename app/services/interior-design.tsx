/**
 * Interior Design Screen - API-Integrated Version
 * Fetches data from server and displays interior design companies
 * Uses real images from API or Pexels for demos
 * @updated 2026-01-28
 */

import { useUnifiedMessaging } from "@/hooks/crm/useUnifiedMessaging";
import {
    getInteriorCompanies,
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

// Pexels API images for demo (interior design related)
const DEMO_IMAGES = [
  "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/3935350/pexels-photo-3935350.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=600",
];

const LOCATIONS = ["Táº¥t cáº£", "HÃ  Ná»™i", "TP.HCM", "ÄÃ  Náºµng", "Cáº§n ThÆ¡"];
const STYLES = [
  "Táº¥t cáº£",
  "Hiá»‡n Ä‘áº¡i",
  "Cá»• Ä‘iá»ƒn",
  "Tá»‘i giáº£n",
  "Scandinavian",
  "Industrial",
  "Indochine",
  "Sang trá»ng",
];
const PRICE_RANGES = [
  { label: "Táº¥t cáº£", min: 0, max: Infinity },
  { label: "DÆ°á»›i 3 triá»‡u", min: 0, max: 3000000 },
  { label: "3-5 triá»‡u", min: 3000000, max: 5000000 },
  { label: "TrÃªn 5 triá»‡u", min: 5000000, max: Infinity },
];

interface InteriorCompany {
  id: number | string;
  name: string;
  logo: string;
  rating: number;
  reviewCount: number;
  projectCount: number;
  startPrice: string;
  location: string;
  styles: string[];
  image: string;
  featured?: boolean;
  verified?: boolean;
}

// Transform API data to display format
function transformCompanyData(
  companies: CompanyListItem[],
  startIndex: number,
): InteriorCompany[] {
  return companies.map((company, idx) => ({
    id: company.id,
    name: company.name,
    logo:
      company.logo ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=9C27B0&color=fff&size=128`,
    rating: company.rating || 4.5,
    reviewCount: company.reviewCount || 0,
    projectCount: Math.floor(Math.random() * 200) + 50,
    startPrice: "3.500.000",
    location: company.location || "HÃ  Ná»™i",
    styles: company.specialties || ["Hiá»‡n Ä‘áº¡i", "Tá»‘i giáº£n"],
    image: DEMO_IMAGES[(idx + startIndex) % DEMO_IMAGES.length],
    featured: idx < 2,
    verified: company.verified,
  }));
}

// Fallback demo companies if API fails
const FALLBACK_COMPANIES: InteriorCompany[] = [
  {
    id: 101,
    name: "NhÃ  Äáº¹p Interior",
    logo: "https://ui-avatars.com/api/?name=ND&background=9C27B0&color=fff&size=128",
    rating: 4.9,
    reviewCount: 324,
    projectCount: 180,
    startPrice: "3.500.000",
    location: "HÃ  Ná»™i",
    styles: ["Hiá»‡n Ä‘áº¡i", "Tá»‘i giáº£n"],
    image: DEMO_IMAGES[0],
    featured: true,
    verified: true,
  },
  {
    id: 102,
    name: "Luxury Home Design",
    logo: "https://ui-avatars.com/api/?name=LH&background=FF6B35&color=fff&size=128",
    rating: 4.8,
    reviewCount: 298,
    projectCount: 150,
    startPrice: "5.000.000",
    location: "TP.HCM",
    styles: ["Cá»• Ä‘iá»ƒn", "Sang trá»ng"],
    image: DEMO_IMAGES[1],
    featured: true,
    verified: true,
  },
  {
    id: 103,
    name: "Minimal Space Studio",
    logo: "https://ui-avatars.com/api/?name=MS&background=2196F3&color=fff&size=128",
    rating: 4.7,
    reviewCount: 215,
    projectCount: 120,
    startPrice: "3.000.000",
    location: "ÄÃ  Náºµng",
    styles: ["Tá»‘i giáº£n", "Scandinavian"],
    image: DEMO_IMAGES[2],
    featured: false,
    verified: false,
  },
  {
    id: 104,
    name: "Classic Interior Vietnam",
    logo: "https://ui-avatars.com/api/?name=CI&background=FF9800&color=fff&size=128",
    rating: 4.6,
    reviewCount: 187,
    projectCount: 95,
    startPrice: "4.000.000",
    location: "HÃ  Ná»™i",
    styles: ["Cá»• Ä‘iá»ƒn", "Indochine"],
    image: DEMO_IMAGES[3],
    featured: false,
    verified: true,
  },
  {
    id: 105,
    name: "Urban Living Design",
    logo: "https://ui-avatars.com/api/?name=UL&background=4CAF50&color=fff&size=128",
    rating: 4.8,
    reviewCount: 256,
    projectCount: 140,
    startPrice: "3.800.000",
    location: "TP.HCM",
    styles: ["Hiá»‡n Ä‘áº¡i", "Industrial"],
    image: DEMO_IMAGES[4],
    featured: false,
    verified: false,
  },
];

export default function InteriorDesignScreen() {
  const [companies, setCompanies] = useState<InteriorCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("Táº¥t cáº£");
  const [selectedStyle, setSelectedStyle] = useState("Táº¥t cáº£");
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFeatured, setShowFeatured] = useState(false);
  const [consultingId, setConsultingId] = useState<number | string | null>(
    null,
  );

  const { getOrCreateConversation } = useUnifiedMessaging();

  // Fetch companies from API
  const fetchCompanies = useCallback(async () => {
    try {
      setError(null);
      const response = await getInteriorCompanies({
        location: selectedLocation === "Táº¥t cáº£" ? undefined : selectedLocation,
        search: searchQuery || undefined,
        limit: 20,
      });

      if (response.data && response.data.length > 0) {
        setCompanies(transformCompanyData(response.data, 0));
      } else {
        // Use fallback data if no API results
        setCompanies(FALLBACK_COMPANIES);
        setError("Äang sá»­ dá»¥ng dá»¯ liá»‡u demo");
      }
    } catch (err) {
      console.error("[InteriorDesign] Error fetching companies:", err);
      setCompanies(FALLBACK_COMPANIES);
      setError("KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u. Äang hiá»ƒn thá»‹ dá»¯ liá»‡u demo.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedLocation, searchQuery]);

  // Initial load
  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchCompanies();
  }, [fetchCompanies]);

  // Handle consult button press - navigate to chat
  const handleConsult = async (company: InteriorCompany) => {
    try {
      setConsultingId(company.id);
      const conversationId = await getOrCreateConversation({
        userId:
          typeof company.id === "number" ? company.id : Number(company.id),
        userName: company.name,
        userAvatar: company.logo,
        userRole: "INTERIOR_DESIGN",
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
      selectedLocation === "Táº¥t cáº£" || company.location === selectedLocation;
    const price = parseFloat(company.startPrice.replace(/\./g, ""));
    const matchPrice =
      price >= PRICE_RANGES[selectedPriceRange].min &&
      price <= PRICE_RANGES[selectedPriceRange].max;
    const matchSearch =
      searchQuery === "" ||
      company.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStyle =
      selectedStyle === "Táº¥t cáº£" || company.styles.includes(selectedStyle);
    const matchFeatured = !showFeatured || company.featured;
    return (
      matchLocation && matchPrice && matchSearch && matchStyle && matchFeatured
    );
  });

  const renderCompanyCard = ({ item: company }: { item: InteriorCompany }) => (
    <TouchableOpacity
      style={styles.companyCard}
      onPress={() => {
        router.push(`/services/company-detail?id=${company.id}`);
      }}
    >
      {/* Featured Badge */}
      {company.featured && (
        <View style={styles.featuredBadge}>
          <Ionicons name="star" size={12} color="#fff" />
          <Text style={styles.featuredBadgeText}>Ná»•i báº­t</Text>
        </View>
      )}

      {/* Company Image */}
      <Image
        source={{ uri: company.image }}
        style={styles.companyImage}
        resizeMode="cover"
      />

      {/* Company Info */}
      <View style={styles.companyInfo}>
        {/* Header */}
        <View style={styles.companyHeader}>
          <Image source={{ uri: company.logo }} style={styles.companyLogo} />
          <View style={styles.companyNameSection}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.companyName} numberOfLines={1}>
                {company.name}
              </Text>
              {company.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#0D9488" />
                </View>
              )}
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color="#666" />
              <Text style={styles.locationText}>{company.location}</Text>
            </View>
          </View>
        </View>

        {/* Rating & Projects */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={14} color="#0D9488" />
            <Text style={styles.ratingText}>{company.rating}</Text>
            <Text style={styles.reviewText}>({company.reviewCount})</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Ionicons name="images-outline" size={14} color="#666" />
            <Text style={styles.projectText}>{company.projectCount} dá»± Ã¡n</Text>
          </View>
        </View>

        {/* Styles */}
        <View style={styles.styleRow}>
          {company.styles.slice(0, 3).map((style, idx) => (
            <View key={idx} style={styles.styleTag}>
              <Text style={styles.styleText}>{style}</Text>
            </View>
          ))}
        </View>

        {/* Price & Button */}
        <View style={styles.footer}>
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Tá»«</Text>
            <Text style={styles.priceValue}>{company.startPrice}â‚«</Text>
            <Text style={styles.priceUnit}>/mÂ²</Text>
          </View>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => handleConsult(company)}
            disabled={consultingId === company.id}
          >
            {consultingId === company.id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={16}
                  color="#fff"
                />
                <Text style={styles.contactButtonText}>TÆ° váº¥n</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Thiáº¿t káº¿ ná»™i tháº¥t",
            headerStyle: { backgroundColor: "#0D9488" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "600" },
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0D9488" />
          <Text style={styles.loadingText}>Äang táº£i...</Text>
        </View>
      </>
    );
  }
  return (
    <>
      <Stack.Screen
        options={{
          title: "Thiáº¿t káº¿ ná»™i tháº¥t",
          headerStyle: { backgroundColor: "#0D9488" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "600" },
        }}
      />
      <View style={styles.container}>
        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="information-circle" size={16} color="#856404" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="TÃ¬m cÃ´ng ty thiáº¿t káº¿ ná»™i tháº¥t..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.featuredButton,
              showFeatured && styles.featuredButtonActive,
            ]}
            onPress={() => setShowFeatured(!showFeatured)}
          >
            <Ionicons
              name={showFeatured ? "star" : "star-outline"}
              size={18}
              color={showFeatured ? "#fff" : "#0D9488"}
            />
            <Text
              style={[
                styles.featuredButtonText,
                showFeatured && styles.featuredButtonTextActive,
              ]}
            >
              Ná»•i báº­t
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter Section - All in one row */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {STYLES.map((style) => (
              <TouchableOpacity
                key={style}
                style={[
                  styles.filterChip,
                  selectedStyle === style && styles.filterChipActive,
                ]}
                onPress={() => setSelectedStyle(style)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedStyle === style && styles.filterChipTextActive,
                  ]}
                >
                  {style}
                </Text>
              </TouchableOpacity>
            ))}

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

        {/* Company List */}
        <FlatList
          data={filteredCompanies}
          renderItem={renderCompanyCard}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={["#0D9488"]}
              tintColor="#0D9488"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                KhÃ´ng tÃ¬m tháº¥y káº¿t quáº£ phÃ¹ há»£p
              </Text>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setSelectedLocation("Táº¥t cáº£");
                  setSelectedStyle("Táº¥t cáº£");
                  setSelectedPriceRange(0);
                  setSearchQuery("");
                  setShowFeatured(false);
                }}
              >
                <Text style={styles.resetButtonText}>Äáº·t láº¡i bá»™ lá»c</Text>
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
    paddingVertical: 10,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#ffc107",
  },
  errorText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#856404",
    flex: 1,
  },
  searchSection: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchBar: {
    flex: 1,
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
  featuredButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#0D9488",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  featuredButtonActive: {
    backgroundColor: "#0D9488",
  },
  featuredButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0D9488",
    marginLeft: 4,
  },
  featuredButtonTextActive: {
    color: "#fff",
  },
  filterSection: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 6,
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
    backgroundColor: "#0D9488",
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
    paddingBottom: 20,
  },
  companyCard: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  featuredBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D9488",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 4,
  },
  verifiedBadge: {
    marginLeft: 4,
  },
  companyImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#f0f0f0",
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
    color: "#0D9488",
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
  styleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  styleTag: {
    backgroundColor: "#f3e5f5",
    borderWidth: 1,
    borderColor: "#0D9488",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  styleText: {
    fontSize: 11,
    color: "#0D9488",
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
    color: "#0D9488",
  },
  priceUnit: {
    fontSize: 12,
    color: "#999",
    marginLeft: 2,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D9488",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  contactButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 4,
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
    backgroundColor: "#0D9488",
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
