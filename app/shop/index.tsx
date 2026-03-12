/**
 * Shop Screen - Shopee-style construction marketplace
 * Full API integration with real backend + mock fallback
 * Features: Search, categories, flash sale, featured, all products, pagination
 */
import { useCart } from "@/context/cart-context";
import type { Product } from "@/data/products";
import { PRODUCTS } from "@/data/products";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
    getFeaturedProducts,
    getFlashSaleProducts,
    getProducts,
    searchProducts,
    type ProductQueryParams,
} from "@/services/api/products.service";
import { useI18n } from "@/services/i18nService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");
const PRODUCT_CARD_WIDTH = (width - 48) / 2;

// ============================================================================
// Categories - Construction industry focused
// ============================================================================
const CATEGORY_KEYS = [
  {
    id: "materials",
    nameKey: "shop.buildingMaterials",
    icon: "cube-outline" as const,
    color: "#0D9488",
  },
  {
    id: "interior",
    nameKey: "shop.furniture",
    icon: "bed-outline" as const,
    color: "#F59E0B",
  },
  {
    id: "sanitary",
    nameKey: "shop.bathroom",
    icon: "water-outline" as const,
    color: "#3B82F6",
  },
  {
    id: "lighting",
    nameKey: "shop.lighting",
    icon: "bulb-outline" as const,
    color: "#8B5CF6",
  },
  {
    id: "furniture",
    nameKey: "shop.homeFurniture",
    icon: "color-palette-outline" as const,
    color: "#EC4899",
  },
  {
    id: "construction",
    nameKey: "shop.construction",
    icon: "construct-outline" as const,
    color: "#EF4444",
  },
  {
    id: "consultation",
    nameKey: "shop.designConsult",
    icon: "document-text-outline" as const,
    color: "#06B6D4",
  },
  {
    id: "villa",
    nameKey: "shop.villa",
    icon: "home-outline" as const,
    color: "#10B981",
  },
  {
    id: "architecture",
    nameKey: "shop.architecture",
    icon: "business-outline" as const,
    color: "#F97316",
  },
  {
    id: "more",
    nameKey: "shop.seeMore",
    icon: "ellipsis-horizontal-outline" as const,
    color: "#6B7280",
  },
];

// Quick action shortcuts
const QUICK_ACTION_KEYS = [
  {
    id: "flash",
    labelKey: "Flash Sale",
    icon: "flash" as const,
    bgColor: "#FEE2E2",
    iconColor: "#EF4444",
    route: "/shopping/flash-sale",
  },
  {
    id: "voucher",
    labelKey: "Voucher",
    icon: "ticket-outline" as const,
    bgColor: "#DBEAFE",
    iconColor: "#3B82F6",
    route: "/shopping/new-customer-offer",
  },
  {
    id: "new",
    labelKey: "shop.newArrivals",
    icon: "sparkles-outline" as const,
    bgColor: "#D1FAE5",
    iconColor: "#10B981",
    route: "/shopping/products-catalog",
  },
  {
    id: "brand",
    labelKey: "Thương hiệu",
    icon: "ribbon-outline" as const,
    bgColor: "#FEF3C7",
    iconColor: "#F59E0B",
    route: "/shopping/products-catalog",
  },
];

// Promo banners
const BANNER_KEYS = [
  {
    id: "1",
    image:
      "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=600",
    titleKey: "shop.discount50",
    subtitleKey: "shop.genuineMaterials",
    gradient: ["#0D9488", "#14B8A6"] as const,
  },
  {
    id: "2",
    image:
      "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600",
    titleKey: "shop.freeShipAll",
    subtitleKey: "shop.freeShipNationwide",
    gradient: ["#7C3AED", "#A78BFA"] as const,
  },
  {
    id: "3",
    image:
      "https://images.pexels.com/photos/3935333/pexels-photo-3935333.jpeg?auto=compress&cs=tinysrgb&w=600",
    titleKey: "shop.comboSave",
    subtitleKey: "shop.comboDesc",
    gradient: ["#EA580C", "#FB923C"] as const,
  },
];

