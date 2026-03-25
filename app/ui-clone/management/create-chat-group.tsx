import { FlowPage } from "@/components/ui-clone/flow-page";

export default function CreateChatGroupScreen() {
  return (
    <FlowPage
      title="Tạo nhóm chat"
      subtitle="Mở nhóm trao đổi cho một hạng mục thi công"
      badge={{ label: "MANAGEMENT • CHAT", tone: "neutral" }}
      sections={[
        {
          key: "chat",
          title: "Cấu hình nhóm",
          rows: [
            { label: "Tên nhóm", value: "Block A - Hoàn thiện" },
            { label: "Số thành viên", value: "15" },
            { label: "Quyền gửi file", value: "Bật" },
            { label: "Quản trị viên", value: "2" },
          ],
        },
      ]}
      footerActions={[
        {
          label: "Tạo nhóm",
          route: "/ui-clone/states/success",
          icon: "chatbubbles-outline",
        },
      ]}
    />
  );
}
