/**
 * Seller Profile Layout - Dynamic routing cho seller/shop pages
 */

import { Stack } from "expo-router";

export default function SellerLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#0D9488" },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontWeight: "600" },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="shop"
        options={{
          title: "Shop",
        }}
      />
    </Stack>
  );
}
