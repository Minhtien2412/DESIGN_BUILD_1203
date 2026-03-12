import { Colors } from "@/constants/theme";
import { Stack } from "expo-router";

export default function AIArchitectLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.light.primary,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "AI Kiến Trúc Sư",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="architecture"
        options={{
          title: "Sơ Đồ Hệ Thống",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="implementation"
        options={{
          title: "Triển Khai Code",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="visualizer"
        options={{
          title: "Thư Viện Phong Cách",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="consultant"
        options={{
          title: "Tư Vấn AI",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="design"
        options={{
          title: "Thiết kế bằng AI",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="templates"
        options={{
          title: "Mẫu dự án",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="export"
        options={{
          title: "Xuất dữ liệu",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
