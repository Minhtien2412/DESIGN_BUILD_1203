import { useLocalSearchParams } from "expo-router";

import RoleBasedHomeScreen from "@/src/features/home/screens/RoleBasedHomeScreen";
import { UserRole } from "@/types/role";

export default function RoleBasedHomeRoute() {
  const { role } = useLocalSearchParams<{ role?: UserRole }>();
  return <RoleBasedHomeScreen role={role} />;
}
