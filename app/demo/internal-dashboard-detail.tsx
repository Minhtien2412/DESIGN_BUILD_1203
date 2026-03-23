import { useLocalSearchParams } from "expo-router";

import InternalDashboardDetailScreen from "@/src/features/home/screens/InternalDashboardDetailScreen";

export default function InternalDashboardDetailRoute() {
  const { section } = useLocalSearchParams<{ section?: string }>();
  return <InternalDashboardDetailScreen section={section} />;
}
