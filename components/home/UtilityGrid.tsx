import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { memo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface UtilityItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color?: string;
}

export type { UtilityItem };

interface UtilityGridProps {
  utilities?: UtilityItem[];
  onUtilityPress?: (utility: UtilityItem) => void;
  style?: any;
}

const defaultUtilities: UtilityItem[] = [
  { id: '1', title: 'Điện', icon: 'flash-outline', route: '/dien', color: '#eab308' },
  { id: '2', title: 'Nước', icon: 'water-outline', route: '/nuoc', color: '#3b82f6' },
  { id: '3', title: 'PCCC', icon: 'flame-outline', route: '/pccc', color: '#dc2626' },
  { id: '4', title: 'Giám sát', icon: 'eye-outline', route: '/giam-sat', color: '#059669' },
  { id: '5', title: 'Thợ công', icon: 'people-outline', route: '/tho-cong', color: '#7c3aed' },
  { id: '6', title: 'Tư vấn', icon: 'chatbubble-outline', route: '/tu-van-cl', color: '#ea580c' },
];

export const UtilityGrid = memo(function UtilityGrid({
  utilities = defaultUtilities,
  onUtilityPress,
  style
}: UtilityGridProps) {
  const handleUtilityPress = (utility: UtilityItem) => {
    if (onUtilityPress) {
      onUtilityPress(utility);
    } else {
      router.push(utility.route as any);
    }
  };

  const renderUtilityItem = ({ item }: { item: UtilityItem }) => (
    <TouchableOpacity
      style={styles.utilityItem}
      onPress={() => handleUtilityPress(item)}
    >
      <View style={[styles.utilityIcon, { backgroundColor: item.color || '#6b7280' }]}>
        <Ionicons name={item.icon} size={20} color="#fff" />
      </View>
      <Text style={styles.utilityText} numberOfLines={1}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.sectionTitle}>Tiện ích</Text>
      <FlatList
        data={utilities}
        renderItem={renderUtilityItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
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
  utilityItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 6,
    marginVertical: 6,
  },
  utilityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  utilityText: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
  },
});
