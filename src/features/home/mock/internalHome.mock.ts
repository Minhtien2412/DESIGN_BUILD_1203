import { InternalHomeMock } from "./home.types";

export const internalHomeMock: InternalHomeMock = {
  headerTitle: "Điều phối công trình nội bộ",
  headerSubtitle:
    "Quản lý công trình, vật tư, tiến độ và vận chuyển theo thời gian thực.",
  searchPlaceholder: "Tìm dự án, đơn hàng, vật tư hoặc tài xế...",
  quickActions: [
    {
      id: "meeting",
      title: "Tạo cuộc họp",
      subtitle: "Nhóm chat dự án",
      icon: "people-outline",
      tint: "#F5FAEC",
    },
    {
      id: "schedule",
      title: "Tạo lịch hẹn",
      subtitle: "Công việc hôm nay",
      icon: "calendar-outline",
      tint: "#FFFFFF",
    },
    {
      id: "order",
      title: "Tạo đơn vật tư",
      subtitle: "Theo gói MS102",
      icon: "cart-outline",
      tint: "#FFFFFF",
    },
    {
      id: "payroll",
      title: "Bảng lương & mời thợ",
      subtitle: "SET tuần 1",
      icon: "cash-outline",
      tint: "#F5FAEC",
    },
  ],
  metrics: [
    { id: "orders", label: "Đơn chờ duyệt", value: "12" },
    { id: "delivery", label: "Chuyến đang giao", value: "05" },
    { id: "workers", label: "Tổ đội online", value: "48" },
    { id: "quality", label: "Checklist đạt", value: "96%" },
  ],
  projectTitle: "Dự án 1: Nhà phố a.Dung Q12",
  projectPeriod: "Tuần 1: Ngày 20-25/02/2026",
  paymentMethod: "Chuyển khoản",
  payrollTotal: "13,600,000",
  payrollRows: [
    {
      id: "thanh",
      name: "Thành",
      phone: "0901...",
      dailyRate: "500k",
      attendance: ["done", "done", "done", "pending"],
    },
    {
      id: "nghia",
      name: "Nghĩa",
      phone: "0932...",
      dailyRate: "450k",
      attendance: ["done", "done", "done", "pending"],
    },
    {
      id: "vinh",
      name: "Vinh",
      phone: "0981...",
      dailyRate: "500k",
      attendance: ["done", "done", "done", "pending"],
    },
    {
      id: "ut",
      name: "Út",
      phone: "0944...",
      dailyRate: "400k",
      attendance: ["done", "done", "done", "pending"],
    },
  ],
  ratings: [
    { id: "nghia", name: "Nghĩa", score: "4.8", active: true },
    { id: "thanh", name: "Thành", score: "4.5" },
    { id: "ut", name: "Út", score: "4.7" },
  ],
  deliveryContact: {
    name: "Nguyễn Văn A",
    role: "Tài xế / Điều phối giao hàng",
    phone: "090 123 4567",
    plate: "51C-892.34",
    rating: "4.9",
  },
  statusSteps: [
    {
      id: "confirm",
      title: "Xác nhận",
      subtitle: "Đơn MS102 đã chốt với nhà cung cấp",
      status: "done",
    },
    {
      id: "depart",
      title: "Xuất bến",
      subtitle: "Xe rời trạm trộn Plant A lúc 09:30",
      status: "done",
    },
    {
      id: "shipping",
      title: "Đang giao",
      subtitle: "Tài xế đang đến Vinhomes Q9, ETA 10:45",
      status: "active",
    },
    {
      id: "arrive",
      title: "Đến nơi",
      subtitle: "Chuẩn bị kiểm tra mẫu và lưu mẫu bê tông",
      status: "upcoming",
    },
    {
      id: "done",
      title: "Hoàn tất",
      subtitle: "Chờ ký xác nhận bởi kỹ sư giám sát",
      status: "upcoming",
    },
  ],
  tabs: [
    { id: "home", label: "Trang chủ", icon: "home-outline" },
    { id: "projects", label: "Dự án", icon: "document-text-outline" },
    { id: "manage", label: "Quản lý", icon: "people-outline", active: true },
    { id: "notifications", label: "Thông báo", icon: "notifications-outline" },
    { id: "profile", label: "Cá nhân", icon: "person-outline" },
  ],
};
