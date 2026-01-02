import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: number;
  editable?: boolean;
  onRatingChange?: (rating: number) => void;
  color?: string;
  emptyColor?: string;
  style?: ViewStyle;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 20,
  editable = false,
  onRatingChange,
  color = '#FFB800',
  emptyColor = '#D1D5DB',
  style,
}: RatingStarsProps) {
  const handlePress = (newRating: number) => {
    if (editable && onRatingChange) {
      onRatingChange(newRating);
    }
  };

  const renderStar = (index: number) => {
    const isFilled = index < rating;
    const isHalf = index === Math.floor(rating) && rating % 1 !== 0;

    const StarComponent = editable ? TouchableOpacity : View;

    return (
      <StarComponent
        key={index}
        onPress={() => handlePress(index + 1)}
        disabled={!editable}
        style={styles.star}
      >
        <Ionicons
          name={isFilled ? 'star' : isHalf ? 'star-half' : 'star-outline'}
          size={size}
          color={isFilled || isHalf ? color : emptyColor}
        />
      </StarComponent>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: maxRating }, (_, i) => renderStar(i))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginHorizontal: 2,
  },
});
