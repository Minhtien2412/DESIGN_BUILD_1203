import { Stack } from 'expo-router';

export default function LaborLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Nhân công & Chấm công',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="workers"
        options={{
          title: 'Danh sách nhân công',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="attendance"
        options={{
          title: 'Chấm công',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="shifts"
        options={{
          title: 'Ca làm việc',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="leave-requests"
        options={{
          title: 'Đơn nghỉ phép',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="payroll"
        options={{
          title: 'Bảng lương',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="create-worker"
        options={{
          title: 'Thêm nhân công',
          headerShown: true,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="create-attendance"
        options={{
          title: 'Chấm công',
          headerShown: true,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="create-leave-request"
        options={{
          title: 'Tạo đơn nghỉ phép',
          headerShown: true,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="create-payroll"
        options={{
          title: 'Tạo bảng lương',
          headerShown: true,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="worker-detail"
        options={{
          title: 'Chi tiết nhân công',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
