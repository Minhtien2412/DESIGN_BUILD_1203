/**
 * Find Contractors Screen - Modern Minimalist Design
 * Features: Animated cards, filter chips, dark mode, haptic feedback
 */

import { useThemeColor } from "@/hooks/use-theme-color";
import ContractorService, {
    Contractor,
    CONTRACTOR_CATEGORIES,
    CONTRACTOR_FILTERS,
    LOCATIONS,
    MOCK_CONTRACTORS,
} from "@/services/contractorService";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Animated Contractor Card
const ContractorCard = ({
  contractor,
  index,
  isDark,
  textColor,
  surfaceColor,
  borderColor,
  primaryColor,
  onSelect,
}: {
  contractor: Contractor;
  index: number;
  isDark: boolean;
  textColor: string;
  surfaceColor: string;
  borderColor: string;
  primaryColor: string;
  onSelect: () => void;
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 1,
      delay: index * 100,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, []);

  const statusConfig =
    contractor.status === "available"
      ? {
          color: "#10b981",
          bg: "#10b981" + "20",
          text: "Đang rảnh",
          icon: "checkmark-circle",
        }
      : {
          color: "#f59e0b",
          bg: "#f59e0b" + "20",
          text: "Hẹn lịch",
          icon: "calendar",
        };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: slideAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.contractorCard,
          { backgroundColor: surfaceColor, borderColor },
        ]}
        activeOpacity={0.8}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onSelect();
        }}
      >
        {/* Image with Gradient Overlay */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: contractor.image }}
            style={styles.contractorImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={styles.imageGradient}
          />
          <View
            style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}
          >
            <Ionicons
              name={statusConfig.icon as any}
              size={12}
              color={statusConfig.color}
            />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.text}
            </Text>
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#fbbf24" />
            <Text style={styles.ratingValue}>{contractor.rating}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <Text
            style={[styles.contractorName, { color: textColor }]}
            numberOfLines={1}
          >
            {contractor.name}
          </Text>

          <Text style={[styles.contractorPrice, { color: primaryColor }]}>
            {contractor.price.toLocaleString("vi-VN")} {contractor.unit}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons
                name="time-outline"
                size={14}
                color={textColor + "60"}
              />
              <Text style={[styles.statText, { color: textColor + "99" }]}>
                {contractor.experience} năm KN
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons
                name="briefcase-outline"
                size={14}
                color={textColor + "60"}
              />
              <Text style={[styles.statText, { color: textColor + "99" }]}>
                {contractor.projects} dự án
              </Text>
            </View>
          </View>

          {/* Select Button */}
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onSelect();
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#6366f1", "#8b5cf6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.selectGradient}
            >
              <Ionicons name="person-add-outline" size={18} color="#fff" />
              <Text style={styles.selectText}>Chọn Thợ Này</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Filter Chip Component
