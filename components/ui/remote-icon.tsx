import { Image } from 'expo-image';
import { ImageStyle, StyleProp } from 'react-native';

interface RemoteIconProps {
  uri?: string; // Optional because some callers previously passed an object with a different prop
  style?: StyleProp<ImageStyle>;
}

export function RemoteIcon({ uri, style }: RemoteIconProps) {
  if (!uri) return null;
  return <Image source={{ uri }} style={style} contentFit="contain" />;
}
