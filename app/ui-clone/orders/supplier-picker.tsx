import { FlowPage } from "@/components/ui-clone/flow-page";

export default function SupplierPickerScreen() {
  return (
    <FlowPage
      title="Chọn nhà cung cấp"
      subtitle="Khóa đơn vị cung ứng cho đơn hàng"
      badge={{ label: "SUPPLIER PICKER", tone: "success" }}
      sections={[
        {
          key: "pick",
          title: "Nhà cung cấp được chọn",
          rows: [
            { label: "Tên NCC", value: "VLXD Đức Hạnh" },
            { label: "Kho", value: "Tân Đông Hiệp, Dĩ An" },
            { label: "ETA", value: "2 giờ" },
            { label: "Rating", value: "4.9 ★", valueColor: "#D79A1A" },
          ],
        },
        {
          key: "risk",
          title: "Kiểm tra rủi ro",
          bullets: [
            "NCC đạt chuẩn hóa đơn điện tử",
            "Đảm bảo tồn kho đủ cho toàn bộ đơn",
            "Đã bật bảo lãnh hoàn tiền nếu giao thiếu",
          ],
          actions: [
            {
              label: "Thiết lập lịch giao",
              route: "/ui-clone/orders/schedule-picker",
              icon: "time-outline",
            },
          ],
        },
      ]}
    />
  );
}
