/**
 * Tools Layout - Stack Navigator
 */
import { Stack } from "expo-router";

export default function ToolsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="lo-ban-ruler" />
      <Stack.Screen name="color-picker" />
      <Stack.Screen name="interior-planner" />
      <Stack.Screen name="price-compare" />
      <Stack.Screen name="fengshui" />
      <Stack.Screen name="feng-shui-ai" />
    </Stack>
  );
}