const FilterChip = ({
  label,
  selected,
  onPress,
  isDark,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  isDark: boolean;
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.filterChip,
        selected
          ? styles.filterChipActive
          : { backgroundColor: isDark ? "#374151" : "#f3f4f6" },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.filterChipText,
          { color: selected ? "#fff" : isDark ? "#d1d5db" : "#4b5563" },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// Category Chip Component
const CategoryChip = ({
  label,
  selected,
  onPress,
  isDark,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  isDark: boolean;
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selected && styles.categoryChipActive,
        !selected && { backgroundColor: isDark ? "#374151" : "#f3f4f6" },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      activeOpacity={0.7}
    >
      {selected && (
        <Ionicons
          name="checkmark"
          size={14}
          color="#fff"
          style={{ marginRight: 4 }}
        />
      )}
      <Text
        style={[
          styles.categoryChipText,
          { color: selected ? "#fff" : isDark ? "#d1d5db" : "#374151" },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default function FindContractorsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const primaryColor = useThemeColor({}, "tint");
  const surfaceColor = useThemeColor({}, "surface");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("Tất cả");
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadContractors = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(false);

      const data = await ContractorService.searchContractors({
        category: selectedCategory || undefined,
        location: selectedLocation,
        search: searchQuery || undefined,
        minRating: selectedFilters.includes("4 sao trở lên") ? 4 : undefined,
        minExperience: selectedFilters.includes("Trên 10 Năm kinh nghiệm")
          ? 10
          : selectedFilters.includes("1-5 Năm Kinh Nghiệm")
            ? 1
            : undefined,
      });
      setContractors(data);
    } catch (err) {
      console.error("Contractor load error:", err);
      setError(true);
      setContractors(MOCK_CONTRACTORS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadContractors();
  }, [selectedCategory, selectedLocation, selectedFilters]);

  const onRefresh = () => {
    setRefreshing(true);
    loadContractors(true);
  };

  const handleSearch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    loadContractors();
  };

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const handleSelectContractor = (contractor: Contractor) => {
    alert(`Đã chọn ${contractor.name}`);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={["top"]}
    >
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: surfaceColor }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Tìm Nhà Thầu
        </Text>
        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: surfaceColor }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Ionicons name="options-outline" size={22} color={textColor} />
        </TouchableOpacity>
      </Animated.View>

      {/* Search Bar */}
      <Animated.View
        style={[styles.searchContainer, { opacity: fadeAnim, borderColor }]}
      >
        <View
          style={[
            styles.searchBar,
            { backgroundColor: isDark ? "#374151" : "#f3f4f6" },
          ]}
        >
          <Ionicons name="search" size={20} color={textColor + "60"} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Tìm thợ, chuyên ngành, thành phố..."
            placeholderTextColor={textColor + "50"}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={textColor + "60"}
              />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {loading && !contractors.length ? (
        <View style={styles.loadingContainer}>
          <View
            style={[
              styles.loadingBg,
              { backgroundColor: isDark ? "#374151" : "#f3f4f6" },
            ]}
          >
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
          <Text style={[styles.loadingText, { color: textColor + "60" }]}>
            Đang tìm nhà thầu...
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#6366f1"
            />
          }
        >
          {/* Error Banner */}
          {error && (
            <Animated.View
              style={[
                styles.errorBanner,
                { backgroundColor: isDark ? "#134E4A" : "#CCFBF1" },
                { opacity: fadeAnim },
              ]}
            >
              <Ionicons name="information-circle" size={18} color="#0D9488" />
              <Text style={styles.errorText}>
                Server không khả dụng - Dùng dữ liệu demo
              </Text>
            </Animated.View>
          )}

          {/* Categories */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Chuyên ngành
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipsRow}>
                {CONTRACTOR_CATEGORIES.map((category) => (
                  <CategoryChip
                    key={category}
                    label={category}
                    selected={selectedCategory === category}
                    onPress={() =>
                      setSelectedCategory(
                        selectedCategory === category ? "" : category
                      )
                    }
                    isDark={isDark}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Filters */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Bộ lọc
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipsRow}>
                {CONTRACTOR_FILTERS.map((filter) => (
                  <FilterChip
                    key={filter}
                    label={filter}
                    selected={selectedFilters.includes(filter)}
                    onPress={() => toggleFilter(filter)}
                    isDark={isDark}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Location Tabs */}
          <View style={styles.locationSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.locationTabs}>
                {LOCATIONS.map((location) => {
                  const isSelected = selectedLocation === location;
                  return (
                    <TouchableOpacity
                      key={location}
                      style={[
                        styles.locationTab,
                        isSelected && styles.locationTabActive,
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedLocation(location);
                      }}
                    >
                      <Text
                        style={[
                          styles.locationText,
                          { color: isSelected ? "#6366f1" : textColor + "80" },
                        ]}
                      >
                        {location}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Results Header */}
          <View style={styles.resultsHeader}>
            <Text style={[styles.resultsTitle, { color: textColor }]}>
              Tìm thấy{" "}
              <Text style={{ color: "#6366f1", fontWeight: "700" }}>
                {contractors.length}
              </Text>{" "}
              nhà thầu
            </Text>
          </View>

          {/* Contractors List */}
          <FlatList
            data={contractors}
            renderItem={({ item, index }) => (
              <ContractorCard
                contractor={item}
                index={index}
                isDark={isDark}
                textColor={textColor}
                surfaceColor={surfaceColor}
                borderColor={borderColor}
                primaryColor={primaryColor}
                onSelect={() => handleSelectContractor(item)}
              />
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />

          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  loadingBg: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  errorText: {
    color: "#0D9488",
    fontSize: 13,
    fontWeight: "500",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 16,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  categoryChipActive: {
    backgroundColor: "#6366f1",
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  filterChipActive: {
    backgroundColor: "#6366f1",
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "500",
  },
  locationSection: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  locationTabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 20,
  },
  locationTab: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  locationTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#6366f1",
  },
  locationText: {
    fontSize: 14,
    fontWeight: "500",
  },
  resultsHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  resultsTitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  contractorCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
  },
  contractorImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#e5e7eb",
  },
  imageGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  ratingBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  cardContent: {
    padding: 14,
  },
  contractorName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  contractorPrice: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d1d5db",
    marginHorizontal: 10,
  },
  statText: {
    fontSize: 13,
  },
  selectButton: {
    borderRadius: 10,
    overflow: "hidden",
  },
  selectGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  selectText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  bottomPadding: {
    height: 100,
  },
});
