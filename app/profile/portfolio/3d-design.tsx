import { SectionHeader } from '@/components/ui/list-item';
import PortfolioDocsService, { type Design3D, MOCK_DESIGNS } from '@/services/portfolioDocsService';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const imageWidth = (width - 48) / 2;

// Types imported from portfolioDocsService

export default function Design3DScreen() {
  const [designs, setDesigns] = useState<Design3D[]>(MOCK_DESIGNS); // Start with mock
  const [loading, setLoading] = useState(false); // Don't block
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});

  const fetchDesigns = useCallback(async () => {
    try {
      const data = await PortfolioDocsService.get3DDesigns();
      if (data.length > 0) {
        setDesigns(data);
      }
    } catch (err) {
      console.warn('Error fetching designs, using mock data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Fetch in background
    const timer = setTimeout(() => {
      fetchDesigns();
    }, 100);
    return () => clearTimeout(timer);
  }, [fetchDesigns]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDesigns(true);
  }, [fetchDesigns]);

  const filteredDesigns = selectedFilter
    ? designs.filter(d => d.room === selectedFilter)
    : designs;

  const roomTypes = Array.from(new Set(designs.map(d => d.room)));

  return (
    <>
      <Stack.Screen
        options={{
          title: '3D Thiết Kế Nội Thất',
          headerBackTitle: 'Quay lại',
        }}
      />
      
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Thư viện 3D</Text>
          <Text style={styles.headerSubtitle}>
            {filteredDesigns.length} thiết kế
          </Text>
        </View>

        {/* Filter Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={[styles.filterChip, !selectedFilter && styles.filterChipActive]}
            onPress={() => setSelectedFilter(null)}
          >
            <Text style={[styles.filterText, !selectedFilter && styles.filterTextActive]}>
              Tất cả
            </Text>
          </TouchableOpacity>
          {roomTypes.map((room) => (
            <TouchableOpacity
              key={room}
              style={[styles.filterChip, selectedFilter === room && styles.filterChipActive]}
              onPress={() => setSelectedFilter(selectedFilter === room ? null : room)}
            >
              <Text style={[styles.filterText, selectedFilter === room && styles.filterTextActive]}>
                {room}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <SectionHeader title="Thiết kế đã lọc" />
        
        {filteredDesigns.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Không có thiết kế</Text>
            <Text style={styles.emptySubtitle}>Chưa có thiết kế nào cho bộ lọc này</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredDesigns.map((design) => (
              <DesignCard 
                key={design.id} 
                design={design}
                isLoading={imageLoadingStates[design.id]}
                onLoadStart={() => setImageLoadingStates(prev => ({ ...prev, [design.id]: true }))}
                onLoadEnd={() => setImageLoadingStates(prev => ({ ...prev, [design.id]: false }))}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </>
  );
}

function DesignCard({ 
  design, 
  isLoading, 
  onLoadStart, 
  onLoadEnd 
}: { 
  design: Design3D;
  isLoading?: boolean;
  onLoadStart: () => void;
  onLoadEnd: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity 
        style={styles.designCard}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={styles.imageContainer}>
          {isLoading && (
            <View style={styles.imageLoader}>
              <ActivityIndicator size="small" color="#0891B2" />
            </View>
          )}
          <Image
            source={{ uri: design.imageUrl }}
            style={styles.designImage}
            resizeMode="cover"
            onLoadStart={onLoadStart}
            onLoadEnd={onLoadEnd}
          />
          
          <View style={styles.designOverlay}>
            <View style={styles.roomBadge}>
              <Text style={styles.roomText}>{design.room}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.designInfo}>
          <Text style={styles.designTitle} numberOfLines={2}>
            {design.title}
          </Text>
          
          <View style={styles.designStats}>
            <View style={styles.stat}>
              <Ionicons name="eye-outline" size={14} color="#6B7280" />
              <Text style={styles.statText}>{design.views}</Text>
            </View>
            
            <View style={styles.stat}>
              <Ionicons name="heart-outline" size={14} color="#6B7280" />
              <Text style={styles.statText}>{design.likes}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    marginBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#0891B2',
    borderColor: '#0891B2',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
  },
  designCard: {
    width: imageWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  designImage: {
    width: '100%',
    height: imageWidth * 0.75,
    backgroundColor: '#E5E7EB',
  },
  designOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  roomBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roomText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  designInfo: {
    padding: 12,
  },
  designTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    height: 36,
  },
  designStats: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
