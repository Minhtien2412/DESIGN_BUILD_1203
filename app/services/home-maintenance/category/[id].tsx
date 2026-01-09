/**
 * Category Detail Screen
 * Chi tiết danh mục dịch vụ bảo trì nhà
 */

import { ServiceWorkerItem } from '@/components/home-maintenance';
import {
    SERVICE_CATEGORIES,
    SERVICE_WORKERS,
    ServiceWorker
} from '@/services/api/homeMaintenanceApi';
import { mediumImpact } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    FlatList,
    Linking,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'price'>('rating');
  
  // Find category
  const category = useMemo(() => 
    SERVICE_CATEGORIES.find(c => c.id === id), [id]
  );
  
  // Get workers for this category (mock: return all for demo)
  const workers = useMemo(() => {
    let sorted = [...SERVICE_WORKERS];
    
    switch (sortBy) {
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        sorted.sort((a, b) => b.reviews - a.reviews);
        break;
      case 'price':
        sorted.sort((a, b) => (a.price?.min || 0) - (b.price?.min || 0));
        break;
    }
    
    return sorted;
  }, [sortBy]);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };
  
  const handleWorkerPress = (worker: ServiceWorker) => {
    mediumImpact();
    router.push(`/services/home-maintenance/worker/${worker.id}` as any);
  };
  
  const handleWorkerCall = (worker: ServiceWorker) => {
    mediumImpact();
    if (worker.phone) {
      Linking.openURL(`tel:${worker.phone}`);
    }
  };
  
  const handleWorkerMessage = (worker: ServiceWorker) => {
    mediumImpact();
    router.push(`/messages/${worker.id}`);
  };
  
  const renderSortButton = (key: 'rating' | 'reviews' | 'price', label: string) => (
    <TouchableOpacity
      style={[styles.sortButton, sortBy === key && styles.sortButtonActive]}
      onPress={() => setSortBy(key)}
    >
      <Text style={[styles.sortButtonText, sortBy === key && styles.sortButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
  
  const renderWorker = ({ item }: { item: ServiceWorker }) => (
    <ServiceWorkerItem
      worker={item}
      variant="card"
      onPress={handleWorkerPress}
      onCall={handleWorkerCall}
      onMessage={handleWorkerMessage}
    />
  );
  
  const renderHeader = () => (
    <View style={styles.listHeader}>
      {/* Category Info */}
      <View style={styles.categoryInfo}>
        <View 
          style={[
            styles.categoryIcon, 
            { backgroundColor: category?.color || '#1877F2' }
          ]}
        >
          <Ionicons 
            name={(category?.iconName || 'construct-outline') as any} 
            size={32} 
            color="#fff" 
          />
        </View>
        <View style={styles.categoryText}>
          <Text style={styles.categoryName}>
            {category?.name?.replace('\n', ' ') || 'Danh mục'}
          </Text>
          <Text style={styles.categoryDescription}>
            {category?.description || ''}
          </Text>
        </View>
      </View>
      
      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sắp xếp theo:</Text>
        <View style={styles.sortButtons}>
          {renderSortButton('rating', 'Đánh giá')}
          {renderSortButton('reviews', 'Phổ biến')}
          {renderSortButton('price', 'Giá')}
        </View>
      </View>
      
      {/* Results count */}
      <Text style={styles.resultsCount}>
        {workers.length} thợ có thể phục vụ
      </Text>
    </View>
  );
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1c1e21" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {category?.name?.replace('\n', ' ') || 'Dịch vụ'}
        </Text>
        <TouchableOpacity>
          <Ionicons name="filter-outline" size={24} color="#1c1e21" />
        </TouchableOpacity>
      </View>
      
      {/* Workers List */}
      <FlatList
        data={workers}
        renderItem={renderWorker}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1c1e21',
  },
  listContent: {
    paddingBottom: 20,
  },
  listHeader: {
    paddingBottom: 8,
  },
  
  // Category Info
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryText: {
    flex: 1,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1e21',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#65676b',
  },
  
  // Sort
  sortContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  sortLabel: {
    fontSize: 13,
    color: '#65676b',
    marginBottom: 8,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
  },
  sortButtonActive: {
    backgroundColor: '#e7f3ff',
  },
  sortButtonText: {
    fontSize: 13,
    color: '#65676b',
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: '#1877F2',
    fontWeight: '600',
  },
  
  // Results
  resultsCount: {
    fontSize: 13,
    color: '#65676b',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
