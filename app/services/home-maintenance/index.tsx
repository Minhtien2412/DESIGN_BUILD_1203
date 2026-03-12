/**
 * Home Maintenance Services Screen
 * Màn hình dịch vụ bảo trì nhà - Facebook/Grab style
 * 
 * @author AI Assistant
 * @date 05/01/2026
 */

import {
    ServiceCategoryItem,
    ServiceWorkerItem,
    SupportChat
} from '@/components/home-maintenance';
import {
    SERVICE_CATEGORIES,
    SERVICE_WORKERS,
    ServiceCategory,
    ServiceWorker
} from '@/services/api/homeMaintenanceApi';
import { mediumImpact } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    Linking,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function HomeMaintenanceScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);
  
  const handleCategoryPress = useCallback((category: ServiceCategory) => {
    mediumImpact();
    setSelectedCategory(category.id);
    // Navigate to category detail
    router.push(`/services/home-maintenance/category/${category.id}` as any);
  }, []);
  
  const handleWorkerPress = useCallback((worker: ServiceWorker) => {
    mediumImpact();
    router.push(`/services/home-maintenance/worker/${worker.id}` as any);
  }, []);
  
  const handleWorkerCall = useCallback((worker: ServiceWorker) => {
    mediumImpact();
    if (worker.phone) {
      Linking.openURL(`tel:${worker.phone}`);
    }
  }, []);
  
  const handleWorkerMessage = useCallback((worker: ServiceWorker) => {
    mediumImpact();
    router.push(`/messages/${worker.id}`);
  }, []);
  
  const openChat = useCallback(() => {
    mediumImpact();
    setIsChatOpen(true);
  }, []);
  
  // Render category item
  const renderCategoryItem = useCallback(({ item }: { item: ServiceCategory }) => (
    <ServiceCategoryItem
      category={item}
      onPress={handleCategoryPress}
    />
  ), [handleCategoryPress]);
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f2f5" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1c1e21" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Dịch Vụ Bảo Trì Nhà</Text>
        
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#1c1e21" />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=800' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Mạng lưới thợ{'\n'}chuyên nghiệp</Text>
            <Text style={styles.heroSubtitle}>Hơn 1000+ thợ đã được xác minh</Text>
            <TouchableOpacity style={styles.heroButton}>
              <Text style={styles.heroButtonText}>Khám phá ngay</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="people" size={24} color="#1877F2" />
            <Text style={styles.statValue}>1000+</Text>
            <Text style={styles.statLabel}>Thợ xác minh</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="star" size={24} color="#fbbf24" />
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Đánh giá TB</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
            <Text style={styles.statValue}>10K+</Text>
            <Text style={styles.statLabel}>Hoàn thành</Text>
          </View>
        </View>
        
        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Danh mục dịch vụ</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={SERVICE_CATEGORIES}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>
        
        {/* Featured Workers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thợ nổi bật</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          {SERVICE_WORKERS.map((worker) => (
            <ServiceWorkerItem
              key={worker.id}
              worker={worker}
              onPress={handleWorkerPress}
              onCall={handleWorkerCall}
              onMessage={handleWorkerMessage}
            />
          ))}
        </View>
        
        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Hành động nhanh</Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickAction}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#e7f3ff' }]}>
                <Ionicons name="time-outline" size={24} color="#1877F2" />
              </View>
              <Text style={styles.quickActionText}>Đặt lịch{'\n'}hẹn</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="receipt-outline" size={24} color="#f59e0b" />
              </View>
              <Text style={styles.quickActionText}>Báo giá{'\n'}dịch vụ</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#dcfce7' }]}>
                <Ionicons name="location-outline" size={24} color="#22c55e" />
              </View>
              <Text style={styles.quickActionText}>Thợ gần{'\n'}bạn</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={openChat}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#fce7f3' }]}>
                <Ionicons name="chatbubbles-outline" size={24} color="#ec4899" />
              </View>
              <Text style={styles.quickActionText}>Tư vấn{'\n'}AI</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
      
      {/* Floating Chat Button */}
      {!isChatOpen && (
        <TouchableOpacity
          style={styles.floatingChatButton}
          onPress={openChat}
          activeOpacity={0.85}
        >
          <Ionicons name="chatbubble-ellipses" size={26} color="#fff" />
        </TouchableOpacity>
      )}
      
      {/* Support Chat Modal */}
      {isChatOpen && (
        <SupportChat onClose={() => setIsChatOpen(false)} />
      )}
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1e21',
  },
  searchButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  
  // Hero Banner
  heroBanner: {
    height: 200,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: '#1877F2',
    padding: 20,
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  heroButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  
  // Stats
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1e21',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: '#65676b',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e4e6eb',
    marginVertical: 4,
  },
  
  // Section
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1c1e21',
  },
  seeAllText: {
    fontSize: 14,
    color: '#1877F2',
    fontWeight: '600',
  },
  categoriesList: {
    paddingHorizontal: 12,
  },
  
  // Quick Actions
  quickActionsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 12,
  },
  quickAction: {
    width: (width - 52) / 4,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 11,
    color: '#65676b',
    textAlign: 'center',
    lineHeight: 14,
  },
  
  // Floating Chat Button
  floatingChatButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1877F2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1877F2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
