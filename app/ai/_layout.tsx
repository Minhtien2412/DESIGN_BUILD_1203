import { Colors } from '@/constants/theme';
import { Stack } from 'expo-router';

export default function AILayout() {
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
          title: 'AI Trợ lý xây dựng',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="photo-analysis"
        options={{
          title: 'Phân tích ảnh tiến độ',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="generate-report"
        options={{
          title: 'Tạo báo cáo tự động',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="material-check"
        options={{
          title: 'Kiểm tra vật liệu',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
