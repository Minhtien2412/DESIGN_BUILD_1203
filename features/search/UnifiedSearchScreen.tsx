/**
 * Unified Search Screen - Tìm kiếm thống nhất
 * Tìm kiếm: Sản phẩm, Thợ, Công ty, Đối tác, Người dùng
 * @created 2025-01-29
 */

import { Product } from "@/data/products";
import { useThemeColor } from "@/hooks/use-theme-color";
import { CompanyListItem } from "@/services/company.service";
import { useI18n } from "@/services/i18nService";
import {
    LOCATIONS,
    PARTNER_TYPES,
    PRODUCT_CATEGORIES,
    PartnerProfile,
    SearchEntityType,
    SearchFilters,
    USER_ROLES,
    UserProfile,
    WORKER_SPECIALTIES,
    unifiedSearch,
} from "@/services/unifiedSearch.service";
import { Worker } from "@/services/workers.api";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Keyboard,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// ============================================================================
// COLORS
// ============================================================================
const COLORS = {
  primary: "#14B8A6",
  primaryLight: "#FFF0EB",
  secondary: "#4CAF50",
  success: "#00C853",
  warning: "#FF9800",
  text: "#212121",
  textSecondary: "#757575",
  border: "#E0E0E0",
  background: "#F5F5F5",
  white: "#FFFFFF",
  star: "#FFB800",
};

// ============================================================================
// ENTITY TAB CONFIG
// ============================================================================
const ENTITY_TAB_KEYS: {
  id: SearchEntityType | "all";
  labelKey: string;
  icon: string;
}[] = [
  { id: "all", labelKey: "search.all", icon: "apps" },
  { id: "product", labelKey: "search.products", icon: "cube" },
  { id: "worker", labelKey: "search.workers", icon: "construct" },
  { id: "company", labelKey: "search.companies", icon: "business" },
  { id: "partner", labelKey: "search.partners", icon: "people" },
  { id: "user", labelKey: "search.users", icon: "person" },
];

// ============================================================================
// COMPONENT: FilterModal
// ============================================================================
interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  entityType: SearchEntityType | "all";
  filters: SearchFilters;
  onApply: (filters: Partial<SearchFilters>) => void;
}

