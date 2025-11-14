/**
 * Optimized Image Component
 * Features: Lazy loading, caching, placeholder, error handling
 */

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ImageProps,
    ImageStyle,
    StyleSheet,
    View,
} from 'react-native';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  placeholder?: string;
  showLoader?: boolean;
  borderRadius?: number;
  cache?: 'default' | 'reload' | 'force-cache' | 'only-if-cached';
}

export function OptimizedImage({
  uri,
  width,
  height,
  aspectRatio,
  placeholder,
  showLoader = true,
  borderRadius,
  cache = 'default',
  style,
  ...props
}: OptimizedImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const imageStyle: ImageStyle = {
    width: width || '100%',
    height: height || undefined,
    aspectRatio: aspectRatio || undefined,
    borderRadius: borderRadius || 0,
  };

  return (
    <View style={[imageStyle, style]}>
      {loading && showLoader && (
        <View style={[styles.placeholder, imageStyle]}>
          <ActivityIndicator size="small" color="#999" />
        </View>
      )}

      {error && (
        <View style={[styles.placeholder, imageStyle, styles.error]}>
          <Ionicons name="image-outline" size={32} color="#999" />
        </View>
      )}

      <Image
        {...props}
        source={{ uri, cache }}
        style={[imageStyle, error && styles.hidden]}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        defaultSource={placeholder ? { uri: placeholder } : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  error: {
    backgroundColor: '#f0f0f0',
  },
  hidden: {
    opacity: 0,
  },
});
