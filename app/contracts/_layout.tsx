import { Stack } from 'expo-router';

export default function ContractsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Hợp đồng',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: 'Tạo hợp đồng',
          headerShown: true,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="[id]/index"
        options={{
          title: 'Chi tiết hợp đồng',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="[id]/edit"
        options={{
          title: 'Chỉnh sửa hợp đồng',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="[id]/sign"
        options={{
          title: 'Ký hợp đồng',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="[id]/milestones"
        options={{
          title: 'Cột mốc thanh toán',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
