import { serviceIconToMaterial, type ServiceIconKey } from '@/constants/service-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';

export function ServiceIcon({ name, size = 28, color = '#16a34a', style }: { name: ServiceIconKey; size?: number; color?: string | OpaqueColorValue; style?: StyleProp<TextStyle> }) {
  const mi = serviceIconToMaterial(name);
  return <MaterialIcons name={mi} size={size} color={color} style={style} />;
}
