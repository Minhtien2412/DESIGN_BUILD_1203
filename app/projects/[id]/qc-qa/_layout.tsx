import { Stack } from 'expo-router';

export default function QCQALayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'QC/QA',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="checklist/foundation"
        options={{
          title: 'Checklist Móng',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="checklist/structure"
        options={{
          title: 'Checklist Kết Cấu',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="checklist/mep"
        options={{
          title: 'Checklist M&E',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="checklist/finishing"
        options={{
          title: 'Checklist Hoàn Thiện',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="checklist/landscape"
        options={{
          title: 'Checklist Cảnh Quan',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="defects/list"
        options={{
          title: 'Danh Sách Lỗi',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="defects/create"
        options={{
          title: 'Báo Cáo Lỗi',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="defects/[id]"
        options={{
          title: 'Chi Tiết Lỗi',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="reports/index"
        options={{
          title: 'Báo Cáo QC/QA',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="reports/compliance"
        options={{
          title: 'Báo Cáo Tuân Thủ',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="reports/quality-metrics"
        options={{
          title: 'Chỉ Số Chất Lượng',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
