import { Stack } from 'expo-router';

export default function BudgetLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Ngân sách & Chi phí',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="budgets"
        options={{
          title: 'Quản lý ngân sách',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="create-budget"
        options={{
          title: 'Tạo ngân sách',
          presentation: 'modal',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="estimates"
        options={{
          title: 'Ước tính chi phí',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="create-estimate"
        options={{
          title: 'Tạo ước tính',
          presentation: 'modal',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="expenses"
        options={{
          title: 'Quản lý chi tiêu',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="create-expense"
        options={{
          title: 'Thêm chi tiêu',
          presentation: 'modal',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="invoices"
        options={{
          title: 'Hóa đơn',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="create-invoice"
        options={{
          title: 'Tạo hóa đơn',
          presentation: 'modal',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="invoice/[id]"
        options={{
          title: 'Chi tiết hóa đơn',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="reports"
        options={{
          title: 'Báo cáo tài chính',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
