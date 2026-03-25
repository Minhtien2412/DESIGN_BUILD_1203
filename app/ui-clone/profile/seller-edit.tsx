import { FlowPage } from "@/components/ui-clone/flow-page";

export default function SellerEditScreen() {
  return (
    <FlowPage
      title="Chỉnh sửa hồ sơ nhà cung cấp"
      subtitle="Cập nhật thông tin cửa hàng và người đại diện"
      badge={{ label: "PROFILE • SELLER" }}
      sections={[
        {
          key: "store",
          title: "Thông tin cửa hàng",
          rows: [
            { label: "Tên cửa hàng", value: "Công ty TOTO" },
            { label: "Người đại diện", value: "Nguyễn Văn A" },
            { label: "SĐT", value: "0987 XXXXXX" },
            { label: "Địa chỉ kho", value: "Kho 01 - Từ Liêm, Hà Nội" },
          ],
        },
        {
          key: "compliance",
          title: "Tuân thủ hồ sơ",
          bullets: [
            "Xác thực mã số thuế và giấy phép kinh doanh",
            "Đồng bộ tài khoản nhận thanh toán QR",
            "Bật cảnh báo tồn kho thấp theo danh mục",
          ],
        },
      ]}
      footerActions={[
        {
          label: "Lưu thay đổi & gửi xác thực",
          route: "/ui-clone/profile/verification",
          icon: "save-outline",
        },
      ]}
    />
  );
}
