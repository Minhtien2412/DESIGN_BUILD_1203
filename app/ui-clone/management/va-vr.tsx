import { FlowPage } from "@/components/ui-clone/flow-page";

export default function VaVrScreen() {
  return (
    <FlowPage
      title="VA-VR mặt bằng"
      subtitle="Xem lớp dữ liệu ảo cho layout và tiến độ"
      badge={{ label: "VA-VR", tone: "neutral" }}
      sections={[
        {
          key: "layers",
          title: "Lớp dữ liệu đang bật",
          bullets: [
            "Lớp kết cấu",
            "Lớp điện nước (MEP)",
            "Lớp hoàn thiện nội thất",
            "Lớp cảnh báo an toàn",
          ],
        },
      ]}
      footerActions={[
        {
          label: "Kết thúc phiên quan sát",
          route: "/ui-clone/states/success",
          icon: "checkmark-circle-outline",
        },
      ]}
    />
  );
}
