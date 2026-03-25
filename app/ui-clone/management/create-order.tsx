import { FlowPage } from "@/components/ui-clone/flow-page";

export default function CreateOrderScreen() {
  return (
    <FlowPage
      title="Tạo đơn hàng"
      subtitle="Khởi tạo đơn vật tư/coffa/bê tông theo template"
      badge={{ label: "MANAGEMENT • ORDER", tone: "success" }}
      sections={[
        {
          key: "quick",
          title: "Mẫu đơn nhanh",
          bullets: [
            "Đơn vật tư tổng hợp",
            "Đơn coffa theo hạng mục",
            "Đơn bê tông theo mác và khối lượng",
          ],
        },
      ]}
      footerActions={[
        {
          label: "Đi đến danh sách vật tư",
          route: "/ui-clone/orders/material-list",
          icon: "cart-outline",
        },
      ]}
    />
  );
}
