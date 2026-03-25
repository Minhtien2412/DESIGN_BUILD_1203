import { FlowPage } from "@/components/ui-clone/flow-page";

export default function ReferralFullQRScreen() {
  return (
    <FlowPage
      title="QR giới thiệu toàn màn hình"
      subtitle="Cho phép người được mời quét nhanh để đăng ký"
      badge={{ label: "FULL QR", tone: "brand" }}
      sections={[
        {
          key: "qrmeta",
          title: "Thông tin QR",
          rows: [
            { label: "Mã giới thiệu", value: "THO12345" },
            { label: "Hiệu lực", value: "Không giới hạn" },
            { label: "Lượt quét hôm nay", value: "26" },
          ],
        },
        {
          key: "policy",
          title: "Lưu ý chia sẻ",
          bullets: [
            "Không chia sẻ trên nhóm spam để tránh khóa mã",
            "Mỗi thiết bị chỉ được tính một lượt đăng ký hợp lệ",
          ],
          actions: [
            {
              label: "Xem thể lệ chương trình",
              route: "/ui-clone/referral/program-rules",
              icon: "book-outline",
            },
          ],
        },
      ]}
    />
  );
}
