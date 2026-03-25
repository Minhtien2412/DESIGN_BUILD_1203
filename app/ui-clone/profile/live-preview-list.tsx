import { FlowPage } from "@/components/ui-clone/flow-page";

export default function LivePreviewListScreen() {
  return (
    <FlowPage
      title="Danh sách Live Preview"
      subtitle="Luồng camera công trình theo thời gian thực"
      badge={{ label: "LIVE FEED", tone: "neutral" }}
      sections={[
        {
          key: "feeds",
          title: "Camera đang phát",
          bullets: [
            "Cam 01 - Cổng chính • 1.2k lượt xem",
            "Cam 02 - Tầng 2 • 658 lượt xem",
            "Cam 03 - Kho vật tư • 402 lượt xem",
          ],
        },
        {
          key: "share",
          title: "Chia sẻ quyền truy cập",
          rows: [
            { label: "Người xem được cấp", value: "12" },
            { label: "Liên kết hết hạn", value: "2" },
            { label: "Bảo mật", value: "OTP + QR" },
          ],
          actions: [
            {
              label: "Mở mã QR toàn màn hình",
              route: "/ui-clone/profile/full-qr",
              icon: "qr-code-outline",
            },
          ],
        },
      ]}
    />
  );
}
