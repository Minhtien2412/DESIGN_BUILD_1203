import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const contractors = [
  {
    id: '1',
    name: 'Công ty TNHH Xây dựng An Phát',
    avatar: 'https://ui-avatars.com/api/?name=AP&background=FF6B35&color=fff',
    rating: 4.9,
    reviews: 234,
    projects: 156,
    specialties: ['Xây nhà trọn gói', 'Cải tạo', 'Thiết kế'],
    verified: true,
    yearsExp: 15,
    location: 'Quận 7, TP.HCM',
    minBudget: 500,
    maxBudget: 5000,
    featured: true,
  },
  {
    id: '2',
    name: 'Nhà thầu Minh Quang',
    avatar: 'https://ui-avatars.com/api/?name=MQ&background=4CAF50&color=fff',
    rating: 4.7,
    reviews: 189,
    projects: 98,
    specialties: ['Xây dựng dân dụng', 'Hoàn thiện'],
    verified: true,
    yearsExp: 10,
    location: 'Quận Bình Thạnh, TP.HCM',
    minBudget: 300,
    maxBudget: 2000,
    featured: false,
  },
  {
    id: '3',
    name: 'Xây dựng Thành Công',
    avatar: 'https://ui-avatars.com/api/?name=TC&background=2196F3&color=fff',
    rating: 4.8,
    reviews: 145,
    projects: 78,
    specialties: ['Nhà phố', 'Biệt thự'],
    verified: true,
    yearsExp: 12,
    location: 'Thủ Đức, TP.HCM',
    minBudget: 800,
    maxBudget: 10000,
    featured: false,
  },
];

const filterOptions = [
  { id: 'all', label: 'Tất cả', icon: 'apps-outline' },
  { id: 'verified', label: 'Xác thực', icon: 'shield-checkmark-outline' },
  { id: 'featured', label: 'Nổi bật', icon: 'star-outline' },
  { id: 'nearby', label: 'Gần tôi', icon: 'location-outline' },
];

export default function ContractorScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'card');
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const formatBudget = (min: number, max: number) => {
    return `${min} - ${max} triệu`;
  };

  const renderContractor = ({ item }: { item: typeof contractors[0] }) => (
    <TouchableOpacity style={[styles.contractorCard, { backgroundColor: cardBg }]}>
      {item.featured && (
        <View style={styles.featuredRibbon}>
          <Text style={styles.featuredText}>⭐ Nổi bật</Text>
        </View>
      )}
      
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.contractorName, { color: textColor }]} numberOfLines={1}>
              {item.name}
            </Text>
            {item.verified && (
              <Ionicons name="checkmark-circle" size={16} color="#2196F3" />
            )}
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#FFB800" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewsText}>({item.reviews} đánh giá)</Text>
          </View>
          <Text style={styles.locationText}>
            <Ionicons name="location-outline" size={12} color="#666" /> {item.location}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: textColor }]}>{item.projects}</Text>
          <Text style={styles.statLabel}>Dự án</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: textColor }]}>{item.yearsExp}</Text>
          <Text style={styles.statLabel}>Năm KN</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#FF6B35' }]}>{formatBudget(item.minBudget, item.maxBudget)}</Text>
          <Text style={styles.statLabel}>Ngân sách</Text>
        </View>
      </View>

      <View style={styles.specialtiesRow}>
        {item.specialties.slice(0, 3).map((spec, index) => (
          <View key={index} style={styles.specialtyTag}>
            <Text style={styles.specialtyText}>{spec}</Text>
          </View>
        ))}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.contactBtn}>
          <Ionicons name="chatbubble-outline" size={18} color="#FF6B35" />
          <Text style={styles.contactBtnText}>Liên hệ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.viewBtn}>
          <Text style={styles.viewBtnText}>Xem chi tiết</Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: 'Nhà thầu', headerShown: true }} />
      
      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: cardBg }]}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Tìm nhà thầu, chuyên môn..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.filterIcon}>
          <Ionicons name="options-outline" size={20} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filterOptions.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterBtn,
              activeFilter === filter.id && styles.filterBtnActive,
            ]}
            onPress={() => setActiveFilter(filter.id)}
          >
            <Ionicons 
              name={filter.icon as any} 
              size={16} 
              color={activeFilter === filter.id ? '#fff' : '#666'} 
            />
            <Text style={[
              styles.filterText,
              activeFilter === filter.id && styles.filterTextActive,
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <FlatList
        data={contractors}
        renderItem={renderContractor}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={[styles.resultCount, { color: textColor }]}>
            {contractors.length} nhà thầu
          </Text>
        }
      />

      {/* Post Request CTA */}
      <TouchableOpacity style={styles.postRequestBtn}>
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={styles.postRequestText}>Đăng yêu cầu báo giá</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginBottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15 },
  filterIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FF6B3515',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: { maxHeight: 50, marginTop: 12 },
  filtersContent: { paddingHorizontal: 16 },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    gap: 6,
  },
  filterBtnActive: { backgroundColor: '#FF6B35' },
  filterText: { color: '#666', fontSize: 13 },
  filterTextActive: { color: '#fff' },
  listContent: { padding: 16 },
  resultCount: { fontSize: 14, marginBottom: 12 },
  contractorCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  featuredRibbon: {
    position: 'absolute',
    top: 12,
    right: -30,
    backgroundColor: '#FFB800',
    paddingHorizontal: 30,
    paddingVertical: 4,
    transform: [{ rotate: '45deg' }],
  },
  featuredText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  cardHeader: { flexDirection: 'row', marginBottom: 16 },
  avatar: { width: 60, height: 60, borderRadius: 12, backgroundColor: '#f0f0f0' },
  headerInfo: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  contractorName: { fontSize: 16, fontWeight: '600', flex: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingText: { fontWeight: '600', marginLeft: 4 },
  reviewsText: { color: '#666', fontSize: 12, marginLeft: 4 },
  locationText: { color: '#666', fontSize: 12, marginTop: 4 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '600' },
  statLabel: { color: '#666', fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#ddd' },
  specialtiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  specialtyTag: { backgroundColor: '#FF6B3515', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  specialtyText: { color: '#FF6B35', fontSize: 12 },
  cardActions: { flexDirection: 'row', gap: 12 },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF6B35',
    gap: 6,
  },
  contactBtnText: { color: '#FF6B35', fontWeight: '500' },
  viewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#FF6B35',
    gap: 4,
  },
  viewBtnText: { color: '#fff', fontWeight: '500' },
  postRequestBtn: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  postRequestText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
