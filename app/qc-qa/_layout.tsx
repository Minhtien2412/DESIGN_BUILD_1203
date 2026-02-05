/**
 * QC/QA Layout
 * Stack navigation for Quality Control & Quality Assurance
 *
 * @author AI Assistant
 * @date 19/01/2026
 */

import { Stack } from "expo-router";

export default function QCQALayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "QC/QA",
        }}
      />
      <Stack.Screen
        name="inspections"
        options={{
          title: "Kiểm tra",
        }}
      />
      <Stack.Screen
        name="checklists"
        options={{
          title: "Danh sách kiểm tra",
        }}
      />
      <Stack.Screen
        name="defects"
        options={{
          title: "Lỗi thi công",
        }}
      />
      <Stack.Screen
        name="reports"
        options={{
          title: "Báo cáo chất lượng",
        }}
      />
      <Stack.Screen
        name="standards"
        options={{
          title: "Tiêu chuẩn",
        }}
      />
    </Stack>
  );
}
