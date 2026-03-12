import { getVideoIcon } from '@/constants/video-icons';
import type { VideoItem } from '@/data/videos';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ImageSourcePropType, StyleSheet, Text, View } from 'react-native';

interface VideoIconTileProps {
  item: VideoItem;
  width: number;
  height: number;
  showTitle?: boolean;
}

export const VideoIconTile: React.FC<VideoIconTileProps> = ({ 
  item, 
  width, 
  height, 
  showTitle = true 
}) => {
  // Lấy icon dựa trên video URL/file name
  const getIconSource = (): ImageSourcePropType => {
    if (typeof item.url === 'string') {
      return getVideoIcon(item.url);
    } else {
      // Cho video local (require), cần extract filename
      // Có thể cần adjust logic này dựa trên cách metro bundler handle
      return getVideoIcon(item.title);
    }
  };

  const iconSource = getIconSource();

  return (
    <View style={[styles.container, { width, height }]}>
      <LinearGradient
        colors={['#f8f9fa', '#e9ecef']}
        style={styles.iconContainer}
      >
        <Image 
          source={iconSource} 
          style={styles.icon}
          contentFit="contain"
        />
      </LinearGradient>
      {showTitle && (
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
          style={styles.overlay}
        >
          <Text numberOfLines={2} style={styles.title}>
            {item.title}
          </Text>
        </LinearGradient>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    // Shadow cho depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  icon: {
    width: '65%',
    height: '65%',
    // Đảm bảo icon hiển thị tốt
    maxWidth: 70,
    maxHeight: 70,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
  },
  title: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 12,
  },
});
