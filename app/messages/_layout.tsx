/**
 * Messages Layout
 * Định nghĩa navigation layout cho messaging system
 */

import { Stack } from 'expo-router';

export default function MessagesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Main list - redirect to unified */}
      <Stack.Screen 
        name="index" 
        options={{
          headerShown: false,
        }}
      />
      
      {/* Unified conversation list (Zalo-style) */}
      <Stack.Screen 
        name="unified"
        options={{
          headerShown: false,
        }}
      />

      {/* New conversation */}
      <Stack.Screen 
        name="new-conversation"
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />

      {/* Chat with specific user (legacy route) */}
      <Stack.Screen 
        name="[userId]"
        options={{
          headerShown: false,
        }}
      />

      {/* Zalo-style chat screen */}
      <Stack.Screen 
        name="chat/[conversationId]"
        options={{
          headerShown: false,
        }}
      />

      {/* Realtime chat */}
      <Stack.Screen 
        name="realtime-chat"
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
