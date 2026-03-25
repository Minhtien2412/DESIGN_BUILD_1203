import { FlowPage } from "@/components/ui-clone/flow-page";

export default function StatePendingScreen() {
  return (
    <FlowPage
      title="State • Pending"
      subtitle="Màn chờ duyệt hoặc chờ hệ thống xử lý"
      badge={{ label: "PENDING", tone: "neutral" }}
      sections={[
        {
          key: "pending",
          title: "Tình trạng chờ",
          rows: [
            { label: "Yêu cầu", value: "Báo cáo sự cố TRIP-1102" },
            { label: "Trạng thái", value: "Đang chờ QA xác nhận" },
            { label: "SLA", value: "Dưới 4 giờ" },
          ],
        },
      ]}
      footerActions={[
        {
          label: "Theo dõi lịch sử giao",
          route: "/ui-clone/delivery/history",
          icon: "time-outline",
        },
      ]}
    />
  );
}
