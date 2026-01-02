/**
 * Archive Layout - Hidden from navigation
 * Contains variant/experimental screens for reference
 * 
 * Archived files:
 * - profile-luxury.tsx (European luxury design variant)
 * - profile-new.tsx (New profile design)
 * - notifications-luxury.tsx (Luxury notifications)
 * - notifications-timeline.tsx (Timeline style notifications)
 * - projects-luxury.tsx (Luxury projects view)
 * - modern-home.tsx (Modern home variant)
 * - activity.tsx (Activity screen)
 */

import { Stack } from 'expo-router';

export default function ArchiveLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="profile-luxury" options={{ title: 'Profile Luxury' }} />
      <Stack.Screen name="profile-new" options={{ title: 'Profile New' }} />
      <Stack.Screen name="notifications-luxury" options={{ title: 'Notifications Luxury' }} />
      <Stack.Screen name="notifications-timeline" options={{ title: 'Notifications Timeline' }} />
      <Stack.Screen name="projects-luxury" options={{ title: 'Projects Luxury' }} />
      <Stack.Screen name="modern-home" options={{ title: 'Modern Home' }} />
      <Stack.Screen name="activity" options={{ title: 'Activity' }} />
    </Stack>
  );
}
