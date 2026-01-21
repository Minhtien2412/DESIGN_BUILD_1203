import { useThemeColor } from '@/hooks/use-theme-color';
import { Dimensions, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');

/**
 * Skeleton Placeholder Component
 * Simple animated placeholder for loading states
 */
interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonProps) {
  const borderColor = useThemeColor('border');
  
  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: borderColor,
        },
        style,
      ]}
    />
  );
}

/**
 * Product Card Skeleton
 * Used in product listings
 */
export function ProductCardSkeleton() {
  const cardColor = useThemeColor('card');
  const borderColor = useThemeColor('border');
  
  return (
    <View style={[styles.productCard, { backgroundColor: cardColor, borderColor: borderColor }]}>
      {/* Image skeleton */}
      <Skeleton width="100%" height={180} borderRadius={12} style={{ marginBottom: 12 }} />
      
      {/* Title skeleton */}
      <Skeleton width="80%" height={16} style={{ marginBottom: 8 }} />
      
      {/* Price skeleton */}
      <View style={styles.row}>
        <Skeleton width="40%" height={18} />
        <Skeleton width={60} height={24} borderRadius={12} />
      </View>
      
      {/* Rating skeleton */}
      <View style={[styles.row, { marginTop: 8 }]}>
        <Skeleton width={80} height={14} />
        <Skeleton width={60} height={14} />
      </View>
    </View>
  );
}

/**
 * Project Card Skeleton
 * Used in project listings
 */
export function ProjectCardSkeleton() {
  const cardColor = useThemeColor('card');
  const borderColor = useThemeColor('border');
  
  return (
    <View style={[styles.projectCard, { backgroundColor: cardColor, borderColor: borderColor }]}>
      <View style={styles.row}>
        {/* Icon skeleton */}
        <Skeleton width={48} height={48} borderRadius={12} />
        
        {/* Text skeleton */}
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Skeleton width="70%" height={16} style={{ marginBottom: 8 }} />
          <Skeleton width="50%" height={14} />
        </View>
      </View>
      
      {/* Progress bar skeleton */}
      <Skeleton width="100%" height={8} borderRadius={4} style={{ marginTop: 16 }} />
      
      {/* Stats skeleton */}
      <View style={[styles.row, { marginTop: 12, justifyContent: 'space-between' }]}>
        <Skeleton width={80} height={14} />
        <Skeleton width={80} height={14} />
        <Skeleton width={80} height={14} />
      </View>
    </View>
  );
}

/**
 * List Item Skeleton
 * Generic list item with icon and text
 */
export function ListItemSkeleton() {
  const cardColor = useThemeColor('card');
  const borderColor = useThemeColor('border');
  
  return (
    <View style={[styles.listItem, { backgroundColor: cardColor, borderColor: borderColor }]}>
      <Skeleton width={40} height={40} borderRadius={20} />
      
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Skeleton width="60%" height={14} style={{ marginBottom: 6 }} />
        <Skeleton width="40%" height={12} />
      </View>
      
      <Skeleton width={24} height={24} borderRadius={4} />
    </View>
  );
}

/**
 * Cart Item Skeleton
 * Used in cart screen
 */
export function CartItemSkeleton() {
  const cardColor = useThemeColor('card');
  const borderColor = useThemeColor('border');
  
  return (
    <View style={[styles.cartItem, { backgroundColor: cardColor, borderColor: borderColor }]}>
      {/* Image */}
      <Skeleton width={80} height={80} borderRadius={8} />
      
      {/* Details */}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Skeleton width="80%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="50%" height={14} style={{ marginBottom: 12 }} />
        
        {/* Price and quantity */}
        <View style={styles.row}>
          <Skeleton width={60} height={18} />
          <Skeleton width={80} height={28} borderRadius={8} />
        </View>
      </View>
    </View>
  );
}

/**
 * Profile Header Skeleton
 * Used in profile screen
 */
export function ProfileHeaderSkeleton() {
  const cardColor = useThemeColor('card');
  
  return (
    <View style={[styles.profileHeader, { backgroundColor: cardColor }]}>
      {/* Avatar */}
      <Skeleton width={80} height={80} borderRadius={40} style={{ marginBottom: 12 }} />
      
      {/* Name */}
      <Skeleton width={150} height={20} style={{ marginBottom: 8 }} />
      
      {/* Email */}
      <Skeleton width={120} height={14} />
      
      {/* Stats */}
      <View style={[styles.row, { marginTop: 20, gap: 20 }]}>
        <View style={{ alignItems: 'center' }}>
          <Skeleton width={40} height={24} style={{ marginBottom: 4 }} />
          <Skeleton width={60} height={12} />
        </View>
        <View style={{ alignItems: 'center' }}>
          <Skeleton width={40} height={24} style={{ marginBottom: 4 }} />
          <Skeleton width={60} height={12} />
        </View>
        <View style={{ alignItems: 'center' }}>
          <Skeleton width={40} height={24} style={{ marginBottom: 4 }} />
          <Skeleton width={60} height={12} />
        </View>
      </View>
    </View>
  );
}

/**
 * Notification Item Skeleton
 */
export function NotificationSkeleton() {
  const cardColor = useThemeColor('card');
  const borderColor = useThemeColor('border');
  
  return (
    <View style={[styles.notificationItem, { backgroundColor: cardColor, borderColor: borderColor }]}>
      <Skeleton width={40} height={40} borderRadius={20} />
      
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Skeleton width="90%" height={14} style={{ marginBottom: 6 }} />
        <Skeleton width="70%" height={12} style={{ marginBottom: 6 }} />
        <Skeleton width="30%" height={10} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  projectCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
});
