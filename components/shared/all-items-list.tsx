/**
 * All Items List Component
 * Component tái sử dụng để hiển thị danh sách tất cả items
 * Được dùng cho các trang "Xem tất cả"
 */

import { Ionicons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import { memo } from 'react';
import {
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

const COLORS = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  accent: '#2563EB',
  border: '#E2E8F0',
};

export interface ListItem {
  id: string | number;
  label: string;
  icon?: any; // Ionicons name or emoji
  route: string;
  color?: string;
  description?: string;
}

interface AllItemsListProps {
  title: string;
  subtitle?: string;
  items: ListItem[];
  columns?: 2 | 3 | 4;
  onItemPress?: (item: ListItem) => void;
}

const ItemCard = memo<{ 
  item: ListItem; 
  columns: number;
  onPress: () => void;
}>(({ item, columns, onPress }) => {
  const cardWidth = (width - 48 - (columns - 1) * 12) / columns;
  
  return (
    <TouchableOpacity
      style={[styles.itemCard, { width: cardWidth }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: (item.color || COLORS.accent) + '15' }]}>
        {typeof item.icon === 'string' && item.icon.length <= 2 ? (
          <Text style={styles.emoji}>{item.icon}</Text>
        ) : (
          <Ionicons 
            name={item.icon || 'cube-outline'} 
            size={24} 
            color={item.color || COLORS.accent} 
          />
        )}
      </View>
      <Text style={styles.itemLabel} numberOfLines={2}>
        {item.label}
      </Text>
      {item.description && (
        <Text style={styles.itemDesc} numberOfLines={1}>
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );
});
ItemCard.displayName = 'ItemCard';

export function AllItemsList({
  title,
  subtitle,
  items,
  columns = 3,
  onItemPress,
}: AllItemsListProps) {
  
  const handleItemPress = (item: ListItem) => {
    if (onItemPress) {
      onItemPress(item);
    } else {
      router.push(item.route as Href);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Items Grid */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              columns={columns}
              onPress={() => handleItemPress(item)}
            />
          ))}
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Tổng cộng: {items.length} mục
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  itemCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 24,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 18,
  },
  itemDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
});
