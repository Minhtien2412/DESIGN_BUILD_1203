import { FlowPage } from "@/components/ui-clone/flow-page";

export default function CreateScheduleScreen() {
  return (
    <FlowPage
      title="Tạo lịch công việc"
      subtitle="Lên lịch theo đội, khu vực và mức ưu tiên"
      badge={{ label: "MANAGEMENT • SCHEDULE", tone: "warning" }}
      sections={[
        {
          key: "schedule",
          title: "Thông tin lịch",
          rows: [
            { label: "Công việc", value: "Đổ sàn tầng 2" },
            { label: "Ngày", value: "27/03/2026" },
            { label: "Ca", value: "07:30 - 11:30" },
            { label: "Nhân sự", value: "12 thợ" },
          ],
        },
      ]}
      footerActions={[
        {
          label: "Lưu lịch",
          route: "/ui-clone/states/success",
          icon: "calendar-outline",
        },
      ]}
    />
  );
}
