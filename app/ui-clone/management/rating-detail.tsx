import { FlowPage } from "@/components/ui-clone/flow-page";

export default function RatingDetailScreen() {
  return (
    <FlowPage
      title="Chi tiết đánh giá"
      subtitle="Điểm số theo tiêu chí chất lượng thi công"
      badge={{ label: "RATING DETAIL", tone: "warning" }}
      sections={[
        {
          key: "rating",
          title: "Tiêu chí",
          bullets: [
            "Tay nghề: 5/5",
            "Tuân thủ an toàn: 5/5",
            "Tiến độ: 4/5",
            "Phối hợp nhóm: 5/5",
          ],
          actions: [
            {
              label: "Mở quan sát công trình",
              route: "/ui-clone/management/site-observer",
              icon: "eye-outline",
            },
          ],
        },
      ]}
    />
  );
}
