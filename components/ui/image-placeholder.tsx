import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ImageSourcePropType, ImageStyle, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface ImagePlaceholderProps {
  source?: ImageSourcePropType;
  fallbackText?: string;
  size?: number;
  style?: ImageStyle | ViewStyle;
  showIcon?: boolean;
}

/**
 * ImagePlaceholder - Safe image component with fallback
 * Hiển thị placeholder khi hình không tồn tại
 */
export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  source,
  fallbackText = 'No Image',
  size = 60,
  style,
  showIcon = true,
}) => {
  const [imageError, setImageError] = React.useState(false);

  // Nếu không có source hoặc có lỗi, hiển thị placeholder
  if (!source || imageError) {
    return (
      <View
        style={[
          styles.placeholder,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          style,
        ]}
      >
        {showIcon && (
          <Ionicons name="image-outline" size={size * 0.4} color="#999" />
        )}
        {fallbackText && (
          <Text
            style={[
              styles.placeholderText,
              { fontSize: size * 0.15, marginTop: showIcon ? 4 : 0 },
            ]}
            numberOfLines={2}
          >
            {fallbackText}
          </Text>
        )}
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style as ImageStyle,
      ]}
      resizeMode="contain"
      onError={() => setImageError(true)}
    />
  );
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#999',
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 4,
  },
});
