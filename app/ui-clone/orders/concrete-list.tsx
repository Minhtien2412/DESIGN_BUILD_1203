import { FlowPage } from "@/components/ui-clone/flow-page";

export default function ConcreteListScreen() {
  return (
    <FlowPage
      title="Danh sách đơn bê tông"
      subtitle="Lựa chọn mác bê tông và phương án bơm"
      badge={{ label: "ORDER • CONCRETE" }}
      sections={[
        {
          key: "mix",
          title: "Tùy chọn mác bê tông",
          rows: [
            { label: "M250", value: "1.100.000đ/m³" },
            { label: "M300", value: "1.200.000đ/m³" },
            { label: "M350", value: "1.300.000đ/m³" },
            { label: "Phụ gia", value: "R7, B2" },
          ],
        },
        {
          key: "move",
          title: "Điều phối vận chuyển",
          bullets: [
            "Chọn xe bồn theo năng lực trạm trộn",
            "Thiết lập tuyến giao ưu tiên tránh kẹt xe",
          ],
          actions: [
            {
              label: "Mở theo dõi giao bê tông",
              route: "/ui-clone/orders/concrete-tracking",
              icon: "car-outline",
            },
          ],
        },
      ]}
    />
  );
}
