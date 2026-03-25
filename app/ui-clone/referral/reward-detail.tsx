import { FlowPage } from "@/components/ui-clone/flow-page";

export default function ReferralRewardDetailScreen() {
  return (
    <FlowPage
      title="Chi tiết phần thưởng"
      subtitle="Mốc 30 thợ • Smart TV"
      badge={{ label: "REWARD DETAIL", tone: "warning" }}
      sections={[
        {
          key: "detail",
          title: "Điều kiện nhận",
          bullets: [
            "Tối thiểu 30 lượt đăng ký thành công",
            "Không vi phạm quy tắc chống gian lận",
            "Tài khoản đã xác minh CCCD",
          ],
          rows: [
            { label: "Tiến độ", value: "18 / 30" },
            { label: "Dự kiến hoàn thành", value: "Tuần 2 - Tháng 4" },
          ],
        },
      ]}
      footerActions={[
        {
          label: "Chia sẻ để tăng lượt mời",
          route: "/ui-clone/referral/share",
          icon: "share-social-outline",
        },
      ]}
    />
  );
}
