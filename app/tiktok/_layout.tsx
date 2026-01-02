/**
 * TikTok Layout
 * Stack navigator for TikTok screens
 * 
 * @author AI Assistant
 * @date 23/12/2025
 */

import { Stack } from 'expo-router';

export default function TikTokLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="profile/[id]"
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          headerBackTitle: '',
        }}
      />
      <Stack.Screen 
        name="search"
        options={{
          headerShown: true,
          headerTitle: 'Search',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen 
        name="video/[id]"
        options={{
          headerShown: false,
          animation: 'fade',
        }}
      />
    </Stack>
  );
}
