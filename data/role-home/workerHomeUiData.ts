import type {
    HomeIconItem,
    HomeLiveItem,
    HomeProductItem,
    HomeVideoItem,
} from "@/components/role-home/mobile-home";
import {
    HOME_UI_BANNERS,
    HOME_UI_ICONS,
    HOME_UI_MEDIA,
    HOME_UI_PRODUCTS,
} from "./homeUiAssetMap";

export const workerTopServiceItems: HomeIconItem[] = [
  {
    id: "service-thiet-ke-nha",
    label: "Thiết kế nhà",
    icon: HOME_UI_ICONS.thietKeNha,
  },
  {
    id: "service-thiet-ke-noi-that",
    label: "Thiết kế nội thất",
    icon: HOME_UI_ICONS.thietKeNoiThat,
  },
  {
    id: "service-tra-cuu",
    label: "Tra cứu xây dựng",
    icon: HOME_UI_ICONS.traCuuXayDung,
  },
  { id: "service-xin-phep", label: "Xin phép", icon: HOME_UI_ICONS.xinPhep },
  { id: "service-ho-so", label: "Hồ sơ mẫu", icon: HOME_UI_ICONS.hoSoMau },
  { id: "service-sua-nha", label: "Sửa nhà", icon: HOME_UI_ICONS.suaNha },
  { id: "service-mau-nha", label: "Mẫu nhà", icon: HOME_UI_ICONS.mauNha },
  {
    id: "service-tu-van",
    label: "Tư vấn chất lượng",
    icon: HOME_UI_ICONS.tuVanChatLuong,
  },
  {
    id: "service-cong-ty-xay-dung",
    label: "Công ty xây dựng",
    icon: HOME_UI_ICONS.congTyXayDung,
  },
  {
    id: "service-cong-ty-noi-that",
    label: "Công ty nội thất",
    icon: HOME_UI_ICONS.congTyNoiThat,
  },
  {
    id: "service-giam-sat",
    label: "Giám sát thi công",
    icon: HOME_UI_ICONS.giamSatThiCong,
  },
  { id: "service-xem-them", label: "Xem thêm", icon: HOME_UI_ICONS.xemThem },
];

export const workerDesignItems: HomeIconItem[] = [
  {
    id: "design-kien-truc-su",
    label: "Kiến trúc sư",
    icon: HOME_UI_ICONS.kienTrucSu,
  },
  { id: "design-ky-su", label: "Kỹ sư", icon: HOME_UI_ICONS.kySu },
  { id: "design-ket-cau", label: "Kết cấu", icon: HOME_UI_ICONS.ketCau },
  { id: "design-dien", label: "Điện", icon: HOME_UI_ICONS.dienCt },
  { id: "design-nuoc", label: "Nước", icon: HOME_UI_ICONS.nuocKySu },
  { id: "design-du-toan", label: "Dự toán", icon: HOME_UI_ICONS.duToan },
  { id: "design-noi-that", label: "Nội thất", icon: HOME_UI_ICONS.noiThat },
  { id: "design-ai", label: "Công cụ AI", icon: HOME_UI_ICONS.congCuAi },
];

export const workerConstructionItems: HomeIconItem[] = [
  { id: "construction-ep-coc", label: "Ép cọc", icon: HOME_UI_ICONS.epCoc },
  { id: "construction-dao-dat", label: "Đào đất", icon: HOME_UI_ICONS.daoDat },
  {
    id: "construction-vat-lieu",
    label: "Vật liệu",
    icon: HOME_UI_ICONS.vatLieu,
  },
  {
    id: "construction-nhan-cong",
    label: "Nhân công xây dựng",
    icon: HOME_UI_ICONS.nhanCongXayDung,
  },
  { id: "construction-tho-xay", label: "Thợ xây", icon: HOME_UI_ICONS.thoXay },
  { id: "construction-tho-sat", label: "Thợ sắt", icon: HOME_UI_ICONS.thoSat },
  {
    id: "construction-tho-coffa",
    label: "Thợ coffa",
    icon: HOME_UI_ICONS.thoCoffa,
  },
  {
    id: "construction-tho-co-khi",
    label: "Thợ cơ khí",
    icon: HOME_UI_ICONS.thoCoKhi,
  },
  {
    id: "construction-tho-to-tuong",
    label: "Thợ tô tường",
    icon: HOME_UI_ICONS.thoToTuong,
  },
  {
    id: "construction-tho-dien-nuoc",
    label: "Thợ điện nước",
    icon: HOME_UI_ICONS.thoDienNuoc,
  },
  { id: "construction-be-tong", label: "Bê tông", icon: HOME_UI_ICONS.beTong },
  {
    id: "construction-xem-them",
    label: "Xem thêm",
    icon: HOME_UI_ICONS.xemThem,
  },
];

