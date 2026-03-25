import { FlowPage } from "@/components/ui-clone/flow-page";

export default function MaterialListScreen() {
  return (
    <FlowPage
      title="Danh sách vật tư"
      subtitle="Chọn vật tư cần đặt cho công trình"
      badge={{ label: "ORDER • MATERIAL" }}
      sections={[
        {
          key: "summary",
          title: "Nhu cầu hiện tại",
          metrics: [
            { key: "m1", label: "Mặt hàng", value: "18", icon: "cube-outline" },
            {
              key: "m2",
              label: "Nhà cung cấp",
              value: "6",
              icon: "storefront-outline",
            },
            {
              key: "m3",
              label: "Dự toán",
              value: "20.7M",
              icon: "cash-outline",
            },
            {
              key: "m4",
              label: "ETA",
              value: "26/03",
              icon: "calendar-outline",
            },
          ],
        },
        {
          key: "items",
          title: "Nhóm vật tư đề xuất",
          bullets: [
            "Cát bê tông hạt lớn • 2m³",
            "Đá 1x2 xanh • 10m³",
            "Xi măng Hà Tiên • 100 bao",
          ],
          actions: [
            {
              label: "So sánh nhà cung cấp",
              route: "/ui-clone/orders/material-compare",
              icon: "git-compare-outline",
            },
          ],
        },
      ]}
    />
  );
}
