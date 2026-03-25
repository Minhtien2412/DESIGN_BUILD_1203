import { ImageSourcePropType } from "react-native";

export type OrderInfoField = {
  key: string;
  label: string;
  value: string;
};

export type PricingLine = {
  id: string;
  name: string;
  unit: string;
  quantity?: number;
  unitPrice: number;
  amount?: number;
  group?: string;
};

export type TimelineNode = {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  state: "done" | "active" | "todo";
};

export type UtilityItem = {
  id: string;
  icon: string;
  label: string;
};

export type GalleryCard = {
  id: string;
  title: string;
  subtitle?: string;
  image: ImageSourcePropType;
};

export type ProductCardItem = {
  id: string;
  title: string;
  price: string;
  rating: string;
  image: ImageSourcePropType;
};

export type LiveCardItem = {
  id: string;
  title: string;
  viewers: string;
  place: string;
  image: ImageSourcePropType;
};

export const navMock = {
  bottomItems: [
    { key: "home", label: "Trang chủ", icon: "home-outline" },
    { key: "orders", label: "Đơn hàng", icon: "document-text-outline" },
    { key: "notify", label: "Thông báo", icon: "notifications-outline" },
    { key: "profile", label: "Cá nhân", icon: "person-outline" },
  ],
};

const banner1 = require("../assets/banner/banner-home-1.jpg");
const banner2 = require("../assets/banner/banner-home-2.jpg");
const banner3 = require("../assets/banner/banner-home-3.jpg");
const banner4 = require("../assets/banner/banner-home-4.jpg");
const banner5 = require("../assets/banner/banner-home-5.jpg");
const banner6 = require("../assets/banner/banner-home-6.jpg");

