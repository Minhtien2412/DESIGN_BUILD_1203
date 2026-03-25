import { FlowPage } from "@/components/ui-clone/flow-page";

export default function WorkerDetailScreen() {
  return (
    <FlowPage
      title="Chi tiết thợ"
      subtitle="Hồ sơ năng lực và lịch sử công việc"
      badge={{ label: "WORKER DETAIL", tone: "success" }}
      sections={[
        {
          key: "profile",
          title: "Hồ sơ ứng viên",
          rows: [
            { label: "Họ tên", value: "Nguyễn Văn Thành" },
            { label: "Kinh nghiệm", value: "5 năm" },
            { label: "Chuyên môn", value: "Điện dân dụng" },
            { label: "Đánh giá", value: "4.8 ★", valueColor: "#D79A1A" },
          ],
        },
      ]}
      footerActions={[
        {
          label: "Xem chi tiết đánh giá",
          route: "/ui-clone/management/rating-detail",
          icon: "star-outline",
        },
      ]}
    />
  );
}
