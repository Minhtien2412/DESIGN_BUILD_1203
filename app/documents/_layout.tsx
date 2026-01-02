import { Stack } from 'expo-router';

export default function DocumentLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Tài liệu',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="documents"
        options={{
          title: 'Danh sách tài liệu',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="folders"
        options={{
          title: 'Thư mục',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="upload"
        options={{
          title: 'Tải lên tài liệu',
          headerShown: true,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="create-folder"
        options={{
          title: 'Tạo thư mục',
          headerShown: true,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="document-detail"
        options={{
          title: 'Chi tiết tài liệu',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="versions"
        options={{
          title: 'Lịch sử phiên bản',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="share"
        options={{
          title: 'Chia sẻ tài liệu',
          headerShown: true,
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
