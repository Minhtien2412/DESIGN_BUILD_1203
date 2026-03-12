/**
 * Service Worker Item Component
 * Hiển thị thông tin một thợ dịch vụ
 * 
 * @author AI Assistant
 * @date 05/01/2026
 */

import type { ServiceWorker } from '@/services/api/homeMaintenanceApi';
import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface ServiceWorkerItemProps {
  worker: ServiceWorker;
  onPress: (worker: ServiceWorker) => void;
  onCall?: (worker: ServiceWorker) => void;
  onMessage?: (worker: ServiceWorker) => void;
  variant?: 'card' | 'list' | 'compact';
}

const ServiceWorkerItem = memo(function ServiceWorkerItemComponent({
  worker,
  onPress,
  onCall,
  onMessage,
  variant = 'card'
}: ServiceWorkerItemProps) {
  
  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={() => onPress(worker)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: worker.avatar }} style={styles.compactAvatar} />
        <View style={styles.compactInfo}>
          <Text style={styles.compactName} numberOfLines={1}>{worker.name}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#fbbf24" />
            <Text style={styles.compactRating}>{worker.rating}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'list') {
    return (
      <TouchableOpacity
        style={styles.listContainer}
        onPress={() => onPress(worker)}
        activeOpacity={0.8}
      >
        <Image source={{ uri: worker.avatar }} style={styles.listAvatar} />
        
        <View style={styles.listInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.listName}>{worker.name}</Text>
            {worker.isVerified && (
              <Ionicons name="checkmark-circle" size={16} color="#1877F2" />
            )}
          </View>
          <Text style={styles.listSpecialty} numberOfLines={1}>{worker.specialty}</Text>
          <View style={styles.statsRow}>
            <Ionicons name="star" size={14} color="#fbbf24" />
            <Text style={styles.statText}>{worker.rating}</Text>
            <Text style={styles.statDivider}>•</Text>
            <Text style={styles.statText}>{worker.reviews} đánh giá</Text>
          </View>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </TouchableOpacity>
    );
  }

  // Card variant (default)
  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => onPress(worker)}
      activeOpacity={0.85}
    >
      {/* Avatar section */}
      <View style={styles.avatarSection}>
        <Image source={{ uri: worker.avatar }} style={styles.cardAvatar} />
        {worker.isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#1877F2" />
          </View>
        )}
      </View>
      
      {/* Info section */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>{worker.name}</Text>
        <Text style={styles.cardSpecialty} numberOfLines={2}>{worker.specialty}</Text>
        
        {/* Rating */}
        <View style={styles.ratingContainer}>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= Math.floor(worker.rating) ? 'star' : 'star-outline'}
                size={14}
                color="#fbbf24"
              />
            ))}
          </View>
          <Text style={styles.ratingText}>
            {worker.rating} ({worker.reviews})
          </Text>
        </View>
        
        {/* Price range */}
        {worker.price && (
          <Text style={styles.priceText}>
            {worker.price.min.toLocaleString('vi-VN')}đ - {worker.price.max.toLocaleString('vi-VN')}đ/{worker.price.unit}
          </Text>
        )}
      </View>
      
      {/* Action buttons */}
      <View style={styles.cardActions}>
        {onCall && (
          <TouchableOpacity
            style={[styles.actionButton, styles.callButton]}
            onPress={() => onCall(worker)}
          >
            <Ionicons name="call" size={18} color="#fff" />
          </TouchableOpacity>
        )}
        {onMessage && (
          <TouchableOpacity
            style={[styles.actionButton, styles.messageButton]}
            onPress={() => onMessage(worker)}
          >
            <Ionicons name="chatbubble" size={18} color="#1877F2" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  // Card variant
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarSection: {
    position: 'relative',
    marginRight: 12,
  },
  cardAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f3f4f6',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  cardSpecialty: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  starsRow: {
    flexDirection: 'row',
    marginRight: 6,
  },
  ratingText: {
    fontSize: 12,
    color: '#6b7280',
  },
  priceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1877F2',
  },
  cardActions: {
    justifyContent: 'flex-start',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButton: {
    backgroundColor: '#22c55e',
  },
  messageButton: {
    backgroundColor: '#e7f3ff',
  },
  
  // List variant
  listContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  listAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f3f4f6',
    marginRight: 12,
  },
  listInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  listName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  listSpecialty: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  statDivider: {
    fontSize: 12,
    color: '#d1d5db',
    marginHorizontal: 6,
  },
  
  // Compact variant
  compactContainer: {
    alignItems: 'center',
    width: 80,
    marginHorizontal: 8,
  },
  compactAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f3f4f6',
    marginBottom: 6,
  },
  compactInfo: {
    alignItems: 'center',
  },
  compactName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactRating: {
    fontSize: 11,
    color: '#6b7280',
    marginLeft: 2,
  },
});

export default ServiceWorkerItem;
