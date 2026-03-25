import { FlowPage } from "@/components/ui-clone/flow-page";

export default function PayrollScreen() {
  return (
    <FlowPage
      title="Bảng lương"
      subtitle="Tổng hợp công, đơn giá và trạng thái thanh toán"
      badge={{ label: "PAYROLL", tone: "warning" }}
      sections={[
        {
          key: "summary",
          title: "Kỳ lương tuần 1",
          rows: [
            { label: "Dự án", value: "Nhà phố a.Dung Q12" },
            { label: "Số nhân sự", value: "5" },
            { label: "Tổng công", value: "25 công" },
            {
              label: "Tổng lương",
              value: "13.600.000đ",
              valueColor: "#75B90D",
            },
          ],
        },
      ]}
      footerActions={[
        {
          label: "Xem chi tiết lương",
          route: "/ui-clone/management/payroll-detail",
          icon: "document-text-outline",
        },
      ]}
    />
  );
}
