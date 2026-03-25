import { FlowPage } from "@/components/ui-clone/flow-page";

export default function ProfileProjectsListScreen() {
  return (
    <FlowPage
      title="Danh sách dự án hồ sơ"
      subtitle="Theo dõi danh mục công trình đã triển khai"
      badge={{ label: "PROJECT FLOW" }}
      sections={[
        {
          key: "kpi",
          title: "Tổng quan danh mục",
          metrics: [
            {
              key: "p1",
              label: "Tổng dự án",
              value: "24",
              icon: "business-outline",
            },
            {
              key: "p2",
              label: "Đang thi công",
              value: "5",
              icon: "hammer-outline",
            },
            {
              key: "p3",
              label: "Đã bàn giao",
              value: "17",
              icon: "ribbon-outline",
            },
            {
              key: "p4",
              label: "Đánh giá TB",
              value: "4.9",
              icon: "star-outline",
            },
          ],
        },
        {
          key: "list",
          title: "Dự án nổi bật",
          bullets: [
            "Biệt thự Vinhomes Q9 • Đang giám sát hoàn thiện",
            "Nhà phố Thủ Đức • Đợi nghiệm thu hệ MEP",
            "Showroom Bình Dương • Sắp bàn giao nội thất",
          ],
          actions: [
            {
              label: "Mở chi tiết dự án",
              route: "/ui-clone/profile/project-detail",
              icon: "open-outline",
            },
          ],
        },
      ]}
    />
  );
}
