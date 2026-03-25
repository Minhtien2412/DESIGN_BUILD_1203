import { FlowPage } from "@/components/ui-clone/flow-page";

export default function StateErrorScreen() {
  return (
    <FlowPage
      title="State • Error"
      subtitle="Màn lỗi khi request thất bại"
      badge={{ label: "ERROR", tone: "warning" }}
      sections={[
        {
          key: "error",
          title: "Chi tiết lỗi",
          rows: [
            { label: "Mã lỗi", value: "API_TIMEOUT_408" },
            { label: "Endpoint", value: "/orders/material" },
            { label: "Ảnh hưởng", value: "Không tải được báo giá" },
          ],
          note: "Đã ghi log Sentry + có thể retry mà không mất form state.",
        },
      ]}
      footerActions={[
        {
          label: "Thử lại",
          route: "/ui-clone/states/loading",
          icon: "refresh-outline",
        },
        {
          label: "Về màn chính",
          route: "/ui-clone",
          tone: "secondary",
          icon: "home-outline",
        },
      ]}
    />
  );
}
