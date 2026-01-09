import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const workers = [
  { 
    id: '1', 
    name: 'Nguyễn Văn An', 
    specialty: 'Thợ điện', 
    rating: 4.9, 
    reviews: 127, 
    price: '200.000đ/giờ',
    experience: '8 năm',
    distance: '2.3 km',
    available: true,
    avatar: 'https://ui-avatars.com/api/?name=An&background=FF6B35&color=fff',
  },
  { 
    id: '2', 
    name: 'Trần Văn Bình', 
    specialty: 'Thợ sơn', 
    rating: 4.8, 
    reviews: 89, 
    price: '180.000đ/giờ',
    experience: '6 năm',
    distance: '1.5 km',
    available: true,
    avatar: 'https://ui-avatars.com/api/?name=Binh&background=4CAF50&color=fff',
  },
  { 
    id: '3', 
    name: 'Lê Hoàng Cường', 
    specialty: 'Thợ nước', 
    rating: 4.7, 
    reviews: 156, 
    price: '220.000đ/giờ',
    experience: '10 năm',
    distance: '3.1 km',
    available: false,
    avatar: 'https://ui-avatars.com/api/?name=Cuong&background=2196F3&color=fff',
  },
  { 
    id: '4', 
    name: 'Phạm Minh Đức', 
    specialty: 'Thợ mộc', 
    rating: 4.9, 
    reviews: 203, 
    price: '250.000đ/giờ',
    experience: '12 năm',
    distance: '4.2 km',
    available: true,
    avatar: 'https://ui-avatars.com/api/?name=Duc&background=9C27B0&color=fff',
  },
  { 
    id: '5', 
    name: 'Hoàng Văn Em', 
    specialty: 'Thợ xây', 
    rating: 4.6, 
    reviews: 78, 
    price: '190.000đ/giờ',
    experience: '5 năm',
    distance: '1.8 km',
    available: true,
    avatar: 'https://ui-avatars.com/api/?name=Em&background=FF9800&color=fff',
  },
];

const specialties = ['Tất cả', 'Thợ điện', 'Thợ nước', 'Thợ sơn', 'Thợ mộc', 'Thợ xây', 'Thợ hàn'];

export default function WorkersScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'card');
  const router = useRouter();
  const [selectedSpecialty, setSelectedSpecialty] = useState('Tất cả');

  const filteredWorkers = selectedSpecialty === 'Tất cả' 
    ? workers 
    : workers.filter(w => w.specialty === selectedSpecialty);

  const renderWorker = ({ item }: { item: typeof workers[0] }) => (
    <TouchableOpacity 
      style={[styles.workerCard, { backgroundColor: cardBg }]}
      onPress={() => router.push(`/finishing/worker-profile/${item.id}`)}
    >
      <View style={styles.workerHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.workerInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.workerName, { color: textColor }]}>{item.name}</Text>
            {item.available ? (
              <View style={styles.availableBadge}>
                <Text style={styles.availableText}>Sẵn sàng</Text>
              </View>
            ) : (
              <View style={[styles.availableBadge, { backgroundColor: '#f0f0f0' }]}>
                <Text style={[styles.availableText, { color: '#999' }]}>Bận</Text>
              </View>
            )}
          </View>
          <Text style={styles.specialty}>{item.specialty} • {item.experience}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#FFB800" />
            <Text style={styles.rating}>{item.rating}</Text>
            <Text style={styles.reviews}>({item.reviews} đánh giá)</Text>
            <Ionicons name="location-outline" size={14} color="#666" style={{ marginLeft: 8 }} />
            <Text style={styles.distance}>{item.distance}</Text>
          </View>
        </View>
      </View>
      <View style={styles.workerFooter}>
        <Text style={[styles.price, { color: '#FF6B35' }]}>{item.price}</Text>
        <TouchableOpacity 
          style={[styles.bookBtn, !item.available && styles.bookBtnDisabled]}
          disabled={!item.available}
        >
          <Text style={styles.bookBtnText}>{item.available ? 'Đặt lịch' : 'Không khả dụng'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: 'Tìm thợ', headerShown: true }} />
      
      {/* Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {specialties.map((spec) => (
          <TouchableOpacity
            key={spec}
            style={[
              styles.filterChip,
              selectedSpecialty === spec && styles.filterChipActive,
            ]}
            onPress={() => setSelectedSpecialty(spec)}
          >
            <Text style={[
              styles.filterText,
              selectedSpecialty === spec && styles.filterTextActive,
            ]}>
              {spec}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Workers List */}
      <FlatList
        data={filteredWorkers}
        renderItem={renderWorker}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Không tìm thấy thợ</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterContainer: { maxHeight: 60 },
  filterContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: '#FF6B35' },
  filterText: { color: '#666', fontSize: 14 },
  filterTextActive: { color: '#fff', fontWeight: '500' },
  listContent: { padding: 16 },
  workerCard: { borderRadius: 12, padding: 16, marginBottom: 12 },
  workerHeader: { flexDirection: 'row' },
  avatar: { width: 64, height: 64, borderRadius: 32, marginRight: 12 },
  workerInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  workerName: { fontSize: 16, fontWeight: '600' },
  availableBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  availableText: { color: '#4CAF50', fontSize: 11, fontWeight: '500' },
  specialty: { color: '#666', fontSize: 13, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  rating: { marginLeft: 4, fontWeight: '600', fontSize: 13 },
  reviews: { color: '#666', fontSize: 12, marginLeft: 4 },
  distance: { color: '#666', fontSize: 12, marginLeft: 4 },
  workerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  price: { fontSize: 16, fontWeight: 'bold' },
  bookBtn: { backgroundColor: '#FF6B35', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  bookBtnDisabled: { backgroundColor: '#ddd' },
  bookBtnText: { color: '#fff', fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: '#999', marginTop: 12 },
});
