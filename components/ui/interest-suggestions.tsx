/**
 * Interest Suggestions Section
 * Gợi ý sản phẩm/dịch vụ có thể quan tâm (dựa trên lịch sử)
 */

import { getInterests, InterestItem } from '@/services/recent-activity';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface InterestSuggestionsProps {
  maxItems?: number;
  showHeader?: boolean;
}

export function InterestSuggestions({
  maxItems = 10,
  showHeader = true,
}: InterestSuggestionsProps) {
  const [interests, setInterests] = useState<InterestItem[]>([]);

  useEffect(() => {
    loadInterests();
  }, []);

  const loadInterests = async () => {
    const items = await getInterests(maxItems);
    setInterests(items);
  };

  if (interests.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name="heart-outline" size={18} color="#0D9488" />
            <Text style={styles.title}>Có thể bạn quan tâm</Text>
          </View>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {interests.map((item) => (
          <TouchableOpacity
            key={`${item.type}-${item.id}`}
            style={styles.interestCard}
            activeOpacity={0.8}
            onPress={() => {
              // Navigate based on type
              if (item.type === 'service') {
                // router.push(item.route);
              }
            }}
          >
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                style={styles.itemImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.itemIconPlaceholder}>
                <Ionicons
                  name={
                    item.type === 'service'
                      ? 'construct'
                      : item.type === 'contractor'
                      ? 'people'
                      : 'cube'
                  }
                  size={32}
                  color="#999"
                />
              </View>
            )}

            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.name}
              </Text>
              <View style={styles.interactionBadge}>
                <Ionicons name="eye" size={12} color="#999" />
                <Text style={styles.interactionText}>{item.interactions}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderTopWidth: 8,
    borderTopColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 10,
  },
  interestCard: {
    width: 120,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  itemImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f5f5f5',
  },
  itemIconPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    padding: 8,
  },
  itemName: {
    fontSize: 12,
    color: '#1a1a1a',
    marginBottom: 6,
    height: 32,
  },
  interactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  interactionText: {
    fontSize: 11,
    color: '#999',
  },
});
