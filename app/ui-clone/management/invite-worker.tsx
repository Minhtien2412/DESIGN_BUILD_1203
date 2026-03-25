import { FlowPage } from "@/components/ui-clone/flow-page";

export default function InviteWorkerScreen() {
  return (
    <FlowPage
      title="Mời thợ"
      subtitle="Thêm nhân sự mới theo kỹ năng và khu vực"
      badge={{ label: "WORKER INVITE" }}
      sections={[
        {
          key: "filters",
          title: "Bộ lọc tuyển thợ",
          rows: [
            { label: "Kỹ năng", value: "Điện + Nước" },
            { label: "Kinh nghiệm", value: "Từ 2 năm" },
            { label: "Khu vực", value: "Q9, Thủ Đức" },
            { label: "Mức lương", value: "700k - 1.2tr/ngày" },
          ],
        },
      ]}
      footerActions={[
        {
          label: "Xem danh sách ứng viên",
          route: "/ui-clone/management/workers",
          icon: "people-outline",
        },
      ]}
    />
  );
}
