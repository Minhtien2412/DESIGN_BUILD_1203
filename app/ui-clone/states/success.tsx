import { FlowPage } from "@/components/ui-clone/flow-page";

export default function StateSuccessScreen() {
  return (
    <FlowPage
      title="State • Success"
      subtitle="Màn thành công sau khi hoàn tất thao tác"
      badge={{ label: "SUCCESS", tone: "success" }}
      sections={[
        {
          key: "success",
          title: "Kết quả",
          bullets: [
            "Dữ liệu đã được lưu thành công",
            "Thông báo đã gửi đến các bên liên quan",
            "Bạn có thể tiếp tục thao tác kế tiếp",
          ],
        },
      ]}
      footerActions={[
        {
          label: "Quay lại UI Clone",
          route: "/ui-clone",
          icon: "checkmark-circle-outline",
        },
      ]}
    />
  );
}
