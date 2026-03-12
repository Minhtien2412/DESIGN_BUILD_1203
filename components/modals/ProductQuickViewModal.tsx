/**
 * Product Quick View Modal
 * Bottom sheet popup for quick product preview from homepage
 *
 * Features:
 * - Swipeable image gallery
 * - Price & discount info
 * - Rating & sold count
 * - Quick add to cart
 * - Navigate to full detail
 *
 * API: GET /products/:id, GET /products/:id/related
 */

import { useCart } from "@/context/cart-context";
import { useFavorites } from "@/context/FavoritesContext";
import { PRODUCTS } from "@/data/products";
import { productService } from "@/services/api/product.service";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SW, height: SH } = Dimensions.get("window");
const MODAL_HEIGHT = SH * 0.75;

const THEME = {
  primary: "#0D9488",
  primaryDark: "#0F766E",
  background: "#FFFFFF",
  surface: "#F8FAFB",
  text: "#1A1A1A",
  textSecondary: "#757575",
  border: "#E8E8E8",
  star: "#FFCE3D",
  error: "#EF4444",
  success: "#10B981",
};

interface ProductQuickViewProps {
  visible: boolean;
  productId: string | null;
  onClose: () => void;
}

interface ProductData {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  rating: number;
  soldCount: number;
  description: string;
  category?: string;
  stock?: number;
  shopName?: string;
  shopAvatar?: string;
  tags?: string[];
}

