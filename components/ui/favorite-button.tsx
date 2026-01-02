import { useFavorites } from '@/context/FavoritesContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface FavoriteButtonProps {
  id: string;
  name: string;
  price: number;
  image: string;
  type: 'product' | 'service' | 'worker';
  size?: number;
  style?: ViewStyle;
  iconColor?: string;
  activeColor?: string;
}

export function FavoriteButton({
  id,
  name,
  price,
  image,
  type,
  size = 24,
  style,
  iconColor = '#666',
  activeColor = '#FF3B30',
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(id);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite({ id, name, price, image, type });
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.button, style]}
      activeOpacity={0.7}
    >
      <Ionicons
        name={favorite ? 'heart' : 'heart-outline'}
        size={size}
        color={favorite ? activeColor : iconColor}
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
