/**
 * Shared data for Home sections
 * Used by Home screen and corresponding detail/hub screens
 */

export const SERVICES = [
  {
    id: 1,
    name: "Thiết kế nhà",
    icon: require("@/assets/images/icon-dich-vu/thiet-ke-nha.webp"),
    route: "/services/house-design",
  },
  {
    id: 2,
    name: "Thiết kế nội thất",
    icon: require("@/assets/images/icon-dich-vu/thiet-ke-noi-that.webp"),
    route: "/services/interior-design",
  },
  {
    id: 3,
    name: "Tra cứu xây dựng",
    icon: require("@/assets/images/icon-dich-vu/tra-cuu-xay-dung.webp"),
    route: "/services/construction-lookup",
  },
  {
    id: 4,
    name: "Xin phép",
    icon: require("@/assets/images/icon-dich-vu/xin-phep.webp"),
    route: "/services/permit",
  },
  {
    id: 5,
    name: "Hồ sơ mẫu",
    icon: require("@/assets/images/icon-dich-vu/ho-so-mau.webp"),
    route: "/services/sample-docs",
  },
  {
    id: 6,
    name: "Lỗ ban",
    icon: require("@/assets/images/icon-dich-vu/lo-ban.webp"),
    route: "/services/feng-shui",
  },
  {
    id: 7,
    name: "Bảng mẫu",
    icon: require("@/assets/images/icon-dich-vu/bang-mau.webp"),
    route: "/services/color-chart",
  },
  {
    id: 8,
    name: "Tư vấn chất lượng",
    icon: require("@/assets/images/icon-dich-vu/tu-van-chat-luong.webp"),
    route: "/services/quality-consulting",
  },
  {
    id: 9,
    name: "Công ty xây dựng",
    icon: require("@/assets/images/icon-dich-vu/cong-ty-xay-dung.webp"),
    route: "/services/construction-company",
  },
  {
    id: 10,
    name: "Công ty nội thất",
    icon: require("@/assets/images/icon-dich-vu/cong-ty-noi-that.webp"),
    route: "/services/company-detail",
  },
  {
    id: 11,
    name: "Giám sát chất lượng",
    icon: require("@/assets/images/icon-dich-vu/giam-sat-chat-luong.webp"),
    route: "/services/quality-supervision",
  },
];

// AI Consultation Services
export const AI_SERVICES = [
  {
    id: 1,
    name: "Tư vấn Thiết kế AI",
    icon: "🏠",
    route: "/services/house-design-ai",
    color: "#3B82F6",
    isNew: true,
  },
  {
    id: 2,
    name: "Tư vấn Nội thất AI",
    icon: "🛋️",
    route: "/services/interior-design-ai",
    color: "#8B5A2B",
    isNew: true,
  },
  {
    id: 3,
    name: "Tư vấn Giấy phép AI",
    icon: "📋",
    route: "/services/permit-ai",
    color: "#059669",
    isNew: true,
  },
  {
    id: 4,
    name: "Tư vấn Dự toán AI",
    icon: "💰",
    route: "/services/cost-estimate-ai",
    color: "#DC2626",
    isNew: true,
  },
  {
    id: 5,
    name: "Phong thủy AI",
    icon: "☯️",
    route: "/tools/feng-shui-ai",
    color: "#7C3AED",
    isNew: true,
  },
];

export const CONSTRUCTION_UTILITIES = [
  {
    id: 1,
    name: "Ép cọc",
    location: "Hà Nội",
    count: 100,
    icon: require("@/assets/images/tien-ich-xay-dung/ep-coc.webp"),
  },
  {
    id: 2,
    name: "Đào đất",
    location: "Sài Gòn",
    count: 50,
    icon: require("@/assets/images/tien-ich-xay-dung/dao-dat.webp"),
  },
  {
    id: 3,
    name: "Vật liệu",
    location: "Đà Nẵng",
    count: 80,
    icon: require("@/assets/images/tien-ich-xay-dung/vat-lieu.webp"),
  },
  {
    id: 4,
    name: "Nhân công",
    location: "Sài Gòn",
    count: 60,
    icon: require("@/assets/images/tien-ich-xay-dung/nhan-cong.webp"),
  },
  {
    id: 5,
    name: "Thợ xây",
    location: "Hà Nội",
    count: 78,
    icon: require("@/assets/images/tien-ich-xay-dung/tho-xay.webp"),
  },
  {
    id: 6,
    name: "Thợ coffa",
    location: "Sài Gòn",
    count: 97,
    icon: require("@/assets/images/tien-ich-xay-dung/tho-coffa.webp"),
  },
  {
    id: 7,
    name: "Thợ điện nước",
    location: "Cần Thơ",
    count: 50,
    icon: require("@/assets/images/tien-ich-xay-dung/tho-dien-nuoc.webp"),
  },
  {
    id: 8,
    name: "Bê tông",
    location: "Sài Gòn",
    count: 90,
    icon: require("@/assets/images/tien-ich-xay-dung/be-tong.webp"),
  },
];