export function ProductQuickViewModal({
  visible,
  productId,
  onClose,
}: ProductQuickViewProps) {
  const { addToCart } = useCart();
  const { favorites, toggleFavorite } = useFavorites();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  const slideAnim = useRef(new Animated.Value(MODAL_HEIGHT)).current;

  // Fetch product data from API
  useEffect(() => {
    if (!visible || !productId) return;
    let cancelled = false;

    const fetchProduct = async () => {
      setLoading(true);
      setQuantity(1);
      setActiveImageIndex(0);
      setAddedToCart(false);

      try {
        // Try API first
        const apiProduct = await productService.getProduct(Number(productId));
        if (!cancelled && apiProduct) {
          setProduct({
            id: String(apiProduct.id),
            name: apiProduct.name,
            price: apiProduct.price,
            images: apiProduct.images?.length
              ? apiProduct.images.map((img: any) =>
                  typeof img === "string" ? img : img.url,
                )
              : ["https://picsum.photos/400/400?random=" + apiProduct.id],
            rating: 4.5,
            soldCount: apiProduct.soldCount || 0,
            description: apiProduct.description || "",
            category: apiProduct.category,
            stock: apiProduct.stock,
          });
        }
      } catch {
        // Fallback to local data
        if (!cancelled) {
          const local = PRODUCTS.find((p) => p.id === productId);
          if (local) {
            const imgStr =
              typeof local.image === "string"
                ? local.image
                : "https://picsum.photos/400/400?random=" + local.id;
            setProduct({
              id: local.id,
              name: local.name,
              price: local.price,
              originalPrice: local.discountPercent
                ? Math.round(local.price / (1 - local.discountPercent / 100))
                : undefined,
              images: [imgStr],
              rating: local.rating || 4.5,
              soldCount: local.sold || 0,
              description: local.description || "",
              category: local.category as string,
              stock: local.stock ?? 99,
              tags: local.tags,
            });
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [visible, productId]);

  // Animate slide up/down
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: MODAL_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const isFav = product ? favorites.some((f) => f.id === product.id) : false;
  const discountPct =
    product?.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0;

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const local = PRODUCTS.find((p) => p.id === product.id);
    if (local) {
      for (let i = 0; i < quantity; i++) {
        addToCart(local);
      }
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }, [product, quantity, addToCart]);

  const handleBuyNow = useCallback(() => {
    handleAddToCart();
    onClose();
    router.push("/cart");
  }, [handleAddToCart, onClose]);

  const handleViewFull = useCallback(() => {
    if (!product) return;
    onClose();
    router.push(`/product/${product.id}`);
  }, [product, onClose]);

  const handleToggleFav = useCallback(() => {
    if (!product) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const local = PRODUCTS.find((p) => p.id === product.id);
    if (local) {
      const imgStr =
        typeof local.image === "string"
          ? local.image
          : "https://picsum.photos/100";
      toggleFavorite({
        id: local.id,
        name: local.name,
        price: local.price,
        image: imgStr,
        type: "product",
      });
    }
  }, [product, toggleFavorite]);

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("vi-VN").format(n) + "đ";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          <Pressable onPress={() => {}}>
            {/* Handle bar */}
            <View style={styles.handleBar}>
              <View style={styles.handle} />
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={THEME.primary} />
                <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
              </View>
            ) : product ? (
              <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* Image Gallery */}
                <View style={styles.imageContainer}>
                  <FlatList
                    data={product.images}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(e) => {
                      const idx = Math.round(
                        e.nativeEvent.contentOffset.x / SW,
                      );
                      setActiveImageIndex(idx);
                    }}
                    keyExtractor={(_, i) => String(i)}
                    renderItem={({ item }) => (
                      <Image
                        source={{ uri: item }}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    )}
                  />
                  {/* Image dots */}
                  {product.images.length > 1 && (
                    <View style={styles.dotsRow}>
                      {product.images.map((_, i) => (
                        <View
                          key={i}
                          style={[
                            styles.dot,
                            i === activeImageIndex && styles.dotActive,
                          ]}
                        />
                      ))}
                    </View>
                  )}
                  {/* Discount badge */}
                  {discountPct > 0 && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>-{discountPct}%</Text>
                    </View>
                  )}
                  {/* Favorite button */}
                  <TouchableOpacity
                    style={styles.favButton}
                    onPress={handleToggleFav}
                  >
                    <Ionicons
                      name={isFav ? "heart" : "heart-outline"}
                      size={22}
                      color={isFav ? THEME.error : "#FFF"}
                    />
                  </TouchableOpacity>
                </View>

                {/* Product Info */}
                <View style={styles.infoSection}>
                  {/* Price */}
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>
                      {formatPrice(product.price)}
                    </Text>
                    {product.originalPrice &&
                      product.originalPrice > product.price && (
                        <Text style={styles.originalPrice}>
                          {formatPrice(product.originalPrice)}
                        </Text>
                      )}
                  </View>

                  {/* Name */}
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>

                  {/* Rating & Sold */}
                  <View style={styles.metaRow}>
                    <View style={styles.ratingBox}>
                      <Ionicons name="star" size={14} color={THEME.star} />
                      <Text style={styles.ratingText}>
                        {product.rating.toFixed(1)}
                      </Text>
                    </View>
                    <Text style={styles.separator}>|</Text>
                    <Text style={styles.soldText}>
                      Đã bán{" "}
                      {product.soldCount > 1000
                        ? `${(product.soldCount / 1000).toFixed(1)}k`
                        : product.soldCount}
                    </Text>
                    {product.stock !== undefined && (
                      <>
                        <Text style={styles.separator}>|</Text>
                        <Text style={styles.stockText}>
                          Kho: {product.stock}
                        </Text>
                      </>
                    )}
                  </View>

                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <View style={styles.tagsRow}>
                      {product.tags.slice(0, 4).map((tag) => (
                        <View key={tag} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Description */}
                  <Text style={styles.description} numberOfLines={3}>
                    {product.description}
                  </Text>

                  {/* Quantity */}
                  <View style={styles.quantitySection}>
                    <Text style={styles.quantityLabel}>Số lượng</Text>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                      >
                        <Ionicons name="remove" size={18} color={THEME.text} />
                      </TouchableOpacity>
                      <Text style={styles.qtyValue}>{quantity}</Text>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => setQuantity((q) => q + 1)}
                      >
                        <Ionicons name="add" size={18} color={THEME.text} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.cartBtn]}
                    onPress={handleAddToCart}
                  >
                    <Ionicons
                      name={addedToCart ? "checkmark-circle" : "cart-outline"}
                      size={20}
                      color={addedToCart ? THEME.success : THEME.primary}
                    />
                    <Text
                      style={[
                        styles.cartBtnText,
                        addedToCart && { color: THEME.success },
                      ]}
                    >
                      {addedToCart ? "Đã thêm!" : "Thêm vào giỏ"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.buyBtn]}
                    onPress={handleBuyNow}
                  >
                    <Text style={styles.buyBtnText}>Mua ngay</Text>
                  </TouchableOpacity>
                </View>

                {/* View Full Detail */}
                <TouchableOpacity
                  style={styles.viewFullBtn}
                  onPress={handleViewFull}
                >
                  <Text style={styles.viewFullText}>Xem chi tiết đầy đủ</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={THEME.primary}
                  />
                </TouchableOpacity>

                <View style={{ height: 30 }} />
              </ScrollView>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="cube-outline"
                  size={48}
                  color={THEME.textSecondary}
                />
                <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
              </View>
            )}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: THEME.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: MODAL_HEIGHT,
    overflow: "hidden",
  },
  handleBar: {
    alignItems: "center",
    paddingVertical: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DDD",
  },
  loadingContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: THEME.textSecondary,
  },
  emptyContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: THEME.textSecondary,
  },

  // Image Gallery
  imageContainer: {
    position: "relative",
  },
  productImage: {
    width: SW,
    height: SW * 0.65,
    backgroundColor: "#F0F0F0",
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
    marginHorizontal: 3,
  },
  dotActive: {
    backgroundColor: "#FFF",
    width: 16,
  },
  discountBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: THEME.error,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  favButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    padding: 8,
  },

  // Info Section
  infoSection: {
    padding: 16,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: "700",
    color: THEME.error,
  },
  originalPrice: {
    fontSize: 14,
    color: THEME.textSecondary,
    textDecorationLine: "line-through",
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.text,
    marginTop: 8,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.text,
  },
  separator: {
    color: THEME.border,
    fontSize: 13,
  },
  soldText: {
    fontSize: 13,
    color: THEME.textSecondary,
  },
  stockText: {
    fontSize: 13,
    color: THEME.textSecondary,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  tag: {
    backgroundColor: "#F0FDFA",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#CCFBF1",
  },
  tagText: {
    fontSize: 11,
    color: THEME.primary,
    fontWeight: "500",
  },
  description: {
    fontSize: 13,
    color: THEME.textSecondary,
    lineHeight: 19,
    marginTop: 10,
  },

  // Quantity
  quantitySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.text,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.border,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyValue: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.text,
    minWidth: 24,
    textAlign: "center",
  },

  // Actions
  actionRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 10,
    gap: 6,
  },
  cartBtn: {
    borderWidth: 1.5,
    borderColor: THEME.primary,
    backgroundColor: "#F0FDFA",
  },
  cartBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.primary,
  },
  buyBtn: {
    backgroundColor: THEME.primary,
  },
  buyBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
  viewFullBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    gap: 4,
  },
  viewFullText: {
    fontSize: 14,
    fontWeight: "500",
    color: THEME.primary,
  },
});

export default ProductQuickViewModal;
