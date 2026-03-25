import { FlowPage } from "@/components/ui-clone/flow-page";

export default function MaterialCompleteScreen() {
  return (
    <FlowPage
      title="Đơn vật tư hoàn tất"
      subtitle="Đơn đã được tạo và gửi cho các bên liên quan"
      badge={{ label: "COMPLETED", tone: "success" }}
      sections={[
        {
          key: "result",
          title: "Kết quả xử lý",
          metrics: [
            {
              key: "r1",
              label: "Mã đơn",
              value: "MS102",
              icon: "document-text-outline",
            },
            {
              key: "r2",
              label: "Trạng thái",
              value: "Đã xác nhận",
              icon: "checkmark-circle-outline",
            },
            {
              key: "r3",
              label: "Tổng tiền",
              value: "20.725.000đ",
              icon: "wallet-outline",
            },
            {
              key: "r4",
              label: "Theo dõi",
              value: "Đang mở",
              icon: "navigate-outline",
            },
          ],
        },
      ]}
      footerActions={[
        {
          label: "Mở chi tiết đơn hàng",
          route: "/ui-clone/material-order-detail",
          icon: "open-outline",
        },
        {
          label: "Xem trạng thái thành công",
          route: "/ui-clone/states/success",
          tone: "secondary",
          icon: "sparkles-outline",
        },
      ]}
    />
  );
}
