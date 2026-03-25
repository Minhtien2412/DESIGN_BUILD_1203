import { FlowPage } from "@/components/ui-clone/flow-page";

export default function MaterialConfirmScreen() {
  return (
    <FlowPage
      title="Xác nhận đơn vật tư"
      subtitle="Bước cuối trước khi phát hành đơn chính thức"
      badge={{ label: "CONFIRM", tone: "warning" }}
      sections={[
        {
          key: "review",
          title: "Tóm tắt đơn hàng",
          rows: [
            { label: "Mã đơn", value: "MS102" },
            { label: "Nhà cung cấp", value: "VLXD Đức Hạnh" },
            { label: "Tổng tiền", value: "20.725.000đ", valueColor: "#75B90D" },
            { label: "Lịch giao", value: "26/03/2026 • 08:00" },
          ],
        },
        {
          key: "confirm",
          title: "Điều kiện phát hành",
          bullets: [
            "Đã có chữ ký xác nhận của kỹ sư giám sát",
            "Đã khóa khối lượng theo BOQ hiện hành",
            "Đã bật theo dõi xe giao theo GPS",
          ],
        },
      ]}
      footerActions={[
        {
          label: "Xác nhận & phát hành",
          route: "/ui-clone/orders/material-complete",
          icon: "checkmark-done-outline",
        },
      ]}
    />
  );
}
