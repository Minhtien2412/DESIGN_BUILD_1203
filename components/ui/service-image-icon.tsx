import { serviceImageSource, type ServiceImageKey } from '@/constants/service-images';
import { Image } from 'expo-image';
import React from 'react';
import { ImageStyle, StyleProp } from 'react-native';

export function ServiceImageIcon({ name, size = 48, style }: { name: ServiceImageKey; size?: number; style?: StyleProp<ImageStyle> }) {
  const src = serviceImageSource(name);
  return <Image source={src} style={[{ width: size, height: size }, style]} contentFit="contain" />;
}
