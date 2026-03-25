import { FlowPage } from "@/components/ui-clone/flow-page";

export default function CoffaConfirmScreen() {
  return (
    <FlowPage
      title="Xác nhận đơn Coffa"
      subtitle="Kiểm tra danh mục thuê và vật tư coffa"
      badge={{ label: "COFFA CONFIRM", tone: "warning" }}
      sections={[
        {
          key: "summary",
          title: "Thông tin xác nhận",
          rows: [
            { label: "Mã đơn", value: "CF-2681" },
            { label: "Dự án", value: "Vinhomes Q9" },
            { label: "Giá trị", value: "3.376.000đ", valueColor: "#75B90D" },
            { label: "Ngày giao", value: "26/03/2026" },
          ],
        },
      ]}
      footerActions={[
        {
          label: "Phát hành đơn Coffa",
          route: "/ui-clone/orders/material-complete",
          icon: "checkmark-circle-outline",
        },
      ]}
    />
  );
}
