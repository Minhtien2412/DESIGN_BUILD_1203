/**
 * Handbook Layout - Sổ tay KSXD
 */
import Colors from "@/constants/Colors";
import { Stack } from "expo-router";

export default function HandbookLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: Colors.light.primary,
        headerBackTitle: "Quay lại",
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Sổ tay KSXD" }} />
      <Stack.Screen name="[categoryId]" options={{ title: "Danh mục" }} />
      <Stack.Screen name="calculator" options={{ title: "Máy tính" }} />
      <Stack.Screen name="reference" options={{ title: "Tra cứu" }} />
    </Stack>
  );
}
