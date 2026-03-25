import { FlowPage } from "@/components/ui-clone/flow-page";

export default function DeliveryDriverDetailScreen() {
  return (
    <FlowPage
      title="Hồ sơ tài xế"
      subtitle="Thông tin người vận hành và phương tiện"
      badge={{ label: "DRIVER", tone: "success" }}
      sections={[
        {
          key: "identity",
          title: "Thông tin tài xế",
          rows: [
            { label: "Họ tên", value: "Nguyễn Văn A" },
            { label: "Biển số", value: "51C-892.34" },
            { label: "Số điện thoại", value: "0909 123 456" },
            { label: "Đánh giá", value: "4.9 ★", valueColor: "#D79A1A" },
          ],
        },
        {
          key: "performance",
          title: "Hiệu suất gần đây",
          bullets: [
            "32 chuyến / 30 ngày • đúng giờ 96%",
            "Không có vi phạm tốc độ trong tháng",
            "Điểm hài lòng khách hàng: 4.8/5",
          ],
        },
      ]}
      footerActions={[
        {
          label: "Quay lại chuyến giao",
          route: "/ui-clone/delivery/trip-detail",
          icon: "arrow-back-outline",
        },
      ]}
    />
  );
}
