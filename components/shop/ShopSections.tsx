/**
 * Shop Section Components - Modern Construction Materials Store
 * Professional e-commerce UI for construction materials, equipment & services
 */
import { Product } from "@/data/products";
import {
    FEATURED_BRANDS,
    FEATURED_CATEGORIES,
    PROMO_BANNERS,
    SHOP_CATEGORIES,
    SHOP_SERVICES,
    formatPrice,
    formatSold,
} from "@/data/shop-data";
import { useDS } from "@/hooks/useDS";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 36) / 2;
const BANNER_WIDTH = SCREEN_WIDTH - 24;

// ═══════════════════════════════════════════════════════════════════════
// SEARCH HEADER - Professional with location & messaging
// ═══════════════════════════════════════════════════════════════════════
interface ShopSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onCartPress: () => void;
  cartCount: number;
  paddingTop: number;
  onMessagePress?: () => void;
}

export const ShopSearchBar = memo(function ShopSearchBar({
  value,
  onChangeText,
  onCartPress,
  cartCount,
  paddingTop,
  onMessagePress,
}: ShopSearchBarProps) {
  const { colors, radius } = useDS();

  return (
    <View
      style={[
        s.searchHeader,
        { backgroundColor: colors.primary, paddingTop: paddingTop + 8 },
      ]}
    >
      {/* Top info bar */}
      <View style={s.topInfoBar}>
        <View style={s.locationRow}>
          <Ionicons
            name="location-sharp"
            size={14}
            color="rgba(255,255,255,0.9)"
          />
          <Text style={s.locationText}>TP. Hồ Chí Minh</Text>
          <Ionicons
            name="chevron-down"
            size={12}
            color="rgba(255,255,255,0.7)"
          />
        </View>
        <Text style={s.storeNameText}>VẬT LIỆU XÂY DỰNG</Text>
      </View>
      {/* Search row */}
      <View style={s.searchRow}>
        <View
          style={[
            s.searchInputWrap,
            { backgroundColor: colors.bgSurface, borderRadius: radius.sm },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Tìm xi măng, thép, gạch, sơn..."
            placeholderTextColor={colors.textTertiary}
            value={value}
            onChangeText={onChangeText}
            returnKeyType="search"
          />
          {value.length > 0 && (
            <Pressable onPress={() => onChangeText("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textTertiary}
              />
            </Pressable>
          )}
          {value.length === 0 && (
            <View
              style={[
                s.searchCameraDivider,
                { backgroundColor: colors.border },
              ]}
            />
          )}
          {value.length === 0 && (
            <Ionicons
              name="camera-outline"
              size={18}
              color={colors.textTertiary}
            />
          )}
        </View>
        <Pressable style={s.headerIconBtn} onPress={onCartPress}>
          <Ionicons name="cart-outline" size={24} color="#fff" />
          {cartCount > 0 && (
            <View style={[s.cartBadge, { backgroundColor: "#FF3B30" }]}>
              <Text style={s.cartBadgeText}>
                {cartCount > 99 ? "99+" : cartCount}
              </Text>
            </View>
          )}
        </Pressable>
        {onMessagePress && (
          <Pressable style={s.headerIconBtn} onPress={onMessagePress}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={22}
              color="#fff"
            />
          </Pressable>
        )}
      </View>
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════
// SERVICES STRIP - Trust badges
// ═══════════════════════════════════════════════════════════════════════
export const ServicesStrip = memo(function ServicesStrip() {
  const { colors } = useDS();

  return (
    <View style={[s.servicesStrip, { backgroundColor: colors.bgSurface }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.servicesStripScroll}
      >
        {SHOP_SERVICES.map((svc) => (
          <View key={svc.id} style={s.serviceStripItem}>
            <Ionicons name={svc.icon} size={18} color={colors.primary} />
            <View style={s.serviceStripText}>
              <Text
                style={[s.serviceStripLabel, { color: colors.text }]}
                numberOfLines={1}
              >
                {svc.label}
              </Text>
              <Text
                style={[s.serviceStripDesc, { color: colors.primary }]}
                numberOfLines={1}
              >
                {svc.desc}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════
// PROMO BANNER CAROUSEL
// ═══════════════════════════════════════════════════════════════════════
export const PromoBannerCarousel = memo(function PromoBannerCarousel({
  onBannerPress,
}: {
  onBannerPress?: (id: string) => void;
}) {
  const { colors, radius } = useDS();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIdx = (activeIdx + 1) % PROMO_BANNERS.length;
      scrollRef.current?.scrollTo({
        x: nextIdx * (BANNER_WIDTH + 12),
        animated: true,
      });
      setActiveIdx(nextIdx);
    }, 4000);
    return () => clearInterval(timer);
  }, [activeIdx]);

  return (
    <View style={s.bannerSection}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.bannerScroll}
        snapToInterval={BANNER_WIDTH + 12}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(
            e.nativeEvent.contentOffset.x / (BANNER_WIDTH + 12),
          );
          setActiveIdx(idx);
        }}
      >
        {PROMO_BANNERS.map((banner) => (
          <Pressable
            key={banner.id}
            style={[s.bannerCard, { borderRadius: radius.md }]}
            onPress={() => onBannerPress?.(banner.id)}
          >
            <LinearGradient
              colors={
                banner.gradient as unknown as [string, string, ...string[]]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[s.bannerGradient, { borderRadius: radius.md }]}
            >
              <View style={s.bannerContent}>
                <View style={s.bannerTextArea}>
                  <Text style={s.bannerTitle}>{banner.title}</Text>
                  <Text style={s.bannerSubtitle}>{banner.subtitle}</Text>
                  <View style={s.bannerBtn}>
                    <Text style={s.bannerBtnText}>Xem ngay</Text>
                    <Ionicons name="arrow-forward" size={14} color="#fff" />
                  </View>
                </View>
                <View style={s.bannerIconWrap}>
                  <Ionicons
                    name={banner.icon}
                    size={56}
                    color="rgba(255,255,255,0.25)"
                  />
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        ))}
      </ScrollView>
      {/* Dots */}
      <View style={s.bannerDots}>
        {PROMO_BANNERS.map((_, idx) => (
          <View
            key={idx}
            style={[
              s.bannerDot,
              {
                backgroundColor:
                  idx === activeIdx ? colors.primary : colors.border,
                width: idx === activeIdx ? 18 : 6,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════
// FEATURED CATEGORY GRID (8 icons)
// ═══════════════════════════════════════════════════════════════════════
interface FeaturedCategoryGridProps {
  onCategoryPress: (id: string) => void;
}

export const FeaturedCategoryGrid = memo(function FeaturedCategoryGrid({
  onCategoryPress,
}: FeaturedCategoryGridProps) {
  const { colors, radius } = useDS();

  return (
    <View style={[s.featCatSection, { backgroundColor: colors.bgSurface }]}>
      <View style={s.sectionHeader}>
        <View style={s.sectionTitleRow}>
          <Ionicons name="storefront" size={18} color={colors.primary} />
          <Text style={[s.sectionTitle, { color: colors.text }]}>
            DANH MỤC SẢN PHẨM
          </Text>
        </View>
        <Pressable onPress={() => onCategoryPress("all")}>
          <Text style={[s.seeAll, { color: colors.primary }]}>Tất cả &gt;</Text>
        </Pressable>
      </View>
      <View style={s.featCatGrid}>
        {FEATURED_CATEGORIES.map((cat) => (
          <Pressable
            key={cat.id}
            style={s.featCatItem}
            onPress={() => onCategoryPress(cat.id)}
          >
            <View
              style={[
                s.featCatIconWrap,
                { backgroundColor: cat.color + "15", borderRadius: radius.md },
              ]}
            >
              <Ionicons name={cat.icon} size={26} color={cat.color} />
            </View>
            <Text
              style={[s.featCatLabel, { color: colors.text }]}
              numberOfLines={1}
            >
              {cat.label}
            </Text>
            <Text style={[s.featCatCount, { color: colors.textTertiary }]}>
              {cat.count}+ SP
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════
// CATEGORY CHIPS (Horizontal scroll)
// ═══════════════════════════════════════════════════════════════════════
interface CategoryChipsProps {
  selected: string;
  onSelect: (id: string) => void;
}

export const CategoryChips = memo(function CategoryChips({
  selected,
  onSelect,
}: CategoryChipsProps) {
  const { colors, radius } = useDS();

  return (
    <View style={[s.categoriesSection, { backgroundColor: colors.bgSurface }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.categoriesScroll}
      >
        {SHOP_CATEGORIES.map((cat) => {
          const isActive = selected === cat.id;
          return (
            <Pressable
              key={cat.id}
              style={[
                s.chipItem,
                {
                  backgroundColor: isActive ? colors.primary : colors.bgMuted,
                  borderRadius: radius.full,
                  borderWidth: isActive ? 0 : 1,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => onSelect(cat.id)}
            >
              <Ionicons
                name={cat.icon}
                size={14}
                color={isActive ? "#fff" : colors.textSecondary}
              />
              <Text
                style={[
                  s.chipLabel,
                  { color: isActive ? "#fff" : colors.textSecondary },
                  isActive && s.chipLabelActive,
                ]}
                numberOfLines={1}
              >
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════
// FLASH SALE SECTION
// ═══════════════════════════════════════════════════════════════════════
interface FlashSaleSectionProps {
  products: Product[];
  onProductPress: (product: Product) => void;
  onSeeAll: () => void;
}

export const FlashSaleSection = memo(function FlashSaleSection({
  products,
  onProductPress,
  onSeeAll,
}: FlashSaleSectionProps) {
  const { colors, radius } = useDS();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  if (products.length === 0) return null;

  return (
    <View style={[s.flashSection, { backgroundColor: "#FFF1F0" }]}>
      {/* Header with countdown feel */}
      <View style={s.flashHeader}>
        <View style={s.flashTitleRow}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Ionicons name="flash" size={22} color="#EF4444" />
          </Animated.View>
          <Text style={s.flashSaleTitle}>FLASH SALE</Text>
          <View style={s.flashTimerBadge}>
            <Ionicons name="time-outline" size={12} color="#fff" />
            <Text style={s.flashTimerText}>Kết thúc trong 02:30:15</Text>
          </View>
        </View>
        <Pressable onPress={onSeeAll}>
          <Text style={[s.seeAll, { color: "#EF4444" }]}>Xem tất cả &gt;</Text>
        </Pressable>
      </View>
      {/* Products scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.hScroll}
      >
        {products.slice(0, 10).map((product) => (
          <Pressable
            key={product.id}
            style={[
              s.flashCard,
              { backgroundColor: "#fff", borderRadius: radius.sm },
            ]}
            onPress={() => onProductPress(product)}
          >
            <Image source={resolveImage(product.image)} style={s.flashImage} />
            {product.discountPercent && product.discountPercent > 0 && (
              <View style={s.flashDiscountBadge}>
                <Text style={s.flashDiscountText}>
                  -{product.discountPercent}%
                </Text>
              </View>
            )}
            <View style={s.flashInfo}>
              <Text style={s.flashPrice}>₫{formatPrice(product.price)}</Text>
              {product.originalPrice && (
                <Text style={s.flashOriginalPrice}>
                  ₫{formatPrice(product.originalPrice)}
                </Text>
              )}
              {/* Sold progress bar */}
              <View style={s.flashProgressBg}>
                <View
                  style={[
                    s.flashProgressFill,
                    {
                      width: `${Math.min(((product.sold || 0) / (product.stock || 100)) * 100, 95)}%`,
                    },
                  ]}
                />
                <Text style={s.flashSoldLabel}>
                  {product.sold ? `Đã bán ${product.sold}` : "Vừa mở bán"}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════
// FEATURED BRANDS
// ═══════════════════════════════════════════════════════════════════════
export const FeaturedBrandsSection = memo(function FeaturedBrandsSection({
  onBrandPress,
}: {
  onBrandPress?: (brandId: string) => void;
}) {
  const { colors, radius } = useDS();

  return (
    <View style={[s.brandsSection, { backgroundColor: colors.bgSurface }]}>
      <View style={s.sectionHeader}>
        <View style={s.sectionTitleRow}>
          <Ionicons name="ribbon" size={16} color={colors.primary} />
          <Text style={[s.sectionTitle, { color: colors.text }]}>
            THƯƠNG HIỆU NỔI BẬT
          </Text>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.brandsScroll}
      >
        {FEATURED_BRANDS.map((brand) => (
          <Pressable
            key={brand.id}
            style={[
              s.brandCard,
              { borderColor: colors.border, borderRadius: radius.sm },
            ]}
            onPress={() => onBrandPress?.(brand.id)}
          >
            <Text style={s.brandLogo}>{brand.logo}</Text>
            <Text style={[s.brandName, { color: colors.text }]}>
              {brand.name}
            </Text>
            <Text style={[s.brandCat, { color: colors.textTertiary }]}>
              {brand.category}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════
// RECENTLY VIEWED
// ═══════════════════════════════════════════════════════════════════════
interface RecentViewedProps {
  history: Array<{ id: string; name: string; price: number; image: string }>;
  onItemPress: (id: string) => void;
  onSeeAll: () => void;
}

export const RecentViewedSection = memo(function RecentViewedSection({
  history,
  onItemPress,
  onSeeAll,
}: RecentViewedProps) {
  const { colors, radius } = useDS();

  if (history.length === 0) return null;

  return (
    <View style={[s.sectionWrap, { backgroundColor: colors.bgSurface }]}>
      <View style={s.sectionHeader}>
        <View style={s.sectionTitleRow}>
          <Ionicons
            name="time-outline"
            size={16}
            color={colors.textSecondary}
          />
          <Text style={[s.sectionTitle, { color: colors.text }]}>
            ĐÃ XEM GẦN ĐÂY
          </Text>
        </View>
        <Pressable onPress={onSeeAll}>
          <Text style={[s.seeAll, { color: colors.primary }]}>
            Xem tất cả &gt;
          </Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.hScroll}
      >
        {history.slice(0, 10).map((item) => (
          <Pressable
            key={item.id}
            style={[
              s.recentCard,
              {
                backgroundColor: colors.bgSurface,
                borderColor: colors.border,
                borderRadius: radius.sm,
              },
            ]}
            onPress={() => onItemPress(item.id)}
          >
            <Image
              source={
                typeof item.image === "string" && item.image
                  ? { uri: item.image }
                  : undefined
              }
              style={s.recentImage}
            />
            <View style={s.recentInfo}>
              <Text
                style={[s.recentName, { color: colors.text }]}
                numberOfLines={2}
              >
                {item.name}
              </Text>
              <Text style={[s.recentPrice, { color: colors.primary }]}>
                ₫{formatPrice(item.price)}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════
// PRODUCTS HEADER
// ═══════════════════════════════════════════════════════════════════════
interface ProductsHeaderProps {
  title: string;
  count: number;
  onFilter?: () => void;
}

export const ProductsHeader = memo(function ProductsHeader({
  title,
  count,
  onFilter,
}: ProductsHeaderProps) {
  const { colors, radius } = useDS();
  return (
    <View style={[s.productsHeader, { backgroundColor: colors.bgSurface }]}>
      <View style={{ flex: 1 }}>
        <Text style={[s.productsTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[s.productsCount, { color: colors.textTertiary }]}>
          {count} sản phẩm
        </Text>
      </View>
      {onFilter && (
        <TouchableOpacity
          onPress={onFilter}
          style={[
            s.filterBtn,
            {
              backgroundColor: colors.primaryBg || "#F0FDFB",
              borderRadius: radius.sm,
            },
          ]}
        >
          <Ionicons name="options-outline" size={16} color={colors.primary} />
          <Text style={[s.filterBtnText, { color: colors.primary }]}>
            Lọc & Sắp xếp
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════
// PRODUCT CARD - Modern construction materials card
// ═══════════════════════════════════════════════════════════════════════
interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
}

export const ProductCard = memo(function ProductCard({
  product,
  onPress,
  onToggleFavorite,
  isFavorite,
}: ProductCardProps) {
  const { colors, radius, shadow } = useDS();

  const hasDiscount = product.discountPercent && product.discountPercent > 0;

  return (
    <Pressable
      style={[
        s.productCard,
        {
          backgroundColor: colors.bgSurface,
          borderRadius: radius.sm,
          ...shadow.sm,
        },
      ]}
      onPress={onPress}
    >
      {/* Image */}
      <View style={s.imageContainer}>
        <Image source={resolveImage(product.image)} style={s.productImage} />

        {/* Discount badge */}
        {hasDiscount && (
          <View style={[s.discountBadge, { backgroundColor: "#EF4444" }]}>
            <Text style={s.discountText}>-{product.discountPercent}%</Text>
          </View>
        )}

        {/* Flash sale badge */}
        {product.flashSale && (
          <View style={[s.flashBadge, { backgroundColor: "#EF4444" }]}>
            <Ionicons name="flash" size={10} color="#fff" />
            <Text style={s.flashBadgeText}>FLASH</Text>
          </View>
        )}

        {/* New badge */}
        {product.isNew && !product.flashSale && (
          <View style={[s.newBadge, { backgroundColor: colors.primary }]}>
            <Text style={s.newBadgeText}>MỚI</Text>
          </View>
        )}

        {/* Bestseller badge */}
        {product.isBestseller && (
          <View style={[s.bestsellerBadge, { backgroundColor: "#F59E0B" }]}>
            <Ionicons name="trophy" size={9} color="#fff" />
            <Text style={s.bestsellerText}>BÁN CHẠY</Text>
          </View>
        )}

        {/* Favorite button */}
        <Pressable
          style={s.heartButton}
          onPress={(e) => {
            e.stopPropagation?.();
            onToggleFavorite();
          }}
          hitSlop={8}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={20}
            color={isFavorite ? "#EF4444" : colors.textTertiary}
          />
        </Pressable>
      </View>

      {/* Info */}
      <View style={s.productInfo}>
        {/* Brand */}
        {product.brand && (
          <Text
            style={[s.productBrand, { color: colors.primary }]}
            numberOfLines={1}
          >
            {product.brand}
          </Text>
        )}

        {/* Name */}
        <Text style={[s.productName, { color: colors.text }]} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Price */}
        <View style={s.priceRow}>
          {product.priceType === "contact" ? (
            <Text style={[s.priceContact, { color: colors.primary }]}>
              Liên hệ
            </Text>
          ) : (
            <>
              <Text style={[s.price, { color: "#EF4444" }]}>
                ₫{formatPrice(product.price)}
              </Text>
              {hasDiscount && (
                <Text style={[s.originalPrice, { color: colors.textTertiary }]}>
                  ₫
                  {formatPrice(
                    Math.round(
                      product.price /
                        (1 - (product.discountPercent || 0) / 100),
                    ),
                  )}
                </Text>
              )}
            </>
          )}
        </View>

        {/* Bottom info row */}
        <View style={s.bottomRow}>
          {product.rating ? (
            <View style={s.ratingRow}>
              <Ionicons name="star" size={10} color="#F59E0B" />
              <Text style={[s.ratingText, { color: colors.textSecondary }]}>
                {product.rating}
              </Text>
            </View>
          ) : null}
          {product.sold || product.soldCount ? (
            <Text style={[s.soldText, { color: colors.textTertiary }]}>
              {formatSold(product.sold || product.soldCount)}
            </Text>
          ) : null}
        </View>

        {/* Shipping & stock info */}
        <View style={s.tagRow}>
          {product.freeShipping && (
            <View style={[s.tagBadge, { backgroundColor: "#ECFDF5" }]}>
              <Ionicons name="car-outline" size={9} color="#059669" />
              <Text style={[s.tagText, { color: "#059669" }]}>Free ship</Text>
            </View>
          )}
          {product.warranty && (
            <View style={[s.tagBadge, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons
                name="shield-checkmark-outline"
                size={9}
                color="#2563EB"
              />
              <Text style={[s.tagText, { color: "#2563EB" }]}>
                BH {product.warranty}
              </Text>
            </View>
          )}
          {product.stock !== undefined &&
            product.stock > 0 &&
            product.stock <= 10 && (
              <View style={[s.tagBadge, { backgroundColor: "#FEF2F2" }]}>
                <Text style={[s.tagText, { color: "#EF4444" }]}>
                  Còn {product.stock}
                </Text>
              </View>
            )}
        </View>
      </View>
    </Pressable>
  );
});

// ═══════════════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════════════
export const ShopEmpty = memo(function ShopEmpty() {
  const { colors } = useDS();
  return (
    <View style={s.emptyContainer}>
      <View style={[s.emptyIconWrap, { backgroundColor: colors.bgMuted }]}>
        <Ionicons
          name="storefront-outline"
          size={48}
          color={colors.textTertiary}
        />
      </View>
      <Text style={[s.emptyTitle, { color: colors.text }]}>
        Không tìm thấy sản phẩm
      </Text>
      <Text style={[s.emptySubtitle, { color: colors.textTertiary }]}>
        Thử tìm kiếm với từ khóa khác{"\n"}hoặc chọn danh mục khác
      </Text>
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════
function resolveImage(image: Product["image"]) {
  if (typeof image === "string") return { uri: image };
  if (image?.uri) return { uri: image.uri };
  return image;
}

// ═══════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  // ── Search Header ─────────────────────
  searchHeader: { paddingHorizontal: 12, paddingBottom: 12 },
  topInfoBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  storeNameText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
    letterSpacing: 1,
  },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  searchInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 13, paddingVertical: 0 },
  searchCameraDivider: { width: 1, height: 20 },
  headerIconBtn: { position: "relative", padding: 6 },
  cartBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: { fontSize: 10, fontWeight: "700", color: "#fff" },

  // ── Services Strip ─────────────────────
  servicesStrip: {
    paddingVertical: 10,
    marginBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  servicesStripScroll: { paddingHorizontal: 16, gap: 20 },
  serviceStripItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  serviceStripText: {},
  serviceStripLabel: { fontSize: 11, fontWeight: "600" },
  serviceStripDesc: { fontSize: 10, fontWeight: "500", marginTop: 1 },

  // ── Promo Banner ─────────────────────
  bannerSection: { marginVertical: 8 },
  bannerScroll: { paddingHorizontal: 12, gap: 12 },
  bannerCard: { width: BANNER_WIDTH, height: 140, overflow: "hidden" },
  bannerGradient: { flex: 1, padding: 20 },
  bannerContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bannerTextArea: { flex: 1, justifyContent: "center" },
  bannerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 12,
  },
  bannerBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  bannerBtnText: { fontSize: 12, fontWeight: "600", color: "#fff" },
  bannerIconWrap: { justifyContent: "center", alignItems: "center" },
  bannerDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
  },
  bannerDot: { height: 6, borderRadius: 3 },

  // ── Featured Category Grid ─────────────────────
  featCatSection: { paddingVertical: 16, marginBottom: 6 },
  featCatGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
  },
  featCatItem: {
    width: "25%",
    alignItems: "center",
    paddingVertical: 10,
  },
  featCatIconWrap: {
    width: 52,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  featCatLabel: { fontSize: 11, fontWeight: "600", textAlign: "center" },
  featCatCount: { fontSize: 9, marginTop: 2 },

  // ── Category Chips ─────────────────────
  categoriesSection: { paddingVertical: 10, marginBottom: 4 },
  categoriesScroll: { paddingHorizontal: 12, gap: 8 },
  chipItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 5,
  },
  chipLabel: { fontSize: 12 },
  chipLabelActive: { fontWeight: "600" },

  // ── Section Common ─────────────────────
  sectionWrap: { paddingVertical: 14, marginBottom: 6 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sectionTitle: { fontSize: 14, fontWeight: "700", letterSpacing: 0.5 },
  seeAll: { fontSize: 12, fontWeight: "500" },
  hScroll: { paddingHorizontal: 12, gap: 10 },

  // ── Flash Sale ─────────────────────
  flashSection: { paddingVertical: 14, marginBottom: 6 },
  flashHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  flashTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  flashSaleTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#EF4444",
    letterSpacing: 1,
  },
  flashTimerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
    marginLeft: 6,
  },
  flashTimerText: { fontSize: 10, color: "#fff", fontWeight: "600" },
  flashCard: {
    width: 130,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  flashImage: { width: 130, height: 130, resizeMode: "cover" },
  flashDiscountBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#EF4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderBottomLeftRadius: 8,
  },
  flashDiscountText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  flashInfo: { padding: 8 },
  flashPrice: { fontSize: 14, fontWeight: "700", color: "#EF4444" },
  flashOriginalPrice: {
    fontSize: 10,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
    marginTop: 2,
  },
  flashProgressBg: {
    height: 16,
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    marginTop: 6,
    overflow: "hidden",
    justifyContent: "center",
  },
  flashProgressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#FECACA",
    borderRadius: 8,
  },
  flashSoldLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "#EF4444",
    textAlign: "center",
    zIndex: 1,
  },

  // ── Brands ─────────────────────
  brandsSection: { paddingVertical: 14, marginBottom: 6 },
  brandsScroll: { paddingHorizontal: 12, gap: 12 },
  brandCard: {
    width: 80,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
  },
  brandLogo: { fontSize: 28, marginBottom: 6 },
  brandName: { fontSize: 11, fontWeight: "600", textAlign: "center" },
  brandCat: { fontSize: 9, textAlign: "center", marginTop: 2 },

  // ── Recent Viewed ─────────────────────
  recentCard: { width: 120, overflow: "hidden", borderWidth: 1 },
  recentImage: { width: 120, height: 120, resizeMode: "cover" },
  recentInfo: { padding: 8 },
  recentName: { fontSize: 11, lineHeight: 14, marginBottom: 4 },
  recentPrice: { fontSize: 13, fontWeight: "700" },

  // ── Products Header ─────────────────────
  productsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 4,
  },
  productsTitle: { fontSize: 15, fontWeight: "700", letterSpacing: 0.5 },
  productsCount: { fontSize: 12, marginTop: 2 },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 5,
  },
  filterBtnText: { fontSize: 12, fontWeight: "600" },

  // ── Product Card ─────────────────────
  productCard: { width: CARD_WIDTH, overflow: "hidden", marginBottom: 4 },
  imageContainer: { position: "relative" },
  productImage: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 0.9,
    resizeMode: "cover",
  },
  discountBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderBottomLeftRadius: 8,
  },
  discountText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  flashBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderTopRightRadius: 8,
    gap: 2,
  },
  flashBadgeText: { color: "#fff", fontSize: 9, fontWeight: "700" },
  newBadge: {
    position: "absolute",
    top: 0,
    left: 0,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomRightRadius: 8,
  },
  newBadgeText: { color: "#fff", fontSize: 9, fontWeight: "700" },
  bestsellerBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderTopRightRadius: 8,
    gap: 3,
  },
  bestsellerText: { color: "#fff", fontSize: 8, fontWeight: "700" },
  heartButton: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: { padding: 10 },
  productBrand: {
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 3,
    textTransform: "uppercase",
  },
  productName: { fontSize: 12, lineHeight: 17, marginBottom: 6, minHeight: 34 },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
    marginBottom: 5,
  },
  price: { fontSize: 15, fontWeight: "700" },
  priceContact: { fontSize: 13, fontWeight: "700" },
  originalPrice: { fontSize: 10, textDecorationLine: "line-through" },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 5,
  },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  ratingText: { fontSize: 10, fontWeight: "500" },
  soldText: { fontSize: 10 },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  tagBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    gap: 3,
  },
  tagText: { fontSize: 8, fontWeight: "600" },

  // ── Empty ─────────────────────
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptySubtitle: { fontSize: 13, textAlign: "center", lineHeight: 20 },
});
