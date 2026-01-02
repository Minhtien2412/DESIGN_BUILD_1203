import { Stack } from 'expo-router';

export default function TimelineLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Timeline & Gantt Chart',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="phases"
        options={{
          title: 'Quản lý giai đoạn',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="tasks"
        options={{
          title: 'Quản lý công việc',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="phase/[id]"
        options={{
          title: 'Chi tiết giai đoạn',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="task/[id]"
        options={{
          title: 'Chi tiết công việc',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="create-phase"
        options={{
          title: 'Tạo giai đoạn',
          presentation: 'modal',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="create-task"
        options={{
          title: 'Tạo công việc',
          presentation: 'modal',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="dependencies"
        options={{
          title: 'Quản lý phụ thuộc',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="critical-path"
        options={{
          title: 'Đường găng',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="baselines"
        options={{
          title: 'Baselines',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="resources"
        options={{
          title: 'Phân bổ nguồn lực',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
