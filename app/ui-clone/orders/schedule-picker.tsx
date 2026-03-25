import { FlowPage } from "@/components/ui-clone/flow-page";

export default function SchedulePickerScreen() {
  return (
    <FlowPage
      title="Chọn lịch giao hàng"
      subtitle="Thiết lập thời điểm nhận và điều phối xe"
      badge={{ label: "SCHEDULE", tone: "neutral" }}
      sections={[
        {
          key: "window",
          title: "Khung giờ đề xuất",
          rows: [
            { label: "Ngày", value: "26/03/2026" },
            { label: "Ca sáng", value: "08:00 - 10:00" },
            { label: "Ca chiều", value: "14:00 - 16:00" },
            { label: "Ưu tiên", value: "Ca sáng" },
          ],
        },
        {
          key: "sync",
          title: "Đồng bộ thi công",
          bullets: [
            "Tự động thông báo đội trưởng trước 60 phút",
            "Khóa thay đổi lịch sau khi xác nhận xe",
            "Đồng bộ với tiến độ đổ bê tông thực tế",
          ],
          actions: [
            {
              label: "Tiếp tục xác nhận đơn",
              route: "/ui-clone/orders/material-confirm",
              icon: "arrow-forward-circle-outline",
            },
          ],
        },
      ]}
    />
  );
}
