import { FlowPage } from "@/components/ui-clone/flow-page";

export default function DeliveryTripDetailScreen() {
  return (
    <FlowPage
      title="Chi tiết chuyến giao"
      subtitle="TRIP-1102 • Theo dõi mốc và tài xế"
      badge={{ label: "TRIP DETAIL", tone: "warning" }}
      sections={[
        {
          key: "trip",
          title: "Thông tin chuyến",
          rows: [
            { label: "Tuyến", value: "Kho Đức Hạnh → Vinhomes Q9" },
            { label: "Khối lượng", value: "10m³" },
            { label: "ETA", value: "10:45", valueColor: "#75B90D" },
            { label: "Trạng thái", value: "Đang di chuyển" },
          ],
          actions: [
            {
              label: "Xem hồ sơ tài xế",
              route: "/ui-clone/delivery/driver-detail",
              tone: "secondary",
              icon: "person-outline",
            },
          ],
        },
      ]}
      footerActions={[
        {
          label: "Xác nhận giao thành công",
          route: "/ui-clone/delivery/proof-of-delivery",
          icon: "camera-outline",
        },
        {
          label: "Báo cáo sự cố",
          route: "/ui-clone/delivery/report-issue",
          tone: "secondary",
          icon: "alert-circle-outline",
        },
      ]}
    />
  );
}
