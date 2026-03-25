import { FlowPage } from "@/components/ui-clone/flow-page";

export default function ProfileFullQRScreen() {
  return (
    <FlowPage
      title="QR truy cập hồ sơ"
      subtitle="Dùng để xác thực nhanh thông tin và chia sẻ hồ sơ"
      badge={{ label: "SECURE QR", tone: "success" }}
      sections={[
        {
          key: "qr",
          title: "Thông tin mã QR",
          rows: [
            { label: "Mã", value: "PROFILE-QR-0273" },
            { label: "Hiệu lực", value: "24 giờ" },
            { label: "Thiết bị đã quét", value: "3" },
          ],
        },
        {
          key: "security",
          title: "Bảo mật truy cập",
          bullets: [
            "Tự động thu hồi khi đổi thông tin hồ sơ",
            "Giới hạn tối đa 10 lượt quét mỗi ngày",
            "Bật cảnh báo khi quét từ thiết bị lạ",
          ],
          actions: [
            {
              label: "Đi đến cài đặt bảo mật",
              route: "/ui-clone/profile/settings",
              icon: "settings-outline",
            },
          ],
        },
      ]}
    />
  );
}
