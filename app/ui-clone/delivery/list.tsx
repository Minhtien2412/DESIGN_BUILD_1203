import { FlowPage } from "@/components/ui-clone/flow-page";

export default function DeliveryListScreen() {
  return (
    <FlowPage
      title="Danh sách chuyến giao"
      subtitle="Quản lý toàn bộ chuyến đang chạy trong ngày"
      badge={{ label: "DELIVERY FLOW" }}
      sections={[
        {
          key: "today",
          title: "Chuyến hôm nay",
          metrics: [
            {
              key: "d1",
              label: "Tổng chuyến",
              value: "14",
              icon: "car-outline",
            },
            {
              key: "d2",
              label: "Đang giao",
              value: "3",
              icon: "navigate-outline",
            },
            {
              key: "d3",
              label: "Đã xong",
              value: "9",
              icon: "checkmark-circle-outline",
            },
            {
              key: "d4",
              label: "Sự cố",
              value: "2",
              icon: "alert-circle-outline",
            },
          ],
        },
        {
          key: "open",
          title: "Chuyến cần theo dõi",
          bullets: [
            "TRIP-1102 • VLXD Đức Hạnh → Vinhomes Q9",
            "TRIP-1103 • Trạm A → Nhà phố Thủ Đức",
          ],
          actions: [
            {
              label: "Mở chi tiết chuyến",
              route: "/ui-clone/delivery/trip-detail",
              icon: "open-outline",
            },
          ],
        },
      ]}
    />
  );
}
