/**
 * Meet Module Layout
 * Video conferencing like Google Meet
 */

import { Stack } from 'expo-router';

export default function MeetLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Cuộc họp' }} />
      <Stack.Screen name="create" options={{ title: 'Tạo cuộc họp' }} />
      <Stack.Screen name="join" options={{ title: 'Tham gia cuộc họp' }} />
      <Stack.Screen name="[code]" options={{ title: 'Phòng họp' }} />
    </Stack>
  );
}