export const workerFinishingItems: HomeIconItem[] = [
  {
    id: "finishing-op-gach",
    label: "Thợ ốp gạch",
    icon: HOME_UI_ICONS.thoOpGach,
  },
  {
    id: "finishing-thach-cao",
    label: "Thợ thạch cao",
    icon: HOME_UI_ICONS.thoThachCao,
  },
  { id: "finishing-tho-son", label: "Thợ sơn", icon: HOME_UI_ICONS.thoSon },
  { id: "finishing-tho-da", label: "Thợ đá", icon: HOME_UI_ICONS.thoDa },
  {
    id: "finishing-tho-lam-cua",
    label: "Thợ làm cửa",
    icon: HOME_UI_ICONS.thoLamCua,
  },
  {
    id: "finishing-tho-lan-can",
    label: "Thợ lan can",
    icon: HOME_UI_ICONS.thoLanCan,
  },
  { id: "finishing-tho-cong", label: "Thợ cổng", icon: HOME_UI_ICONS.thoCong },
  {
    id: "finishing-tho-camera",
    label: "Thợ camera",
    icon: HOME_UI_ICONS.thoCamera,
  },
];

export const workerMaintenanceItems: HomeIconItem[] = [
  {
    id: "maintenance-may-giat",
    label: "Thợ sửa máy giặt",
    icon: HOME_UI_ICONS.thoMayGiat,
  },
  {
    id: "maintenance-tu-lanh",
    label: "Thợ sửa tủ lạnh",
    icon: HOME_UI_ICONS.thoTuLanh,
  },
  {
    id: "maintenance-thong-tac",
    label: "Thợ thông tắc cống",
    icon: HOME_UI_ICONS.thoThongTacCong,
  },
  { id: "maintenance-dien", label: "Thợ điện", icon: HOME_UI_ICONS.thoDien },
  {
    id: "maintenance-cap-nuoc",
    label: "Thợ cấp nước",
    icon: HOME_UI_ICONS.thoCapNuoc,
  },
  {
    id: "maintenance-wifi",
    label: "Thợ mạng wifi",
    icon: HOME_UI_ICONS.thoMangWifi,
  },
  {
    id: "maintenance-may-lanh",
    label: "Thợ sửa máy lạnh",
    icon: HOME_UI_ICONS.thoMayLanh,
  },
  {
    id: "maintenance-xem-them",
    label: "Xem thêm",
    icon: HOME_UI_ICONS.xemThem,
  },
];

export const workerMarketplaceItems: HomeIconItem[] = [
  { id: "market-bep", label: "Thiết bị bếp", icon: HOME_UI_ICONS.thietBiBep },
  {
    id: "market-ve-sinh",
    label: "Thiết bị vệ sinh",
    icon: HOME_UI_ICONS.thietBiVeSinh,
  },
  { id: "market-dien", label: "Điện", icon: HOME_UI_ICONS.dien },
  { id: "market-nuoc", label: "Nước", icon: HOME_UI_ICONS.nuoc },
  { id: "market-pccc", label: "PCCC", icon: HOME_UI_ICONS.pccc },
  { id: "market-giuong", label: "Giường", icon: HOME_UI_ICONS.giuong },
  {
    id: "market-ban-lam-viec",
    label: "Bàn làm việc",
    icon: HOME_UI_ICONS.banLamViec,
  },
  { id: "market-sofa", label: "Sofa", icon: HOME_UI_ICONS.sofa },
];

export const workerLiveItems: HomeLiveItem[] = [
  { id: "live-1", image: HOME_UI_MEDIA.live1, badgeText: "LIVE" },
  { id: "live-2", image: HOME_UI_MEDIA.live2, badgeText: "LIVE" },
];

export const workerVideoItems: HomeVideoItem[] = [
  { id: "video-1", image: HOME_UI_MEDIA.video1, views: "29.0k" },
  { id: "video-2", image: HOME_UI_MEDIA.video2, views: "21.4k" },
];

export const workerFurnitureProducts: HomeProductItem[] = [
  {
    id: "furniture-1",
    name: "Sofa hiện đại phong cách Bắc Âu cao cấp",
    price: "1.200.000đ",
    sold: "Đã bán 1.2k+",
    image: HOME_UI_PRODUCTS.sofa,
  },
  {
    id: "furniture-2",
    name: "Bàn ăn gỗ sồi tự nhiên chân sắt sơn tĩnh điện",
    price: "2.450.000đ",
    sold: "Đã bán 856",
    image: HOME_UI_PRODUCTS.banAn,
  },
  {
    id: "furniture-3",
    name: "Đèn học để tối giản cho không gian làm việc",
    price: "350.000đ",
    sold: "Đã bán 2.1k+",
    image: HOME_UI_PRODUCTS.den,
  },
];

export const workerHomeBanners = {
  hero: HOME_UI_BANNERS.heroWorker,
  design: HOME_UI_BANNERS.design,
  construction: HOME_UI_BANNERS.construction,
  finishing: HOME_UI_BANNERS.finishing,
  maintenance: HOME_UI_BANNERS.maintenance,
  interiorDeal: HOME_UI_BANNERS.interiorDeal,
};
