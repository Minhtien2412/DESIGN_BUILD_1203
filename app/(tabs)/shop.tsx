/**
 * Shop Tab - Modern Construction Materials Store
 * Professional e-commerce for construction materials, equipment & services
 * Shopee/Lazada-style with construction industry focus
 */
import {
    FilterSortModal,
    type FilterState,
} from "@/components/modals/FilterSortModal";
import { ProductQuickViewModal } from "@/components/modals/ProductQuickViewModal";
import {
    CategoryChips,
    FeaturedBrandsSection,
    FeaturedCategoryGrid,
    FlashSaleSection,
    ProductCard,
    ProductsHeader,
    PromoBannerCarousel,
    RecentViewedSection,
    ShopEmpty,
    ShopSearchBar,
} from "@/components/shop/ShopSections";
import { useCart } from "@/context/cart-context";
import { useFavorites } from "@/context/FavoritesContext";
import { useViewHistory } from "@/context/ViewHistoryContext";
import { PRODUCTS, Product } from "@/data/products";
import { useDS } from "@/hooks/useDS";
import {
    getFlashSaleProducts as fetchFlashSale,
    getProducts,
} from "@/services/api/products.service";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ShopScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useDS();
  const { addToCart, items: cartItems } = useCart();
  const { favorites, toggleFavorite } = useFavorites();
  const { addToHistory, history } = useViewHistory();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [quickViewId, setQuickViewId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    category: "all",
    minPrice: "",
    maxPrice: "",
    minRating: 0,
    sortBy: "default",
    inStock: false,
  });

  // ── Server products state ─────────────────────────────
  const [serverProducts, setServerProducts] = useState<Product[]>([]);
  const [serverFlashSale, setServerFlashSale] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const hasFetched = useRef(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const [productsRes, flashRes] = await Promise.allSettled([
        getProducts({ page: 1, limit: 100 }),
        fetchFlashSale(20),
      ]);

      if (
        productsRes.status === "fulfilled" &&
        productsRes.value.products.length > 0
      ) {
        setServerProducts(productsRes.value.products);
        console.log(
          "[Shop] ✅ Loaded",
          productsRes.value.products.length,
          "products from server",
        );
      } else {
        console.log("[Shop] ⚠️ Server products unavailable, using local data");
        setServerProducts([]);
      }

      if (flashRes.status === "fulfilled" && flashRes.value.length > 0) {
        setServerFlashSale(flashRes.value);
      } else {
        setServerFlashSale([]);
      }
    } catch (err) {
      console.warn("[Shop] ❌ Fetch failed, using local fallback", err);
      setServerProducts([]);
      setServerFlashSale([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchProducts();
    }
  }, [fetchProducts]);

  // Merge server + local data (server takes priority, dedup by id)
  const allProducts = useMemo(() => {
    if (serverProducts.length > 0) {
      const serverIds = new Set(serverProducts.map((p) => p.id));
      const localExtras = PRODUCTS.filter((p) => !serverIds.has(p.id));
      return [...serverProducts, ...localExtras];
    }
    return PRODUCTS;
  }, [serverProducts]);

  // ── Derived data ──────────────────────────────────────
  const isSearching =
    searchQuery.trim().length > 0 || selectedCategory !== "all";

  const filteredProducts = useMemo(() => {
    let result = allProducts.filter((p) => p.status === "ACTIVE" || !p.status);
    // Category filter
    const cat =
      activeFilters.category !== "all"
        ? activeFilters.category
        : selectedCategory;
    if (cat !== "all") {
      result = result.filter((p) => p.category === cat);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q)),
      );
    }
    // Price range
    if (activeFilters.minPrice) {
      result = result.filter((p) => p.price >= Number(activeFilters.minPrice));
    }
    if (activeFilters.maxPrice) {
      result = result.filter((p) => p.price <= Number(activeFilters.maxPrice));
    }
    // Rating
    if (activeFilters.minRating > 0) {
      result = result.filter((p) => (p.rating || 0) >= activeFilters.minRating);
    }
    // In stock only
    if (activeFilters.inStock) {
      result = result.filter((p) => !p.stock || p.stock > 0);
    }
    // Sort
    switch (activeFilters.sortBy) {
      case "price_asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        result = [...result].reverse();
        break;
      default:
        // Default: bestsellers first, then by rating
        result = [...result].sort((a, b) => {
          if (a.isBestseller && !b.isBestseller) return -1;
          if (!a.isBestseller && b.isBestseller) return 1;
          return (b.rating || 0) - (a.rating || 0);
        });
    }
    return result;
  }, [allProducts, selectedCategory, searchQuery, activeFilters]);

  const flashSaleProducts = useMemo(() => {
    if (serverFlashSale.length > 0) return serverFlashSale;
    return allProducts.filter((p) => p.flashSale);
  }, [serverFlashSale, allProducts]);

  const bestsellerProducts = useMemo(() => {
    return allProducts
      .filter((p) => p.isBestseller && (p.status === "ACTIVE" || !p.status))
      .slice(0, 10);
  }, [allProducts]);

  // ── Handlers ──────────────────────────────────────────
  const handleProductPress = useCallback(
    (product: Product) => {
      const imageStr =
        typeof product.image === "string"
          ? product.image
          : product.image?.uri || "";
      addToHistory({
        id: product.id,
        name: product.name,
        price: product.price,
        image: imageStr,
        type: "product" as const,
      });
      router.push(`/product/${product.id}`);
    },
    [router, addToHistory],
  );

  const handleToggleFavorite = useCallback(
    (product: Product) => {
      const imageStr =
        typeof product.image === "string"
          ? product.image
          : product.image?.uri || "";
      toggleFavorite({
        id: product.id,
        name: product.name,
        price: product.price,
        image: imageStr,
        type: "product" as const,
      });
    },
    [toggleFavorite],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  }, [fetchProducts]);

  const handleApplyFilters = useCallback((filters: FilterState) => {
    setActiveFilters(filters);
    if (filters.category !== "all") {
      setSelectedCategory(filters.category);
    }
    setShowFilter(false);
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.some((f) => f.id === id),
    [favorites],
  );

  const handleCategoryPress = useCallback((id: string) => {
    setSelectedCategory(id);
  }, []);

  // ── List header (full home experience) ────────────────
  const renderHeader = () => (
    <View>
      {/* Search Bar */}
      <ShopSearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onCartPress={() => router.push("/cart")}
        cartCount={cartItems.length}
        paddingTop={insets.top}
        onMessagePress={() => router.push("/chat")}
      />

      {/* Show full store experience when not searching */}
      {!isSearching && (
        <>
          {/* Promo Banner Carousel */}
          <PromoBannerCarousel />

          {/* Featured Category Grid (8 icons) */}
          <FeaturedCategoryGrid onCategoryPress={handleCategoryPress} />

          {/* Flash Sale */}
          <FlashSaleSection
            products={flashSaleProducts}
            onProductPress={handleProductPress}
            onSeeAll={() => setSelectedCategory("flash")}
          />

          {/* Featured Brands */}
          <FeaturedBrandsSection />

          {/* Recently Viewed */}
          <RecentViewedSection
            history={history.slice(0, 10)}
            onItemPress={(id) => router.push(`/product/${id}`)}
            onSeeAll={() => router.push("/profile/favorites")}
          />
        </>
      )}

      {/* Category chips (always visible) */}
      {isSearching && (
        <CategoryChips
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      )}

      {/* Products grid header */}
      <ProductsHeader
        title={
          isSearching
            ? selectedCategory !== "all"
              ? "SẢN PHẨM"
              : `KẾT QUẢ TÌM KIẾM`
            : "GỢI Ý CHO BẠN"
        }
        count={filteredProducts.length}
        onFilter={() => setShowFilter(true)}
      />
    </View>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={() => handleProductPress(item)}
      onToggleFavorite={() => handleToggleFavorite(item)}
      isFavorite={isFavorite(item.id)}
    />
  );

  // ── Back to top button ────────────────────────────────
  const flatListRef = useRef<FlatList>(null);

  // ── Render ────────────────────────────────────────────
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.bgMuted || "#F3F4F6" },
      ]}
    >
      <FlatList
        ref={flatListRef}
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={<ShopEmpty />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={7}
      />

      {/* Floating scroll-to-top */}
      <Pressable
        style={[styles.scrollTopBtn, { backgroundColor: colors.primary }]}
        onPress={() =>
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
        }
      >
        <Ionicons name="chevron-up" size={20} color="#fff" />
      </Pressable>

      {/* Filter & Sort Modal */}
      <FilterSortModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onApply={handleApplyFilters}
        initialFilters={activeFilters}
      />

      {/* Product Quick View Modal */}
      <ProductQuickViewModal
        visible={!!quickViewId}
        productId={quickViewId}
        onClose={() => setQuickViewId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  productRow: {
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  scrollTopBtn: {
    position: "absolute",
    bottom: 100,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.85,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
});
