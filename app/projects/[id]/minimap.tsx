import ConstructionProgressBoard from '@/components/construction/ConstructionProgressBoard';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function ProjectMinimapScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Tiến độ thi công',
          headerBackTitle: 'Quay lại',
        }}
      />

      <View style={[styles.container, { backgroundColor }]}>
        <ConstructionProgressBoard
          projectId={id || 'default-project'}
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
