import { Colors } from '@/constants/theme';
import { useCart } from '@/features/cart';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { IconSymbol } from './icon-symbol';

interface CartBadgeProps {
  href?: '/cart';
  size?: number;
}

export const CartBadge: React.FC<CartBadgeProps> = ({ href = '/cart', size = 24 }) => {
  const { totalQty } = useCart();
  const scheme = useColorScheme();
  const color = Colors[scheme ?? 'light'].tint;
  const danger = Colors[scheme ?? 'light'].danger;

  const content = (
    <View style={styles.container}>
      <IconSymbol name="cart.fill" size={size} color={color} />
      {totalQty > 0 && (
        <View style={[styles.badge, { backgroundColor: danger }]}> 
          <Text style={styles.badgeText}>{totalQty > 99 ? '99+' : totalQty}</Text>
        </View>
      )}
    </View>
  );

  return (
    <Link href={href} asChild>
      <Pressable accessibilityRole="button" hitSlop={8} style={styles.pressable}>
        {content}
      </Pressable>
    </Link>
  );
};

const styles = StyleSheet.create({
  pressable: { marginRight: 16 },
  container: { justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '600' },
});