// Sort options
const SORT_OPTION_KEYS: {
  labelKey: string;
  value: ProductQueryParams["sortBy"];
  order: "asc" | "desc";
}[] = [
  { labelKey: "shop.popular", value: "popular", order: "desc" },
  { labelKey: "shop.newest", value: "newest", order: "desc" },
  { labelKey: "shop.bestSeller", value: "popular", order: "desc" },
  { labelKey: "shop.priceAsc", value: "price", order: "asc" },
  { labelKey: "shop.priceDesc", value: "price", order: "desc" },
];

// ============================================================================
// Countdown Timer Component
// ============================================================================
function FlashSaleTimer() {
  const [timeLeft, setTimeLeft] = useState({ h: 2, m: 30, s: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { h, m, s } = prev;
        if (s > 0) {
          s--;
        } else if (m > 0) {
          m--;
          s = 59;
        } else if (h > 0) {
          h--;
          m = 59;
          s = 59;
        }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <View style={styles.timerRow}>
      <View style={styles.timerBox}>
        <Text style={styles.timerDigit}>{pad(timeLeft.h)}</Text>
      </View>
      <Text style={styles.timerColon}>:</Text>
      <View style={styles.timerBox}>
        <Text style={styles.timerDigit}>{pad(timeLeft.m)}</Text>
      </View>
      <Text style={styles.timerColon}>:</Text>
      <View style={styles.timerBox}>
        <Text style={styles.timerDigit}>{pad(timeLeft.s)}</Text>
      </View>
    </View>
  );
}

// ============================================================================
// Product Card Component
// ============================================================================
function ProductCard({
  product,
  onPress,
  cardBg,
  textColor,
}: {
  product: Product;
  onPress: () => void;
  cardBg: string;
  textColor: string;
}) {
  const { t } = useI18n();
  const imageUri =
    typeof product.image === "string"
      ? product.image
      : product.image?.uri || "https://via.placeholder.com/200";

  const discount = product.discountPercent
    ? product.discountPercent
    : product.flashSale
      ? 30
      : 0;

  const originalPrice =
    discount > 0 ? Math.round(product.price / (1 - discount / 100)) : 0;

  return (
    <TouchableOpacity
      style={[styles.productCard, { backgroundColor: cardBg }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Image */}
      <View style={styles.productImageWrap}>
        <Image
          source={{ uri: imageUri }}
          style={styles.productImage}
          resizeMode="cover"
        />
        {product.flashSale && (
          <View style={styles.flashBadge}>
            <Ionicons name="flash" size={10} color="#fff" />
            <Text style={styles.flashBadgeText}>-{discount}%</Text>
          </View>
        )}
        {product.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>MỚI</Text>
          </View>
        )}
        {product.isBestseller && (
          <View style={styles.bestsellerBadge}>
            <Text style={styles.bestsellerBadgeText}>BÁN CHẠY</Text>
          </View>
        )}
        {product.freeShipping && (
          <View style={styles.freeShipBadge}>
            <Ionicons name="car-outline" size={10} color="#0D9488" />
            <Text style={styles.freeShipText}>Freeship</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.productContent}>
        <Text
          style={[styles.productName, { color: textColor }]}
          numberOfLines={2}
        >
          {product.name}
        </Text>

        {/* Price Row */}
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>
            {product.price.toLocaleString("vi-VN")}đ
          </Text>
          {originalPrice > 0 && (
            <Text style={styles.originalPrice}>
              {originalPrice.toLocaleString("vi-VN")}đ
            </Text>
          )}
        </View>

        {/* Rating + Sold */}
        <View style={styles.productFooter}>
          {(product.rating ?? 0) > 0 && (
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={10} color="#FFB800" />
              <Text style={styles.ratingText}>
                {product.rating?.toFixed(1)}
              </Text>
            </View>
          )}
          <Text style={styles.soldText}>
            {t("shop.sold").replace(
              "{count}",
              String(product.sold ?? product.soldCount ?? 0),
            )}
          </Text>
        </View>

        {/* Seller */}
        {product.seller?.name && (
          <Text style={styles.sellerName} numberOfLines={1}>
            {product.seller.verified && "✓ "}
            {product.seller.name}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ============================================================================
// Main Shop Screen
// ============================================================================
export default function ShopScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const subtextColor = useThemeColor(
    { light: "#6B7280", dark: "#9CA3AF" },
    "text",
  );
  const router = useRouter();
  const { totalItems } = useCart();
  const { t } = useI18n();

  // URL params
  const { category: paramCategory, type: paramType } = useLocalSearchParams<{
    category?: string;
    type?: string;
  }>();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState(0);

  // Data states
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  // Loading states
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingFlash, setLoadingFlash] = useState(true);
  const [loadingAll, setLoadingAll] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;

  // Banner auto scroll
  const bannerRef = useRef<ScrollView>(null);
  const [activeBanner, setActiveBanner] = useState(0);
  const bannerScrollX = useRef(new Animated.Value(0)).current;

  // Apply URL params
  useEffect(() => {
    if (paramCategory) {
      setSelectedCategory(paramCategory);
    }
    if (paramType) {
      setSearchQuery(paramType);
    }
  }, [paramCategory, paramType]);

  // ========== DATA FETCHING ==========

  const fetchFeatured = useCallback(async () => {
    setLoadingFeatured(true);
    try {
      const products = await getFeaturedProducts(8);
      setFeaturedProducts(
        products.length > 0
          ? products
          : PRODUCTS.filter((p) => (p.rating ?? 0) >= 4.5).slice(0, 8),
      );
    } catch {
      setFeaturedProducts(
        PRODUCTS.filter((p) => (p.rating ?? 0) >= 4.5).slice(0, 8),
      );
    } finally {
      setLoadingFeatured(false);
    }
  }, []);

  const fetchFlashSale = useCallback(async () => {
    setLoadingFlash(true);
    try {
      const products = await getFlashSaleProducts(10);
      setFlashSaleProducts(
        products.length > 0
          ? products
          : PRODUCTS.filter((p) => p.flashSale).slice(0, 10),
      );
    } catch {
      setFlashSaleProducts(PRODUCTS.filter((p) => p.flashSale).slice(0, 10));
    } finally {
      setLoadingFlash(false);
    }
  }, []);

  const fetchAllProducts = useCallback(
    async (page = 1, append = false) => {
      if (page === 1) setLoadingAll(true);
      else setLoadingMore(true);

      try {
        const sort = SORT_OPTION_KEYS[selectedSort];
        const params: ProductQueryParams = {
          page,
          limit: PAGE_SIZE,
          sortBy: sort.value,
          sortOrder: sort.order,
        };
        if (selectedCategory && selectedCategory !== "more") {
          params.category = selectedCategory;
        }

        const response = await getProducts(params);
        const products = response.products;

        if (products.length > 0) {
          setAllProducts((prev) =>
            append ? [...prev, ...products] : products,
          );
          setHasMore(response.hasMore);
          setCurrentPage(page);
        } else if (!append) {
          // Fallback to local data
          const local = PRODUCTS.filter((p) =>
            selectedCategory && selectedCategory !== "more"
              ? p.category === selectedCategory
              : true,
          ).slice(0, PAGE_SIZE);
          setAllProducts(local);
          setHasMore(false);
        }
      } catch {
        if (!append) {
          const local = PRODUCTS.filter((p) =>
            selectedCategory && selectedCategory !== "more"
              ? p.category === selectedCategory
              : true,
          ).slice(0, PAGE_SIZE);
          setAllProducts(local);
          setHasMore(false);
        }
      } finally {
        setLoadingAll(false);
        setLoadingMore(false);
      }
    },
    [selectedCategory, selectedSort],
  );

  // Initial load
  useEffect(() => {
    fetchFeatured();
    fetchFlashSale();
  }, [fetchFeatured, fetchFlashSale]);

  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchAllProducts(1, false);
  }, [fetchAllProducts]);

  // Search
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchActive(false);
      setSearchResults([]);
      return;
    }
    setSearchActive(true);
    setSearchLoading(true);
    try {
      const response = await searchProducts(searchQuery.trim(), { limit: 30 });
      setSearchResults(response.products);
    } catch {
      const local = PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      ).slice(0, 30);
      setSearchResults(local);
    } finally {
      setSearchLoading(false);
    }
  }, [searchQuery]);

  // Pull to refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchFeatured(),
      fetchFlashSale(),
      fetchAllProducts(1, false),
    ]);
    setRefreshing(false);
  }, [fetchFeatured, fetchFlashSale, fetchAllProducts]);

  // Load more
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !searchActive) {
      fetchAllProducts(currentPage + 1, true);
    }
  }, [loadingMore, hasMore, currentPage, searchActive, fetchAllProducts]);

  // Banner auto-scroll
  useEffect(() => {
    const timer = setInterval(() => {
      const next = (activeBanner + 1) % BANNER_KEYS.length;
      bannerRef.current?.scrollTo({ x: next * (width - 32), animated: true });
      setActiveBanner(next);
    }, 4000);
    return () => clearInterval(timer);
  }, [activeBanner]);

  const handleBannerScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
    setActiveBanner(index);
  };

  // Navigation
  const openProduct = useCallback(
    (product: Product) => {
      router.push(`/product/${product.id}` as any);
    },
    [router],
  );

  const openCategory = useCallback(
    (catId: string) => {
      if (catId === "more") {
        router.push("/shopping" as any);
        return;
      }
      if (selectedCategory === catId) {
        setSelectedCategory(null);
      } else {
        setSelectedCategory(catId);
      }
    },
    [router, selectedCategory],
  );

  // ========== RENDER HELPERS ==========

  const renderProductCard = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard
        product={item}
        onPress={() => openProduct(item)}
        cardBg={cardBg}
        textColor={textColor}
      />
    ),
    [cardBg, textColor, openProduct],
  );

  const displayProducts = searchActive ? searchResults : allProducts;

  // ========== HEADER (search + cart) ==========

  const renderHeader = () => (
    <>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <LinearGradient
          colors={["#0D9488", "#14B8A6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder={t("shop.searchPlaceholder")}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setSearchActive(false);
                setSearchResults([]);
              }}
            >
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => router.push("/cart" as any)}
        >
          <Ionicons name="cart-outline" size={24} color="#fff" />
          {totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {totalItems > 99 ? "99+" : totalItems}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.chatBtn}
          onPress={() => router.push("/messages" as any)}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Show search results header */}
      {searchActive && (
        <View style={[styles.searchResultHeader, { backgroundColor: cardBg }]}>
          <Text style={[styles.searchResultText, { color: textColor }]}>
            {searchLoading
              ? t("shop.searching")
              : t("shop.searchResults")
                  .replace("{count}", String(searchResults.length))
                  .replace("{query}", searchQuery)}
          </Text>
        </View>
      )}

      {/* Normal content when not searching */}
      {!searchActive && (
        <>
          {/* Banners */}
          <View style={styles.bannerSection}>
            <ScrollView
              ref={bannerRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleBannerScroll}
              style={styles.bannerScroll}
            >
              {BANNER_KEYS.map((banner) => (
                <TouchableOpacity
                  key={banner.id}
                  style={styles.bannerItem}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{ uri: banner.image }}
                    style={styles.bannerImage}
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.7)"]}
                    style={styles.bannerOverlay}
                  >
                    <Text style={styles.bannerTitle}>{t(banner.titleKey)}</Text>
                    <Text style={styles.bannerSubtitle}>
                      {t(banner.subtitleKey)}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {/* Dots */}
            <View style={styles.dotsRow}>
              {BANNER_KEYS.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, activeBanner === i && styles.dotActive]}
                />
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={[styles.quickActionsRow, { backgroundColor: cardBg }]}>
            {QUICK_ACTION_KEYS.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickAction}
                onPress={() => router.push(action.route as any)}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: action.bgColor },
                  ]}
                >
                  <Ionicons
                    name={action.icon as any}
                    size={20}
                    color={action.iconColor}
                  />
                </View>
                <Text style={[styles.quickActionText, { color: subtextColor }]}>
                  {t(action.labelKey) || action.labelKey}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Categories */}
          <View style={[styles.section, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              {t("shop.categories")}
            </Text>
            <View style={styles.categoriesGrid}>
              {CATEGORY_KEYS.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.categoryItem}
                    onPress={() => openCategory(cat.id)}
                  >
                    <View
                      style={[
                        styles.categoryIcon,
                        {
                          backgroundColor: isActive
                            ? cat.color
                            : `${cat.color}15`,
                        },
                      ]}
                    >
                      <Ionicons
                        name={cat.icon}
                        size={22}
                        color={isActive ? "#fff" : cat.color}
                      />
                    </View>
                    <Text
                      style={[
                        styles.categoryName,
                        { color: isActive ? cat.color : textColor },
                        isActive && styles.categoryNameActive,
                      ]}
                      numberOfLines={1}
                    >
                      {t(cat.nameKey)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Flash Sale */}
          <View style={styles.flashSaleSection}>
            <LinearGradient
              colors={["#EF4444", "#F97316"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.flashSaleHeader}
            >
              <View style={styles.flashSaleTitleRow}>
                <Ionicons name="flash" size={18} color="#FFE700" />
                <Text style={styles.flashSaleTitle}>FLASH SALE</Text>
                <FlashSaleTimer />
              </View>
              <TouchableOpacity
                onPress={() => router.push("/shopping/flash-sale" as any)}
              >
                <Text style={styles.flashSaleMore}>{t("shop.viewAll")}</Text>
              </TouchableOpacity>
            </LinearGradient>

            {loadingFlash ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#EF4444" />
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.flashSaleList}
              >
                {flashSaleProducts.map((product) => {
                  const imageUri =
                    typeof product.image === "string"
                      ? product.image
                      : product.image?.uri || "https://via.placeholder.com/120";
                  const discount = product.discountPercent ?? 30;
                  return (
                    <TouchableOpacity
                      key={product.id}
                      style={[styles.flashCard, { backgroundColor: cardBg }]}
                      onPress={() => openProduct(product)}
                    >
                      <Image
                        source={{ uri: imageUri }}
                        style={styles.flashImage}
                      />
                      <View style={styles.flashDiscount}>
                        <Text style={styles.flashDiscountText}>
                          -{discount}%
                        </Text>
                      </View>
                      <Text style={styles.flashPrice}>
                        {product.price.toLocaleString("vi-VN")}đ
                      </Text>
                      <View style={styles.flashSoldBar}>
                        <View
                          style={[
                            styles.flashSoldFill,
                            {
                              width: `${Math.min(((product.sold ?? 0) / ((product.stock ?? 100) + (product.sold ?? 0))) * 100, 100)}%`,
                            },
                          ]}
                        />
                        <Text style={styles.flashSoldText}>
                          {t("shop.sold").replace(
                            "{count}",
                            String(product.sold ?? product.soldCount ?? 0),
                          )}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* Featured */}
          <View style={[styles.section, { backgroundColor: cardBg }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                🔥 {t("shop.featuredProducts")}
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/shopping/products-catalog" as any)}
              >
                <Text style={styles.viewAllText}>{t("shop.viewAll")}</Text>
              </TouchableOpacity>
            </View>

            {loadingFeatured ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#0D9488" />
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredList}
              >
                {featuredProducts.map((product) => {
                  const imageUri =
                    typeof product.image === "string"
                      ? product.image
                      : product.image?.uri || "https://via.placeholder.com/160";
                  return (
                    <TouchableOpacity
                      key={product.id}
                      style={[styles.featuredCard, { backgroundColor }]}
                      onPress={() => openProduct(product)}
                    >
                      <Image
                        source={{ uri: imageUri }}
                        style={styles.featuredImage}
                      />
                      <Text
                        style={[styles.featuredName, { color: textColor }]}
                        numberOfLines={2}
                      >
                        {product.name}
                      </Text>
                      <Text style={styles.featuredPrice}>
                        {product.price.toLocaleString("vi-VN")}đ
                      </Text>
                      <View style={styles.featuredMeta}>
                        <Ionicons name="star" size={10} color="#FFB800" />
                        <Text style={styles.featuredRating}>
                          {product.rating?.toFixed(1) ?? "5.0"}
                        </Text>
                        <Text style={styles.featuredSold}>
                          |{" "}
                          {t("shop.sold").replace(
                            "{count}",
                            String(product.sold ?? product.soldCount ?? 0),
                          )}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* Sort bar */}
          <View style={[styles.sortBar, { backgroundColor: cardBg }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {SORT_OPTION_KEYS.map((opt, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.sortChip,
                    selectedSort === i && styles.sortChipActive,
                  ]}
                  onPress={() => setSelectedSort(i)}
                >
                  <Text
                    style={[
                      styles.sortChipText,
                      selectedSort === i && styles.sortChipTextActive,
                    ]}
                  >
                    {t(opt.labelKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Active filter pill */}
          {selectedCategory && selectedCategory !== "more" && (
            <View style={styles.filterPill}>
              <Text style={styles.filterPillText}>
                {CATEGORY_KEYS.find((c) => c.id === selectedCategory)?.nameKey
                  ? t(
                      CATEGORY_KEYS.find((c) => c.id === selectedCategory)!
                        .nameKey,
                    )
                  : selectedCategory}
              </Text>
              <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                <Ionicons name="close-circle" size={16} color="#0D9488" />
              </TouchableOpacity>
            </View>
          )}

          {/* "Gợi ý hôm nay" title */}
          <View style={styles.suggestHeader}>
            <View style={styles.suggestLine} />
            <Text style={[styles.suggestTitle, { color: textColor }]}>
              {t("shop.suggestToday")}
            </Text>
            <View style={styles.suggestLine} />
          </View>
        </>
      )}
    </>
  );

  // ========== FOOTER ==========
  const renderFooter = () => {
    if (searchActive && searchLoading) {
      return (
        <View style={styles.footerLoading}>
          <ActivityIndicator size="small" color="#0D9488" />
        </View>
      );
    }
    if (loadingAll && !loadingMore) {
      return (
        <View style={styles.footerLoading}>
          <ActivityIndicator size="small" color="#0D9488" />
          <Text style={styles.footerText}>{t("shop.loadingProducts")}</Text>
        </View>
      );
    }
    if (loadingMore) {
      return (
        <View style={styles.footerLoading}>
          <ActivityIndicator size="small" color="#0D9488" />
        </View>
      );
    }
    if (!hasMore && displayProducts.length > 0) {
      return (
        <View style={styles.footerEnd}>
          <View style={styles.footerEndLine} />
          <Text style={styles.footerEndText}>{t("shop.noMoreProducts")}</Text>
          <View style={styles.footerEndLine} />
        </View>
      );
    }
    if (displayProducts.length === 0 && !loadingAll) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color="#ccc" />
          <Text style={styles.emptyTitle}>{t("shop.noProductsFound")}</Text>
          <Text style={styles.emptySubtitle}>
            {searchActive
              ? t("shop.tryOtherKeywords")
              : t("shop.noCategoryProducts")}
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => {
              setSelectedCategory(null);
              setSearchActive(false);
              setSearchQuery("");
            }}
          >
            <Text style={styles.emptyBtnText}>{t("shop.viewAllProducts")}</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  // ========== MAIN RENDER ==========
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: t("shop.store"), headerShown: false }} />

      <FlatList
        data={displayProducts}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.productsRow}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#0D9488"]}
            tintColor="#0D9488"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews={Platform.OS !== "web"}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================
const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: 24 },

  // Search header
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: 12,
    overflow: "hidden",
  },
  backBtn: { padding: 6, marginRight: 4 },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    borderRadius: 20,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#333", paddingVertical: 0 },
  cartBtn: { marginLeft: 10, position: "relative", padding: 4 },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -6,
    backgroundColor: "#EF4444",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  chatBtn: { marginLeft: 8, padding: 4 },

  // Search result header
  searchResultHeader: { paddingHorizontal: 16, paddingVertical: 12 },
  searchResultText: { fontSize: 14 },

  // Banners
  bannerSection: { marginTop: 8, marginBottom: 4 },
  bannerScroll: {},
  bannerItem: {
    width: width - 32,
    height: 140,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  bannerImage: { width: "100%", height: "100%", backgroundColor: "#e5e7eb" },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: 14,
  },
  bannerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  bannerSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginTop: 2,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D1D5DB",
  },
  dotActive: { backgroundColor: "#0D9488", width: 18 },

  // Quick actions
  quickActionsRow: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
  },
  quickAction: { flex: 1, alignItems: "center" },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  quickActionText: { fontSize: 11, textAlign: "center" },

  // Section
  section: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  viewAllText: { color: "#0D9488", fontSize: 13, fontWeight: "500" },

  // Categories
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  categoryItem: {
    width: "20%",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  categoryName: { fontSize: 10, textAlign: "center" },
  categoryNameActive: { fontWeight: "700" },

  // Flash Sale
  flashSaleSection: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  flashSaleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  flashSaleTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  flashSaleTitle: { color: "#fff", fontWeight: "800", fontSize: 15 },
  flashSaleMore: { color: "#fff", fontSize: 13 },
  flashSaleList: { paddingHorizontal: 8, paddingVertical: 10, gap: 8 },
  flashCard: {
    width: 110,
    borderRadius: 8,
    overflow: "hidden",
  },
  flashImage: { width: 110, height: 110, backgroundColor: "#E5E7EB" },
  flashDiscount: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#EF4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderBottomLeftRadius: 8,
  },
  flashDiscountText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  flashPrice: {
    color: "#EF4444",
    fontWeight: "bold",
    fontSize: 13,
    paddingHorizontal: 6,
    paddingTop: 6,
  },
  flashSoldBar: {
    height: 16,
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    marginHorizontal: 6,
    marginVertical: 6,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  flashSoldFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#EF4444",
    borderRadius: 8,
  },
  flashSoldText: { color: "#fff", fontSize: 9, fontWeight: "bold", zIndex: 1 },

  // Timer
  timerRow: { flexDirection: "row", alignItems: "center" },
  timerBox: {
    backgroundColor: "#111",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timerDigit: { color: "#fff", fontSize: 13, fontWeight: "bold" },
  timerColon: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
    marginHorizontal: 2,
  },

  // Featured
  featuredList: { paddingRight: 8, gap: 10 },
  featuredCard: { width: 140, borderRadius: 10, overflow: "hidden" },
  featuredImage: { width: 140, height: 140, backgroundColor: "#E5E7EB" },
  featuredName: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingTop: 8,
    height: 36,
  },
  featuredPrice: {
    color: "#0D9488",
    fontWeight: "bold",
    fontSize: 14,
    paddingHorizontal: 8,
  },
  featuredMeta: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 8,
    gap: 2,
  },
  featuredRating: { fontSize: 10, color: "#666" },
  featuredSold: { fontSize: 10, color: "#999", marginLeft: 2 },

  // Sort bar
  sortBar: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
    backgroundColor: "transparent",
  },
  sortChipActive: { backgroundColor: "#0D9488" },
  sortChipText: { fontSize: 13, color: "#666" },
  sortChipTextActive: { color: "#fff", fontWeight: "600" },

  // Filter pill
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginLeft: 16,
    marginTop: 8,
    backgroundColor: "#F0FDFA",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: "#0D948830",
  },
  filterPillText: { fontSize: 12, color: "#0D9488", fontWeight: "600" },

  // Suggest header
  suggestHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 6,
    gap: 10,
  },
  suggestLine: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
  suggestTitle: { fontSize: 13, fontWeight: "700", letterSpacing: 1 },

  // Products grid
  productsRow: {
    paddingHorizontal: 16,
    justifyContent: "space-between",
    marginBottom: 10,
  },
  productCard: {
    width: PRODUCT_CARD_WIDTH,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  productImageWrap: { position: "relative" },
  productImage: {
    width: "100%",
    height: PRODUCT_CARD_WIDTH,
    backgroundColor: "#E5E7EB",
  },
  flashBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  flashBadgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  newBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#10B981",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: { color: "#fff", fontSize: 9, fontWeight: "bold" },
  bestsellerBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#F59E0B",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bestsellerBadgeText: { color: "#fff", fontSize: 9, fontWeight: "bold" },
  freeShipBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDFA",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  freeShipText: { color: "#0D9488", fontSize: 9, fontWeight: "600" },
  productContent: { padding: 10 },
  productName: { fontSize: 12, height: 34, lineHeight: 17 },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  productPrice: { color: "#0D9488", fontSize: 14, fontWeight: "bold" },
  originalPrice: {
    color: "#9CA3AF",
    fontSize: 11,
    textDecorationLine: "line-through",
  },
  productFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  ratingBox: { flexDirection: "row", alignItems: "center", gap: 2 },
  ratingText: { fontSize: 10, color: "#666" },
  soldText: { color: "#9CA3AF", fontSize: 10 },
  sellerName: { fontSize: 10, color: "#9CA3AF", marginTop: 4 },

  // Loading
  loadingRow: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  // Footer
  footerLoading: {
    paddingVertical: 20,
    alignItems: "center",
    gap: 8,
  },
  footerText: { color: "#999", fontSize: 13 },
  footerEnd: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 10,
  },
  footerEndLine: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
  footerEndText: { color: "#999", fontSize: 12 },

  // Empty state
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#666", marginTop: 12 },
  emptySubtitle: {
    fontSize: 13,
    color: "#999",
    marginTop: 4,
    textAlign: "center",
  },
  emptyBtn: {
    marginTop: 16,
    backgroundColor: "#0D9488",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
});
