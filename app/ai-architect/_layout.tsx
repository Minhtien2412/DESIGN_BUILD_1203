import { Colors } from '@/constants/theme';
import { Stack } from 'expo-router';

export default function AIArchitectLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.light.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'AI Kiến Trúc Sư',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="architecture"
        options={{
          title: 'Sơ Đồ Hệ Thống',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="implementation"
        options={{
          title: 'Triển Khai Code',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="visualizer"
        options={{
          title: 'Thư Viện Phong Cách',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="consultant"
        options={{
          title: 'Tư Vấn AI',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="design"
        options={{
          title: 'AI Design Generator',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="templates"
        options={{
          title: 'Project Templates',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="export"
        options={{
          title: 'Export Center',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
