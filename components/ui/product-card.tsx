import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/layout';
import { Product } from '@/data/products';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

export function formatPrice(value: number) {
  try {
    return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
  } catch {
    return value + ' ₫';
  }
}

export function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart?: (p: Product) => void }) {
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const accent = useThemeColor({}, 'accent');
  const chipText = useThemeColor({}, 'chipText');
  const textMuted = useThemeColor({}, 'textMuted');
  const hasDiscount = typeof product.discountPercent === 'number' && product.discountPercent > 0;
  const finalPrice = hasDiscount
    ? Math.round(product.price * (1 - (product.discountPercent ?? 0) / 100))
    : product.price;
  return (
    <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
      <Link href={`/product/${product.id}` as any} asChild>
        <Pressable>
          <Image source={product.image} style={styles.image} contentFit="cover" />
          {hasDiscount && (
            <View style={[styles.discountBadge, { backgroundColor: accent }]}> 
              <ThemedText style={[styles.discountText, { color: chipText }]}>-{product.discountPercent}%</ThemedText>
            </View>
          )}
          {product.flashSale && (
            <View style={[styles.flashTag, { backgroundColor: accent }]}> 
              <ThemedText style={[styles.flashText, { color: chipText }]}>FLASH</ThemedText>
            </View>
          )}
        </Pressable>
      </Link>
      <ThemedText numberOfLines={2} style={styles.title}>{product.name}</ThemedText>
      <View style={styles.priceWrap}>
        {hasDiscount && (
          <ThemedText style={[styles.oldPrice, { color: textMuted }]}>{formatPrice(product.price)}</ThemedText>
        )}
        <ThemedText type="defaultSemiBold" style={styles.price}>{formatPrice(finalPrice)}</ThemedText>
      </View>
      <Pressable style={[styles.addBtn, { backgroundColor: accent }]} onPress={() => onAddToCart?.(product)}>
        <ThemedText style={{ color: chipText }}>Thêm vào giỏ</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    borderRadius: Radii.md,
    backgroundColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  image: { width: '100%', aspectRatio: 1, borderRadius: Radii.sm, marginBottom: 4 },
  title: { fontSize: 12, minHeight: 30 },
  priceWrap: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  oldPrice: { fontSize: 10, textDecorationLine: 'line-through' },
  price: { },
  addBtn: { marginTop: 6, paddingVertical: 6, borderRadius: Radii.sm, alignItems: 'center' },
  discountBadge: { position: 'absolute', top: 6, left: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  discountText: { fontSize: 10, fontWeight: '600' },
  flashTag: { position: 'absolute', top: 6, right: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  flashText: { fontSize: 10, fontWeight: '700' },
});
