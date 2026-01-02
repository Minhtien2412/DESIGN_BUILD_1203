/**
 * Cart Screen - Modern Design
 * Updated: 13/12/2025
 * 
 * Features:
 * - Nordic Green theme
 * - Modern item cards with images
 * - Smooth quantity controls
 * - Checkout summary
 * - Empty state illustration
 */

import ModernButton from '@/components/ui/modern-button';
import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
    MODERN_TYPOGRAPHY,
} from '@/constants/modern-theme';
import { useCart } from '@/context/cart-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
    Alert,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CartScreen() {
  const { items, totalPrice, totalItems, updateQuantity, removeFromCart, clearCart } = useCart();
  
  // Alias for template compatibility
  const totalQty = totalItems;
  const increment = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) updateQuantity(id, item.quantity + 1);
  };
  const decrement = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item && item.quantity > 1) updateQuantity(id, item.quantity - 1);
  };
  const remove = (id: string) => removeFromCart(id);
  const clear = () => clearCart();

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN');
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Vui lòng thêm sản phẩm vào giỏ hàng');
      return;
    }
    router.push('/checkout');
  };

  const handleClearCart = () => {
    Alert.alert(
      'Xóa giỏ hàng',
      'Bạn có chắc muốn xóa tất cả sản phẩm?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: clear },
      ]
    );
  };

  const handleRemoveItem = (id: string, name: string) => {
    Alert.alert(
      'Xóa sản phẩm',
      `Bạn muốn xóa "${name}" khỏi giỏ hàng?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: () => remove(id) },
      ]
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={MODERN_COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Giỏ hàng ({totalQty})</Text>
          {items.length > 0 && (
            <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
              <Ionicons name="trash-outline" size={22} color={MODERN_COLORS.error} />
            </TouchableOpacity>
          )}
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="cart-outline" size={100} color={MODERN_COLORS.divider} />
            </View>
            <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
            <Text style={styles.emptyText}>Hãy thêm sản phẩm vào giỏ hàng của bạn</Text>
            <ModernButton
              variant="primary"
              size="large"
              onPress={() => router.push('/(tabs)')}
              icon="storefront-outline"
              iconPosition="left"
              style={styles.shopButton}
            >
              Tiếp tục mua sắm
            </ModernButton>
          </View>
        ) : (
          <>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {items.map((item) => (
                <View key={item.id} style={styles.cartItem}>
                  {/* Product Image */}
                  <View style={styles.itemImageContainer}>
                    <Image
                      source={typeof item.product.image === 'string' ? { uri: item.product.image } : item.product.image}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />
                  </View>

                  {/* Product Info */}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.product.name}
                    </Text>
                    <Text style={styles.itemPrice}>₫{formatPrice(item.product.price)}</Text>

                    {/* Quantity Controls */}
                    <View style={styles.quantityRow}>
                      <View style={styles.quantityControls}>
                        <TouchableOpacity
                          style={[styles.quantityButton, item.quantity <= 1 && styles.quantityButtonDisabled]}
                          onPress={() => decrement(item.id)}
                          disabled={item.quantity <= 1}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name="remove"
                            size={18}
                            color={item.quantity <= 1 ? MODERN_COLORS.textDisabled : MODERN_COLORS.text}
                          />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => increment(item.id)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="add" size={18} color={MODERN_COLORS.text} />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.itemTotal}>
                        ₫{formatPrice(item.product.price * item.quantity)}
                      </Text>
                    </View>
                  </View>

                  {/* Remove Button */}
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveItem(item.id, item.product.name)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle" size={24} color={MODERN_COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Summary Card */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Tổng quan đơn hàng</Text>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tạm tính ({totalQty} sản phẩm)</Text>
                  <Text style={styles.summaryValue}>₫{formatPrice(totalPrice)}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
                  <Text style={styles.freeShipping}>Miễn phí</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Tổng cộng</Text>
                  <Text style={styles.totalValue}>₫{formatPrice(totalPrice)}</Text>
                </View>
              </View>

              {/* Info Banner */}
              <View style={styles.infoBanner}>
                <Ionicons name="shield-checkmark-outline" size={20} color={MODERN_COLORS.primary} />
                <Text style={styles.infoBannerText}>
                  Thanh toán an toàn • Giao hàng nhanh chóng
                </Text>
              </View>

              <View style={{ height: 100 }} />
            </ScrollView>

            {/* Checkout Bar */}
            <View style={styles.checkoutBar}>
              <LinearGradient
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
                style={styles.checkoutGradient}
              />
              <View style={styles.checkoutContent}>
                <View style={styles.totalSection}>
                  <Text style={styles.totalText}>Tổng cộng</Text>
                  <Text style={styles.totalPrice}>₫{formatPrice(totalPrice)}</Text>
                </View>
                <ModernButton
                  variant="primary"
                  size="large"
                  onPress={handleCheckout}
                  icon="arrow-forward"
                  iconPosition="right"
                  style={styles.checkoutButton}
                >
                  {`Thanh toán (${totalQty})`}
                </ModernButton>
              </View>
            </View>
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MODERN_COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: MODERN_SPACING.md,
    paddingTop: 44,
    paddingBottom: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.divider,
  },
  backButton: { padding: MODERN_SPACING.xs },
  headerTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.lg,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
    flex: 1,
    marginLeft: MODERN_SPACING.sm,
  },
  clearButton: { padding: MODERN_SPACING.xs },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: MODERN_SPACING.xl,
  },
  emptyIconContainer: {
    width: 140,
    height: 140,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: `${MODERN_COLORS.primary}05`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: MODERN_SPACING.lg,
  },
  emptyTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xl,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.xs,
  },
  emptyText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.textSecondary,
    marginBottom: MODERN_SPACING.xl,
    textAlign: 'center',
  },
  shopButton: { minWidth: 200 },
  content: { flex: 1 },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: MODERN_COLORS.surface,
    padding: MODERN_SPACING.md,
    marginHorizontal: MODERN_SPACING.sm,
    marginTop: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.lg,
    ...MODERN_SHADOWS.sm,
    position: 'relative',
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: MODERN_COLORS.background,
    overflow: 'hidden',
  },
  itemImage: { width: '100%', height: '100%' },
  itemInfo: {
    flex: 1,
    marginLeft: MODERN_SPACING.md,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
    color: MODERN_COLORS.text,
    lineHeight: MODERN_TYPOGRAPHY.lineHeight.tight,
    marginBottom: MODERN_SPACING.xxs,
  },
  itemPrice: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.lg,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.primary,
    marginBottom: MODERN_SPACING.xs,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.md,
    borderWidth: 1,
    borderColor: MODERN_COLORS.divider,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: { opacity: 0.4 },
  quantityText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
    minWidth: 32,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.text,
  },
  removeButton: {
    position: 'absolute',
    top: MODERN_SPACING.sm,
    right: MODERN_SPACING.sm,
    padding: MODERN_SPACING.xxs,
  },
  summaryCard: {
    backgroundColor: MODERN_COLORS.surface,
    margin: MODERN_SPACING.sm,
    marginTop: MODERN_SPACING.md,
    padding: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.lg,
    ...MODERN_SHADOWS.sm,
  },
  summaryTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: MODERN_SPACING.sm,
  },
  summaryLabel: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
    color: MODERN_COLORS.text,
  },
  freeShipping: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
    color: MODERN_COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: MODERN_COLORS.divider,
    marginVertical: MODERN_SPACING.sm,
  },
  totalLabel: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
  },
  totalValue: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xl,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.primary,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${MODERN_COLORS.primary}10`,
    marginHorizontal: MODERN_SPACING.sm,
    marginTop: MODERN_SPACING.md,
    padding: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.md,
    gap: MODERN_SPACING.sm,
  },
  infoBannerText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.primary,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  checkoutGradient: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    height: 20,
  },
  checkoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MODERN_SPACING.md,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.surface,
    ...MODERN_SHADOWS.lg,
  },
  totalSection: { flex: 1 },
  totalText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    color: MODERN_COLORS.textSecondary,
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xl,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.primary,
  },
  checkoutButton: { flex: 1.2 },
});
