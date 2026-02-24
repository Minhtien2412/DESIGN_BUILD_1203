import { Colors } from "@/constants/theme";
import { Stack } from "expo-router";

export default function ShoppingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#fff" },
        headerTintColor: Colors.light.primary,
        headerTitleStyle: { fontWeight: "600", fontSize: 17 },
        headerShadowVisible: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="products-catalog"
        options={{ title: "Thư Viện Thiết Bị" }}
      />
      <Stack.Screen
        name="flash-sale"
        options={{ title: "Flash Sale", headerShown: false }}
      />
      <Stack.Screen name="promotions" options={{ title: "Khuyến Mãi" }} />
      <Stack.Screen name="categories" options={{ title: "Danh Mục" }} />
      <Stack.Screen name="brands" options={{ title: "Thương Hiệu" }} />
      <Stack.Screen name="new-arrivals" options={{ title: "Hàng Mới Về" }} />
      <Stack.Screen name="best-sellers" options={{ title: "Bán Chạy" }} />
      <Stack.Screen name="deals" options={{ title: "Ưu Đãi Hấp Dẫn" }} />
    </Stack>
  );
}
