import { Product } from '@/data/products';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ProductCard } from './product-card';

export function ProductGrid({ products, onAddToCart }: { products: Product[]; onAddToCart?: (p: Product) => void }) {
  return (
    <View style={styles.wrap}>
      {products.map(p => (
        <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