export const ordersMock = {
  materialOrder: {
    headerTitle: "Chi tiết đơn hàng",
    orderCode: "MS102",
    infoFields: [
      { key: "code", label: "Mã đơn hàng", value: "MS102" },
      { key: "location", label: "Vị trí", value: "Vinhomes Q9" },
      { key: "job", label: "Công việc", value: "Cung cấp VLXD" },
      { key: "date", label: "Lịch cấp hàng", value: "26/03/2026" },
    ] as OrderInfoField[],
    materialThumbs: [banner1, banner2, banner3],
    quotationSupplierName: "Nhà cung cấp 1: VLXD Đức Hạnh",
    quotationItems: [
      {
        id: "qt-1",
        name: "Cát bê tông hạt lớn",
        unit: "m³",
        unitPrice: 460000,
      },
      { id: "qt-2", name: "Cát bê tông vàng", unit: "m³", unitPrice: 420000 },
      { id: "qt-3", name: "Cát lấp", unit: "m³", unitPrice: 180000 },
      { id: "qt-4", name: "Đá mi", unit: "m³", unitPrice: 320000 },
      { id: "qt-5", name: "Đá 1x2 xanh trắng", unit: "m³", unitPrice: 480000 },
      {
        id: "qt-6",
        name: "Xi măng Hà Tiên đa dụng",
        unit: "Bao",
        unitPrice: 89000,
      },
      {
        id: "qt-7",
        name: "Gạch tuynen Thành Tâm",
        unit: "Viên",
        unitPrice: 1250,
      },
      { id: "qt-8", name: "Thép phi 10, 12, 14", unit: "Kg", unitPrice: 18500 },
    ] as PricingLine[],
    qualityChecklist: ["Đá mi", "Cát bê tông", "Thép VN CB4"],
    verification: {
      supplierName: "Đức Hạnh",
      engineerName: "Nguyễn Văn A",
    },
    selectedOrder: {
      title: "Chốt đơn hàng MS102",
      status: "ĐANG XỬ LÝ",
      unitName: "Đơn vị: VLXD Đức Hạnh",
      lines: [
        {
          id: "sl-1",
          name: "Cát bê tông hạt lớn",
          unit: "m³",
          quantity: 2,
          unitPrice: 460000,
          amount: 920000,
        },
        {
          id: "sl-2",
          name: "Đá 1x2 xanh",
          unit: "m³",
          quantity: 10,
          unitPrice: 480000,
          amount: 4800000,
        },
        {
          id: "sl-3",
          name: "Xi măng Hà Tiên",
          unit: "Bao",
          quantity: 100,
          unitPrice: 89000,
          amount: 8900000,
        },
        {
          id: "sl-4",
          name: "Thép phi 12",
          unit: "Kg",
          quantity: 330,
          unitPrice: 18500,
          amount: 6105000,
        },
      ] as PricingLine[],
      totalText: "20.725.000đ",
    },
  },

  deliveryMap: {
    etaLabel: "Xe đang đến công trình",
    etaTime: "10:45 AM",
    etaSub: "Dự kiến đến lúc",
    progressSteps: ["Xác nhận", "Xuất bến", "Đang giao", "Đến nơi", "Hoàn tất"],
    orderStats: [
      {
        key: "mass",
        label: "Khối lượng",
        value: "10 m³",
        icon: "layers-outline",
      },
      {
        key: "grade",
        label: "Mác bê tông",
        value: "M300",
        icon: "flask-outline",
      },
      {
        key: "vehicle",
        label: "Loại xe",
        value: "Xe bồn",
        icon: "car-outline",
      },
      {
        key: "plant",
        label: "Trạm trộn",
        value: "Plant A",
        icon: "business-outline",
      },
    ],
  },

  coffaDetail: {
    orderCode: "MS102",
    project: "Vinhomes Q9",
    deliveryDate: "26/03/2026",
    summaryJob: "Cung cấp Coffa",
    materialTags: [
      "Ván 20x4m: 10 tấm",
      "Ván 30x4m: 20 tấm",
      "Tăng đơ: 10 cái",
      "Tole 1cm: 100 tấm",
      "Chân: 10 cái",
    ],
    quoteLines: [
      {
        id: "cf-vl-1",
        group: "VẬT LIỆU",
        name: "Ván 25x4m",
        unit: "Tấm",
        unitPrice: 120000,
        amount: 1200000,
      },
      {
        id: "cf-vl-2",
        group: "VẬT LIỆU",
        name: "Ván phim 18li",
        unit: "Tấm",
        unitPrice: 350000,
        amount: 700000,
      },
      {
        id: "cf-tb-1",
        group: "THIẾT BỊ CHO THUÊ",
        name: "Giàn giáo 1m7",
        unit: "Khung",
        unitPrice: 15000,
        amount: 300000,
      },
      {
        id: "cf-tb-2",
        group: "THIẾT BỊ CHO THUÊ",
        name: "Cây chống nêm",
        unit: "Cây",
        unitPrice: 8000,
        amount: 120000,
      },
      {
        id: "cf-tb-3",
        group: "THIẾT BỊ CHO THUÊ",
        name: "Kích tăng U",
        unit: "Cái",
        unitPrice: 5000,
        amount: 50000,
      },
    ] as PricingLine[],
    selectedDetail: [
      {
        id: "cf-s1",
        group: "GÓI COFFA VÁN",
        name: "Ván 25x4m",
        unit: "Tấm",
        quantity: 10,
        unitPrice: 0,
      },
      {
        id: "cf-s2",
        group: "GÓI COFFA VÁN",
        name: "Ván 30x4m",
        unit: "Tấm",
        quantity: 5,
        unitPrice: 0,
      },
      {
        id: "cf-s3",
        group: "GÓI COFFA VÁN",
        name: "Ván 50x4m",
        unit: "Tấm",
        quantity: 4,
        unitPrice: 0,
      },
      {
        id: "cf-s4",
        group: "GÓI THIẾT BỊ",
        name: "Giàn giáo 1m7",
        unit: "Khung",
        quantity: 20,
        unitPrice: 0,
      },
      {
        id: "cf-s5",
        group: "GÓI THIẾT BỊ",
        name: "Cây chống nêm",
        unit: "Cây",
        quantity: 15,
        unitPrice: 0,
      },
      {
        id: "cf-s6",
        group: "GÓI THIẾT BỊ",
        name: "Thanh chéo",
        unit: "Cặp",
        quantity: 20,
        unitPrice: 0,
      },
      {
        id: "cf-s7",
        group: "GÓI THIẾT BỊ",
        name: "Cùm kẹp",
        unit: "Cái",
        quantity: 10,
        unitPrice: 0,
      },
      {
        id: "cf-s8",
        group: "GÓI THIẾT BỊ",
        name: "Tôn coffa 0.5m",
        unit: "Tấm",
        quantity: 10,
        unitPrice: 0,
      },
    ] as PricingLine[],
    total: "3,376,000 đ",
  },

  concreteDetail: {
    infoFields: [
      { key: "loc", label: "Vị trí", value: "Vinhomes Q9" },
      { key: "job", label: "Công việc", value: "Bê tông" },
      { key: "date", label: "Lịch cấp hàng", value: "26/03/2026" },
      {
        key: "desc",
        label: "Mô tả chi tiết",
        value: "Đổ móng bơm ngang, bơm cần",
      },
    ] as OrderInfoField[],
    concreteTable: [
      { id: "cb-1", name: "M250", unit: "m³", unitPrice: 1100000 },
      { id: "cb-2", name: "M300", unit: "m³", unitPrice: 1200000 },
      { id: "cb-3", name: "M350", unit: "m³", unitPrice: 1300000 },
    ] as PricingLine[],
    additives: "R7, B2",
    pumpHorizontal: "120k/m3",
    pumpBoom: "150k/m3",
    selectedSupplier: {
      name: "CC1",
      product: "Bê tông M300 - B2",
      quantity: "10 m³",
      unitPrice: "1.250.000đ/m³",
      amount: "12.500.000đ",
    },
  },
};

