/**
 * Home Screen - Enhanced with Horizontal Scrollable Sections
 * Each section displays 2 rows x 4 columns, scrollable left/right
 * Includes external content from Pexels/GNews APIs when DB data is empty
 * @updated 2026-01-15
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Href, router } from "expo-router";
import { memo, useCallback, useMemo, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// External content hooks and components
import {
    ExternalNewsSection,
    ExternalVideoSection,
} from "@/components/ExternalContentSection";
import { useExternalNews, useExternalVideos } from "@/hooks/useExternalContent";
import { useWorkerStats, WORKER_TYPE_MAP } from "@/hooks/useWorkerStats";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 16) / 4; // 4 items per row - tighter padding

// ============================================================================
// COLORS & SPACING
// ============================================================================
const COLORS = {
  bg: "#F8F9FA",
  white: "#FFFFFF",
  primary: "#7CB342",
  text: "#212121",
  textLight: "#757575",
  border: "#E0E0E0",
  liveBadge: "#E53935",
  chipBg: "#F5F5F5",
  chipActiveBg: "#7CB342",
  chipActiveText: "#FFFFFF",
};

const SPACING = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 8,
  xl: 12,
};

const FALLBACK_ICON = require("@/assets/images/icon.png");

const ICONS = {
  services: {
    houseDesign: require("@/assets/images/icon-dich-vu/thiet-ke-nha.webp"),
    interiorDesign: require("@/assets/images/icon-dich-vu/thiet-ke-noi-that.webp"),
    lookup: require("@/assets/images/icon-dich-vu/tra-cuu-xay-dung.webp"),
    permit: require("@/assets/images/icon-dich-vu/xin-phep.webp"),
    template: require("@/assets/images/icon-dich-vu/ho-so-mau.webp"),
    loBan: require("@/assets/images/icon-dich-vu/lo-ban.webp"),
    palette: require("@/assets/images/icon-dich-vu/bang-mau.webp"),
    consulting: require("@/assets/images/icon-dich-vu/tu-van-chat-luong.webp"),
    contractor: require("@/assets/images/icon-dich-vu/cong-ty-xay-dung.webp"),
    interiorCompany: require("@/assets/images/icon-dich-vu/cong-ty-noi-that.webp"),
    supervisor: require("@/assets/images/icon-dich-vu/giam-sat-chat-luong.webp"),
    estimation: require("@/assets/images/tien-ich-thiet-ke/du-toan.webp"),
    materials: require("@/assets/images/tien-ich-xay-dung/vat-lieu.webp"),
    aiTools: require("@/assets/images/tien-ich-thiet-ke/kien-tru-su-noi-that.webp"),
    workerFinder: require("@/assets/images/tien-ich-xay-dung/nhan-cong.webp"),
    more: FALLBACK_ICON,
  },
  designUtilities: {
    architect: require("@/assets/images/tien-ich-thiet-ke/kien-truc-su.webp"),
    interiorArchitect: require("@/assets/images/tien-ich-thiet-ke/kien-tru-su-noi-that.webp"),
    supervisor: require("@/assets/images/tien-ich-thiet-ke/ky-su-giam-sat.webp"),
    structureEngineer: require("@/assets/images/tien-ich-thiet-ke/ky-su-ket-cau.webp"),
    electricalEngineer: require("@/assets/images/tien-ich-thiet-ke/ky-su-dien.webp"),
    plumbingEngineer: require("@/assets/images/tien-ich-thiet-ke/ky-su-nuoc.webp"),
    estimation: require("@/assets/images/tien-ich-thiet-ke/du-toan.webp"),
  },
  shopping: {
    kitchen: require("@/assets/images/tien-ich-mua-sam-trang-thiet-bi/thiet-bi-bep.webp"),
    bathroom: require("@/assets/images/tien-ich-mua-sam-trang-thiet-bi/thiet-bi-ve-sinh.webp"),
    electric: require("@/assets/images/tien-ich-mua-sam-trang-thiet-bi/dien.webp"),
    water: require("@/assets/images/tien-ich-mua-sam-trang-thiet-bi/nuoc.webp"),
    pccc: require("@/assets/images/tien-ich-mua-sam-trang-thiet-bi/pccc.webp"),
    dining: require("@/assets/images/tien-ich-mua-sam-trang-thiet-bi/ban-an.webp"),
    study: require("@/assets/images/tien-ich-mua-sam-trang-thiet-bi/ban-hoc.webp"),
    sofa: require("@/assets/images/tien-ich-mua-sam-trang-thiet-bi/sofa.webp"),
  },
  library: {
    office: require("@/assets/images/thu-vien/van-phong.webp"),
    townhouse: require("@/assets/images/thu-vien/nha-pho.webp"),
    villa: require("@/assets/images/thu-vien/biet-thu.webp"),
    classicVilla: require("@/assets/images/thu-vien/biet-thu-co-dien.webp"),
    hotel: require("@/assets/images/thu-vien/khach-san.webp"),
    factory: require("@/assets/images/thu-vien/nha-xuong.webp"),
    servicedApartment: require("@/assets/images/thu-vien/can-ho-dich-vu.webp"),
  },
  construction: {
    pile: require("@/assets/images/tien-ich-xay-dung/ep-coc.webp"),
    digging: require("@/assets/images/tien-ich-xay-dung/dao-dat.webp"),
    material: require("@/assets/images/tien-ich-xay-dung/vat-lieu.webp"),
    workforce: require("@/assets/images/tien-ich-xay-dung/nhan-cong.webp"),
    mason: require("@/assets/images/tien-ich-xay-dung/tho-xay.webp"),
    coffa: require("@/assets/images/tien-ich-xay-dung/tho-coffa.webp"),
    plaster: require("@/assets/images/tien-ich-xay-dung/tho-to-tuong.webp"),
    mep: require("@/assets/images/tien-ich-xay-dung/tho-dien-nuoc.webp"),
    concrete: require("@/assets/images/tien-ich-xay-dung/be-tong.webp"),
  },
  finishing: {
    tile: require("@/assets/images/tien-ich-hoan-thien/tho-lat-gach.webp"),
    gypsum: require("@/assets/images/tien-ich-hoan-thien/tho-thachcao-.webp"),
    paint: require("@/assets/images/tien-ich-hoan-thien/tho-son.webp"),
    stone: require("@/assets/images/tien-ich-hoan-thien/tho-da.webp"),
    door: require("@/assets/images/tien-ich-hoan-thien/tho-lam-cua.webp"),
    railing: require("@/assets/images/tien-ich-hoan-thien/tho-lan-can.webp"),
    gate: require("@/assets/images/tien-ich-hoan-thien/tho-cong.webp"),
    camera: require("@/assets/images/tien-ich-hoan-thien/tho-camera.webp"),
  },
} as const;

// ============================================================================
// DATA - DỊCH VỤ (Main Services - 16 items for scrolling)
// ============================================================================
// Icons đơn giản, style châu Âu - minimal & clean
const SERVICES = [
  {
    id: 1,
    label: "Thiết kế nhà",
    icon: ICONS.services.houseDesign,
    route: "/services/house-design",
  },
  {
    id: 2,
    label: "Thiết kế nội thất",
    icon: ICONS.services.interiorDesign,
    route: "/services/interior-design",
  },
  {
    id: 3,
    label: "Tra cứu xây dựng",
    icon: ICONS.services.lookup,
    route: "/construction",
  },
  {
    id: 4,
    label: "Xin phép",
    icon: ICONS.services.permit,
    route: "/services/permit",
  },
  {
    id: 5,
    label: "Hồ sơ mẫu",
    icon: ICONS.services.template,
    route: "/documents",
  },
  {
    id: 6,
    label: "Lô ban",
    icon: ICONS.services.loBan,
    route: "/tools/lo-ban-ruler",
  },
  {
    id: 7,
    label: "Bảng màu",
    icon: ICONS.services.palette,
    route: "/tools/color-picker",
  },
  {
    id: 8,
    label: "Tư vấn CL",
    icon: ICONS.services.consulting,
    route: "/quality-assurance",
  },
  // Row 2
  {
    id: 9,
    label: "Công ty XD",
    icon: ICONS.services.contractor,
    route: "/contractor",
  },
  {
    id: 10,
    label: "Công ty NT",
    icon: ICONS.services.interiorCompany,
    route: "/services/interior-design",
  },
  {
    id: 11,
    label: "Giám sát CL",
    icon: ICONS.services.supervisor,
    route: "/services/quality-supervision",
  },
  {
    id: 12,
    label: "Dự toán",
    icon: ICONS.services.estimation,
    route: "/calculators",
  },
  {
    id: 13,
    label: "Vật liệu",
    icon: ICONS.services.materials,
    route: "/materials",
  },
  {
    id: 14,
    label: "AI Thiết kế",
    icon: ICONS.services.aiTools,
    route: "/ai-design",
  },
  {
    id: 15,
    label: "Tìm thợ",
    icon: ICONS.services.workerFinder,
    route: "/workers",
  },
  {
    id: 16,
    label: "Xem thêm",
    icon: ICONS.services.more,
    route: "/(tabs)/menu",
  },
];

// DESIGN LIVE
const DESIGN_LIVE = [
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

// TIỆN ÍCH THIẾT KẾ (16 items)
// Design services - minimal icons
const DESIGN_SERVICES = [
  {
    id: 1,
    label: "Kiến trúc sư",
    price: "300.000đ/m2",
    location: "Sài Gòn",
    count: "100",
    icon: ICONS.designUtilities.architect,
    route: "/services/house-design",
  },
  {
    id: 2,
    label: "Kỹ sư",
    price: "200.000đ/m2",
    location: "Sài Gòn",
    count: "100",
    icon: ICONS.designUtilities.supervisor,
    route: "/services/construction-company",
  },
  {
    id: 3,
    label: "Kết cấu",
    price: "150.000đ/m2",
    location: "Sài Gòn",
    count: "100",
    icon: ICONS.designUtilities.structureEngineer,
    route: "/services/construction-lookup",
  },
  {
    id: 4,
    label: "Điện",
    price: "200.000đ/m2",
    location: "Sài Gòn",
    count: "100",
    icon: ICONS.designUtilities.electricalEngineer,
    route: "/finishing/dien-nuoc",
  },
  {
    id: 5,
    label: "Nước",
    price: "250.000đ/m2",
    location: "Sài Gòn",
    count: "100",
    icon: ICONS.designUtilities.plumbingEngineer,
    route: "/finishing/dien-nuoc",
  },
  {
    id: 6,
    label: "Dự toán",
    price: "150.000đ/m2",
    location: "Sài Gòn",
    count: "100",
    icon: ICONS.designUtilities.estimation,
    route: "/calculators",
  },
  {
    id: 7,
    label: "Nội thất",
    price: "70.000đ/m2",
    location: "Sài Gòn",
    count: "100",
    icon: ICONS.designUtilities.interiorArchitect,
    route: "/services/interior-design",
  },
  {
    id: 8,
    label: "Công Cụ AI",
    price: "70.000đ/m2",
    location: "Sài Gòn",
    count: "100",
    icon: ICONS.services.aiTools,
    route: "/ai-design",
  },
  // Row 2
  {
    id: 9,
    label: "Phong thủy",
    price: "100.000đ/m2",
    location: "Hà Nội",
    count: "80",
    icon: ICONS.services.loBan,
    route: "/tools/feng-shui-ai",
  },
  {
    id: 10,
    label: "Xin phép XD",
    price: "50.000đ/m2",
    location: "Đà Nẵng",
    count: "60",
    icon: ICONS.services.permit,
    route: "/services/permit",
  },
  {
    id: 11,
    label: "Khảo sát",
    price: "80.000đ/m2",
    location: "Sài Gòn",
    count: "45",
    icon: ICONS.services.lookup,
    route: "/construction",
  },
  {
    id: 12,
    label: "Thiết kế 3D",
    price: "120.000đ/m2",
    location: "Sài Gòn",
    count: "55",
    icon: ICONS.services.houseDesign,
    route: "/ai-design",
  },
  {
    id: 13,
    label: "Bản vẽ",
    price: "90.000đ/m2",
    location: "Hà Nội",
    count: "70",
    icon: ICONS.services.template,
    route: "/documents",
  },
  {
    id: 14,
    label: "Thi công",
    price: "180.000đ/m2",
    location: "Sài Gòn",
    count: "120",
    icon: ICONS.services.contractor,
    route: "/contractor",
  },
  {
    id: 15,
    label: "Giám sát",
    price: "50.000đ/m2",
    location: "Sài Gòn",
    count: "90",
    icon: ICONS.services.supervisor,
    route: "/services/quality-supervision",
  },
  {
    id: 16,
    label: "Nghiệm thu",
    price: "40.000đ/m2",
    location: "Sài Gòn",
    count: "75",
    icon: ICONS.services.consulting,
    route: "/quality-assurance",
  },
];

// TIỆN ÍCH MUA SẮM TRANG THIẾT BỊ - minimal icons
const EQUIPMENT_ITEMS = [
  {
    id: 1,
    label: "Thiết bị bếp",
    icon: ICONS.shopping.kitchen,
    route: "/equipment?category=kitchen",
  },
  {
    id: 2,
    label: "Thiết bị vệ sinh",
    icon: ICONS.shopping.bathroom,
    route: "/equipment?category=bathroom",
  },
  {
    id: 3,
    label: "Điện",
    icon: ICONS.shopping.electric,
    route: "/equipment?category=electrical",
  },
  {
    id: 4,
    label: "Nước",
    icon: ICONS.shopping.water,
    route: "/equipment?category=plumbing",
  },
  {
    id: 5,
    label: "PCCC",
    icon: ICONS.shopping.pccc,
    route: "/equipment?category=fire-safety",
  },
  {
    id: 6,
    label: "Bàn ăn",
    icon: ICONS.shopping.dining,
    route: "/shop?category=furniture&type=dining",
  },
  {
    id: 7,
    label: "Bàn học",
    icon: ICONS.shopping.study,
    route: "/shop?category=furniture&type=desk",
  },
  {
    id: 8,
    label: "Sofa",
    icon: ICONS.shopping.sofa,
    route: "/shop?category=furniture&type=sofa",
  },
  // Row 2
  {
    id: 9,
    label: "Tủ quần áo",
    icon: ICONS.shopping.study,
    route: "/shop?category=furniture&type=wardrobe",
  },
  {
    id: 10,
    label: "Giường ngủ",
    icon: ICONS.shopping.sofa,
    route: "/shop?category=furniture&type=bed",
  },
  {
    id: 11,
    label: "Đèn trang trí",
    icon: ICONS.shopping.electric,
    route: "/shop?category=lighting",
  },
  {
    id: 12,
    label: "Rèm cửa",
    icon: ICONS.shopping.water,
    route: "/shop?category=curtain",
  },
  {
    id: 13,
    label: "Máy lạnh",
    icon: ICONS.shopping.electric,
    route: "/equipment?category=hvac",
  },
  {
    id: 14,
    label: "Máy nước nóng",
    icon: ICONS.shopping.water,
    route: "/equipment?category=water-heater",
  },
  {
    id: 15,
    label: "Bồn tắm",
    icon: ICONS.shopping.bathroom,
    route: "/equipment?category=bathroom",
  },
  { id: 16, label: "Xem thêm", icon: ICONS.services.more, route: "/shop" },
];

// THƯ VIỆN - minimal geometric icons
const LIBRARY_ITEMS = [
  {
    id: 1,
    label: "Văn phòng",
    icon: ICONS.library.office,
    route: "/categories/office",
  },
  {
    id: 2,
    label: "Nhà phố",
    icon: ICONS.library.townhouse,
    route: "/categories/townhouse",
  },
  {
    id: 3,
    label: "Biệt thự",
    icon: ICONS.library.villa,
    route: "/categories/villa",
  },
  {
    id: 4,
    label: "Biệt thự cổ điển",
    icon: ICONS.library.classicVilla,
    route: "/categories/classic-villa",
  },
  {
    id: 5,
    label: "Khách sạn",
    icon: ICONS.library.hotel,
    route: "/categories/hotel",
  },
  {
    id: 6,
    label: "Nhà xưởng",
    icon: ICONS.library.factory,
    route: "/categories/factory",
  },
  {
    id: 7,
    label: "Căn hộ DV",
    icon: ICONS.library.servicedApartment,
    route: "/categories/apartment",
  },
  {
    id: 8,
    label: "Nhà hàng",
    icon: ICONS.library.hotel,
    route: "/categories/restaurant",
  },
  // Row 2
  {
    id: 9,
    label: "Cafe",
    icon: ICONS.library.townhouse,
    route: "/categories/cafe",
  },
  {
    id: 10,
    label: "Spa",
    icon: ICONS.library.servicedApartment,
    route: "/categories/spa",
  },
  {
    id: 11,
    label: "Gym",
    icon: ICONS.library.factory,
    route: "/categories/gym",
  },
  {
    id: 12,
    label: "Trường học",
    icon: ICONS.library.office,
    route: "/categories/school",
  },
  {
    id: 13,
    label: "Bệnh viện",
    icon: ICONS.library.hotel,
    route: "/categories/hospital",
  },
  {
    id: 14,
    label: "Showroom",
    icon: ICONS.library.office,
    route: "/categories/showroom",
  },
  { id: 15, label: "Kho", icon: ICONS.library.factory, route: "/warehouse" },
  {
    id: 16,
    label: "Xem thêm",
    icon: ICONS.services.more,
    route: "/categories",
  },
];

// TIỆN ÍCH XÂY DỰNG - simplified icons
const CONSTRUCTION_WORKERS = [
  {
    id: 1,
    label: "Ép cọc",
    price: "Hà Nội - 100",
    icon: ICONS.construction.pile,
    route: "/workers?specialty=ep-coc",
  },
  {
    id: 2,
    label: "Đào đất",
    price: "Sài Gòn - 50",
    icon: ICONS.construction.digging,
    route: "/workers?specialty=dao-dat",
  },
  {
    id: 3,
    label: "Vật liệu",
    price: "Sài Gòn - 50",
    icon: ICONS.construction.material,
    route: "/materials",
  },
  {
    id: 4,
    label: "Nhân công XD",
    price: "Sài Gòn - 50",
    icon: ICONS.construction.workforce,
    route: "/workers?specialty=nhan-cong",
  },
  {
    id: 5,
    label: "Thợ xây",
    price: "Hà Nội - 78",
    icon: ICONS.construction.mason,
    route: "/workers?specialty=tho-xay",
  },
  {
    id: 6,
    label: "Thợ sắt",
    price: "Sài Gòn - 97",
    icon: ICONS.construction.coffa,
    route: "/workers?specialty=tho-sat",
  },
  {
    id: 7,
    label: "Thợ coffa",
    price: "Sài Gòn - 97",
    icon: ICONS.construction.coffa,
    route: "/workers?specialty=tho-coffa",
  },
  {
    id: 8,
    label: "Thợ cơ khí",
    price: "Sài Gòn - 97",
    icon: ICONS.construction.material,
    route: "/workers?specialty=co-khi",
  },
  // Row 2
  {
    id: 9,
    label: "Thợ tô tường",
    price: "Hà Nội - 100",
    icon: ICONS.construction.plaster,
    route: "/workers?specialty=to-tuong",
  },
  {
    id: 10,
    label: "Thợ điện nước",
    price: "Sài Gòn - 50",
    icon: ICONS.construction.mep,
    route: "/finishing/dien-nuoc",
  },
  {
    id: 11,
    label: "Bê tông",
    price: "Sài Gòn - 50",
    icon: ICONS.construction.concrete,
    route: "/materials?category=be-tong",
  },
  {
    id: 12,
    label: "Cốp pha",
    price: "Đà Nẵng - 35",
    icon: ICONS.construction.coffa,
    route: "/workers?specialty=cop-pha",
  },
  {
    id: 13,
    label: "Máy móc",
    price: "Sài Gòn - 80",
    icon: ICONS.construction.material,
    route: "/equipment?category=machinery",
  },
  {
    id: 14,
    label: "Vận tải",
    price: "Sài Gòn - 60",
    icon: ICONS.construction.workforce,
    route: "/fleet",
  },
  {
    id: 15,
    label: "Giám sát",
    price: "Hà Nội - 45",
    icon: ICONS.services.supervisor,
    route: "/services/quality-supervision",
  },
  { id: 16, label: "Xem thêm", icon: ICONS.services.more, route: "/workers" },
];

// VIDEO CONSTRUCTIONS (12 items)
const VIDEO_ITEMS = [
  {
    id: 1,
    label: "Thợ ép cọc",
    image: "https://picsum.photos/100/100?random=5",
    live: true,
    route: "/videos",
  },
  {
    id: 2,
    label: "Nhân công XD",
    image: "https://picsum.photos/100/100?random=6",
    live: true,
    route: "/videos",
  },
  {
    id: 3,
    label: "Thợ đắp chỉ",
    image: "https://picsum.photos/100/100?random=7",
    live: true,
    route: "/videos",
  },
  {
    id: 4,
    label: "Thợ tô tường",
    image: "https://picsum.photos/100/100?random=8",
    live: true,
    route: "/videos",
  },
  {
    id: 5,
    label: "Lát gạch",
    image: "https://picsum.photos/100/100?random=9",
    live: false,
    route: "/videos",
  },
  {
    id: 6,
    label: "Sơn nhà",
    image: "https://picsum.photos/100/100?random=10",
    live: true,
    route: "/videos",
  },
  {
    id: 7,
    label: "Làm cửa",
    image: "https://picsum.photos/100/100?random=11",
    live: false,
    route: "/videos",
  },
  {
    id: 8,
    label: "Lắp điện",
    image: "https://picsum.photos/100/100?random=12",
    live: true,
    route: "/videos",
  },
];

// TIỆN ÍCH HOÀN THIỆN - clean outline icons
const FINISHING_WORKERS = [
  {
    id: 1,
    label: "Thợ lát gạch",
    price: "Hà Nội - 100",
    icon: ICONS.finishing.tile,
    route: "/finishing/lat-gach",
  },
  {
    id: 2,
    label: "Thợ thạch cao",
    price: "Sài Gòn - 100",
    icon: ICONS.finishing.gypsum,
    route: "/finishing/thach-cao",
  },
  {
    id: 3,
    label: "Thợ sơn",
    price: "Sài Gòn - 70",
    icon: ICONS.finishing.paint,
    route: "/finishing/son",
  },
  {
    id: 4,
    label: "Thợ đá",
    price: "Sài Gòn - 70",
    icon: ICONS.finishing.stone,
    route: "/finishing/da",
  },
  {
    id: 5,
    label: "Thợ làm cửa",
    price: "Hà Nội - 100",
    icon: ICONS.finishing.door,
    route: "/finishing/lam-cua",
  },
  {
    id: 6,
    label: "Thợ lan can",
    price: "Sài Gòn - 70",
    icon: ICONS.finishing.railing,
    route: "/finishing/lan-can",
  },
  {
    id: 7,
    label: "Thợ cổng",
    price: "Đà Nẵng - 35",
    icon: ICONS.finishing.gate,
    route: "/finishing",
  },
  {
    id: 8,
    label: "Thợ camera",
    price: "Sài Gòn - 70",
    icon: ICONS.finishing.camera,
    route: "/finishing/camera",
  },
  // Row 2
  {
    id: 9,
    label: "Thợ ốp đá",
    price: "Sài Gòn - 65",
    icon: ICONS.finishing.stone,
    route: "/finishing/op-da",
  },
  {
    id: 10,
    label: "Thợ điện",
    price: "Hà Nội - 85",
    icon: ICONS.construction.mep,
    route: "/finishing/dien-nuoc",
  },
  {
    id: 11,
    label: "Thợ nội thất",
    price: "Sài Gòn - 90",
    icon: ICONS.services.interiorDesign,
    route: "/finishing/noi-that",
  },
  {
    id: 12,
    label: "Tổng hợp",
    price: "Đà Nẵng - 50",
    icon: ICONS.finishing.gate,
    route: "/finishing/tho-tong-hop",
  },
  {
    id: 13,
    label: "Thợ mộc",
    price: "Sài Gòn - 75",
    icon: ICONS.finishing.door,
    route: "/finishing",
  },
  {
    id: 14,
    label: "Thợ nhôm kính",
    price: "Hà Nội - 60",
    icon: ICONS.finishing.railing,
    route: "/finishing",
  },
  {
    id: 15,
    label: "Thợ vệ sinh",
    price: "Sài Gòn - 40",
    icon: ICONS.shopping.bathroom,
    route: "/finishing",
  },
  { id: 16, label: "Xem thêm", icon: ICONS.services.more, route: "/finishing" },
];

// DANH MỤC (Categories with images - 8 items)
const CATEGORY_ITEMS = [
  {
    id: 1,
    label: "Lát gạch",
    image: "https://picsum.photos/80/80?random=11",
    route: "/finishing/lat-gach",
  },
  {
    id: 2,
    label: "Nội quy công trình",
    image: "https://picsum.photos/80/80?random=12",
    route: "/documents",
  },
  {
    id: 3,
    label: "Bảo quản thiết bị",
    image: "https://picsum.photos/80/80?random=13",
    route: "/equipment/maintenance",
  },
  {
    id: 4,
    label: "Ốp đá",
    image: "https://picsum.photos/80/80?random=14",
    route: "/finishing/op-da",
  },
  {
    id: 5,
    label: "Sơn tường",
    image: "https://picsum.photos/80/80?random=15",
    route: "/finishing/son",
  },
  {
    id: 6,
    label: "Thạch cao",
    image: "https://picsum.photos/80/80?random=16",
    route: "/finishing/thach-cao",
  },
  {
    id: 7,
    label: "Làm cửa",
    image: "https://picsum.photos/80/80?random=17",
    route: "/finishing/lam-cua",
  },
  {
    id: 8,
    label: "Camera",
    image: "https://picsum.photos/80/80?random=18",
    route: "/finishing/camera",
  },
];

// ============================================================================
// FILTER DATA
// ============================================================================

// Bộ lọc cho Dịch vụ
const SERVICE_FILTERS = [
  { id: "all", label: "Tất cả" },
  { id: "design", label: "Thiết kế" },
  { id: "construction", label: "Xây dựng" },
  { id: "interior", label: "Nội thất" },
  { id: "consulting", label: "Tư vấn" },
  { id: "tools", label: "Công cụ" },
];

// ============================================================================
// HELPER: Group items into pages (2 rows x 4 cols = 8 items per page)
// ============================================================================
function groupItemsIntoPages<T>(items: T[], itemsPerPage: number = 8): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += itemsPerPage) {
    pages.push(items.slice(i, i + itemsPerPage));
  }
  return pages;
}

// ============================================================================
// COMPONENTS
// ============================================================================

// Header
const Header = memo(() => (
  <View style={styles.header}>
    <TouchableOpacity onPress={() => router.push("/(tabs)/menu" as Href)}>
      <Ionicons name="menu-outline" size={28} color={COLORS.text} />
    </TouchableOpacity>
    <Text style={styles.logoText}>APP Design Build</Text>
    <TouchableOpacity onPress={() => router.push("/notifications" as Href)}>
      <Ionicons name="notifications-outline" size={26} color={COLORS.text} />
    </TouchableOpacity>
  </View>
));

// Search Bar
const SearchBar = memo(() => (
  <TouchableOpacity
    style={styles.searchBar}
    onPress={() => router.push("/search" as Href)}
    activeOpacity={0.7}
  >
    <Ionicons name="search-outline" size={20} color={COLORS.textLight} />
    <Text style={styles.searchPlaceholder}>
      Tìm Kiếm dịch vụ, thợ, vật liệu...
    </Text>
  </TouchableOpacity>
));

// Service Grid Item
const ServiceItem = memo<{ item: (typeof SERVICES)[0] }>(({ item }) => (
  <TouchableOpacity
    style={styles.serviceItem}
    onPress={() => router.push(item.route as Href)}
    activeOpacity={0.7}
  >
    <View style={styles.serviceIconContainer}>
      <Image source={item.icon} style={styles.iconImage} resizeMode="contain" />
    </View>
    <Text style={styles.serviceLabel} numberOfLines={2}>
      {item.label}
    </Text>
  </TouchableOpacity>
));

// Service Section with horizontal scroll (2 rows x 4 cols)
const ServiceSection = memo<{
  title: string;
  data: typeof SERVICES;
  seeMoreRoute: string;
}>(({ title, data, seeMoreRoute }) => {
  const pages = useMemo(() => groupItemsIntoPages(data, 8), [data]);

  return (
    <View style={styles.section}>
      {title ? (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <TouchableOpacity onPress={() => router.push(seeMoreRoute as Href)}>
            <Text style={styles.seeMoreText}>XEM THÊM</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <FlatList
        data={pages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => `page-${index}`}
        renderItem={({ item: pageItems }) => (
          <View style={styles.gridPage}>
            {pageItems.map((service) => (
              <ServiceItem key={service.id} item={service} />
            ))}
          </View>
        )}
      />
    </View>
  );
});

// Design Live Item with badge
const DesignLiveItem = memo<{ item: (typeof DESIGN_LIVE)[0] }>(({ item }) => (
  <TouchableOpacity
    style={styles.designLiveItem}
    onPress={() => router.push(item.route as Href)}
    activeOpacity={0.7}
  >
    <Image source={{ uri: item.image }} style={styles.designLiveImage} />
    {item.badge && (
      <View style={styles.liveBadge}>
        <View style={styles.liveDot} />
        <Text style={styles.liveBadgeText}>Live</Text>
      </View>
    )}
  </TouchableOpacity>
));

// Green Banner
const GreenBanner = memo(() => (
  <TouchableOpacity
    style={styles.greenBanner}
    onPress={() => router.push("/construction" as Href)}
    activeOpacity={0.9}
  >
    <LinearGradient
      colors={["#66BB6A", "#43A047"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.greenBannerGradient}
    >
      <View style={styles.greenBannerContent}>
        <View>
          <Text style={styles.greenBannerTitle}>TIỆN ÍCH</Text>
          <Text style={styles.greenBannerSubtitle}>XÂY DỰNG</Text>
          <Text style={styles.greenBannerDescription}>
            Hỗ trợ cho công ty xây dựng hoặc nhà thầu
          </Text>
          <Text style={styles.greenBannerNote}>
            Tài khoản khách hàng (Tác vụ lập phiếu công việc / Thẻ thanh toán)
          </Text>
        </View>
        <View style={styles.greenBannerButton}>
          <Text style={styles.greenBannerButtonText}>KHÁM PHÁ NGAY</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
        </View>
      </View>
      <View style={styles.greenBannerImageContainer}>
        <Ionicons name="construct" size={80} color="rgba(255,255,255,0.3)" />
      </View>
    </LinearGradient>
  </TouchableOpacity>
));

// Design Service Card
const DesignServiceItem = memo<{ item: (typeof DESIGN_SERVICES)[0] }>(
  ({ item }) => (
    <TouchableOpacity
      style={styles.designServiceItem}
      onPress={() => router.push(item.route as Href)}
      activeOpacity={0.7}
    >
      <View style={styles.designServiceIcon}>
        <Image
          source={item.icon}
          style={styles.iconImage}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.designServiceLabel} numberOfLines={1}>
        {item.label}
      </Text>
      <Text style={styles.designServicePrice} numberOfLines={1}>
        {item.price}
      </Text>
    </TouchableOpacity>
  )
);

// Design Service Section with horizontal scroll
const DesignServiceSection = memo<{
  title: string;
  data: typeof DESIGN_SERVICES;
  seeMoreRoute: string;
}>(({ title, data, seeMoreRoute }) => {
  const pages = useMemo(() => groupItemsIntoPages(data, 8), [data]);

  return (
    <View style={styles.section}>
      {title ? (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <TouchableOpacity onPress={() => router.push(seeMoreRoute as Href)}>
            <Text style={styles.seeMoreText}>XEM THÊM</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <FlatList
        data={pages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => `design-page-${index}`}
        renderItem={({ item: pageItems }) => (
          <View style={styles.gridPage}>
            {pageItems.map((item) => (
              <DesignServiceItem key={item.id} item={item} />
            ))}
          </View>
        )}
      />
    </View>
  );
});

// Equipment Item
const EquipmentItemComponent = memo<{ item: (typeof EQUIPMENT_ITEMS)[0] }>(
  ({ item }) => (
    <TouchableOpacity
      style={styles.equipmentItem}
      onPress={() => router.push(item.route as Href)}
      activeOpacity={0.7}
    >
      <View style={styles.equipmentIcon}>
        <Image
          source={item.icon}
          style={styles.iconImage}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.equipmentLabel} numberOfLines={2}>
        {item.label}
      </Text>
    </TouchableOpacity>
  )
);

// Equipment Section
const EquipmentSection = memo<{
  title: string;
  data: typeof EQUIPMENT_ITEMS;
  seeMoreRoute: string;
}>(({ title, data, seeMoreRoute }) => {
  const pages = useMemo(() => groupItemsIntoPages(data, 8), [data]);

  return (
    <View style={styles.section}>
      {title ? (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <TouchableOpacity onPress={() => router.push(seeMoreRoute as Href)}>
            <Text style={styles.seeMoreText}>XEM THÊM</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <FlatList
        data={pages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => `equipment-page-${index}`}
        renderItem={({ item: pageItems }) => (
          <View style={styles.gridPage}>
            {pageItems.map((item) => (
              <EquipmentItemComponent key={item.id} item={item} />
            ))}
          </View>
        )}
      />
    </View>
  );
});

// Library Item
const LibraryItemComponent = memo<{ item: (typeof LIBRARY_ITEMS)[0] }>(
  ({ item }) => (
    <TouchableOpacity
      style={styles.libraryItem}
      onPress={() => router.push(item.route as Href)}
      activeOpacity={0.7}
    >
      <View style={styles.libraryIcon}>
        <Image
          source={item.icon}
          style={styles.iconImage}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.libraryLabel} numberOfLines={2}>
        {item.label}
      </Text>
    </TouchableOpacity>
  )
);

// Library Section
const LibrarySection = memo<{
  title: string;
  data: typeof LIBRARY_ITEMS;
  seeMoreRoute: string;
}>(({ title, data, seeMoreRoute }) => {
  const pages = useMemo(() => groupItemsIntoPages(data, 8), [data]);

  return (
    <View style={styles.section}>
      {title ? (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <TouchableOpacity onPress={() => router.push(seeMoreRoute as Href)}>
            <Text style={styles.seeMoreText}>XEM THÊM</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <FlatList
        data={pages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => `library-page-${index}`}
        renderItem={({ item: pageItems }) => (
          <View style={styles.gridPage}>
            {pageItems.map((item) => (
              <LibraryItemComponent key={item.id} item={item} />
            ))}
          </View>
        )}
      />
    </View>
  );
});

// Construction Worker Item
const ConstructionWorkerItem = memo<{ item: (typeof CONSTRUCTION_WORKERS)[0] }>(
  ({ item }) => (
    <TouchableOpacity
      style={styles.workerItem}
      onPress={() => router.push(item.route as Href)}
      activeOpacity={0.7}
    >
      <View style={styles.workerIcon}>
        <Image
          source={item.icon}
          style={styles.iconImage}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.workerLabel} numberOfLines={1}>
        {item.label}
      </Text>
      {item.price && (
        <Text style={styles.workerPrice} numberOfLines={1}>
          {item.price}
        </Text>
      )}
    </TouchableOpacity>
  )
);

// Construction Worker Section
const ConstructionWorkerSection = memo<{
  title: string;
  data: typeof CONSTRUCTION_WORKERS;
  seeMoreRoute: string;
}>(({ title, data, seeMoreRoute }) => {
  const pages = useMemo(() => groupItemsIntoPages(data, 8), [data]);

  return (
    <View style={styles.section}>
      {title ? (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <TouchableOpacity onPress={() => router.push(seeMoreRoute as Href)}>
            <Text style={styles.seeMoreText}>XEM THÊM</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <FlatList
        data={pages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => `worker-page-${index}`}
        renderItem={({ item: pageItems }) => (
          <View style={styles.gridPage}>
            {pageItems.map((item) => (
              <ConstructionWorkerItem key={item.id} item={item} />
            ))}
          </View>
        )}
      />
    </View>
  );
});

// Video Item
const VideoItemComponent = memo<{ item: (typeof VIDEO_ITEMS)[0] }>(
  ({ item }) => (
    <TouchableOpacity
      style={styles.videoItem}
      onPress={() => router.push(item.route as Href)}
      activeOpacity={0.7}
    >
      <View style={styles.videoImageContainer}>
        <Image source={{ uri: item.image }} style={styles.videoImage} />
        {item.live && (
          <View style={styles.videoLiveBadge}>
            <View style={styles.videoLiveDot} />
            <Text style={styles.videoLiveBadgeText}>Live</Text>
          </View>
        )}
        <View style={styles.videoPlayIcon}>
          <Ionicons name="play" size={16} color={COLORS.white} />
        </View>
      </View>
      <Text style={styles.videoLabel} numberOfLines={1}>
        {item.label}
      </Text>
    </TouchableOpacity>
  )
);

// Video Section
const VideoSection = memo<{
  title: string;
  data: typeof VIDEO_ITEMS;
  seeMoreRoute: string;
}>(({ title, data, seeMoreRoute }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={() => router.push(seeMoreRoute as Href)}>
        <Text style={styles.seeMoreText}>XEM THÊM</Text>
      </TouchableOpacity>
    </View>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.videoContainer}
    >
      {data.map((item) => (
        <VideoItemComponent key={item.id} item={item} />
      ))}
    </ScrollView>
  </View>
));

// Finishing Worker Item
const FinishingWorkerItem = memo<{ item: (typeof FINISHING_WORKERS)[0] }>(
  ({ item }) => (
    <TouchableOpacity
      style={styles.finishingItem}
      onPress={() => router.push(item.route as Href)}
      activeOpacity={0.7}
    >
      <View style={styles.finishingIcon}>
        <Image
          source={item.icon}
          style={styles.iconImage}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.finishingLabel} numberOfLines={1}>
        {item.label}
      </Text>
      {item.price && (
        <Text style={styles.finishingPrice} numberOfLines={1}>
          {item.price}
        </Text>
      )}
    </TouchableOpacity>
  )
);

// Finishing Worker Section
const FinishingWorkerSection = memo<{
  title: string;
  data: typeof FINISHING_WORKERS;
  seeMoreRoute: string;
}>(({ title, data, seeMoreRoute }) => {
  const pages = useMemo(() => groupItemsIntoPages(data, 8), [data]);

  return (
    <View style={styles.section}>
      {title ? (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <TouchableOpacity onPress={() => router.push(seeMoreRoute as Href)}>
            <Text style={styles.seeMoreText}>XEM THÊM</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <FlatList
        data={pages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => `finishing-page-${index}`}
        renderItem={({ item: pageItems }) => (
          <View style={styles.gridPage}>
            {pageItems.map((item) => (
              <FinishingWorkerItem key={item.id} item={item} />
            ))}
          </View>
        )}
      />
    </View>
  );
});

// Category Card
const CategoryCard = memo<{ item: (typeof CATEGORY_ITEMS)[0] }>(({ item }) => (
  <TouchableOpacity
    style={styles.categoryCard}
    onPress={() => router.push(item.route as Href)}
    activeOpacity={0.7}
  >
    <Image source={{ uri: item.image }} style={styles.categoryImage} />
    <Text style={styles.categoryLabel}>{item.label}</Text>
  </TouchableOpacity>
));

// ============================================================================
// MAIN SCREEN
// ============================================================================

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  // Worker stats from API
  const {
    stats: workerStats,
    loading: statsLoading,
    refresh: refreshStats,
    selectedLocation,
    getWorkerCount,
  } = useWorkerStats();

  // Get dynamic construction workers data with API stats
  const dynamicConstructionWorkers = useMemo(() => {
    return CONSTRUCTION_WORKERS.map((worker) => {
      const workerType = WORKER_TYPE_MAP[worker.id];
      if (!workerType || worker.id === 16) return worker; // Skip "Xem thêm"

      const { location, count } = getWorkerCount(workerType);
      return {
        ...worker,
        price: `${location} - ${count}`,
      };
    });
  }, [getWorkerCount, workerStats, selectedLocation]);

  // Get dynamic finishing workers data with API stats
  const dynamicFinishingWorkers = useMemo(() => {
    return FINISHING_WORKERS.map((worker) => {
      const workerType = WORKER_TYPE_MAP[worker.id + 100]; // Offset for finishing
      if (!workerType || worker.id === 16) return worker; // Skip "Xem thêm"

      const { location, count } = getWorkerCount(workerType);
      return {
        ...worker,
        price: `${location} - ${count}`,
      };
    });
  }, [getWorkerCount, workerStats, selectedLocation]);

  // External content from Pexels/GNews APIs
  const {
    videos: externalVideos,
    isLoading: videosLoading,
    refetch: refetchVideos,
  } = useExternalVideos({
    category: "general",
    perPage: 8,
    enabled: true,
  });
  const {
    articles: externalNews,
    isLoading: newsLoading,
    refetch: refetchNews,
  } = useExternalNews({
    category: "general",
    max: 8, // Load sẵn 8 tin
    enabled: true,
  });

  // Tính tổng số content mới
  const totalNewContent = externalVideos.length + externalNews.length;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Also refresh external content and worker stats
    Promise.all([refetchVideos(), refetchNews(), refreshStats()]).finally(
      () => {
        setTimeout(() => setRefreshing(false), 1500);
      }
    );
  }, [refetchVideos, refetchNews, refreshStats]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <Header />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <SearchBar />
        </View>

        {/* DỊCH VỤ - 2 rows x 4 cols, scrollable */}
        <View style={styles.section}>
          <ServiceSection
            title=""
            data={SERVICES}
            seeMoreRoute="/(tabs)/menu"
          />
        </View>

        {/* DESIGN LIVE */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>DESIGN LIVE</Text>
            <TouchableOpacity onPress={() => router.push("/live" as Href)}>
              <Text style={styles.seeMoreText}>XEM THÊM</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.designLiveContainer}
          >
            {DESIGN_LIVE.map((item) => (
              <DesignLiveItem key={item.id} item={item} />
            ))}
          </ScrollView>
        </View>

        {/* Green Banner */}
        <View style={styles.bannerSection}>
          <GreenBanner />
        </View>

        {/* TIỆN ÍCH THIẾT KẾ */}
        <DesignServiceSection
          title="TIỆN ÍCH THIẾT KẾ"
          data={DESIGN_SERVICES}
          seeMoreRoute="/services"
        />

        {/* TIỆN ÍCH MUA SẮM TRANG THIẾT BỊ */}
        <EquipmentSection
          title="TIỆN ÍCH MUA SẮM"
          data={EQUIPMENT_ITEMS}
          seeMoreRoute="/shop"
        />

        {/* THƯ VIỆN */}
        <LibrarySection
          title="THƯ VIỆN THIẾT KẾ"
          data={LIBRARY_ITEMS}
          seeMoreRoute="/categories"
        />

        {/* TIỆN ÍCH XÂY DỰNG */}
        <ConstructionWorkerSection
          title="TIỆN ÍCH XÂY DỰNG"
          data={dynamicConstructionWorkers}
          seeMoreRoute="/workers"
        />

        {/* VIDEO CONSTRUCTIONS */}
        <VideoSection
          title="VIDEO XÂY DỰNG"
          data={VIDEO_ITEMS}
          seeMoreRoute="/videos"
        />

        {/* TIỆN ÍCH HOÀN THIỆN */}
        <FinishingWorkerSection
          title="TIỆN ÍCH HOÀN THIỆN"
          data={dynamicFinishingWorkers}
          seeMoreRoute="/finishing"
        />

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>DANH MỤC NỔI BẬT</Text>
            <TouchableOpacity
              onPress={() => router.push("/categories" as Href)}
            >
              <Text style={styles.seeMoreText}>XEM THÊM</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {CATEGORY_ITEMS.map((item) => (
              <CategoryCard key={item.id} item={item} />
            ))}
          </ScrollView>
        </View>

        {/* ============================================== */}
        {/* EXTERNAL CONTENT - From Pexels & GNews APIs */}
        {/* ============================================== */}

        {/* External Videos from Pexels */}
        {externalVideos.length > 0 && (
          <View style={styles.section}>
            <ExternalVideoSection
              videos={externalVideos}
              title="🎬 Video xây dựng tham khảo"
              subtitle="Video miễn phí từ Pexels"
              isLoading={videosLoading}
              onSeeAll={() => router.push("/social/video-discovery" as Href)}
            />
          </View>
        )}

        {/* External News from GNews */}
        {externalNews.length > 0 && (
          <View style={styles.section}>
            <ExternalNewsSection
              articles={externalNews}
              title="📰 Tin tức xây dựng"
              subtitle="Tin từ GNews API"
              isLoading={newsLoading}
              onSeeAll={() => router.push("/news" as Href)}
            />
          </View>
        )}

        {/* Bottom Padding */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollView: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 1,
  },

  // Search
  searchSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 24,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    gap: SPACING.sm,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: COLORS.textLight,
    flex: 1,
  },

  // Section
  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  bannerSection: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  seeMoreText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },

  // Grid Page (2 rows x 4 cols)
  gridPage: {
    width: width - SPACING.lg * 2,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  // Service Item
  serviceItem: {
    width: ITEM_WIDTH,
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  serviceIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
    overflow: "hidden",
  },
  iconImage: {
    width: 68,
    height: 68,
    borderRadius: 8,
  },
  serviceLabel: {
    fontSize: 10,
    color: COLORS.text,
    textAlign: "center",
    lineHeight: 13,
    maxWidth: 70,
  },

  // Design Live
  designLiveContainer: {
    paddingRight: SPACING.lg,
  },
  designLiveItem: {
    marginRight: SPACING.md,
    position: "relative",
  },
  designLiveImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },
  liveBadge: {
    position: "absolute",
    top: SPACING.xs,
    left: SPACING.xs,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.liveBadge,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 3,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
  },
  liveBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.white,
  },

  // Green Banner
  greenBanner: {
    height: 160,
    borderRadius: 8,
    overflow: "hidden",
  },
  greenBannerGradient: {
    flex: 1,
    flexDirection: "row",
    padding: SPACING.lg,
  },
  greenBannerContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  greenBannerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.white,
  },
  greenBannerSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
    marginTop: 2,
  },
  greenBannerDescription: {
    fontSize: 10,
    color: "rgba(255,255,255,0.9)",
    marginTop: SPACING.xs,
  },
  greenBannerNote: {
    fontSize: 8,
    color: "rgba(255,255,255,0.8)",
    marginTop: SPACING.xs,
  },
  greenBannerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    alignSelf: "flex-start",
    gap: SPACING.xs,
  },
  greenBannerButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.white,
  },
  greenBannerImageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  // Design Service Item
  designServiceItem: {
    width: ITEM_WIDTH,
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  designServiceIcon: {
    width: 66,
    height: 66,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  designServiceLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
    maxWidth: 70,
  },
  designServicePrice: {
    fontSize: 8,
    color: COLORS.primary,
    textAlign: "center",
    marginTop: 2,
  },

  // Equipment Item
  equipmentItem: {
    width: ITEM_WIDTH,
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  equipmentIcon: {
    width: 66,
    height: 66,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  equipmentLabel: {
    fontSize: 10,
    color: COLORS.text,
    textAlign: "center",
    maxWidth: 70,
  },

  // Library Item
  libraryItem: {
    width: ITEM_WIDTH,
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  libraryIcon: {
    width: 66,
    height: 66,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  libraryLabel: {
    fontSize: 10,
    color: COLORS.text,
    textAlign: "center",
    maxWidth: 70,
  },

  // Worker Item
  workerItem: {
    width: ITEM_WIDTH,
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  workerIcon: {
    width: 66,
    height: 66,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  workerLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
    maxWidth: 70,
  },
  workerPrice: {
    fontSize: 8,
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: 2,
  },

  // Video
  videoContainer: {
    paddingRight: SPACING.lg,
  },
  videoItem: {
    width: 100,
    marginRight: SPACING.md,
  },
  videoImageContainer: {
    position: "relative",
  },
  videoImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },
  videoLiveBadge: {
    position: "absolute",
    top: SPACING.xs,
    left: SPACING.xs,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.liveBadge,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    gap: 2,
  },
  videoLiveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.white,
  },
  videoLiveBadgeText: {
    fontSize: 8,
    fontWeight: "600",
    color: COLORS.white,
  },
  videoPlayIcon: {
    position: "absolute",
    top: 38,
    left: 38,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  videoLabel: {
    fontSize: 10,
    color: COLORS.text,
    marginTop: SPACING.xs,
    textAlign: "center",
  },

  // Finishing Item
  finishingItem: {
    width: ITEM_WIDTH,
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  finishingIcon: {
    width: 66,
    height: 66,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  finishingLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
    maxWidth: 70,
  },
  finishingPrice: {
    fontSize: 8,
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: 2,
  },

  // Categories
  categoriesContainer: {
    paddingRight: SPACING.lg,
  },
  categoryCard: {
    width: 120,
    marginRight: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryImage: {
    width: "100%",
    height: 80,
    backgroundColor: COLORS.border,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.text,
    padding: SPACING.sm,
    textAlign: "center",
  },
});
