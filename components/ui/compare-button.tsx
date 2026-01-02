import { useCompare } from '@/context/CompareContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Alert, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface CompareButtonProps {
  id: string;
  name: string;
  price: number;
  image: string;
  type: 'product' | 'service' | 'worker';
  specs?: Record<string, any>;
  size?: number;
  style?: ViewStyle;
  iconColor?: string;
  activeColor?: string;
}

export function CompareButton({
  id,
  name,
  price,
  image,
  type,
  specs,
  size = 24,
  style,
  iconColor = '#666',
  activeColor = '#3B82F6',
}: CompareButtonProps) {
  const { isInCompare, addToCompare, removeFromCompare, compareCount, maxCompareItems } = useCompare();
  const inCompare = isInCompare(id);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (inCompare) {
      removeFromCompare(id);
    } else {
      const added = addToCompare({ id, name, price, image, type, specs });
      if (!added) {
        Alert.alert(
          'Đã đủ số lượng',
          `Bạn chỉ có thể so sánh tối đa ${maxCompareItems} sản phẩm cùng lúc.`,
          [{ text: 'OK' }]
        );
      }
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.button, style]}
      activeOpacity={0.7}
    >
      <Ionicons
        name={inCompare ? 'git-compare' : 'git-compare-outline'}
        size={size}
        color={inCompare ? activeColor : iconColor}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
