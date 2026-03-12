/**
 * Gypsum/Drywall Workers Screen - Thợ thạch cao
 * Uses shared CategoryWorkerList component  
 */
import { CategoryWorkerList } from '@/components/finishing/CategoryWorkerList';
import { Colors } from '@/constants/theme';
import { CATEGORY_CONFIGS, WORKERS_DATA } from '@/data/finishing-workers';
import { Stack } from 'expo-router';
import { View } from 'react-native';

const CATEGORY_KEY = 'thach-cao';

export default function ThachCaoScreenNew() {
  const config = CATEGORY_CONFIGS[CATEGORY_KEY];
  const workers = WORKERS_DATA[CATEGORY_KEY] || [];

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: config?.title || 'Thợ thạch cao',
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      
      <CategoryWorkerList
        workers={workers}
        config={config}
        profileRoutePrefix="/finishing/worker-profile"
      />
    </View>
  );
}
