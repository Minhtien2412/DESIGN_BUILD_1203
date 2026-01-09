import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const livestreams = [
  {
    id: '1',
    title: 'Hướng dẫn ốp gạch nhà tắm từ A-Z',
    host: { name: 'Thợ Minh', avatar: 'https://ui-avatars.com/api/?name=Minh', isVerified: true },
    thumbnail: 'https://via.placeholder.com/400x225/FF6B35/fff?text=LIVE',
    viewers: 1234,
    isLive: true,
    duration: '45:30',
    category: 'Hướng dẫn',
  },
  {
    id: '2',
    title: 'Flash Sale vật liệu xây dựng',
    host: { name: 'VLXD Minh Phát', avatar: 'https://ui-avatars.com/api/?name=MP', isVerified: true },
    thumbnail: 'https://via.placeholder.com/400x225/F44336/fff?text=SALE',
    viewers: 3456,
    isLive: true,
    duration: '1:20:15',
    category: 'Bán hàng',
  },
  {
    id: '3',
    title: 'Review máy khoan Bosch GSB 16 RE',
    host: { name: 'Review Công cụ', avatar: 'https://ui-avatars.com/api/?name=RC', isVerified: false },
    thumbnail: 'https://via.placeholder.com/400x225/4CAF50/fff?text=REVIEW',
    viewers: 567,
    isLive: true,
    duration: '15:20',
    category: 'Review',
  },
];

const upcomingStreams = [
  {
    id: '1',
    title: 'Thiết kế nội thất với AI',
    host: 'Studio Design',
    scheduledTime: '20:00 hôm nay',
    subscribers: 234,
  },
  {
    id: '2',
    title: 'Giải đáp thắc mắc sơn nhà',
    host: 'Chuyên gia Sơn',
    scheduledTime: '14:00 ngày mai',
    subscribers: 567,
  },
];

const categories = [
  { id: '1', name: 'Hướng dẫn', icon: 'play-circle-outline', color: '#FF6B35' },
  { id: '2', name: 'Bán hàng', icon: 'cart-outline', color: '#F44336' },
  { id: '3', name: 'Review', icon: 'star-outline', color: '#4CAF50' },
  { id: '4', name: 'Q&A', icon: 'help-circle-outline', color: '#2196F3' },
];

export default function LivestreamScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'card');
  const router = useRouter();

  const formatViewers = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const renderLivestream = ({ item }: { item: typeof livestreams[0] }) => (
    <TouchableOpacity style={styles.livestreamCard}>
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        {item.isLive && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
        <View style={styles.viewersBox}>
          <Ionicons name="eye" size={12} color="#fff" />
          <Text style={styles.viewersText}>{formatViewers(item.viewers)}</Text>
        </View>
        <View style={styles.durationBox}>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
      </View>
      
      <View style={styles.livestreamInfo}>
        <Image source={{ uri: item.host.avatar }} style={styles.hostAvatar} />
        <View style={styles.livestreamDetails}>
          <Text style={[styles.livestreamTitle, { color: textColor }]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.hostRow}>
            <Text style={styles.hostName}>{item.host.name}</Text>
            {item.host.isVerified && (
              <Ionicons name="checkmark-circle" size={12} color="#2196F3" />
            )}
            <Text style={styles.categoryLabel}> • {item.category}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: 'Livestream', headerShown: true }} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((cat) => (
            <TouchableOpacity key={cat.id} style={[styles.categoryItem, { backgroundColor: cat.color + '20' }]}>
              <Ionicons name={cat.icon as any} size={20} color={cat.color} />
              <Text style={[styles.categoryName, { color: cat.color }]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Live Now */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.liveDotLarge} />
              <Text style={[styles.sectionTitle, { color: textColor }]}>Đang phát sóng</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.viewAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={livestreams}
            renderItem={renderLivestream}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Upcoming */}
        <View style={[styles.section, { backgroundColor: cardBg, marginHorizontal: 16, borderRadius: 12, padding: 16 }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>📅 Sắp diễn ra</Text>
          {upcomingStreams.map((stream) => (
            <View key={stream.id} style={styles.upcomingItem}>
              <View style={styles.upcomingIcon}>
                <Ionicons name="videocam-outline" size={24} color="#FF6B35" />
              </View>
              <View style={styles.upcomingInfo}>
                <Text style={[styles.upcomingTitle, { color: textColor }]}>{stream.title}</Text>
                <Text style={styles.upcomingHost}>{stream.host}</Text>
                <View style={styles.upcomingMeta}>
                  <Ionicons name="time-outline" size={12} color="#666" />
                  <Text style={styles.upcomingTime}>{stream.scheduledTime}</Text>
                  <Ionicons name="notifications-outline" size={12} color="#666" style={{ marginLeft: 12 }} />
                  <Text style={styles.upcomingTime}>{stream.subscribers} đăng ký</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.notifyBtn}>
                <Ionicons name="notifications-outline" size={20} color="#FF6B35" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Start Streaming CTA */}
        <TouchableOpacity style={[styles.startStreamCard, { backgroundColor: '#FF6B35' }]}>
          <View style={styles.startStreamIcon}>
            <Ionicons name="videocam" size={32} color="#FF6B35" />
          </View>
          <View style={styles.startStreamContent}>
            <Text style={styles.startStreamTitle}>Bắt đầu phát sóng</Text>
            <Text style={styles.startStreamDesc}>Chia sẻ kỹ năng, bán hàng trực tiếp</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  categoriesContent: { padding: 16, gap: 10 },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  categoryName: { fontSize: 13, fontWeight: '500' },
  section: { marginBottom: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  viewAll: { color: '#FF6B35', fontSize: 14 },
  liveDotLarge: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#F44336' },
  horizontalList: { paddingLeft: 16, paddingRight: 8 },
  livestreamCard: { width: 280, marginRight: 12 },
  thumbnailContainer: { position: 'relative' },
  thumbnail: { width: '100%', height: 160, borderRadius: 12, backgroundColor: '#f0f0f0' },
  liveBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  liveText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  viewersBox: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  viewersText: { color: '#fff', fontSize: 11 },
  durationBox: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: { color: '#fff', fontSize: 11 },
  livestreamInfo: { flexDirection: 'row', marginTop: 12 },
  hostAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f0f0f0' },
  livestreamDetails: { flex: 1, marginLeft: 10 },
  livestreamTitle: { fontSize: 14, fontWeight: '500', lineHeight: 18 },
  hostRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  hostName: { color: '#666', fontSize: 12 },
  categoryLabel: { color: '#999', fontSize: 12 },
  upcomingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  upcomingIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FF6B3520',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upcomingInfo: { flex: 1, marginLeft: 12 },
  upcomingTitle: { fontSize: 14, fontWeight: '500' },
  upcomingHost: { color: '#666', fontSize: 12, marginTop: 2 },
  upcomingMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  upcomingTime: { color: '#999', fontSize: 11, marginLeft: 4 },
  notifyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B3510',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startStreamCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  startStreamIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startStreamContent: { flex: 1, marginLeft: 16 },
  startStreamTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  startStreamDesc: { color: '#fff', opacity: 0.9, marginTop: 4 },
});
