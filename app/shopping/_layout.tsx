import { Stack } from 'expo-router';

export default function ShoppingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="products-catalog" options={{ title: 'Thư Viện Thiết Bị' }} />
    </Stack>
  );
}
