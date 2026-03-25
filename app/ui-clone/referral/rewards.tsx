import { FlowPage } from "@/components/ui-clone/flow-page";

export default function ReferralRewardsScreen() {
  return (
    <FlowPage
      title="Kho phần thưởng"
      subtitle="Danh sách mốc thưởng theo số lượng giới thiệu"
      badge={{ label: "REWARDS", tone: "success" }}
      sections={[
        {
          key: "tiers",
          title: "Mốc hiện tại",
          rows: [
            { label: "Đã đạt", value: "18 thợ" },
            { label: "Mốc kế tiếp", value: "30 thợ - Smart TV" },
            { label: "Ước tính", value: "+12 thợ trong 2 tuần" },
          ],
        },
        {
          key: "items",
          title: "Danh mục thưởng",
          bullets: [
            "10 thợ • 100.000đ",
            "30 thợ • Smart TV",
            "50 thợ • Tủ lạnh",
            "100 thợ • Xe máy",
          ],
          actions: [
            {
              label: "Mở chi tiết mốc thưởng",
              route: "/ui-clone/referral/reward-detail",
              icon: "ribbon-outline",
            },
          ],
        },
      ]}
    />
  );
}
