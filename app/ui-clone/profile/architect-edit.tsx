import { FlowPage } from "@/components/ui-clone/flow-page";

export default function ArchitectEditScreen() {
  return (
    <FlowPage
      title="Chỉnh sửa hồ sơ kiến trúc sư"
      subtitle="Cập nhật chứng chỉ, kỹ năng và công ty hiện tại"
      badge={{ label: "PROFILE • ARCHITECT", tone: "success" }}
      sections={[
        {
          key: "basic",
          title: "Thông tin hành nghề",
          rows: [
            { label: "Họ tên", value: "Nguyễn Văn Phương" },
            { label: "Mã hành nghề", value: "ARCH-2023-08" },
            { label: "Email", value: "example@email.com" },
            { label: "Kinh nghiệm", value: "3 năm" },
          ],
        },
        {
          key: "skills",
          title: "Bộ kỹ năng thiết kế",
          chips: [
            { label: "AutoCAD" },
            { label: "Revit" },
            { label: "SketchUp" },
            { label: "BIM", tone: "warning" },
          ],
          bullets: [
            "Đính kèm danh mục bản vẽ mẫu mới nhất",
            "Xác thực chứng chỉ hành nghề còn hiệu lực",
          ],
        },
      ]}
      footerActions={[
        {
          label: "Lưu & cập nhật hồ sơ KTS",
          route: "/ui-clone/profile/verification",
          icon: "document-text-outline",
        },
      ]}
    />
  );
}
