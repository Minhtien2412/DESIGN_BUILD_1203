import { FlowPage } from "@/components/ui-clone/flow-page";

export default function PayrollDetailScreen() {
  return (
    <FlowPage
      title="Chi tiết bảng lương"
      subtitle="Phân rã theo nhân sự và ngày công"
      badge={{ label: "PAYROLL DETAIL", tone: "success" }}
      sections={[
        {
          key: "rows",
          title: "Dòng lương tiêu biểu",
          bullets: [
            "Thành • 500k/ngày • 5 ngày • 2.500.000đ",
            "Nghĩa • 450k/ngày • 5 ngày • 2.250.000đ",
            "Út • 400k/ngày • 5 ngày • 2.000.000đ",
          ],
          note: "Dữ liệu chi tiết đồng bộ theo chấm công thực tế từ đội trưởng.",
        },
      ]}
      footerActions={[
        {
          label: "Mời thêm thợ vào dự án",
          route: "/ui-clone/management/invite-worker",
          icon: "person-add-outline",
        },
      ]}
    />
  );
}
