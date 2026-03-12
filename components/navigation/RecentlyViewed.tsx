import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface RecentItem {
  id: string;
  label: string;
  route: string;
  icon: string;
  timestamp: number;
}

const STORAGE_KEY = '@recently_viewed';
const MAX_ITEMS = 5;

export const RecentlyViewed: React.FC = () => {
  const router = useRouter();
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    loadRecentItems();
  }, []);

  const loadRecentItems = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored);
        setRecentItems(items.slice(0, MAX_ITEMS));
      }
    } catch (error) {
      console.error('Failed to load recent items:', error);
    }
  };

  const handleItemPress = (route: string) => {
    router.push(route as any);
  };

  const handleRemoveItem = useCallback(async (id: string) => {
    const filtered = recentItems.filter(item => item.id !== id);
    setRecentItems(filtered);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  }, [recentItems]);

  if (recentItems.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gần đây</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {recentItems.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => handleItemPress(item.route)}
            style={styles.itemCard}
          >
            <View style={styles.itemContent}>
              <Ionicons name={item.icon as any} size={20} color="#4A90E2" />
              <Text style={styles.itemLabel} numberOfLines={2}>
                {item.label}
              </Text>
            </View>
            <Pressable
              onPress={() => handleRemoveItem(item.id)}
              style={styles.removeButton}
              hitSlop={8}
            >
              <Ionicons name="close-circle" size={16} color="#999" />
            </Pressable>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 10,
  },
  itemCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  itemLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});

// Helper function to add item to recent list (export for use in screens)
export const addToRecentlyViewed = async (item: Omit<RecentItem, 'timestamp'>) => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const items: RecentItem[] = stored ? JSON.parse(stored) : [];
    
    // Remove if already exists
    const filtered = items.filter(i => i.id !== item.id);
    
    // Add to front with timestamp
    const newItems = [{ ...item, timestamp: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
  } catch (error) {
    console.error('Failed to add recent item:', error);
  }
};