function FilterModal({
  visible,
  onClose,
  entityType,
  filters,
  onApply,
}: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<Partial<SearchFilters>>({});
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const { t } = useI18n();

  useEffect(() => {
    setLocalFilters({
      location: filters.location,
      category: filters.category,
      minRating: filters.minRating,
      verified: filters.verified,
    });
  }, [filters, visible]);

  const getCategories = () => {
    switch (entityType) {
      case "product":
        return PRODUCT_CATEGORIES;
      case "worker":
        return WORKER_SPECIALTIES;
      case "partner":
        return PARTNER_TYPES;
      case "user":
        return USER_ROLES;
      default:
        return PRODUCT_CATEGORIES;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              {t("search.filterTitle")}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Location Filter */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: textColor }]}>
                {t("search.area")}
              </Text>
              <View style={styles.filterOptions}>
                {LOCATIONS.map((loc) => (
                  <TouchableOpacity
                    key={loc}
                    style={[
                      styles.filterChip,
                      localFilters.location === loc && styles.filterChipActive,
                    ]}
                    onPress={() =>
                      setLocalFilters({
                        ...localFilters,
                        location: loc === "Tất cả" ? undefined : loc,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        localFilters.location === loc &&
                          styles.filterChipTextActive,
                      ]}
                    >
                      {loc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Category Filter */}
            {entityType !== "all" && (
              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: textColor }]}>
                  {t("search.category")}
                </Text>
                <View style={styles.filterOptions}>
                  {getCategories().map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.filterChip,
                        localFilters.category === cat.id &&
                          styles.filterChipActive,
                      ]}
                      onPress={() =>
                        setLocalFilters({
                          ...localFilters,
                          category: cat.id === "all" ? undefined : cat.id,
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          localFilters.category === cat.id &&
                            styles.filterChipTextActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Rating Filter */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: textColor }]}>
                {t("search.minRating")}
              </Text>
              <View style={styles.filterOptions}>
                {[0, 3, 3.5, 4, 4.5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.filterChip,
                      localFilters.minRating === rating &&
                        styles.filterChipActive,
                    ]}
                    onPress={() =>
                      setLocalFilters({
                        ...localFilters,
                        minRating: rating === 0 ? undefined : rating,
                      })
                    }
                  >
                    <Ionicons
                      name="star"
                      size={12}
                      color={
                        localFilters.minRating === rating
                          ? COLORS.white
                          : COLORS.star
                      }
                    />
                    <Text
                      style={[
                        styles.filterChipText,
                        localFilters.minRating === rating &&
                          styles.filterChipTextActive,
                      ]}
                    >
                      {rating === 0 ? t("search.all") : `${rating}+`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Verified Filter */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: textColor }]}>
                {t("search.verified")}
              </Text>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    localFilters.verified === undefined &&
                      styles.filterChipActive,
                  ]}
                  onPress={() =>
                    setLocalFilters({ ...localFilters, verified: undefined })
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      localFilters.verified === undefined &&
                        styles.filterChipTextActive,
                    ]}
                  >
                    {t("search.all")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    localFilters.verified === true && styles.filterChipActive,
                  ]}
                  onPress={() =>
                    setLocalFilters({ ...localFilters, verified: true })
                  }
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color={
                      localFilters.verified === true
                        ? COLORS.white
                        : COLORS.secondary
                    }
                  />
                  <Text
                    style={[
                      styles.filterChipText,
                      localFilters.verified === true &&
                        styles.filterChipTextActive,
                    ]}
                  >
                    {t("search.verifiedYes")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => setLocalFilters({})}
            >
              <Text style={styles.resetBtnText}>{t("search.reset")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => {
                onApply(localFilters);
                onClose();
              }}
            >
              <Text style={styles.applyBtnText}>{t("search.apply")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ============================================================================
// RESULT CARDS
// ============================================================================

function ProductCard({
  item,
  onPress,
}: {
  item: Product;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.productCard} onPress={onPress}>
      <Image
        source={
          typeof item.image === "string" ? { uri: item.image } : item.image
        }
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        <Text style={styles.productPrice}>
          {item.price?.toLocaleString("vi-VN")}₫
        </Text>
        {item.discountPercent && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{item.discountPercent}%</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function WorkerCard({ item, onPress }: { item: Worker; onPress: () => void }) {
  const { t } = useI18n();
  return (
    <TouchableOpacity style={styles.workerCard} onPress={onPress}>
      <Image
        source={{
          uri:
            item.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=FF6B35&color=fff`,
        }}
        style={styles.workerAvatar}
      />
      <View style={styles.workerInfo}>
        <View style={styles.workerHeader}>
          <Text style={styles.workerName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.verified && (
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={COLORS.secondary}
            />
          )}
        </View>
        <Text style={styles.workerSpecialty}>{item.workerType}</Text>
        <View style={styles.workerMeta}>
          <Ionicons name="star" size={14} color={COLORS.star} />
          <Text style={styles.workerRating}>{item.rating}</Text>
          <Text style={styles.workerLocation}> · {item.location}</Text>
        </View>
        <Text style={styles.workerPrice}>
          {item.dailyRate?.toLocaleString("vi-VN")}₫/ngày
        </Text>
      </View>
      {item.availability === "available" && (
        <View style={styles.availableBadge}>
          <Text style={styles.availableText}>{t("search.ready")}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function CompanyCard({
  item,
  onPress,
}: {
  item: CompanyListItem;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.companyCard} onPress={onPress}>
      <Image source={{ uri: item.logo }} style={styles.companyLogo} />
      <View style={styles.companyInfo}>
        <View style={styles.companyHeader}>
          <Text style={styles.companyName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.verified && (
            <Ionicons
              name="shield-checkmark"
              size={16}
              color={COLORS.secondary}
            />
          )}
        </View>
        <View style={styles.companyMeta}>
          <Ionicons name="star" size={14} color={COLORS.star} />
          <Text style={styles.companyRating}>
            {item.rating} ({item.reviewCount} đánh giá)
          </Text>
        </View>
        <Text style={styles.companyLocation}>
          <Ionicons
            name="location-outline"
            size={12}
            color={COLORS.textSecondary}
          />{" "}
          {item.location}
        </Text>
        <View style={styles.specialtiesRow}>
          {item.specialties.slice(0, 2).map((spec, index) => (
            <View key={index} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{spec}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function PartnerCard({
  item,
  onPress,
}: {
  item: PartnerProfile;
  onPress: () => void;
}) {
  const { t } = useI18n();
  const getTypeLabel = (type: string) => {
    const typeKeyMap: Record<string, string> = {
      contractor: "search.contractor",
      supplier: "search.supplier",
      architect: "search.architect",
      designer: "search.designer",
      investor: "search.investor",
    };
    return typeKeyMap[type] ? t(typeKeyMap[type]) : type;
  };

  return (
    <TouchableOpacity style={styles.partnerCard} onPress={onPress}>
      <Image
        source={{
          uri:
            item.logo ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=4CAF50&color=fff`,
        }}
        style={styles.partnerLogo}
      />
      <View style={styles.partnerInfo}>
        <View style={styles.partnerHeader}>
          <Text style={styles.partnerName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.verified && (
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={COLORS.secondary}
            />
          )}
        </View>
        <View style={styles.partnerTypeBadge}>
          <Text style={styles.partnerTypeText}>{getTypeLabel(item.type)}</Text>
        </View>
        <View style={styles.partnerMeta}>
          <Ionicons name="star" size={14} color={COLORS.star} />
          <Text style={styles.partnerRating}>
            {item.rating} ({item.reviewCount})
          </Text>
        </View>
        <Text style={styles.partnerLocation}>
          <Ionicons
            name="location-outline"
            size={12}
            color={COLORS.textSecondary}
          />{" "}
          {item.location}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function UserCard({
  item,
  onPress,
}: {
  item: UserProfile;
  onPress: () => void;
}) {
  const { t } = useI18n();
  const getRoleLabel = (role: string) => {
    const roleKeyMap: Record<string, string> = {
      customer: "search.customer",
      seller: "search.seller",
      contractor: "search.contractor",
      worker: "search.worker",
      admin: "search.admin",
    };
    return roleKeyMap[role] ? t(roleKeyMap[role]) : role;
  };

  return (
    <TouchableOpacity style={styles.userCard} onPress={onPress}>
      <Image
        source={{
          uri:
            item.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=2196F3&color=fff`,
        }}
        style={styles.userAvatar}
      />
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.verified && (
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={COLORS.secondary}
            />
          )}
        </View>
        <View style={styles.userRoleBadge}>
          <Text style={styles.userRoleText}>{getRoleLabel(item.role)}</Text>
        </View>
        {item.location && (
          <Text style={styles.userLocation}>
            <Ionicons
              name="location-outline"
              size={12}
              color={COLORS.textSecondary}
            />{" "}
            {item.location}
          </Text>
        )}
        {item.rating !== undefined && (
          <View style={styles.userMeta}>
            <Ionicons name="star" size={14} color={COLORS.star} />
            <Text style={styles.userRating}>
              {item.rating} ({item.reviewCount || 0})
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function UnifiedSearchScreen() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const { t } = useI18n();
  const params = useLocalSearchParams<{ q?: string; type?: string }>();

  // State
  const [query, setQuery] = useState(params.q || "");
  const [activeTab, setActiveTab] = useState<SearchEntityType | "all">(
    (params.type as SearchEntityType) || "all",
  );
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    entityType: "all",
    query: "",
    page: 1,
    limit: 20,
  });

  // Results
  const [products, setProducts] = useState<Product[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [partners, setPartners] = useState<PartnerProfile[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [totalCounts, setTotalCounts] = useState({
    products: 0,
    workers: 0,
    companies: 0,
    partners: 0,
    users: 0,
  });

  // Search handler
  const performSearch = useCallback(
    async (searchFilters: SearchFilters, refresh = false) => {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const results = await unifiedSearch(searchFilters);

        setProducts(results.products.data);
        setWorkers(results.workers.data);
        setCompanies(results.companies.data);
        setPartners(results.partners.data);
        setUsers(results.users.data);
        setTotalCounts({
          products: results.products.total,
          workers: results.workers.total,
          companies: results.companies.total,
          partners: results.partners.total,
          users: results.users.total,
        });
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [],
  );

  // Initial load
  useEffect(() => {
    performSearch(filters);
  }, []);

  // Search on query change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const newFilters = { ...filters, query, entityType: activeTab };
      setFilters(newFilters);
      performSearch(newFilters);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, activeTab]);

  // Apply filters
  const handleApplyFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    performSearch(updatedFilters);
  };

  // Refresh
  const handleRefresh = () => {
    performSearch(filters, true);
  };

  // Navigation handlers
  const handleProductPress = (product: Product) => {
    router.push(`/product/${product.id}` as any);
  };

  const handleWorkerPress = (worker: Worker) => {
    router.push(`/workers/${worker.id}` as any);
  };

  const handleCompanyPress = (company: CompanyListItem) => {
    router.push(`/services/company-detail?id=${company.id}` as any);
  };

  const handlePartnerPress = (partner: PartnerProfile) => {
    router.push(`/contractor/${partner.id}` as any);
  };

  const handleUserPress = (user: UserProfile) => {
    router.push(`/profile/${user.id}` as any);
  };

  // Render tab badge
  const renderTabBadge = (count: number) => {
    if (count === 0) return null;
    return (
      <View style={styles.tabBadge}>
        <Text style={styles.tabBadgeText}>{count > 99 ? "99+" : count}</Text>
      </View>
    );
  };

  // Get count for tab
  const getTabCount = (tabId: SearchEntityType | "all") => {
    switch (tabId) {
      case "product":
        return totalCounts.products;
      case "worker":
        return totalCounts.workers;
      case "company":
        return totalCounts.companies;
      case "partner":
        return totalCounts.partners;
      case "user":
        return totalCounts.users;
      case "all":
        return (
          totalCounts.products +
          totalCounts.workers +
          totalCounts.companies +
          totalCounts.partners +
          totalCounts.users
        );
      default:
        return 0;
    }
  };

  // Render unified list
  const renderResults = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t("search.searching")}</Text>
        </View>
      );
    }

    const totalResults = getTabCount(activeTab);

    if (totalResults === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color={COLORS.border} />
          <Text style={[styles.emptyText, { color: textColor }]}>
            {t("search.noResults")}
          </Text>
          <Text style={styles.emptySubtext}>{t("search.noResultsHint")}</Text>
        </View>
      );
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
        contentContainerStyle={styles.resultsContainer}
      >
        {/* Products Section */}
        {(activeTab === "all" || activeTab === "product") &&
          products.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>
                  <Ionicons name="cube" size={18} color={COLORS.primary} />{" "}
                  {t("search.products")}
                </Text>
                <Text style={styles.sectionCount}>
                  {totalCounts.products} {t("search.results")}
                </Text>
              </View>
              <FlatList
                horizontal
                data={products}
                renderItem={({ item }) => (
                  <ProductCard
                    item={item}
                    onPress={() => handleProductPress(item)}
                  />
                )}
                keyExtractor={(item) => `product-${item.id}`}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}

        {/* Workers Section */}
        {(activeTab === "all" || activeTab === "worker") &&
          workers.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>
                  <Ionicons name="construct" size={18} color={COLORS.primary} />{" "}
                  {t("search.workers")}
                </Text>
                <Text style={styles.sectionCount}>
                  {totalCounts.workers} {t("search.results")}
                </Text>
              </View>
              {workers.map((item) => (
                <WorkerCard
                  key={`worker-${item.id}`}
                  item={item}
                  onPress={() => handleWorkerPress(item)}
                />
              ))}
            </View>
          )}

        {/* Companies Section */}
        {(activeTab === "all" || activeTab === "company") &&
          companies.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>
                  <Ionicons name="business" size={18} color={COLORS.primary} />{" "}
                  {t("search.companies")}
                </Text>
                <Text style={styles.sectionCount}>
                  {totalCounts.companies} {t("search.results")}
                </Text>
              </View>
              {companies.map((item) => (
                <CompanyCard
                  key={`company-${item.id}`}
                  item={item}
                  onPress={() => handleCompanyPress(item)}
                />
              ))}
            </View>
          )}

        {/* Partners Section */}
        {(activeTab === "all" || activeTab === "partner") &&
          partners.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>
                  <Ionicons name="people" size={18} color={COLORS.primary} />{" "}
                  {t("search.partners")}
                </Text>
                <Text style={styles.sectionCount}>
                  {totalCounts.partners} {t("search.results")}
                </Text>
              </View>
              {partners.map((item) => (
                <PartnerCard
                  key={`partner-${item.id}`}
                  item={item}
                  onPress={() => handlePartnerPress(item)}
                />
              ))}
            </View>
          )}

        {/* Users Section */}
        {(activeTab === "all" || activeTab === "user") && users.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                <Ionicons name="person" size={18} color={COLORS.primary} />{" "}
                {t("search.users")}
              </Text>
              <Text style={styles.sectionCount}>
                {totalCounts.users} {t("search.results")}
              </Text>
            </View>
            {users.map((item) => (
              <UserCard
                key={`user-${item.id}`}
                item={item}
                onPress={() => handleUserPress(item)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, "#FF8F5A"]}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("search.unifiedSearch")}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: COLORS.white }]}>
            <Ionicons name="search" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder={t("search.placeholder")}
              placeholderTextColor={COLORS.textSecondary}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              onSubmitEditing={Keyboard.dismiss}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="options" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Entity Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.tabsContainer, { backgroundColor: cardBg }]}
        contentContainerStyle={styles.tabsContent}
      >
        {ENTITY_TAB_KEYS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={tab.icon as any}
              size={18}
              color={
                activeTab === tab.id ? COLORS.primary : COLORS.textSecondary
              }
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.tabTextActive,
              ]}
            >
              {t(tab.labelKey)}
            </Text>
            {renderTabBadge(getTabCount(tab.id))}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results */}
      {renderResults()}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        entityType={activeTab}
        filters={filters}
        onApply={handleApplyFilters}
      />
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Tabs
  tabsContainer: {
    maxHeight: 60,
  },
  tabsContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginRight: 8,
    gap: 6,
  },
  tabActive: {
    backgroundColor: COLORS.primaryLight,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  tabBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.white,
  },

  // Results
  resultsContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // Sections
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  sectionCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  horizontalList: {
    paddingRight: 16,
  },

  // Product Card
  productCard: {
    width: 160,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: 120,
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.white,
  },

  // Worker Card
  workerCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  workerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  workerInfo: {
    flex: 1,
  },
  workerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  workerName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
  },
  workerSpecialty: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  workerMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  workerRating: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 4,
  },
  workerLocation: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  workerPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
    marginTop: 4,
  },
  availableBadge: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  availableText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.secondary,
  },

  // Company Card
  companyCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  companyLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  companyInfo: {
    flex: 1,
  },
  companyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  companyName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
  },
  companyMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  companyRating: {
    fontSize: 12,
    color: COLORS.text,
    marginLeft: 4,
  },
  companyLocation: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  specialtiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
    gap: 6,
  },
  specialtyTag: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  specialtyText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: "500",
  },

  // Partner Card
  partnerCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  partnerLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  partnerName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
  },
  partnerTypeBadge: {
    backgroundColor: "#E3F2FD",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  partnerTypeText: {
    fontSize: 11,
    color: "#1976D2",
    fontWeight: "500",
  },
  partnerMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  partnerRating: {
    fontSize: 12,
    color: COLORS.text,
    marginLeft: 4,
  },
  partnerLocation: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // User Card
  userCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
  },
  userRoleBadge: {
    backgroundColor: "#FFF3E0",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  userRoleText: {
    fontSize: 11,
    color: COLORS.warning,
    fontWeight: "500",
  },
  userLocation: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  userMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  userRating: {
    fontSize: 12,
    color: COLORS.text,
    marginLeft: 4,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: "center",
  },
  resetBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  applyBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.white,
  },
});
