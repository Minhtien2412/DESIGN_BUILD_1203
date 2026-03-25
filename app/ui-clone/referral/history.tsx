import { FlowPage } from "@/components/ui-clone/flow-page";

export default function ReferralHistoryScreen() {
  return (
    <FlowPage
      title="Lịch sử giới thiệu"
      subtitle="Theo dõi từng lượt mời và trạng thái đăng ký"
      badge={{ label: "REFERRAL HISTORY" }}
      sections={[
        {
          key: "timeline",
          title: "Lượt giới thiệu gần nhất",
          bullets: [
            "23/03 • Trần Văn B • Đăng ký thành công",
            "22/03 • Lê Thị C • Chờ xác minh số điện thoại",
            "21/03 • Phạm Văn D • Đã kích hoạt tài khoản",
          ],
          actions: [
            {
              label: "Xem chi tiết phần thưởng",
              route: "/ui-clone/referral/reward-detail",
              icon: "gift-outline",
            },
          ],
        },
      ]}
    />
  );
}
