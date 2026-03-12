/**
 * Cart Screen - Redesigned with DS
 * Swipe-to-delete cart items, voucher support, checkout flow
 * ~250 lines vs 751 original
 */
import { DSButton } from "@/components/ds";
import { type CartItem, useCart } from "@/context/cart-context";
import { useVoucher } from "@/context/voucher-context";
import { useDS } from "@/hooks/useDS";
import { useI18n } from "@/services/i18nService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useRef } from "react";
import {
    Alert,
    Animated,
    Image,
    PanResponder,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const SWIPE_THRESHOLD = 80;

// ═══════════════════════════════════════════════════════════════════════
// SWIPEABLE CART ITEM
// ═══════════════════════════════════════════════════════════════════════
function SwipeableCartItem({
  item,
  onRemove,
  onIncrement,
  onDecrement,
  formatPrice,
  deleteLabel,
}: {
  item: CartItem;
  onRemove: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  formatPrice: (n: number) => string;
  deleteLabel: string;
}) {
  const { colors, radius, shadow, spacing } = useDS();
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 10 && Math.abs(g.dy) < 20,
      onPanResponderMove: (_, g) => {
        if (g.dx < 0) translateX.setValue(Math.max(g.dx, -120));
      },
      onPanResponderRelease: (_, g) => {
        Animated.spring(translateX, {
          toValue: g.dx < -SWIPE_THRESHOLD ? -100 : 0,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  const handleDelete = () => {
    Animated.timing(translateX, {
      toValue: -500,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onRemove());
  };

  return (
    <View
      style={[
        s.swipeWrap,
        {
          marginHorizontal: spacing.md,
          marginTop: spacing.md,
          borderRadius: radius.lg,
        },
      ]}
    >
      {/* Delete background */}
      <View
        style={[
          s.deleteBg,
          {
            backgroundColor: colors.error,
            borderTopRightRadius: radius.lg,
            borderBottomRightRadius: radius.lg,
          },
        ]}
      >
        <TouchableOpacity style={s.deleteAction} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={24} color="#fff" />
          <Text style={s.deleteText}>{deleteLabel}</Text>
        </TouchableOpacity>
      </View>

      {/* Card */}
      <Animated.View
        style={[
          s.cartItem,
          {
            backgroundColor: colors.bgSurface,
            borderRadius: radius.lg,
            ...shadow.sm,
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View
          style={[
            s.itemImage,
            { borderRadius: radius.md, backgroundColor: colors.bgMuted },
          ]}
        >
          <Image
            source={
              typeof item.product.image === "string"
                ? { uri: item.product.image }
                : item.product.image
            }
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        </View>

        <View style={s.itemInfo}>
          <Text style={[s.itemName, { color: colors.text }]} numberOfLines={2}>
            {item.product.name}
          </Text>

          {(item.selectedSize || item.selectedColor) && (
            <View style={s.variantRow}>
              {item.selectedColor && (
                <View
                  style={[
                    s.variantBadge,
                    {
                      backgroundColor: colors.primaryBg,
                      borderColor: colors.primaryBorder,
                    },
                  ]}
                >
                  <Text style={[s.variantText, { color: colors.primary }]}>
                    {item.selectedColor}
                  </Text>
                </View>
              )}
              {item.selectedSize && (
                <View
                  style={[
                    s.variantBadge,
                    {
                      backgroundColor: colors.primaryBg,
                      borderColor: colors.primaryBorder,
                    },
                  ]}
                >
                  <Text style={[s.variantText, { color: colors.primary }]}>
                    {item.selectedSize}
                  </Text>
                </View>
              )}
            </View>
          )}

          <Text style={[s.itemPrice, { color: colors.primary }]}>
            ₫{formatPrice(item.product.price)}
          </Text>

          <View style={s.quantityRow}>
            <View
              style={[
                s.quantityControls,
                {
                  backgroundColor: colors.bgMuted,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                },
              ]}
            >
              <TouchableOpacity
                style={[s.qtyBtn, item.quantity <= 1 && { opacity: 0.4 }]}
                onPress={onDecrement}
                disabled={item.quantity <= 1}
              >
                <Ionicons name="remove" size={18} color={colors.text} />
              </TouchableOpacity>
              <Text style={[s.qtyText, { color: colors.text }]}>
                {item.quantity}
              </Text>
              <TouchableOpacity style={s.qtyBtn} onPress={onIncrement}>
                <Ionicons name="add" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={[s.itemTotal, { color: colors.text }]}>
              ₫{formatPrice(item.product.price * item.quantity)}
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════
export default function CartScreen() {
  const { colors, radius, shadow, spacing, isDark } = useDS();
  const { t } = useI18n();
  const {
    items,
    totalPrice,
    totalItems,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const { appliedVoucher, appliedFreeshipVoucher, getTotalDiscount } =
    useVoucher();

  const voucherDiscount = getTotalDiscount();
  const finalTotal = Math.max(0, totalPrice - voucherDiscount);

  const formatPrice = (price: number) => price.toLocaleString("vi-VN");

  const increment = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) updateQuantity(id, item.quantity + 1);
  };
  const decrement = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item && item.quantity > 1) updateQuantity(id, item.quantity - 1);
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert(t("checkout.emptyCart"), t("checkout.emptyCartMsg"));
      return;
    }
    router.push("/checkout");
  };

  const handleClear = () => {
    Alert.alert(t("cart.clearCart"), t("cart.clearConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => clearCart(),
      },
    ]);
  };

  const handleRemove = (id: string, name: string) => {
    Alert.alert(t("cart.removeItem"), t("cart.removeConfirm", { name }), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => removeFromCart(id),
      },
    ]);
  };

  return (
    <>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      <View style={[s.container, { backgroundColor: colors.bg }]}>
        {/* Header */}
        <View
          style={[
            s.header,
            {
              backgroundColor: colors.bgSurface,
              borderBottomColor: colors.divider,
            },
          ]}
        >
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: colors.text }]}>
            {t("cart.title")} ({totalItems})
          </Text>
          {items.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={s.clearBtn}>
              <Ionicons name="trash-outline" size={22} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>

        {items.length === 0 ? (
          /* Empty State */
          <View style={s.emptyWrap}>
            <View style={[s.emptyIcon, { backgroundColor: colors.primaryBg }]}>
              <Ionicons name="cart-outline" size={100} color={colors.divider} />
            </View>
            <Text style={[s.emptyTitle, { color: colors.text }]}>
              {t("cart.empty")}
            </Text>
            <Text style={[s.emptyText, { color: colors.textSecondary }]}>
              {t("cart.emptyHint")}
            </Text>
            <DSButton
              title={t("cart.continueShopping")}
              variant="primary"
              size="lg"
              onPress={() => router.push("/(tabs)")}
              style={{ minWidth: 200, marginTop: 16 }}
            />
          </View>
        ) : (
          <>
            <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
              {/* Shopee-style Free Shipping Progress */}
              {(() => {
                const FREE_SHIP_THRESHOLD = 300000;
                const progress = Math.min(totalPrice / FREE_SHIP_THRESHOLD, 1);
                const remaining = FREE_SHIP_THRESHOLD - totalPrice;
                return (
                  <View
                    style={[
                      s.freeShipBar,
                      {
                        backgroundColor: colors.bgSurface,
                        borderBottomColor: colors.divider,
                      },
                    ]}
                  >
                    <View style={s.freeShipRow}>
                      <Ionicons
                        name="car-outline"
                        size={18}
                        color={progress >= 1 ? colors.success : "#EE4D2D"}
                      />
                      <Text
                        style={[
                          s.freeShipText,
                          {
                            color: progress >= 1 ? colors.success : colors.text,
                          },
                        ]}
                      >
                        {progress >= 1
                          ? t("cart.freeShippingUnlocked")
                          : t("cart.freeShipRemaining", {
                              amount: `₫${formatPrice(remaining)}`,
                            })}
                      </Text>
                    </View>
                    <View
                      style={[
                        s.freeShipTrack,
                        { backgroundColor: colors.bgMuted },
                      ]}
                    >
                      <View
                        style={[
                          s.freeShipFill,
                          {
                            width: `${progress * 100}%` as any,
                            backgroundColor:
                              progress >= 1 ? colors.success : "#EE4D2D",
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })()}

              {items.map((item) => (
                <SwipeableCartItem
                  key={item.id}
                  item={item}
                  onRemove={() => handleRemove(item.id, item.product.name)}
                  onIncrement={() => increment(item.id)}
                  onDecrement={() => decrement(item.id)}
                  formatPrice={formatPrice}
                  deleteLabel={t("cart.swipeDelete")}
                />
              ))}

              {/* Summary */}
              <View
                style={[
                  s.summaryCard,
                  {
                    backgroundColor: colors.bgSurface,
                    borderRadius: radius.lg,
                    ...shadow.sm,
                  },
                ]}
              >
                <Text style={[s.summaryTitle, { color: colors.text }]}>
                  {t("cart.orderSummary")}
                </Text>

                <SummaryRow
                  label={t("cart.subtotal", { count: String(totalItems) })}
                  value={`₫${formatPrice(totalPrice)}`}
                  colors={colors}
                />
                <SummaryRow
                  label={t("cart.shipping")}
                  value={t("cart.freeShipping")}
                  valueColor={colors.success}
                  colors={colors}
                />

                {appliedVoucher && (
                  <SummaryRow
                    label="Voucher"
                    value={`-₫${formatPrice(appliedVoucher.discountAmount)}`}
                    valueColor={colors.primary}
                    icon="pricetag"
                    iconColor={colors.primary}
                    colors={colors}
                  />
                )}
                {appliedFreeshipVoucher && (
                  <SummaryRow
                    label="Free Ship"
                    value={`-₫${formatPrice(appliedFreeshipVoucher.discountAmount)}`}
                    valueColor={colors.info}
                    icon="car"
                    iconColor={colors.info}
                    colors={colors}
                  />
                )}

                <View
                  style={[s.divider, { backgroundColor: colors.divider }]}
                />

                <View style={s.summaryRow}>
                  <Text style={[s.totalLabel, { color: colors.text }]}>
                    {t("cart.total")}
                  </Text>
                  <Text style={[s.totalValue, { color: colors.primary }]}>
                    ₫{formatPrice(finalTotal)}
                  </Text>
                </View>

                {!appliedVoucher && totalPrice > 0 && (
                  <TouchableOpacity
                    style={[
                      s.voucherHint,
                      {
                        backgroundColor: colors.primaryBg,
                        borderRadius: radius.sm,
                      },
                    ]}
                    onPress={() => router.push("/profile/vouchers")}
                  >
                    <Ionicons
                      name="ticket-outline"
                      size={16}
                      color={colors.primary}
                    />
                    <Text
                      style={[s.voucherHintText, { color: colors.primary }]}
                    >
                      {t("cart.voucherHint")}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* Info Banner */}
              <View
                style={[
                  s.infoBanner,
                  {
                    backgroundColor: colors.primaryBg,
                    borderRadius: radius.md,
                  },
                ]}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[s.infoBannerText, { color: colors.primary }]}>
                  {t("cart.safePayment")}
                </Text>
              </View>

              <View style={{ height: 100 }} />
            </ScrollView>

            {/* Checkout Bar */}
            <View style={s.checkoutBar}>
              <LinearGradient
                colors={["rgba(255,255,255,0)", "rgba(255,255,255,1)"]}
                style={s.checkoutGradient}
              />
              <View
                style={[
                  s.checkoutContent,
                  { backgroundColor: colors.bgSurface, ...shadow.lg },
                ]}
              >
                <View style={s.totalSection}>
                  <Text style={[s.totalText, { color: colors.textSecondary }]}>
                    {t("cart.total")}
                  </Text>
                  <Text style={[s.totalPrice, { color: colors.primary }]}>
                    ₫{formatPrice(finalTotal)}
                  </Text>
                </View>
                <DSButton
                  title={t("cart.checkout", { count: String(totalItems) })}
                  variant="primary"
                  size="lg"
                  onPress={handleCheckout}
                  style={{ flex: 1.2 }}
                />
              </View>
            </View>
          </>
        )}
      </View>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SUMMARY ROW HELPER
// ═══════════════════════════════════════════════════════════════════════
function SummaryRow({
  label,
  value,
  valueColor,
  icon,
  iconColor,
  colors,
}: {
  label: string;
  value: string;
  valueColor?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  colors: any;
}) {
  return (
    <View style={s.summaryRow}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        {icon && (
          <Ionicons
            name={icon}
            size={14}
            color={iconColor || colors.textSecondary}
          />
        )}
        <Text
          style={[s.summaryLabel, { color: iconColor || colors.textSecondary }]}
        >
          {label}
        </Text>
      </View>
      <Text style={[s.summaryValue, { color: valueColor || colors.text }]}>
        {value}
      </Text>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "600", flex: 1, marginLeft: 12 },
  clearBtn: { padding: 4 },

  // Empty
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  emptyText: { fontSize: 15, textAlign: "center", marginBottom: 20 },

  // Content
  content: { flex: 1 },

  // Swipe
  swipeWrap: { overflow: "hidden" },
  deleteBg: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    width: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteAction: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  deleteText: { color: "#fff", fontSize: 12, fontWeight: "600", marginTop: 4 },

  // Cart Item
  cartItem: { flexDirection: "row", padding: 16, position: "relative" },
  itemImage: { width: 80, height: 80, overflow: "hidden" },
  itemInfo: { flex: 1, marginLeft: 16, justifyContent: "space-between" },
  itemName: {
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 20,
    marginBottom: 2,
  },
  variantRow: { flexDirection: "row", gap: 6, marginBottom: 4 },
  variantBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  variantText: { fontSize: 11, fontWeight: "500" },
  itemPrice: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  quantityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: {
    fontSize: 15,
    fontWeight: "600",
    minWidth: 32,
    textAlign: "center",
  },
  itemTotal: { fontSize: 15, fontWeight: "700" },

  // Summary
  summaryCard: { margin: 12, marginTop: 16, padding: 16 },
  summaryTitle: { fontSize: 15, fontWeight: "600", marginBottom: 16 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: "500" },
  totalLabel: { fontSize: 15, fontWeight: "600" },
  totalValue: { fontSize: 20, fontWeight: "700" },
  divider: { height: 1, marginVertical: 12 },

  // Voucher hint
  voucherHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  voucherHintText: { flex: 1, fontSize: 13, fontWeight: "500" },

  // Info banner
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 12,
    marginTop: 16,
    padding: 16,
    gap: 8,
  },
  infoBannerText: { fontSize: 14, fontWeight: "500" },

  // Checkout bar
  checkoutBar: { position: "absolute", bottom: 0, left: 0, right: 0 },
  checkoutGradient: {
    position: "absolute",
    top: -20,
    left: 0,
    right: 0,
    height: 20,
  },
  checkoutContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  totalSection: { flex: 1 },
  totalText: { fontSize: 12, marginBottom: 2 },
  totalPrice: { fontSize: 20, fontWeight: "700" },

  // Free shipping progress bar (Shopee-style)
  freeShipBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  freeShipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  freeShipText: { fontSize: 13, fontWeight: "500", flex: 1 },
  freeShipTrack: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  freeShipFill: {
    height: "100%",
    borderRadius: 2,
  },
});