export const suppliersMock = {
  preferred: {
    id: "sup-01",
    name: "VLXD Đức Hạnh",
    status: "Đang xử lý",
    location: "Kho Tân Đông Hiệp, Dĩ An",
    eta: "2 giờ",
    rating: 4.9,
  },
};

export const profilesMock = {
  seller: {
    storeName: "Công ty TOTO",
    storeTagline: "Thiết bị vệ sinh cao cấp",
    storeCode: "TOT0123456",
    managerName: "Nguyễn Văn A",
    cccd: "001090XXXXXX",
    phone: "0987 XXXXXX",
    email: "contact@tot.vn",
    residence: "123 Đường Láng, Đống Đa, Hà Nội",
    warehouseAddress: "Kho 01 - Cụm công nghiệp vừa và nhỏ Từ Liêm, Hà Nội",
    storeDesc:
      "Chuyên cung cấp các thiết bị vệ sinh cao cấp chính hãng TOTO Nhật Bản. Cam kết chất lượng và dịch vụ bảo hành tốt nhất.",
    taxCode: "0101234567",
    businessLicense: "GP-2023-A1",
  },

  teamLead: {
    fullName: "Nguyễn Văn An",
    role: "Đội trưởng thi công",
    workerId: "012345678901",
    phone: "0901234567",
    email: "an.nguyen@example.com",
    address: "Quận 1, TP. Hồ Chí Minh",
    skills: "Nề, Điện, Nước",
    expYears: "3 năm",
    rank: "Đội trưởng",
    salaryPerDay: "1.2tr/ngày",
  },

  architect: {
    fullName: "Nguyễn Văn Phương",
    architectId: "ARCH-2023-08",
    phone: "0123...",
    cccd: "0790...",
    email: "example@email.com",
    address: "Nhập địa chỉ...",
    qrCode: "0273...",
    skills: ["AutoCAD", "Revit", "SketchUp", "+ Thêm"],
    expYears: "3 năm",
    role: "Kiến trúc sư",
  },

  engineer: {
    fullName: "Nguyễn Văn An",
    role: "Kỹ sư thiết kế",
    engineerId: "ENGR-2023-0809",
    cccd: "012345678910",
    phone: "0901 234 567",
    address: "Quận 1, TP. HCM",
    email: "an.nguyen@company.com",
    qrBank: "Vietcombank -1023...",
    expYears: "3 Năm",
    rank: "Kỹ sư",
    skill: "AutoCAD",
  },
};

