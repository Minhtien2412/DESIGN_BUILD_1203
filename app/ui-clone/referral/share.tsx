import { FlowPage } from "@/components/ui-clone/flow-page";

export default function ReferralShareScreen() {
  return (
    <FlowPage
      title="Chia sẻ mã giới thiệu"
      subtitle="Phân phối link, QR và nội dung mời"
      badge={{ label: "SHARE", tone: "success" }}
      sections={[
        {
          key: "channels",
          title: "Kênh chia sẻ",
          rows: [
            { label: "Zalo", value: "Ưu tiên" },
            { label: "Facebook", value: "Đang bật" },
            { label: "SMS", value: "Có mẫu tin" },
            { label: "Sao chép link", value: "1 chạm" },
          ],
        },
      ]}
      footerActions={[
        {
          label: "Hiển thị QR toàn màn hình",
          route: "/ui-clone/referral/full-qr",
          icon: "qr-code-outline",
        },
      ]}
    />
  );
}
