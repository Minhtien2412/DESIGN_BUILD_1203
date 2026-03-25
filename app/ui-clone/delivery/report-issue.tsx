import { FlowPage } from "@/components/ui-clone/flow-page";

export default function DeliveryReportIssueScreen() {
  return (
    <FlowPage
      title="Báo cáo sự cố giao hàng"
      subtitle="Ghi nhận nguyên nhân và đề xuất xử lý"
      badge={{ label: "INCIDENT", tone: "warning" }}
      sections={[
        {
          key: "incident",
          title: "Thông tin sự cố",
          rows: [
            { label: "Loại sự cố", value: "Trễ ETA do kẹt xe" },
            { label: "Mức độ", value: "Trung bình", valueColor: "#D79A1A" },
            { label: "Ảnh hưởng", value: "+35 phút" },
            { label: "Trách nhiệm", value: "Đang xác minh" },
          ],
        },
        {
          key: "resolution",
          title: "Phương án xử lý",
          bullets: [
            "Thông báo tự động cho chủ công trình",
            "Điều phối tài xế thay thế nếu cần",
            "Gắn cờ chuyến để theo dõi QA hậu kỳ",
          ],
        },
      ]}
      footerActions={[
        {
          label: "Lưu báo cáo (trạng thái chờ)",
          route: "/ui-clone/states/pending",
          icon: "hourglass-outline",
        },
      ]}
    />
  );
}
