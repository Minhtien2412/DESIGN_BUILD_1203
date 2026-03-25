import { FlowPage } from "@/components/ui-clone/flow-page";

export default function ProfileSettingsScreen() {
  return (
    <FlowPage
      title="Cài đặt hồ sơ"
      subtitle="Tùy chỉnh quyền riêng tư và thông báo"
      badge={{ label: "SETTINGS", tone: "neutral" }}
      sections={[
        {
          key: "privacy",
          title: "Quyền riêng tư",
          bullets: [
            "Ẩn số điện thoại trên trang công khai",
            "Chỉ cho phép khách đã xác thực xem live preview",
            "Yêu cầu OTP khi thay đổi tài khoản nhận tiền",
          ],
        },
        {
          key: "notify",
          title: "Thông báo",
          rows: [
            { label: "Nhắc lịch hẹn", value: "Bật" },
            { label: "Cảnh báo thanh toán", value: "Bật" },
            { label: "Cảnh báo rủi ro", value: "Bật" },
          ],
          actions: [
            {
              label: "Quay lại danh mục UI Clone",
              route: "/ui-clone",
              icon: "home-outline",
            },
          ],
        },
      ]}
    />
  );
}
