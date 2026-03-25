import { FlowPage } from "@/components/ui-clone/flow-page";

export default function ReferralInviteListScreen() {
  return (
    <FlowPage
      title="Danh sách người được mời"
      subtitle="Quản lý trạng thái từng người và nhắc lại"
      badge={{ label: "INVITE LIST", tone: "neutral" }}
      sections={[
        {
          key: "invites",
          title: "Danh sách active",
          bullets: [
            "Nguyễn Văn E • Chưa cài app",
            "Đoàn Văn F • Đã cài app, chưa đăng ký",
            "Trần Thị G • Đã đăng ký thành công",
          ],
        },
      ]}
      footerActions={[
        {
          label: "Chia sẻ lời mời mới",
          route: "/ui-clone/referral/share",
          icon: "send-outline",
        },
      ]}
    />
  );
}
