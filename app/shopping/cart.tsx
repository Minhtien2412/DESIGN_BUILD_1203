import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Card, CardContent } from '../../components/ui';
import { Shadows } from '../../constants/shadows';
import { Layout, SpacingSemantic } from '../../constants/spacing';
import { TextVariants } from '../../constants/typography';
import { useCart } from '../../context/cart-context';
import { useThemeColor } from '../../hooks/use-theme-color';

// ============================================
// SHOPPING CART SCREEN
// ============================================

export default function CartScreen() {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');
  const surface = useThemeColor({}, 'surface');

  const handleCheckout = () => {
    router.push('/checkout' as any);
  };

  if (items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: background }]}>
        <Stack.Screen options={{ title: 'Shopping Cart', headerBackTitle: 'Back' }} />
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={100} color={textMuted} />
          <Text style={[TextVariants.h2, { color: text, marginTop: SpacingSemantic.lg }]}>
            Your cart is empty
          </Text>
          <Text style={[TextVariants.body2, { color: textMuted, marginTop: SpacingSemantic.sm, textAlign: 'center' }]}>
            Add some products to get started
          </Text>
          <Button
            title="Browse Products"
            onPress={() => router.push('/shopping' as any)}
            style={{ marginTop: SpacingSemantic['2xl'] }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <Stack.Screen options={{ 
        title: `Cart (${totalItems})`,
        headerBackTitle: 'Back',
        headerRight: () => (
          <Pressable onPress={clearCart}>
            <Text style={[TextVariants.caption, { color: primary }]}>Clear All</Text>
          </Pressable>
        ),
      }} />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: Layout.containerPadding.horizontal }}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: SpacingSemantic.md }}>
            <CardContent style={styles.cartItem}>
              <Image source={{ uri: item.product.image }} style={styles.productImage} />
              
              <View style={styles.itemDetails}>
                <Text style={[TextVariants.body1, { color: text, fontWeight: '600' }]} numberOfLines={2}>
                  {item.product.name}
                </Text>
                <Text style={[TextVariants.caption, { color: textMuted, marginTop: 4 }]}>
                  {item.product.category}
                </Text>
                {item.selectedSize && (
                  <Text style={[TextVariants.caption, { color: textMuted }]}>
                    Size: {item.selectedSize}
                  </Text>
                )}
                {item.selectedColor && (
                  <Text style={[TextVariants.caption, { color: textMuted }]}>
                    Color: {item.selectedColor}
                  </Text>
                )}
                <Text style={[TextVariants.h4, { color: primary, marginTop: 8 }]}>
                  {item.product.price.toLocaleString('vi-VN')} đ
                </Text>
              </View>

              <View style={styles.quantityControls}>
                <Pressable
                  onPress={() => updateQuantity(item.id, item.quantity - 1)}
                  style={[styles.quantityButton, { borderColor: border }]}
                  disabled={item.quantity <= 1}
                >
                  <Ionicons name="remove" size={16} color={item.quantity <= 1 ? textMuted : text} />
                </Pressable>
                
                <Text style={[TextVariants.body1, { color: text, fontWeight: '600', marginHorizontal: 12 }]}>
                  {item.quantity}
                </Text>
                
                <Pressable
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                  style={[styles.quantityButton, { borderColor: border }]}
                >
                  <Ionicons name="add" size={16} color={text} />
                </Pressable>
              </View>

              <Pressable
                onPress={() => removeFromCart(item.id)}
                style={styles.removeButton}
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </Pressable>
            </CardContent>
          </Card>
        )}
      />

      {/* Summary Footer */}
      <View style={[styles.summaryFooter, { backgroundColor: surface, borderTopColor: border }]}>
        <View style={styles.summaryRow}>
          <Text style={[TextVariants.body2, { color: textMuted }]}>Subtotal</Text>
          <Text style={[TextVariants.body1, { color: text, fontWeight: '600' }]}>
            {totalPrice.toLocaleString('vi-VN')} đ
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={[TextVariants.body2, { color: textMuted }]}>Shipping</Text>
          <Text style={[TextVariants.body1, { color: text, fontWeight: '600' }]}>Free</Text>
        </View>
        
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={[TextVariants.h3, { color: text }]}>Total</Text>
          <Text style={[TextVariants.h3, { color: primary }]}>
            {totalPrice.toLocaleString('vi-VN')} đ
          </Text>
        </View>

        <Button
          title={`Proceed to Checkout (${totalItems} items)`}
          onPress={handleCheckout}
          style={{ marginTop: SpacingSemantic.lg }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.containerPadding.horizontal,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: SpacingSemantic.md,
  },
  itemDetails: {
    flex: 1,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SpacingSemantic.sm,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    marginLeft: SpacingSemantic.sm,
    padding: 8,
  },
  summaryFooter: {
    padding: Layout.containerPadding.horizontal,
    borderTopWidth: 1,
    ...Shadows.card,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SpacingSemantic.sm,
  },
  totalRow: {
    marginTop: SpacingSemantic.md,
    paddingTop: SpacingSemantic.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
});
