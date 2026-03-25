import { FlowPage } from "@/components/ui-clone/flow-page";

export default function CoffaListScreen() {
  return (
    <FlowPage
      title="Danh sách đơn Coffa"
      subtitle="Tập hợp các gói ván - giàn giáo - phụ kiện"
      badge={{ label: "ORDER • COFFA" }}
      sections={[
        {
          key: "inventory",
          title: "Gói coffa đề xuất",
          bullets: [
            "Gói ván 25x4m • 10 tấm",
            "Gói giàn giáo 1m7 • 20 khung",
            "Gói cây chống nêm • 15 cây",
          ],
        },
        {
          key: "next",
          title: "Phê duyệt báo giá",
          rows: [
            { label: "Tổng dự toán", value: "3.376.000đ" },
            { label: "Nhà cung cấp", value: "Coffa Đức Hạnh" },
          ],
          actions: [
            {
              label: "Xác nhận đơn Coffa",
              route: "/ui-clone/orders/coffa-confirm",
              icon: "clipboard-outline",
            },
          ],
        },
      ]}
    />
  );
}
