/**
 * Construction Progress Demo Screen
 * Demonstrates ConstructionProgressBoard component with real backend
 */

import ConstructionProgressBoard from '@/components/construction/ConstructionProgressBoard';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function ConstructionProgressDemoScreen() {
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Tiến độ thi công',
          headerLargeTitle: false,
        }} 
      />
      <View style={[styles.container, { backgroundColor }]}>
        <ConstructionProgressBoard 
          projectId="demo-villa-project-2025" 
          isAdmin={true} 
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
