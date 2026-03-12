/**
 * Home Screen Data — All static data for the home tab
 * Extracted from the 2440-line monolith for clean separation
 * @created 2026-02-24
 */

import { ImageSourcePropType } from "react-native";

const FALLBACK_ICON = require("@/assets/images/icon.png");

// ═══════════════════════════════════════════════════════════════════════
// ICON IMPORTS — Centralized asset references
// ═══════════════════════════════════════════════════════════════════════

const tryRequire = (path: () => ImageSourcePropType): ImageSourcePropType => {
  try {
    return path();
  } catch {
    return FALLBACK_ICON;
  }
};

export const HOME_ICONS = {
  // ══════ DỊCH VỤ ══════
  services: {
    houseDesign: tryRequire(() =>
      require("@/assets/icon-home-page/Thiết kế nhà.png"),
    ),
    interiorDesign: tryRequire(() =>
      require("@/assets/icon-home-page/Thiết kế nội thất.png"),
    ),
    lookup: tryRequire(() =>
      require("@/assets/icon-home-page/Tra cứu xây dựng.png"),
    ),
    permit: tryRequire(() => require("@/assets/icon-home-page/xin phép.png")),
    template: tryRequire(() =>
      require("@/assets/icon-home-page/Hồ Sơ mẫu.png"),
    ),
    loBan: tryRequire(() =>
      require("@/assets/icon-home-page/Thước lỗ ban.png"),
    ),
    palette: tryRequire(() => require("@/assets/icon-home-page/bảng màu.png")),
    consulting: tryRequire(() =>
      require("@/assets/icon-home-page/tư vấn chất lượng.png"),
    ),
    contractor: tryRequire(() =>
      require("@/assets/icon-home-page/công ty xây dựng.png"),
    ),
    interiorCompany: tryRequire(() =>
      require("@/assets/icon-home-page/công ty nội thất.png"),
    ),
    supervisor: tryRequire(() =>
      require("@/assets/icon-home-page/giám sát chất lượng.png"),
    ),
    estimation: tryRequire(() =>
      require("@/assets/icon-home-page/dự toán.png"),
    ),
    materials: tryRequire(() =>
      require("@/assets/icon-home-page/vật liệu xây dựng.png"),
    ),
    aiTools: tryRequire(() =>
      require("@/assets/icon-home-page/công cụ ai.png"),
    ),
    workerFinder: tryRequire(() =>
      require("@/assets/icon-home-page/nhân công xây dựng.png"),
    ),
    more: tryRequire(() => require("@/assets/icon-home-page/xem thêm.jpeg")),
  },
  // ══════ TIỆN ÍCH THIẾT KẾ ══════
  design: {
    architect: tryRequire(() =>
      require("@/assets/icon-home-page/kiến trúc sư.png"),
    ),
    interiorArchitect: tryRequire(() =>
      require("@/assets/icon-home-page/nội thất.png"),
    ),
    supervisor: tryRequire(() => require("@/assets/icon-home-page/kỹ sư.png")),
    structureEngineer: tryRequire(() =>
      require("@/assets/icon-home-page/kết cấu.png"),
    ),
    electricalEngineer: tryRequire(() =>
      require("@/assets/icon-home-page/điện.png"),
    ),
    plumbingEngineer: tryRequire(() =>
      require("@/assets/icon-home-page/nước.png"),
    ),
    estimation: tryRequire(() =>
      require("@/assets/icon-home-page/dự toán.png"),
    ),
  },
  // ══════ TIỆN ÍCH MUA SẮM ══════
  shopping: {
    kitchen: tryRequire(() =>
      require("@/assets/icon-home-page/thiết bị bếp.jpeg"),
    ),
    bathroom: tryRequire(() =>
      require("@/assets/icon-home-page/thiết bị vệ sinh.jpeg"),
    ),
    electric: tryRequire(() =>
      require("@/assets/icon-home-page/thiết bị điện.jpeg"),
    ),
    water: tryRequire(() =>
      require("@/assets/icon-home-page/thiết bị nước.jpeg"),
    ),
    pccc: tryRequire(() => require("@/assets/icon-home-page/PCCC.jpeg")),
    dining: tryRequire(() => require("@/assets/icon-home-page/bàn ăn.jpeg")),
    study: tryRequire(() => require("@/assets/icon-home-page/bàn học.jpeg")),
    sofa: tryRequire(() => require("@/assets/icon-home-page/sofa.jpeg")),
  },
  // ══════ THƯ VIỆN ══════
  library: {
    office: tryRequire(() =>
      require("@/assets/images/thu-vien/van-phong.webp"),
    ),
    townhouse: tryRequire(() =>
      require("@/assets/images/thu-vien/nha-pho.webp"),
    ),
    villa: tryRequire(() => require("@/assets/images/thu-vien/biet-thu.webp")),
    classicVilla: tryRequire(() =>
      require("@/assets/images/thu-vien/biet-thu-co-dien.webp"),
    ),
    hotel: tryRequire(() => require("@/assets/images/thu-vien/khach-san.webp")),
    factory: tryRequire(() =>
      require("@/assets/images/thu-vien/nha-xuong.webp"),
    ),
    servicedApartment: tryRequire(() =>
      require("@/assets/images/thu-vien/can-ho-dich-vu.webp"),
    ),
  },
  // ══════ TIỆN ÍCH XÂY DỰNG ══════
  construction: {
    pile: tryRequire(() =>
      require("@/assets/icon-home-page/nhân công ép cọc.png"),
    ),
    digging: tryRequire(() =>
      require("@/assets/icon-home-page/nhân công đào đất.png"),
    ),
    material: tryRequire(() =>
      require("@/assets/icon-home-page/vật liệu xây dựng.png"),
    ),
    workforce: tryRequire(() =>
      require("@/assets/icon-home-page/nhân công xây dựng.png"),
    ),
    mason: tryRequire(() => require("@/assets/icon-home-page/thợ xây.png")),
    ironWorker: tryRequire(() =>
      require("@/assets/icon-home-page/thợ sắt.png"),
    ),
    coffa: tryRequire(() => require("@/assets/icon-home-page/thợ coffa.png")),
    mechanical: tryRequire(() =>
      require("@/assets/icon-home-page/thợ cơ khí.png"),
    ),
    plaster: tryRequire(() =>
      require("@/assets/icon-home-page/thợ tô tường.png"),
    ),
    mep: tryRequire(() => require("@/assets/icon-home-page/thợ điện nước.png")),
    concrete: tryRequire(() => require("@/assets/icon-home-page/bê tông.png")),
  },
  // ══════ TIỆN ÍCH HOÀN THIỆN ══════
  finishing: {
    tile: tryRequire(() => require("@/assets/icon-home-page/thợ lát gạch.png")),
    gypsum: tryRequire(() =>
      require("@/assets/icon-home-page/thợ đóng trần thạch cao.png"),
    ),
    paint: tryRequire(() => require("@/assets/icon-home-page/thợ sơn.png")),
    stone: tryRequire(() => require("@/assets/icon-home-page/thợ đá.png")),
    door: tryRequire(() => require("@/assets/icon-home-page/thợ cửa.png")),
    railing: tryRequire(() =>
      require("@/assets/icon-home-page/thợ lan can.png"),
    ),
    gate: tryRequire(() => require("@/assets/icon-home-page/thợ cổng.png")),
    camera: tryRequire(() => require("@/assets/icon-home-page/thợ camera.png")),
  },
  // ══════ TIỆN ÍCH BẢO TRÌ ══════
  maintenance: {
    washingMachine: tryRequire(() =>
      require("@/assets/icon-home-page/thợ sửa máy giặt.png"),
    ),
    fridge: tryRequire(() =>
      require("@/assets/icon-home-page/thợ sửa tủ lạnh.png"),
    ),
    drainage: tryRequire(() =>
      require("@/assets/icon-home-page/thợ tông tắc cống.png"),
    ),
    electrician: tryRequire(() =>
      require("@/assets/icon-home-page/Thợ điện lực.png"),
    ),
    waterRepair: tryRequire(() =>
      require("@/assets/icon-home-page/Thợ sửa nước.png"),
    ),
    wifi: tryRequire(() =>
      require("@/assets/icon-home-page/Thợ mạng wifi.png"),
    ),
    aircon: tryRequire(() =>
      require("@/assets/icon-home-page/thợ sửa máy lạnh.png"),
    ),
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════
// DATA TYPES
// ═══════════════════════════════════════════════════════════════════════

export interface ServiceItem {
  id: number;
  label: string;
  icon: ImageSourcePropType;
  route: string;
}

export interface DesignServiceItem extends ServiceItem {
  price: string;
  location: string;
  count: string;
}

export interface WorkerItem extends ServiceItem {
  price: string;
}

export interface RepairServiceItem {
  id: string;
  label: string;
  icon: string; // MaterialCommunityIcons name
  color: string;
  price: string;
}

// ═══════════════════════════════════════════════════════════════════════
// DỊCH VỤ (Main Services — 16 items)
// ═══════════════════════════════════════════════════════════════════════

export const SERVICES: ServiceItem[] = [
  {
    id: 1,
    label: "Thiết kế nhà",
    icon: HOME_ICONS.services.houseDesign,
    route: "/services/house-design",
  },
  {
    id: 2,
    label: "Thiết kế nội thất",
    icon: HOME_ICONS.services.interiorDesign,
    route: "/services/interior-design",
  },
  {
    id: 3,
    label: "Tra cứu xây dựng",
    icon: HOME_ICONS.services.lookup,
    route: "/construction",
  },
  {
    id: 4,
    label: "Xin phép",
    icon: HOME_ICONS.services.permit,
    route: "/services/permit",
  },
  {
    id: 5,
    label: "Hồ sơ mẫu",
    icon: HOME_ICONS.services.template,
    route: "/documents",
  },
  {
    id: 6,
    label: "Lỗ ban",
    icon: HOME_ICONS.services.loBan,
    route: "/tools/lo-ban-ruler",
  },
  {
    id: 7,
    label: "Bảng màu",
    icon: HOME_ICONS.services.palette,
    route: "/tools/color-picker",
  },
  {
    id: 8,
    label: "Tư vấn chất lượng",
    icon: HOME_ICONS.services.consulting,
    route: "/services/quality-consulting",
  },
  {
    id: 9,
    label: "Công ty xây dựng",
    icon: HOME_ICONS.services.contractor,
    route: "/contractor",
  },
  {
    id: 10,
    label: "Công ty nội thất",
    icon: HOME_ICONS.services.interiorCompany,
    route: "/services/interior-company",
  },
  {
    id: 11,
    label: "Giám sát chất lượng",
    icon: HOME_ICONS.services.supervisor,
    route: "/services/quality-supervision",
  },
  {
    id: 12,
    label: "Xem thêm",
    icon: HOME_ICONS.services.more,
    route: "/(tabs)/menu",
  },
];

// ═══════════════════════════════════════════════════════════════════════
// DỊCH VỤ SỬA CHỮA TẠI NHÀ (Repair Services)
// ═══════════════════════════════════════════════════════════════════════

export const REPAIR_SERVICES: RepairServiceItem[] = [
  {
    id: "ac",
    label: "Vệ sinh\nmáy lạnh",
    icon: "air-conditioner",
    color: "#2196F3",
    price: "120K",
  },
  {
    id: "elec",
    label: "Thợ điện",
    icon: "flash",
    color: "#FFC107",
    price: "100K",
  },
  {
    id: "plumb",
    label: "Thợ nước",
    icon: "water-pump",
    color: "#03A9F4",
    price: "150K",
  },
  {
    id: "paint",
    label: "Thợ sơn",
    icon: "format-paint",
    color: "#E91E63",
    price: "200K",
  },
  {
    id: "clean",
    label: "Vệ sinh\nnhà",
    icon: "broom",
    color: "#4CAF50",
    price: "200K",
  },
  {
    id: "lock",
    label: "Thợ khoá",
    icon: "key-variant",
    color: "#795548",
    price: "100K",
  },
  {
    id: "wood",
    label: "Thợ mộc",
    icon: "hammer",
    color: "#8D6E63",
    price: "200K",
  },
  {
    id: "cam",
    label: "Lắp\ncamera",
    icon: "cctv",
    color: "#9C27B0",
    price: "300K",
  },
];

// ═══════════════════════════════════════════════════════════════════════
// TIỆN ÍCH THIẾT KẾ (Design Services — 16 items)
// ═══════════════════════════════════════════════════════════════════════

export const DESIGN_SERVICES: DesignServiceItem[] = [
  {
    id: 1,
    label: "Kiến trúc sư",
    price: "300.000đ/m2",
    location: "Sài Gòn",
    count: "100",
    icon: HOME_ICONS.design.architect,
    route: "/services/architect-listing",
  },
  {
    id: 2,
    label: "Kỹ sư",
    price: "200.000đ/m2",
    location: "Sài Gòn",
    count: "100",
    icon: HOME_ICONS.design.supervisor,
    route: "/services/engineer-listing",
  },
  {
    id: 3,
    label: "Kết cấu",
    price: "150.000đ/m2",
    location: "Sài Gòn",
    count: "100",
    icon: HOME_ICONS.design.structureEngineer,
    route: "/services/structural-engineer",
  },
  {
    id: 4,
    label: "Điện",
    price: "200.000đ/m2",
    location: "Sài Gòn",
    count: "100",
    icon: HOME_ICONS.design.electricalEngineer,
    route: "/services/mep-electrical",
  },
  {
    id: 5,
    label: "Nước",
    price: "250.000đ/m2",
    location: "Sài Gòn",
    count: "100",
    icon: HOME_ICONS.design.plumbingEngineer,
    route: "/services/mep-plumbing",
  },
  {
    id: 6,
    label: "Dự toán",
    price: "150.000đ/m2",
    location: "Sài Gòn",
    count: "100",
    icon: HOME_ICONS.design.estimation,
    route: "/calculators",
  },
  {
    id: 7,
    label: "Nội thất",
    price: "70.000đ/m2",
    location: "Sài Gòn",
    count: "100",
    icon: HOME_ICONS.design.interiorArchitect,
    route: "/services/interior-design",
  },
  {
    id: 8,
    label: "Công Cụ AI",
    price: "70.000đ/m2",
    location: "Sài Gòn",
    count: "100",
    icon: HOME_ICONS.services.aiTools,
    route: "/ai-design",
  },
  {
    id: 9,
    label: "Phong thủy",
    price: "100.000đ/m2",
    location: "Hà Nội",
    count: "80",
    icon: HOME_ICONS.services.loBan,
    route: "/tools/feng-shui-ai",
  },
  {
    id: 10,
    label: "Xin phép XD",
    price: "50.000đ/m2",
    location: "Đà Nẵng",
    count: "60",
    icon: HOME_ICONS.services.permit,
    route: "/services/permit",
  },
  {
    id: 11,
    label: "Khảo sát",
    price: "80.000đ/m2",
    location: "Sài Gòn",
    count: "45",
    icon: HOME_ICONS.services.lookup,
    route: "/construction",
  },
  {
    id: 12,
    label: "Thiết kế 3D",
    price: "120.000đ/m2",
    location: "Sài Gòn",
    count: "55",
    icon: HOME_ICONS.services.houseDesign,
    route: "/ai-design",
  },
  {
    id: 13,
    label: "Bản vẽ",
    price: "90.000đ/m2",
    location: "Hà Nội",
    count: "70",
    icon: HOME_ICONS.services.template,
    route: "/documents",
  },
  {
    id: 14,
    label: "Thi công",
    price: "180.000đ/m2",
    location: "Sài Gòn",
    count: "120",
    icon: HOME_ICONS.services.contractor,
    route: "/contractor",
  },
  {
    id: 15,
    label: "Giám sát",
    price: "50.000đ/m2",
    location: "Sài Gòn",
    count: "90",
    icon: HOME_ICONS.services.supervisor,
    route: "/services/quality-supervision",
  },
  {
    id: 16,
    label: "Nghiệm thu",
    price: "40.000đ/m2",
    location: "Sài Gòn",
    count: "75",
    icon: HOME_ICONS.services.consulting,
    route: "/quality-assurance",
  },
];

// ═══════════════════════════════════════════════════════════════════════
// TIỆN ÍCH MUA SẮM (Equipment — 16 items)
// ═══════════════════════════════════════════════════════════════════════

export const EQUIPMENT_ITEMS: ServiceItem[] = [
  {
    id: 1,
    label: "Thiết bị bếp",
    icon: HOME_ICONS.shopping.kitchen,
    route: "/shopping/kitchen-equipment",
  },
  {
    id: 2,
    label: "Thiết bị vệ sinh",
    icon: HOME_ICONS.shopping.bathroom,
    route: "/shopping/sanitary-equipment",
  },
  {
    id: 3,
    label: "Điện",
    icon: HOME_ICONS.shopping.electric,
    route: "/shopping/electrical",
  },
  {
    id: 4,
    label: "Nước",
    icon: HOME_ICONS.shopping.water,
    route: "/shopping/plumbing",
  },
  {
    id: 5,
    label: "PCCC",
    icon: HOME_ICONS.shopping.pccc,
    route: "/shopping/fire-safety",
  },
  {
    id: 6,
    label: "Bàn ăn",
    icon: HOME_ICONS.shopping.dining,
    route: "/shopping/dining-tables",
  },
  {
    id: 7,
    label: "Bàn học",
    icon: HOME_ICONS.shopping.study,
    route: "/shopping/study-desks",
  },
  {
    id: 8,
    label: "Sofa",
    icon: HOME_ICONS.shopping.sofa,
    route: "/shopping/sofas",
  },
  {
    id: 9,
    label: "Tủ quần áo",
    icon: HOME_ICONS.shopping.study,
    route: "/shopping/interior",
  },
  {
    id: 10,
    label: "Giường ngủ",
    icon: HOME_ICONS.shopping.sofa,
    route: "/shopping/interior",
  },
  {
    id: 11,
    label: "Đèn trang trí",
    icon: HOME_ICONS.shopping.electric,
    route: "/shopping/electrical",
  },
  {
    id: 12,
    label: "Rèm cửa",
    icon: HOME_ICONS.shopping.water,
    route: "/shopping/interior",
  },
  {
    id: 13,
    label: "Máy lạnh",
    icon: HOME_ICONS.shopping.electric,
    route: "/shopping/electrical",
  },
  {
    id: 14,
    label: "Máy nước nóng",
    icon: HOME_ICONS.shopping.water,
    route: "/shopping/plumbing",
  },
  {
    id: 15,
    label: "Bồn tắm",
    icon: HOME_ICONS.shopping.bathroom,
    route: "/shopping/sanitary-equipment",
  },
  {
    id: 16,
    label: "Xem thêm",
    icon: HOME_ICONS.services.more,
    route: "/shopping",
  },
];

// ═══════════════════════════════════════════════════════════════════════
// THƯ VIỆN THIẾT KẾ (Library — 16 items)
// ═══════════════════════════════════════════════════════════════════════

export const LIBRARY_ITEMS: ServiceItem[] = [
  {
    id: 1,
    label: "Văn phòng",
    icon: HOME_ICONS.library.office,
    route: "/categories/office",
  },
  {
    id: 2,
    label: "Nhà phố",
    icon: HOME_ICONS.library.townhouse,
    route: "/categories/townhouse",
  },
  {
    id: 3,
    label: "Biệt thự",
    icon: HOME_ICONS.library.villa,
    route: "/categories/villa",
  },
  {
    id: 4,
    label: "Biệt thự cổ điển",
    icon: HOME_ICONS.library.classicVilla,
    route: "/categories/classic-villa",
  },
  {
    id: 5,
    label: "Khách sạn",
    icon: HOME_ICONS.library.hotel,
    route: "/categories/hotel",
  },
  {
    id: 6,
    label: "Nhà xưởng",
    icon: HOME_ICONS.library.factory,
    route: "/categories/factory",
  },
  {
    id: 7,
    label: "Căn hộ DV",
    icon: HOME_ICONS.library.servicedApartment,
    route: "/categories/apartment",
  },
  {
    id: 8,
    label: "Nhà hàng",
    icon: HOME_ICONS.library.hotel,
    route: "/categories/restaurant",
  },
  {
    id: 9,
    label: "Cafe",
    icon: HOME_ICONS.library.townhouse,
    route: "/categories/cafe",
  },
  {
    id: 10,
    label: "Spa",
    icon: HOME_ICONS.library.servicedApartment,
    route: "/categories/spa",
  },
  {
    id: 11,
    label: "Gym",
    icon: HOME_ICONS.library.factory,
    route: "/categories/gym",
  },
  {
    id: 12,
    label: "Trường học",
    icon: HOME_ICONS.library.office,
    route: "/categories/school",
  },
  {
    id: 13,
    label: "Bệnh viện",
    icon: HOME_ICONS.library.hotel,
    route: "/categories/hospital",
  },
  {
    id: 14,
    label: "Showroom",
    icon: HOME_ICONS.library.office,
    route: "/categories/showroom",
  },
  {
    id: 15,
    label: "Kho",
    icon: HOME_ICONS.library.factory,
    route: "/warehouse",
  },
  {
    id: 16,
    label: "Xem thêm",
    icon: HOME_ICONS.services.more,
    route: "/categories",
  },
];

// ═══════════════════════════════════════════════════════════════════════
// TIỆN ÍCH XÂY DỰNG (Construction Workers — 16 items)
// ═══════════════════════════════════════════════════════════════════════

export const CONSTRUCTION_WORKERS: WorkerItem[] = [
  {
    id: 1,
    label: "Ép cọc",
    price: "Hà Nội - 100",
    icon: HOME_ICONS.construction.pile,
    route: "/workers?specialty=ep-coc",
  },
  {
    id: 2,
    label: "Đào đất",
    price: "Sài Gòn - 50",
    icon: HOME_ICONS.construction.digging,
    route: "/workers?specialty=dao-dat",
  },
  {
    id: 3,
    label: "Vật liệu",
    price: "Sài Gòn - 50",
    icon: HOME_ICONS.construction.material,
    route: "/shopping/construction",
  },
  {
    id: 4,
    label: "Nhân công XD",
    price: "Sài Gòn - 50",
    icon: HOME_ICONS.construction.workforce,
    route: "/workers?specialty=nhan-cong",
  },
  {
    id: 5,
    label: "Thợ xây",
    price: "Hà Nội - 78",
    icon: HOME_ICONS.construction.mason,
    route: "/workers?specialty=tho-xay",
  },
  {
    id: 6,
    label: "Thợ sắt",
    price: "Sài Gòn - 97",
    icon: HOME_ICONS.construction.ironWorker,
    route: "/workers?specialty=tho-sat",
  },
  {
    id: 7,
    label: "Thợ coffa",
    price: "Sài Gòn - 97",
    icon: HOME_ICONS.construction.coffa,
    route: "/workers?specialty=tho-coffa",
  },
  {
    id: 8,
    label: "Thợ cơ khí",
    price: "Sài Gòn - 97",
    icon: HOME_ICONS.construction.mechanical,
    route: "/workers?specialty=co-khi",
  },
  {
    id: 9,
    label: "Thợ tô tường",
    price: "Hà Nội - 100",
    icon: HOME_ICONS.construction.plaster,
    route: "/workers?specialty=to-tuong",
  },
  {
    id: 10,
    label: "Thợ điện nước",
    price: "Sài Gòn - 50",
    icon: HOME_ICONS.construction.mep,
    route: "/workers?specialty=dien-nuoc",
  },
  {
    id: 11,
    label: "Bê tông",
    price: "Sài Gòn - 50",
    icon: HOME_ICONS.construction.concrete,
    route: "/shopping/construction",
  },
  {
    id: 12,
    label: "Cốp pha",
    price: "Đà Nẵng - 35",
    icon: HOME_ICONS.construction.coffa,
    route: "/workers?specialty=cop-pha",
  },
  {
    id: 13,
    label: "Máy móc",
    price: "Sài Gòn - 80",
    icon: HOME_ICONS.construction.material,
    route: "/shopping/construction",
  },
  {
    id: 14,
    label: "Vận tải",
    price: "Sài Gòn - 60",
    icon: HOME_ICONS.construction.workforce,
    route: "/workers?specialty=van-tai",
  },
  {
    id: 15,
    label: "Giám sát",
    price: "Hà Nội - 45",
    icon: HOME_ICONS.services.supervisor,
    route: "/services/quality-supervision",
  },
  {
    id: 16,
    label: "Xem thêm",
    price: "",
    icon: HOME_ICONS.services.more,
    route: "/workers",
  },
];

// ═══════════════════════════════════════════════════════════════════════
// TIỆN ÍCH HOÀN THIỆN (Finishing Workers — 16 items)
// ═══════════════════════════════════════════════════════════════════════

export const FINISHING_WORKERS: WorkerItem[] = [
  {
    id: 1,
    label: "Thợ lát gạch",
    price: "Hà Nội - 100",
    icon: HOME_ICONS.finishing.tile,
    route: "/finishing/lat-gach",
  },
  {
    id: 2,
    label: "Thợ thạch cao",
    price: "Sài Gòn - 100",
    icon: HOME_ICONS.finishing.gypsum,
    route: "/finishing/thach-cao",
  },
  {
    id: 3,
    label: "Thợ sơn",
    price: "Sài Gòn - 70",
    icon: HOME_ICONS.finishing.paint,
    route: "/finishing/son",
  },
  {
    id: 4,
    label: "Thợ đá",
    price: "Sài Gòn - 70",
    icon: HOME_ICONS.finishing.stone,
    route: "/finishing/da",
  },
  {
    id: 5,
    label: "Thợ làm cửa",
    price: "Hà Nội - 100",
    icon: HOME_ICONS.finishing.door,
    route: "/finishing/lam-cua",
  },
  {
    id: 6,
    label: "Thợ lan can",
    price: "Sài Gòn - 70",
    icon: HOME_ICONS.finishing.railing,
    route: "/finishing/lan-can",
  },
  {
    id: 7,
    label: "Thợ cổng",
    price: "Đà Nẵng - 35",
    icon: HOME_ICONS.finishing.gate,
    route: "/finishing",
  },
  {
    id: 8,
    label: "Thợ camera",
    price: "Sài Gòn - 70",
    icon: HOME_ICONS.finishing.camera,
    route: "/finishing/camera",
  },
  {
    id: 9,
    label: "Thợ ốp đá",
    price: "Sài Gòn - 65",
    icon: HOME_ICONS.finishing.stone,
    route: "/finishing/op-da",
  },
  {
    id: 10,
    label: "Thợ điện",
    price: "Hà Nội - 85",
    icon: HOME_ICONS.construction.mep,
    route: "/finishing/dien-nuoc",
  },
  {
    id: 11,
    label: "Thợ nội thất",
    price: "Sài Gòn - 90",
    icon: HOME_ICONS.services.interiorDesign,
    route: "/finishing/noi-that",
  },
  {
    id: 12,
    label: "Tổng hợp",
    price: "Đà Nẵng - 50",
    icon: HOME_ICONS.finishing.gate,
    route: "/finishing/tho-tong-hop",
  },
  {
    id: 13,
    label: "Thợ mộc",
    price: "Sài Gòn - 75",
    icon: HOME_ICONS.finishing.door,
    route: "/finishing",
  },
  {
    id: 14,
    label: "Thợ nhôm kính",
    price: "Hà Nội - 60",
    icon: HOME_ICONS.finishing.railing,
    route: "/finishing",
  },
  {
    id: 15,
    label: "Thợ vệ sinh",
    price: "Sài Gòn - 40",
    icon: HOME_ICONS.shopping.bathroom,
    route: "/finishing",
  },
  {
    id: 16,
    label: "Xem thêm",
    price: "",
    icon: HOME_ICONS.services.more,
    route: "/finishing",
  },
];

// ═══════════════════════════════════════════════════════════════════════
// DESIGN LIVE CIRCLES
// ═══════════════════════════════════════════════════════════════════════

export const DESIGN_LIVE = [
  {
    id: 1,
    image: "https://picsum.photos/150/150?random=1",
    badge: true,
    route: "/live",
  },
  {
    id: 2,
    image: "https://picsum.photos/150/150?random=2",
    badge: true,
    route: "/live",
  },
  {
    id: 3,
    image: "https://picsum.photos/150/150?random=3",
    badge: true,
    route: "/live",
  },
  {
    id: 4,
    image: "https://picsum.photos/150/150?random=4",
    badge: true,
    route: "/live",
  },
  {
    id: 5,
    image: "https://picsum.photos/150/150?random=5",
    badge: true,
    route: "/live",
  },
  {
    id: 6,
    image: "https://picsum.photos/150/150?random=6",
    badge: true,
    route: "/live",
  },
];

// ═══════════════════════════════════════════════════════════════════════
// CATEGORY ITEMS (Featured categories)
// ═══════════════════════════════════════════════════════════════════════

export interface CategoryItem {
  id: number;
  label: string;
  icon: string; // MaterialCommunityIcons name
  color: string;
  route: string;
}

export const CATEGORY_ITEMS: CategoryItem[] = [
  {
    id: 1,
    label: "Lát gạch",
    icon: "texture-box",
    color: "#E65100",
    route: "/finishing/lat-gach",
  },
  {
    id: 2,
    label: "Nội quy công trình",
    icon: "clipboard-text-outline",
    color: "#1976D2",
    route: "/documents",
  },
  {
    id: 3,
    label: "Bảo quản thiết bị",
    icon: "tools",
    color: "#00897B",
    route: "/equipment/maintenance",
  },
  {
    id: 4,
    label: "Ốp đá",
    icon: "wall",
    color: "#5D4037",
    route: "/finishing/op-da",
  },
  {
    id: 5,
    label: "Sơn tường",
    icon: "format-paint",
    color: "#E91E63",
    route: "/finishing/son",
  },
  {
    id: 6,
    label: "Thạch cao",
    icon: "rectangle-outline",
    color: "#FF9800",
    route: "/finishing/thach-cao",
  },
  {
    id: 7,
    label: "Mái nhà",
    icon: "home-roof",
    color: "#0097A7",
    route: "/finishing",
  },
  {
    id: 8,
    label: "Camera",
    icon: "cctv",
    color: "#7B1FA2",
    route: "/finishing/camera",
  },
];

// ═══════════════════════════════════════════════════════════════════════
// TIỆN ÍCH BẢO TRÌ - SỬA CHỮA (Maintenance Workers — 8 items)
// ═══════════════════════════════════════════════════════════════════════

export const MAINTENANCE_WORKERS: WorkerItem[] = [
  {
    id: 1,
    label: "Thợ sửa máy giặt",
    price: "",
    icon: HOME_ICONS.maintenance.washingMachine,
    route: "/workers?specialty=sua-may-giat",
  },
  {
    id: 2,
    label: "Thợ sửa tủ lạnh",
    price: "",
    icon: HOME_ICONS.maintenance.fridge,
    route: "/workers?specialty=sua-tu-lanh",
  },
  {
    id: 3,
    label: "Thợ thông tắc cống",
    price: "",
    icon: HOME_ICONS.maintenance.drainage,
    route: "/workers?specialty=thong-tac-cong",
  },
  {
    id: 4,
    label: "Thợ điện",
    price: "",
    icon: HOME_ICONS.maintenance.electrician,
    route: "/workers?specialty=tho-dien",
  },
  {
    id: 5,
    label: "Thợ cấp nước",
    price: "",
    icon: HOME_ICONS.maintenance.waterRepair,
    route: "/workers?specialty=cap-nuoc",
  },
  {
    id: 6,
    label: "Thợ mạng – wifi",
    price: "",
    icon: HOME_ICONS.maintenance.wifi,
    route: "/workers?specialty=mang-wifi",
  },
  {
    id: 7,
    label: "Thợ sửa máy lạnh",
    price: "",
    icon: HOME_ICONS.maintenance.aircon,
    route: "/workers?specialty=sua-may-lanh",
  },
  {
    id: 8,
    label: "Xem thêm",
    price: "",
    icon: HOME_ICONS.services.more,
    route: "/workers",
  },
];

// ═══════════════════════════════════════════════════════════════════════
// CỘNG ĐỒNG — Community section (Ionicons-based, no image assets)
// ═══════════════════════════════════════════════════════════════════════
export interface CommunityItem {
  id: number;
  label: string;
  iconName: string;
  iconColor: string;
  bgColor: string;
  route: string;
}

export const COMMUNITY_ITEMS: CommunityItem[] = [
  {
    id: 1,
    label: "Bảng tin",
    iconName: "newspaper-outline",
    iconColor: "#ffffff",
    bgColor: "#0D9488",
    route: "/(tabs)/social",
  },
  {
    id: 2,
    label: "Đăng bài",
    iconName: "create-outline",
    iconColor: "#ffffff",
    bgColor: "#3B82F6",
    route: "/social/create-post",
  },
  {
    id: 3,
    label: "Video",
    iconName: "videocam-outline",
    iconColor: "#ffffff",
    bgColor: "#EF4444",
    route: "/social/video-discovery",
  },
  {
    id: 4,
    label: "Instagram",
    iconName: "logo-instagram",
    iconColor: "#ffffff",
    bgColor: "#A855F7",
    route: "/instagram-feed",
  },
  {
    id: 5,
    label: "Thông báo",
    iconName: "megaphone-outline",
    iconColor: "#ffffff",
    bgColor: "#F97316",
    route: "/community",
  },
  {
    id: 6,
    label: "Khám phá",
    iconName: "compass-outline",
    iconColor: "#ffffff",
    bgColor: "#10B981",
    route: "/social/explore",
  },
];
