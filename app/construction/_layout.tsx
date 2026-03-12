/**
 * Construction Map Layout
 * Stack navigation for construction map screens
 */

import { Stack } from 'expo-router';

export default function ConstructionMapLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="map/index"
        options={{
          title: 'Construction Maps',
        }}
      />
      <Stack.Screen
        name="map/[id]"
        options={{
          title: 'Construction Map Detail',
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
