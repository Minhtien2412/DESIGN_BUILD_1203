import type { RouteInfo } from '@/constants/routes';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface IconTileProps {
  item: RouteInfo;
}

export function IconTile({ item }: IconTileProps) {
  // Map icon keys to MaterialIcons
  const getIconName = (iconKey: string): keyof typeof MaterialIcons.glyphMap => {
    const iconMap: Record<string, keyof typeof MaterialIcons.glyphMap> = {
      'ep-coc': 'foundation',
      'dao-dat': 'landscape',
      'vat-lieu': 'inventory',
      'be-tong': 'architecture',
      'nhan-cong': 'engineering',
      'tho-xay': 'build',
      'tho-sat': 'hardware',
      'tho-coffa': 'construction',
      'tho-co-khi': 'settings',
      'tho-to-tuong': 'format-paint',
      'tho-dien-nuoc': 'electrical-services',
      'lat-gach': 'grid-on',
      'thach-cao': 'layers',
      'tho-son': 'brush',
      'tho-da': 'texture',
      'lam-cua': 'door-front',
      'lan-can': 'fence',
      'tho-cong': 'handyman',
      'camera': 'videocam',
    };
    return iconMap[iconKey] || 'help';
  };

  return (
    <TouchableOpacity
      key={item.href}
      style={styles.utilityItem}
      onPress={() => router.push(item.href as any)}
    >
      <MaterialIcons name={getIconName(item.iconKey)} size={32} color="#4A90E2" style={{ marginBottom: 4 }} />
      <Text style={styles.utilityText} numberOfLines={1}>{item.label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  utilityItem: {
    alignItems: 'center',
    width: '25%', // 4 items per row
    paddingVertical: 8,
  },
  utilityText: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
    textAlign: 'center',
  },
});
