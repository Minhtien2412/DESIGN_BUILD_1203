import { FlowPage } from "@/components/ui-clone/flow-page";

export default function StateLockedScreen() {
  return (
    <FlowPage
      title="State • Locked"
      subtitle="Màn bị khóa do thiếu quyền hoặc điều kiện"
      badge={{ label: "LOCKED", tone: "warning" }}
      sections={[
        {
          key: "lock",
          title: "Lý do khóa",
          rows: [
            { label: "Quyền hiện tại", value: "Viewer" },
            { label: "Yêu cầu", value: "Manager hoặc Engineer" },
            { label: "Hồ sơ xác thực", value: "Chưa hoàn tất" },
          ],
        },
      ]}
      footerActions={[
        {
          label: "Đi đến xác thực hồ sơ",
          route: "/ui-clone/profile/verification",
          icon: "shield-outline",
        },
      ]}
    />
  );
}
