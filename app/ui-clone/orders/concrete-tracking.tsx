import { FlowPage } from "@/components/ui-clone/flow-page";

export default function ConcreteTrackingScreen() {
  return (
    <FlowPage
      title="Theo dõi đơn bê tông"
      subtitle="Giám sát trạng thái xe bồn theo thời gian thực"
      badge={{ label: "TRACKING", tone: "success" }}
      sections={[
        {
          key: "status",
          title: "Trạng thái hiện tại",
          rows: [
            { label: "Đơn", value: "BT-9302" },
            { label: "Tài xế", value: "Nguyễn Văn A" },
            { label: "Biển số", value: "51C-892.34" },
            { label: "ETA", value: "10:45", valueColor: "#75B90D" },
          ],
        },
        {
          key: "events",
          title: "Mốc vận chuyển",
          bullets: [
            "09:00 • Xác nhận đơn thành công",
            "09:30 • Xe rời trạm trộn",
            "10:15 • Đang di chuyển đến công trình",
          ],
        },
      ]}
      footerActions={[
        {
          label: "Mở màn hình chi tiết bê tông",
          route: "/ui-clone/concrete-order-detail",
          icon: "open-outline",
        },
      ]}
    />
  );
}
