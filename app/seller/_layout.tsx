/**
 * Seller Center Layout
 * Layout cho khu vực người bán (Shopee/TikTok style)
 */

import { Stack } from "expo-router";

export default function SellerLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#FF6B35",
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Stack.Screen
        name="dashboard"
        options={{
          title: "Kênh người bán",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="products"
        options={{
          title: "Quản lý sản phẩm",
        }}
      />
      <Stack.Screen
        name="add-product"
        options={{
          title: "Thêm sản phẩm",
        }}
      />
      <Stack.Screen
        name="edit-product"
        options={{
          title: "Sửa sản phẩm",
        }}
      />
      <Stack.Screen
        name="orders"
        options={{
          title: "Quản lý đơn hàng",
        }}
      />
      <Stack.Screen
        name="order-detail"
        options={{
          title: "Chi tiết đơn hàng",
        }}
      />
      <Stack.Screen
        name="revenue"
        options={{
          title: "Doanh thu",
        }}
      />
      <Stack.Screen
        name="reviews"
        options={{
          title: "Đánh giá shop",
        }}
      />
      <Stack.Screen
        name="shop-settings"
        options={{
          title: "Cài đặt Shop",
        }}
      />
      <Stack.Screen
        name="promotions"
        options={{
          title: "Khuyến mãi",
        }}
      />
      <Stack.Screen
        name="analytics"
        options={{
          title: "Phân tích",
        }}
      />
    </Stack>
  );
}
