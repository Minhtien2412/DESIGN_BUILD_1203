import { FlowPage } from "@/components/ui-clone/flow-page";

export default function ProfileVerificationScreen() {
  return (
    <FlowPage
      title="Trung tâm xác thực hồ sơ"
      subtitle="Theo dõi trạng thái duyệt hồ sơ chuyên môn"
      badge={{ label: "VERIFICATION", tone: "warning" }}
      sections={[
        {
          key: "status",
          title: "Trạng thái hiện tại",
          rows: [
            { label: "CCCD", value: "Đã xác thực", valueColor: "#2E9B3C" },
            { label: "Chứng chỉ nghề", value: "Đang kiểm duyệt" },
            {
              label: "Tài khoản ngân hàng",
              value: "Đã liên kết",
              valueColor: "#2E9B3C",
            },
            { label: "Rủi ro", value: "Thấp", valueColor: "#2E9B3C" },
          ],
          note: "Hồ sơ sẽ được duyệt tự động trong vòng 4 giờ làm việc.",
        },
      ]}
      footerActions={[
        {
          label: "Xem màn hình thành công",
          route: "/ui-clone/states/success",
          icon: "checkmark-circle-outline",
        },
      ]}
    />
  );
}
