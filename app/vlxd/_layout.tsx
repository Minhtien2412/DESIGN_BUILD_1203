/**
 * VLXD Layout - Ép cọc - Bê tông - VLXD
 * Stack navigation for construction materials screens
 */

import { Stack } from "expo-router";

export default function VLXDLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: "VLXD - Vật liệu xây dựng" }}
      />
      <Stack.Screen name="order" options={{ title: "Đặt hàng VLXD" }} />
      <Stack.Screen name="quotation" options={{ title: "Báo giá NCC" }} />
      <Stack.Screen name="sample-approval" options={{ title: "Trình mẫu" }} />
      <Stack.Screen name="supplier-selection" options={{ title: "Chọn NCC" }} />
      <Stack.Screen
        name="order-summary"
        options={{ title: "Tổng hợp đơn hàng" }}
      />
      <Stack.Screen name="coffa-order" options={{ title: "Đặt hàng Coffa" }} />
      <Stack.Screen
        name="fence-order"
        options={{ title: "Sắt hàng rào bao che" }}
      />
    </Stack>
  );
}
