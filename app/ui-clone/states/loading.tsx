import { FlowPage } from "@/components/ui-clone/flow-page";

export default function StateLoadingScreen() {
  return (
    <FlowPage
      title="State • Loading"
      subtitle="Màn trạng thái đang tải dữ liệu"
      badge={{ label: "LOADING", tone: "neutral" }}
      sections={[
        {
          key: "loading",
          title: "Tình trạng tải",
          rows: [
            { label: "Nguồn dữ liệu", value: "Orders + Delivery + Profile" },
            { label: "Tiến độ", value: "68%" },
            { label: "Dự kiến", value: "~3 giây" },
          ],
          note: "Sử dụng skeleton + retry tự động để giữ trải nghiệm mượt.",
        },
      ]}
    />
  );
}
