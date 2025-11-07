import React from 'react';
import { Text, View } from 'react-native';

export default function LiveBadge() {
  return (
    <View
      style={{
        position: 'absolute',
        top: 16,
        left: 12,
        backgroundColor: 'rgba(255,0,0,0.9)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
      }}
      pointerEvents="none"
    >
      <Text style={{ color: '#fff', fontWeight: '800', letterSpacing: 1 }}>TRỰC TIẾP</Text>
    </View>
  );
}