export const projectsMock: GalleryCard[] = [
  {
    id: "pj-1",
    title: "Biệt thự",
    subtitle: "12 ảnh • 5 video",
    image: banner4,
  },
  {
    id: "pj-2",
    title: "Nhà phố",
    subtitle: "12 ảnh • 2 video",
    image: banner5,
  },
  { id: "pj-3", title: "Showroom", subtitle: "8 ảnh", image: banner6 },
  { id: "pj-4", title: "Xem thêm 4+", subtitle: "", image: banner2 },
];

export const liveCardsMock: LiveCardItem[] = [
  {
    id: "live-1",
    title: "Review Sen tắm TOTO âm tường cao cấp...",
    viewers: "1.2k",
    place: "Q9, TP.HCM",
    image: banner1,
  },
  {
    id: "live-2",
    title: "Khám phá BST Lavabo 2025",
    viewers: "856",
    place: "Dĩ An, Bình Dương",
    image: banner2,
  },
  {
    id: "live-3",
    title: "Tư vấn lắp đặt vệ sinh",
    viewers: "2.4k",
    place: "Quận 12",
    image: banner3,
  },
];

export const productsMock: ProductCardItem[] = [
  {
    id: "pd-1",
    title: "Bàn cầu thông minh TOTO Washlet CW188",
    price: "12.500.000đ",
    rating: "4.9 (120)",
    image: banner1,
  },
  {
    id: "pd-2",
    title: "Vòi sen tăng nhiệt độ TOTO TMGG40E",
    price: "3.450.000đ",
    rating: "4.8 (85)",
    image: banner2,
  },
  {
    id: "pd-3",
    title: "Chậu rửa đặt bàn TOTO LT4706",
    price: "1.890.000đ",
    rating: "5.0 (42)",
    image: banner3,
  },
  {
    id: "pd-4",
    title: "Bồn tắm ngọc trai TOTO PPY1710WPE",
    price: "28.000.000đ",
    rating: "4.7 (18)",
    image: banner4,
  },
];

export const referralsMock = {
  code: "THO12345",
  subtitle: "Mời thêm thợ mới tải app và đăng ký để nhận quà hấp dẫn",
  note: "Người thợ mới quét mã, tải app và đăng ký tài khoản thành công sẽ được tính là 1 lượt giới thiệu",
  stats: [
    { key: "s1", label: "Tổng số thợ đã giới thiệu", value: "18" },
    { key: "s2", label: "Số lượt đăng ký thành công", value: "16" },
    { key: "s3", label: "Phần quà hiện tại", value: "100.000đ" },
    { key: "s4", label: "Mục tiêu tiếp theo", value: "20 thợ (TV)" },
  ],
  achievementText: "Bạn đã giới thiệu thành công 18 thợ",
  milestones: [
    { key: "m10", label: "10 thợ", reward: "100.000đ", reached: true },
    { key: "m30", label: "30 thợ", reward: "Tivi", reached: false },
    { key: "m50", label: "50 thợ", reward: "Tủ lạnh", reached: false },
    { key: "m80", label: "80 thợ", reward: "Điện thoại", reached: false },
    { key: "m100", label: "100 thợ", reward: "Xe máy", reached: false },
  ],
  specialMilestoneText: "Mốc đặc biệt 150 thợ: NHẬN XE MÁY HONDA",
  howItWorks: [
    "Đưa mã QR / link mời cho thợ khác",
    "Thợ mới tải app và đăng ký tài khoản",
    "Nhận quà theo số lượng thợ giới thiệu thành công",
  ],
  rewardCards: [
    { id: "rw-1", title: "100.000đ", condition: "Điều kiện: 10 thợ" },
    { id: "rw-2", title: "Smart TV", condition: "Điều kiện: 20 thợ" },
    { id: "rw-3", title: "Tủ lạnh", condition: "Điều kiện: 50 thợ" },
  ],
};

