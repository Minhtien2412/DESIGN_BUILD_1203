import { Stack } from 'expo-router';

export default function InventoryLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Vật liệu & Kho',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="materials"
        options={{
          title: 'Danh sách vật liệu',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="create-material"
        options={{
          title: 'Thêm vật liệu',
          presentation: 'modal',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="material/[id]"
        options={{
          title: 'Chi tiết vật liệu',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="suppliers"
        options={{
          title: 'Nhà cung cấp',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="create-supplier"
        options={{
          title: 'Thêm nhà cung cấp',
          presentation: 'modal',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="orders"
        options={{
          title: 'Đơn đặt hàng',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="create-order"
        options={{
          title: 'Tạo đơn hàng',
          presentation: 'modal',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="order/[id]"
        options={{
          title: 'Chi tiết đơn hàng',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="transactions"
        options={{
          title: 'Lịch sử giao dịch',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="alerts"
        options={{
          title: 'Cảnh báo kho',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