export const FINISHING_UTILITIES = [
  {
    id: 1,
    name: "Thợ lát gạch",
    location: "Hà Nội",
    count: 100,
    icon: require("@/assets/images/tien-ich-hoan-thien/tho-lat-gach.webp"),
  },
  {
    id: 2,
    name: "Thợ thạch cao",
    location: "Sài Gòn",
    count: 60,
    icon: require("@/assets/images/tien-ich-hoan-thien/tho-thachcao-.webp"),
  },
  {
    id: 3,
    name: "Thợ sơn",
    location: "Đà Nẵng",
    count: 85,
    icon: require("@/assets/images/tien-ich-hoan-thien/tho-son.webp"),
  },
  {
    id: 4,
    name: "Thợ đá",
    location: "Sài Gòn",
    count: 70,
    icon: require("@/assets/images/tien-ich-hoan-thien/tho-da.webp"),
  },
  {
    id: 5,
    name: "Thợ làm cửa",
    location: "Hà Nội",
    count: 68,
    icon: require("@/assets/images/tien-ich-hoan-thien/tho-lam-cua.webp"),
  },
  {
    id: 6,
    name: "Thợ lan can",
    location: "Sài Gòn",
    count: 95,
    icon: require("@/assets/images/tien-ich-hoan-thien/tho-lan-can.webp"),
  },
  {
    id: 7,
    name: "Thợ công",
    location: "Cần Thơ",
    count: 40,
    icon: require("@/assets/images/tien-ich-hoan-thien/tho-cong.webp"),
  },
  {
    id: 8,
    name: "Thợ camera",
    location: "Sài Gòn",
    count: 70,
    icon: require("@/assets/images/tien-ich-hoan-thien/tho-camera.webp"),
  },
];

export const EQUIPMENT_SHOPPING = [
  {
    id: 1,
    name: "Thiết bị bếp",
    icon: require("@/assets/images/tien-ich-mua-sam-trang-thiet-bi/thiet-bi-bep.webp"),
  },
  {
    id: 2,
    name: "Thiết bị vệ sinh",
    icon: require("@/assets/images/tien-ich-mua-sam-trang-thiet-bi/thiet-bi-ve-sinh.webp"),
  },
  {
    id: 3,
    name: "Điện",
    icon: require("@/assets/images/tien-ich-mua-sam-trang-thiet-bi/dien.webp"),
  },
  {
    id: 4,
    name: "Nước",
    icon: require("@/assets/images/tien-ich-mua-sam-trang-thiet-bi/nuoc.webp"),
  },
  {
    id: 5,
    name: "PCCC",
    icon: require("@/assets/images/tien-ich-mua-sam-trang-thiet-bi/pccc.webp"),
  },
  {
    id: 6,
    name: "Bàn ăn",
    icon: require("@/assets/images/tien-ich-mua-sam-trang-thiet-bi/ban-an.webp"),
  },
  {
    id: 7,
    name: "Bàn học",
    icon: require("@/assets/images/tien-ich-mua-sam-trang-thiet-bi/ban-hoc.webp"),
  },
  {
    id: 8,
    name: "Sofa",
    icon: require("@/assets/images/tien-ich-mua-sam-trang-thiet-bi/sofa.webp"),
  },
];

export const LIBRARY = [
  {
    id: 1,
    name: "Văn phòng",
    icon: require("@/assets/images/thu-vien/van-phong.webp"),
  },
  {
    id: 2,
    name: "Nhà phố",
    icon: require("@/assets/images/thu-vien/nha-pho.webp"),
  },
  {
    id: 3,
    name: "Biệt thự",
    icon: require("@/assets/images/thu-vien/biet-thu.webp"),
  },
  {
    id: 4,
    name: "Biệt thự cổ điển",
    icon: require("@/assets/images/thu-vien/biet-thu-co-dien.webp"),
  },
  {
    id: 5,
    name: "Khách sạn",
    icon: require("@/assets/images/thu-vien/khach-san.webp"),
  },
  {
    id: 6,
    name: "Nhà xưởng",
    icon: require("@/assets/images/thu-vien/nha-xuong.webp"),
  },
  {
    id: 7,
    name: "Căn hộ dịch vụ",
    icon: require("@/assets/images/thu-vien/can-ho-dich-vu.webp"),
  },
];

export const DESIGN_UTILITIES = [
  {
    id: 1,
    name: "Kiến trúc sư",
    price: "100k",
    icon: require("@/assets/images/tien-ich-thiet-ke/kien-truc-su.webp"),
  },
  {
    id: 2,
    name: "Kỹ sư giám sát",
    price: "80k",
    icon: require("@/assets/images/tien-ich-thiet-ke/ky-su-giam-sat.webp"),
  },
  {
    id: 3,
    name: "Kỹ sư kết cấu",
    price: "90k",
    icon: require("@/assets/images/tien-ich-thiet-ke/ky-su-ket-cau.webp"),
  },
  {
    id: 4,
    name: "Kỹ sư điện",
    price: "70k",
    icon: require("@/assets/images/tien-ich-thiet-ke/ky-su-dien.webp"),
  },
  {
    id: 5,
    name: "Kỹ sư nước",
    price: "70k",
    icon: require("@/assets/images/tien-ich-thiet-ke/ky-su-nuoc.webp"),
  },
  {
    id: 6,
    name: "Dự toán",
    price: "60k",
    icon: require("@/assets/images/tien-ich-thiet-ke/du-toan.webp"),
  },
  {
    id: 7,
    name: "Nội thất",
    price: "100k",
    icon: require("@/assets/images/tien-ich-thiet-ke/kien-tru-su-noi-that.webp"),
  },
];
