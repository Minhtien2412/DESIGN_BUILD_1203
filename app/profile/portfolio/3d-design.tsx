import { SectionHeader } from '@/components/ui/list-item';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type Design3D = {
  id: string;
  title: string;
  room: string;
  imageUrl: string;
  views: number;
  likes: number;
};

const { width } = Dimensions.get('window');
const imageWidth = (width - 48) / 2;

const MOCK_DESIGNS: Design3D[] = [
  {
    id: '1',
    title: 'Phòng khách hiện đại',
    room: 'Phòng khách',
    imageUrl: 'https://picsum.photos/400/300?random=1',
    views: 245,
    likes: 38,
  },
  {
    id: '2',
    title: 'Phòng ngủ master',
    room: 'Phòng ngủ',
    imageUrl: 'https://picsum.photos/400/300?random=2',
    views: 189,
    likes: 29,
  },
  {
    id: '3',
    title: 'Bếp & phòng ăn',
    room: 'Bếp',
    imageUrl: 'https://picsum.photos/400/300?random=3',
    views: 312,
    likes: 52,
  },
  {
    id: '4',
    title: 'Phòng làm việc',
    room: 'Phòng làm việc',
    imageUrl: 'https://picsum.photos/400/300?random=4',
    views: 167,
    likes: 24,
  },
  {
    id: '5',
    title: 'Phòng tắm cao cấp',
    room: 'Phòng tắm',
    imageUrl: 'https://picsum.photos/400/300?random=5',
    views: 198,
    likes: 31,
  },
  {
    id: '6',
    title: 'Ban công xanh',
    room: 'Ban công',
    imageUrl: 'https://picsum.photos/400/300?random=6',
    views: 221,
    likes: 43,
  },
];

export default function Design3DScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: '3D Thiết Kế Nội Thất',
          headerBackTitle: 'Quay lại',
        }}
      />
      
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Thư viện 3D</Text>
          <Text style={styles.headerSubtitle}>
            {MOCK_DESIGNS.length} thiết kế
          </Text>
        </View>

        <SectionHeader title="Tất cả thiết kế" />
        
        <View style={styles.grid}>
          {MOCK_DESIGNS.map((design) => (
            <TouchableOpacity key={design.id} style={styles.designCard}>
              <Image
                source={{ uri: design.imageUrl }}
                style={styles.designImage}
                resizeMode="cover"
              />
              
              <View style={styles.designOverlay}>
                <View style={styles.roomBadge}>
                  <Text style={styles.roomText}>{design.room}</Text>
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
          ))}
        </View>
      </ScrollView>
    </>
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
    elevation: 2,
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
