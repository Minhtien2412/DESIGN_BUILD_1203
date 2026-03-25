import { FlowPage } from "@/components/ui-clone/flow-page";

export default function MaterialCompareScreen() {
  return (
    <FlowPage
      title="So sánh báo giá vật tư"
      subtitle="Đánh giá theo giá, chất lượng và ETA"
      badge={{ label: "COMPARE", tone: "warning" }}
      sections={[
        {
          key: "vendor",
          title: "Bảng so sánh nhanh",
          rows: [
            { label: "VLXD Đức Hạnh", value: "20.725.000đ" },
            { label: "An Phát Materials", value: "21.020.000đ" },
            { label: "Bình Minh Supply", value: "20.910.000đ" },
            {
              label: "Đánh giá cao nhất",
              value: "Đức Hạnh",
              valueColor: "#75B90D",
            },
          ],
        },
        {
          key: "decision",
          title: "Quy tắc chọn NCC",
          bullets: [
            "Ưu tiên nhà cung cấp có xác thực hồ sơ đầy đủ",
            "Chênh lệch giá < 2% ưu tiên ETA nhanh hơn",
            "Loại trừ NCC có tỷ lệ giao trễ > 10%",
          ],
          actions: [
            {
              label: "Chọn nhà cung cấp",
              route: "/ui-clone/orders/supplier-picker",
              icon: "checkmark-circle-outline",
            },
          ],
        },
      ]}
    />
  );
}
