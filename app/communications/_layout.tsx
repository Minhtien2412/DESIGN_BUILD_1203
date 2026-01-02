/**
 * Communications Layout - Microsoft Teams Style
 * Sidebar navigation with Chat, Calls, Contacts, Activity
 */

import { Stack } from 'expo-router';

export default function CommunicationsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="chat/[conversationId]" />
      <Stack.Screen name="contacts" />
      <Stack.Screen name="activity" />
    </Stack>
  );
}
