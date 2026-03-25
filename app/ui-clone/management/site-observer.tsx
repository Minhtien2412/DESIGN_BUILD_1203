import { FlowPage } from "@/components/ui-clone/flow-page";

export default function SiteObserverScreen() {
  return (
    <FlowPage
      title="Quan sát công trình"
      subtitle="Theo dõi tiến độ hiện trường qua camera và checklist"
      badge={{ label: "SITE OBSERVER", tone: "success" }}
      sections={[
        {
          key: "observe",
          title: "Giám sát realtime",
          rows: [
            { label: "Camera online", value: "4" },
            { label: "Checklist hôm nay", value: "12 mục" },
            { label: "Mục hoàn thành", value: "9", valueColor: "#2E9B3C" },
            { label: "Cảnh báo", value: "1" },
          ],
        },
      ]}
      footerActions={[
        {
          label: "Mở VA-VR mặt bằng",
          route: "/ui-clone/management/va-vr",
          icon: "scan-outline",
        },
      ]}
    />
  );
}
