import { FlowPage } from "@/components/ui-clone/flow-page";

export default function CreateMeetingScreen() {
  return (
    <FlowPage
      title="Tạo cuộc họp"
      subtitle="Lập cuộc họp giữa kỹ sư, đội trưởng và nhà cung cấp"
      badge={{ label: "MANAGEMENT • MEETING" }}
      sections={[
        {
          key: "meeting",
          title: "Thiết lập cuộc họp",
          rows: [
            { label: "Chủ đề", value: "Tiến độ block A" },
            { label: "Thời gian", value: "26/03/2026 • 09:00" },
            { label: "Hình thức", value: "Online + Onsite" },
            { label: "Thành viên", value: "8 người" },
          ],
        },
      ]}
      footerActions={[
        {
          label: "Tạo cuộc họp",
          route: "/ui-clone/states/success",
          icon: "videocam-outline",
        },
      ]}
    />
  );
}
