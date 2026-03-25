import { FlowPage } from "@/components/ui-clone/flow-page";

export default function ReferralProgramRulesScreen() {
  return (
    <FlowPage
      title="Thể lệ chương trình giới thiệu"
      subtitle="Điều kiện tính thưởng và chính sách chống gian lận"
      badge={{ label: "PROGRAM RULES", tone: "warning" }}
      sections={[
        {
          key: "rules",
          title: "Quy định chính",
          bullets: [
            "Lượt giới thiệu hợp lệ khi người được mời hoàn tất đăng ký",
            "Hệ thống từ chối tài khoản ảo hoặc trùng thiết bị",
            "Phần thưởng được cộng vào ví sau khi duyệt trong 24h",
            "Mọi khiếu nại cần gửi trong vòng 7 ngày",
          ],
        },
      ]}
      footerActions={[
        {
          label: "Quay lại màn referral chính",
          route: "/ui-clone/referral",
          icon: "arrow-back-outline",
        },
      ]}
    />
  );
}
