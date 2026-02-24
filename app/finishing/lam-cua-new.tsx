/**
 * Làm cửa Category Screen (New - Shared UI)
 * Uses shared CategoryWorkerList component
 */
import { CategoryWorkerList } from '@/components/finishing/CategoryWorkerList';
import { CATEGORY_CONFIGS, WORKERS_DATA } from '@/data/finishing-workers';
import { Stack } from 'expo-router';
import { View } from 'react-native';

const CATEGORY_KEY = 'lam-cua';

export default function LamCuaNewScreen() {
  const config = CATEGORY_CONFIGS[CATEGORY_KEY];
  const workers = WORKERS_DATA[CATEGORY_KEY] || [];

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <Stack.Screen
        options={{
          title: config?.title || 'Thợ làm cửa',
          headerStyle: { backgroundColor: '#0D9488' },
          headerTintColor: '#fff',
        }}
      />
      <CategoryWorkerList workers={workers} config={config} />
    </View>
  );
}
