/**
 * Social Module Layout
 * Stack navigation for social features
 * 
 * @author AI Assistant
 * @date 23/12/2025
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { Stack } from 'expo-router';

export default function SocialLayout() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor,
        },
        headerTintColor: textColor,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerBackTitle: 'Quay lại',
        contentStyle: {
          backgroundColor,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Bảng tin',
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="post/[id]"
        options={{
          title: 'Bài viết',
        }}
      />
      <Stack.Screen
        name="profile/[id]"
        options={{
          title: 'Trang cá nhân',
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: 'Tạo bài viết',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
