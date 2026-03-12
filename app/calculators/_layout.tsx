/**
 * Calculators Layout - Tiện ích tính toán hoàn thiện
 */
import { Stack } from "expo-router";

export default function CalculatorsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#0F766E" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: "Dự toán xây dựng", headerShown: false }}
      />
      <Stack.Screen
        name="project-estimate"
        options={{ title: "Chi tiết dự toán", headerShown: false }}
      />
      <Stack.Screen
        name="paint"
        options={{ title: "Tính lượng sơn", headerShown: false }}
      />
      <Stack.Screen
        name="tiles"
        options={{ title: "Tính số gạch", headerShown: false }}
      />
      <Stack.Screen
        name="electrical"
        options={{ title: "Tính công suất điện", headerShown: false }}
      />
      <Stack.Screen
        name="plumbing"
        options={{ title: "Tính đường ống nước", headerShown: false }}
      />
      <Stack.Screen
        name="quick-estimate"
        options={{ title: "Dự toán nhanh", headerShown: false }}
      />
      <Stack.Screen
        name="templates"
        options={{ title: "Mẫu dự toán", headerShown: false }}
      />
      <Stack.Screen
        name="material-list"
        options={{ title: "Bảng vật tư", headerShown: false }}
      />
      <Stack.Screen
        name="payment-schedule"
        options={{ title: "Lịch thanh toán", headerShown: false }}
      />
      <Stack.Screen
        name="compare"
        options={{ title: "So sánh dự toán", headerShown: false }}
      />
    </Stack>
  );
}
