import React from 'react';
import { ActivityIndicator, View } from 'react-native';

export function Loader({ height = 120 }: { height?: number }) {
  return (
    <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}
