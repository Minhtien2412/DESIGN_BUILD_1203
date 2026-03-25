import { FlowPage } from "@/components/ui-clone/flow-page";

export default function EngineerEditScreen() {
  return (
    <FlowPage
      title="Chỉnh sửa hồ sơ kỹ sư"
      subtitle="Thiết lập chuyên môn và tài khoản nhận lương"
      badge={{ label: "PROFILE • ENGINEER", tone: "brand" }}
      sections={[
        {
          key: "core",
          title: "Thông tin kỹ sư",
          rows: [
            { label: "Họ tên", value: "Nguyễn Văn An" },
            { label: "Mã kỹ sư", value: "ENGR-2023-0809" },
            { label: "Kỹ năng", value: "AutoCAD" },
            { label: "Kinh nghiệm", value: "3 năm" },
          ],
        },
        {
          key: "payment",
          title: "Thiết lập thanh toán",
          bullets: [
            "Liên kết QR ngân hàng Vietcombank",
            "Bật xác thực 2 lớp khi rút tiền",
            "Đặt ngưỡng cảnh báo khi bảng lương bất thường",
          ],
        },
      ]}
      footerActions={[
        {
          label: "Lưu hồ sơ kỹ sư",
          route: "/ui-clone/profile/verification",
          icon: "shield-checkmark-outline",
        },
      ]}
    />
  );
}
