import { FlowPage } from "@/components/ui-clone/flow-page";

export default function TeamEditScreen() {
  return (
    <FlowPage
      title="Chỉnh sửa hồ sơ đội trưởng"
      subtitle="Cập nhật kỹ năng, lương và vùng nhận việc"
      badge={{ label: "PROFILE • TEAM LEAD", tone: "brand" }}
      sections={[
        {
          key: "identity",
          title: "Thông tin cá nhân",
          rows: [
            { label: "Họ tên", value: "Nguyễn Văn An" },
            { label: "SĐT", value: "0901 234 567" },
            { label: "CCCD", value: "012345678901" },
            { label: "Khu vực", value: "Q1, Q3, Q7 - TP.HCM" },
          ],
        },
        {
          key: "skills",
          title: "Năng lực đội",
          chips: [
            { label: "Nề" },
            { label: "Điện" },
            { label: "Nước" },
            { label: "Giám sát", tone: "success" },
          ],
          note: "Mức lương nguyện vọng: 1.2tr/ngày • Tỷ lệ hoàn thành 97%",
        },
      ]}
      footerActions={[
        {
          label: "Lưu hồ sơ đội trưởng",
          route: "/ui-clone/profile/verification",
          icon: "checkmark-done-outline",
        },
      ]}
    />
  );
}
