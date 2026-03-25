import { FlowPage } from "@/components/ui-clone/flow-page";

export default function StateEmptyScreen() {
  return (
    <FlowPage
      title="State • Empty"
      subtitle="Màn trống khi chưa có dữ liệu"
      badge={{ label: "EMPTY", tone: "warning" }}
      sections={[
        {
          key: "empty",
          title: "Không có kết quả",
          bullets: [
            "Chưa có đơn hàng phù hợp bộ lọc",
            "Bạn có thể tạo đơn mới hoặc đổi điều kiện lọc",
          ],
        },
      ]}
      footerActions={[
        {
          label: "Tạo đơn mới",
          route: "/ui-clone/orders/material-list",
          icon: "add-circle-outline",
        },
      ]}
    />
  );
}