export const transportMock = {
  driver: {
    name: "Nguyễn Văn A",
    plate: "51C-892.34",
    rating: "4.9",
    avatar: banner2,
  },
  timeline: [
    {
      id: "tl-1",
      title: "Đang trên đường Võ Văn Kiệt",
      subtitle: "Tài xế đang di chuyển đến công trình",
      time: "10:15",
      state: "active",
    },
    {
      id: "tl-2",
      title: "Đã xuất bến",
      subtitle: "Trạm Mixing Plant A",
      time: "09:30",
      state: "done",
    },
    {
      id: "tl-3",
      title: "Đã xác nhận",
      subtitle: "Đơn hàng đã được xác nhận",
      time: "09:00",
      state: "done",
    },
  ] as TimelineNode[],
};

export const payrollMock = {
  projectName: "Dự án 1: Nhà phố a.Dung Q12",
  weekLabel: "Tuần 1: Ngày 20-25/02/2026",
  rows: [
    {
      id: "pr-1",
      name: "Thành",
      phone: "0901...",
      salary: "500k",
      days: ["✓", "✓", "✓", "✓", "✓"],
    },
    {
      id: "pr-2",
      name: "Nghĩa",
      phone: "0932...",
      salary: "450k",
      days: ["✓", "✓", "✓", "✓", "✓"],
    },
    {
      id: "pr-3",
      name: "Vĩn",
      phone: "0981...",
      salary: "500k",
      days: ["✓", "✓", "✓", "✓", "✓"],
    },
    {
      id: "pr-4",
      name: "Út",
      phone: "0944...",
      salary: "400k",
      days: ["✓", "✓", "✓", "✓", "✓"],
    },
    {
      id: "pr-5",
      name: "Năm",
      phone: "0903...",
      salary: "400k",
      days: ["✓", "✓", "✓", "✓", "✓"],
    },
  ],
  paymentMethod: "Chuyển khoản",
  total: "13,600,000",
};

export const ratingsMock = {
  tabs: [
    { id: "rt-1", name: "Nghĩa", score: "4.8" },
    { id: "rt-2", name: "Thành", score: "4.5" },
    { id: "rt-3", name: "Út", score: "4.7" },
  ],
  criteria: [
    { id: "c-1", label: "Tài năng", stars: 5 },
    { id: "c-2", label: "Tay nghề", stars: 5 },
    { id: "c-3", label: "Chăm chỉ", stars: 5 },
    { id: "c-4", label: "Trung thực", stars: 4 },
    { id: "c-5", label: "Tuân thủ ATLĐ", stars: 5 },
  ],
};

export const utilitiesMock: UtilityItem[] = [
  { id: "ut-1", icon: "git-branch-outline", label: "Dự án" },
  { id: "ut-2", icon: "document-text-outline", label: "Hợp đồng" },
  { id: "ut-3", icon: "wallet-outline", label: "Báo giá" },
  { id: "ut-4", icon: "eye-outline", label: "Giám sát" },
  { id: "ut-5", icon: "calendar-outline", label: "Lịch hẹn" },
  { id: "ut-6", icon: "people-outline", label: "Họp hành" },
  { id: "ut-7", icon: "bag-handle-outline", label: "Đơn hàng" },
  { id: "ut-8", icon: "home-outline", label: "Kho hàng" },
  { id: "ut-9", icon: "log-in-outline", label: "Nhập kho" },
  { id: "ut-10", icon: "cash-outline", label: "Bảng lương" },
  { id: "ut-11", icon: "stats-chart-outline", label: "Báo cáo" },
  { id: "ut-12", icon: "star-outline", label: "Đánh giá" },
];

export const profileSalaryOptions = ["10Tr", "12Tr", "15Tr"];

export const certificatesMock = [
  {
    id: "cert-1",
    title: "C/chỉ năng lực HĐ XD",
    statusLabel: "Xem",
    statusTone: "view",
  },
  {
    id: "cert-2",
    title: "C/chỉ hành nghề TK",
    statusLabel: "Tải lên",
    statusTone: "upload",
  },
  {
    id: "cert-3",
    title: "Bằng tốt nghiệp",
    statusLabel: "Xem",
    statusTone: "view",
  },
  {
    id: "cert-4",
    title: "Giám sát & An toàn",
    statusLabel: "Đã xác thực",
    statusTone: "verified",
  },
];
