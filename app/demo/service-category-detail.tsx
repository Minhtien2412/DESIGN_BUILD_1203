import { useLocalSearchParams } from "expo-router";

import ServiceCategoryDetailScreen from "@/src/features/home/screens/ServiceCategoryDetailScreen";
import { UserRole } from "@/types/role";

export default function ServiceCategoryDetailRoute() {
  const { categoryId, role, title } = useLocalSearchParams<{
    categoryId?: string;
    role?: UserRole;
    title?: string;
  }>();

  return (
    <ServiceCategoryDetailScreen
      categoryId={categoryId}
      role={role ?? "customer"}
      title={title}
    />
  );
}
