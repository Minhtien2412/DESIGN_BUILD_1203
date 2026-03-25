import { FlowPage } from "@/components/ui-clone/flow-page";

export default function DeliveryHistoryScreen() {
  return (
    <FlowPage
      title="Lịch sử giao hàng"
      subtitle="Tổng hợp chuyến đã hoàn tất và sự cố đã xử lý"
      badge={{ label: "DELIVERY HISTORY", tone: "neutral" }}
      sections={[
        {
          key: "history",
          title: "Nhật ký gần nhất",
          bullets: [
            "TRIP-1089 • Hoàn tất • 24/03/2026",
            "TRIP-1088 • Hoàn tất • 24/03/2026",
            "TRIP-1086 • Có sự cố • Đã xử lý",
            "TRIP-1085 • Hoàn tất • 23/03/2026",
          ],
          note: "Lịch sử lưu 180 ngày và có thể xuất CSV/PDF từ backend quản trị.",
        },
      ]}
    />
  );
}
