import { useLocalSearchParams } from "expo-router";

import ProductDetailScreen from "@/src/features/home/screens/ProductDetailScreen";
import { UserRole } from "@/types/role";

export default function ProductDetailRoute() {
  const { productId, role } = useLocalSearchParams<{
    productId?: string;
    role?: UserRole;
  }>();

  return (
    <ProductDetailScreen productId={productId} role={role ?? "customer"} />
  );
}
