import { FlowPage } from "@/components/ui-clone/flow-page";

export default function ProfileProjectDetailScreen() {
  return (
    <FlowPage
      title="Chi tiết dự án"
      subtitle="Biệt thự Vinhomes Q9 • Block A"
      badge={{ label: "DETAIL", tone: "warning" }}
      sections={[
        {
          key: "scope",
          title: "Phạm vi công việc",
          rows: [
            { label: "Chủ đầu tư", value: "Công ty Minh Khang" },
            { label: "Tiến độ", value: "82%", valueColor: "#75B90D" },
            { label: "Giai đoạn", value: "Hoàn thiện nội thất" },
            { label: "Ngày bàn giao", value: "30/04/2026" },
          ],
        },
        {
          key: "actions",
          title: "Hành động nhanh",
          bullets: [
            "Xuất báo cáo tiến độ cho khách hàng",
            "Gọi nhóm thi công xác nhận hạng mục còn thiếu",
          ],
          actions: [
            {
              label: "Xem danh sách live preview",
              route: "/ui-clone/profile/live-preview-list",
              icon: "videocam-outline",
            },
          ],
        },
      ]}
    />
  );
}
