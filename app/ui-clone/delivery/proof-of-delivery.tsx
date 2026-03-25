import { FlowPage } from "@/components/ui-clone/flow-page";

export default function DeliveryProofScreen() {
  return (
    <FlowPage
      title="Xác nhận bàn giao"
      subtitle="Thu thập ảnh, chữ ký và khối lượng thực tế"
      badge={{ label: "PROOF OF DELIVERY", tone: "success" }}
      sections={[
        {
          key: "proof",
          title: "Checklist bàn giao",
          bullets: [
            "Ảnh hiện trường trước và sau khi dỡ hàng",
            "Chữ ký kỹ sư giám sát tại công trình",
            "Khối lượng thực nhận và biên bản chênh lệch",
          ],
          rows: [
            { label: "Mã bàn giao", value: "POD-3321" },
            { label: "Trạng thái", value: "Đầy đủ", valueColor: "#2E9B3C" },
          ],
        },
      ]}
      footerActions={[
        {
          label: "Hoàn tất và lưu chứng từ",
          route: "/ui-clone/states/success",
          icon: "checkmark-done-outline",
        },
      ]}
    />
  );
}
