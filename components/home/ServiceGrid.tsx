import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { memo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ServiceItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color?: string;
}

export type { ServiceItem };

interface ServiceGridProps {
  services?: ServiceItem[];
  onServicePress?: (service: ServiceItem) => void;
  style?: any;
}

const defaultServices: ServiceItem[] = [
  { id: '1', title: 'Thiết kế nhà', icon: 'home-outline', route: '/tk-nha', color: '#3b82f6' },
  { id: '2', title: 'Nội thất', icon: 'bed-outline', route: '/tk-noi-that', color: '#8b5cf6' },
  { id: '3', title: 'Biệt thự', icon: 'business-outline', route: '/biet-thu', color: '#10b981' },
  { id: '4', title: 'Khách sạn', icon: 'key-outline', route: '/khach-san', color: '#f59e0b' },
  { id: '5', title: 'Nhà phố', icon: 'storefront-outline', route: '/nha-pho', color: '#ef4444' },
  { id: '6', title: 'Văn phòng', icon: 'briefcase-outline', route: '/van-phong', color: '#6366f1' },
  { id: '7', title: 'Thư viện', icon: 'library-outline', route: '/thu-vien', color: '#06b6d4' },
  { id: '8', title: 'Mẫu nhà', icon: 'construct-outline', route: '/mau-nha', color: '#84cc16' },
];

export const ServiceGrid = memo(function ServiceGrid({
  services = defaultServices,
  onServicePress,
  style
}: ServiceGridProps) {
  const handleServicePress = (service: ServiceItem) => {
    if (onServicePress) {
      onServicePress(service);
    } else {
      router.push(service.route as any);
    }
  };

  const renderServiceItem = ({ item }: { item: ServiceItem }) => (
    <TouchableOpacity
      style={styles.serviceItem}
      onPress={() => handleServicePress(item)}
    >
      <View style={[styles.serviceIcon, { backgroundColor: item.color || '#3b82f6' }]}>
        <Ionicons name={item.icon} size={24} color="#fff" />
      </View>
      <Text style={styles.serviceText} numberOfLines={2}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.sectionTitle}>Dịch vụ thiết kế</Text>
      <FlatList
        data={services}
        renderItem={renderServiceItem}
        keyExtractor={(item) => item.id}
        numColumns={4}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={styles.gridContainer}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  gridContainer: {
    paddingHorizontal: 4,
  },
  serviceItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    marginVertical: 6,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 11,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 14,
  },
});
