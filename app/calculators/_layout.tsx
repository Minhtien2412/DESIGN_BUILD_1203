/**
 * Calculators Layout - Tiện ích tính toán hoàn thiện
 */
import { Stack } from 'expo-router';

export default function CalculatorsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1E40AF' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Tiện ích tính toán', headerShown: false }} />
      <Stack.Screen name="paint" options={{ title: 'Tính lượng sơn', headerShown: false }} />
      <Stack.Screen name="tiles" options={{ title: 'Tính số gạch', headerShown: false }} />
      <Stack.Screen name="electrical" options={{ title: 'Tính công suất điện', headerShown: false }} />
      <Stack.Screen name="plumbing" options={{ title: 'Tính đường ống nước', headerShown: false }} />
    </Stack>
  );
}
