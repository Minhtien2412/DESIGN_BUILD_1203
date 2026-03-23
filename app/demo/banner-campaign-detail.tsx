import { useLocalSearchParams } from "expo-router";

import BannerCampaignDetailScreen from "@/src/features/home/screens/BannerCampaignDetailScreen";
import { UserRole } from "@/types/role";

export default function BannerCampaignDetailRoute() {
  const { campaignId, role, title } = useLocalSearchParams<{
    campaignId?: string;
    role?: UserRole;
    title?: string;
  }>();

  return (
    <BannerCampaignDetailScreen
      campaignId={campaignId}
      role={role ?? "customer"}
      title={title}
    />
  );
}
