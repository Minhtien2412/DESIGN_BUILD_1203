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
    </Stack>
  );
}
