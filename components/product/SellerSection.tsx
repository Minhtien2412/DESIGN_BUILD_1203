/**
 * Seller Section Component - Shopee Style
 * Hiển thị thông tin người bán/công ty
 */

import { ThemedText } from '@/components/themed-text';
import type { Seller } from '@/data/products';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

interface SellerSectionProps {
  seller: Seller;
  soldCount?: number;
  location?: string;
}

export function SellerSection({ seller, soldCount, location }: SellerSectionProps) {
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');
  const textMuted = useThemeColor({}, 'textMuted');
  const text = useThemeColor({}, 'text');

  const handleCall = () => {
    if (seller.phone) {
      Linking.openURL(`tel:${seller.phone}`);
    }
  };

  const handleChat = () => {
    // TODO: Navigate to chat screen
    console.log('Open chat with seller:', seller.id);
  };

  const handleViewShop = () => {
    // TODO: Navigate to seller profile
    console.log('View shop:', seller.id);
  };

  return (
    <View style={[styles.container, { backgroundColor: surface, borderColor: border }]}>
      {/* Seller Header */}
      <Pressable style={styles.header} onPress={handleViewShop}>
        <View style={styles.sellerInfo}>
          {seller.logo && (
            <Image 
              source={seller.logo} 
              style={styles.logo}
              contentFit="cover"
            />
          )}
          <View style={styles.sellerDetails}>
            <View style={styles.nameRow}>
              <ThemedText style={[styles.sellerName, { color: text }]} numberOfLines={1}>
                {seller.name}
              </ThemedText>
              {seller.verified && (
                <Ionicons name="checkmark-circle" size={16} color="#0D9488" />
              )}
            </View>
            <ThemedText style={[styles.sellerType, { color: textMuted }]}>
              {seller.type === 'company' ? 'Công ty' : 'Cá nhân'}
              {seller.yearsInBusiness && ` • ${seller.yearsInBusiness} năm kinh nghiệm`}
            </ThemedText>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={textMuted} />
      </Pressable>

      {/* Stats */}
      <View style={styles.statsRow}>
        {seller.rating && (
          <View style={styles.stat}>
            <Ionicons name="star" size={14} color="#FFB800" />
            <ThemedText style={[styles.statValue, { color: text }]}>
              {seller.rating.toFixed(1)}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: textMuted }]}>
              Đánh giá
            </ThemedText>
          </View>
        )}
        
        {soldCount !== undefined && (
          <View style={styles.stat}>
            <Ionicons name="cube-outline" size={14} color={primary} />
            <ThemedText style={[styles.statValue, { color: text }]}>
              {soldCount}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: textMuted }]}>
              Đã bán
            </ThemedText>
          </View>
        )}
        
        {location && (
          <View style={styles.stat}>
            <Ionicons name="location-outline" size={14} color={primary} />
            <ThemedText style={[styles.statValue, { color: text }]} numberOfLines={1}>
              {location}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {seller.phone && (
          <Pressable 
            style={[styles.actionBtn, { borderColor: border }]}
            onPress={handleCall}
            android_ripple={{ color: 'rgba(10,104,71,0.1)' }}
          >
            <Ionicons name="call-outline" size={18} color={primary} />
            <ThemedText style={[styles.actionText, { color: primary }]}>
              Gọi điện
            </ThemedText>
          </Pressable>
        )}
        
        <Pressable 
          style={[styles.actionBtn, styles.chatBtn, { backgroundColor: primary }]}
          onPress={handleChat}
          android_ripple={{ color: 'rgba(255,255,255,0.3)' }}
        >
          <Ionicons name="chatbubble-outline" size={18} color="#FFF" />
          <ThemedText style={[styles.actionText, { color: '#FFF' }]}>
            Chat ngay
          </ThemedText>
        </Pressable>
      </View>

      {/* Description */}
      {seller.description && (
        <View style={styles.description}>
          <ThemedText style={[styles.descText, { color: textMuted }]}>
            {seller.description}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F0F0',
  },
  sellerDetails: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '700',
  },
  sellerType: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: '#FFF',
  },
  chatBtn: {
    borderWidth: 0,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  description: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  descText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
