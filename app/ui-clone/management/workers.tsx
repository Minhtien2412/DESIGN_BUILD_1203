import { FlowPage } from "@/components/ui-clone/flow-page";

export default function WorkersScreen() {
  return (
    <FlowPage
      title="Danh sách thợ"
      subtitle="Ứng viên phù hợp theo bộ lọc hiện tại"
      badge={{ label: "WORKERS", tone: "neutral" }}
      sections={[
        {
          key: "workers",
          title: "Top ứng viên",
          bullets: [
            "Nguyễn Văn Thành • 4.8★ • Điện dân dụng",
            "Phạm Văn Nghĩa • 4.7★ • Cấp thoát nước",
            "Lê Văn Út • 4.9★ • MEP tổng hợp",
          ],
          actions: [
            {
              label: "Mở hồ sơ ứng viên",
              route: "/ui-clone/management/worker-detail",
              icon: "open-outline",
            },
          ],
        },
      ]}
    />
  );
}
