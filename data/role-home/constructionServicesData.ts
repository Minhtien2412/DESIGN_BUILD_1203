import type {
    HomeIconItem,
    HomeLiveItem,
    HomeProductItem,
    HomeVideoItem,
} from "@/components/role-home/mobile-home";
import {
    HOME_UI_BANNERS,
    HOME_UI_CONTROL_ICONS,
    HOME_UI_ICONS,
    HOME_UI_MEDIA,
    HOME_UI_PRODUCTS,
} from "./homeUiAssetMap";

export const constructionServicesControlIcons = HOME_UI_CONTROL_ICONS;

export const constructionServicesTopItems: HomeIconItem[] = [
  {
    id: "cs-thiet-ke-nha",
    label: "Thiết kế nhà",
    icon: HOME_UI_ICONS.thietKeNha,
  },
  {
    id: "cs-thiet-ke-noi-that",
    label: "Thiết kế nội thất",
    icon: HOME_UI_ICONS.thietKeNoiThat,
  },
  {
    id: "cs-tra-cuu",
    label: "Tra cứu xây dựng",
    icon: HOME_UI_ICONS.traCuuXayDung,
  },
  { id: "cs-xin-phep", label: "Xin phép", icon: HOME_UI_ICONS.xinPhep },
  { id: "cs-ho-so", label: "Hồ sơ mẫu", icon: HOME_UI_ICONS.hoSoMau },
  { id: "cs-sua-nha", label: "Sửa nhà", icon: HOME_UI_ICONS.suaNha },
  { id: "cs-mau-nha", label: "Mẫu nhà", icon: HOME_UI_ICONS.mauNha },
  {
    id: "cs-tu-van",
    label: "Tư vấn chất lượng",
    icon: HOME_UI_ICONS.tuVanChatLuong,
  },
  {
    id: "cs-cong-ty-xd",
    label: "Công ty xây dựng",
    icon: HOME_UI_ICONS.congTyXayDung,
  },
  {
    id: "cs-cong-ty-nt",
    label: "Công ty nội thất",
    icon: HOME_UI_ICONS.congTyNoiThat,
  },
  {
    id: "cs-giam-sat",
    label: "Giám sát thi công",
    icon: HOME_UI_ICONS.giamSatThiCong,
  },
  { id: "cs-xem-them", label: "Xem thêm", icon: HOME_UI_ICONS.xemThem },
];

export const constructionServicesDesignItems: HomeIconItem[] = [
  {
    id: "cs-kien-truc-su",
    label: "Kiến trúc sư",
    icon: HOME_UI_ICONS.kienTrucSu,
  },
  { id: "cs-ky-su", label: "Kỹ sư", icon: HOME_UI_ICONS.kySu },
  { id: "cs-ket-cau", label: "Kết cấu", icon: HOME_UI_ICONS.ketCau },
  { id: "cs-dien", label: "Điện", icon: HOME_UI_ICONS.dienCt },
  { id: "cs-nuoc", label: "Nước", icon: HOME_UI_ICONS.nuocKySu },
  { id: "cs-du-toan", label: "Dự toán", icon: HOME_UI_ICONS.duToan },
  { id: "cs-noi-that", label: "Nội thất", icon: HOME_UI_ICONS.noiThat },
  { id: "cs-ai", label: "Công cụ AI", icon: HOME_UI_ICONS.congCuAi },
];

export const constructionServicesConstructionItems: HomeIconItem[] = [
  { id: "cs-ep-coc", label: "Ép cọc", icon: HOME_UI_ICONS.epCoc },
  { id: "cs-dao-dat", label: "Đào đất", icon: HOME_UI_ICONS.daoDat },
  { id: "cs-vat-lieu", label: "Vật liệu", icon: HOME_UI_ICONS.vatLieu },
  {
    id: "cs-nhan-cong",
    label: "Nhân công xây dựng",
    icon: HOME_UI_ICONS.nhanCongXayDung,
  },
  { id: "cs-tho-xay", label: "Thợ xây", icon: HOME_UI_ICONS.thoXay },
  { id: "cs-tho-sat", label: "Thợ sắt", icon: HOME_UI_ICONS.thoSat },
  { id: "cs-tho-coffa", label: "Thợ coffa", icon: HOME_UI_ICONS.thoCoffa },
  { id: "cs-tho-co-khi", label: "Thợ cơ khí", icon: HOME_UI_ICONS.thoCoKhi },
  {
    id: "cs-tho-to-tuong",
    label: "Thợ tô tường",
    icon: HOME_UI_ICONS.thoToTuong,
  },
  {
    id: "cs-tho-dien-nuoc",
    label: "Thợ điện nước",
    icon: HOME_UI_ICONS.thoDienNuoc,
  },
  { id: "cs-be-tong", label: "Bê tông", icon: HOME_UI_ICONS.beTong },
  { id: "cs-build-xem", label: "Xem thêm", icon: HOME_UI_ICONS.xemThem },
];

export const constructionServicesFinishingItems: HomeIconItem[] = [
  {
    id: "cs-tho-op-gach",
    label: "Thợ ốp gạch",
    icon: HOME_UI_ICONS.thoOpGach,
  },
  {
    id: "cs-tho-thach-cao",
    label: "Thợ thạch cao",
    icon: HOME_UI_ICONS.thoThachCao,
  },
  { id: "cs-tho-son", label: "Thợ sơn", icon: HOME_UI_ICONS.thoSon },
  { id: "cs-tho-da", label: "Thợ đá", icon: HOME_UI_ICONS.thoDa },
  {
    id: "cs-tho-lam-cua",
    label: "Thợ làm cửa",
    icon: HOME_UI_ICONS.thoLamCua,
  },
  {
    id: "cs-tho-lan-can",
    label: "Thợ lan can",
    icon: HOME_UI_ICONS.thoLanCan,
  },
  { id: "cs-tho-cong", label: "Thợ cổng", icon: HOME_UI_ICONS.thoCong },
  {
    id: "cs-tho-camera",
    label: "Thợ camera",
    icon: HOME_UI_ICONS.thoCamera,
  },
];

export const constructionServicesMaintenanceItems: HomeIconItem[] = [
  {
    id: "cs-may-giat",
    label: "Thợ sửa máy giặt",
    icon: HOME_UI_ICONS.thoMayGiat,
  },
  {
    id: "cs-tu-lanh",
    label: "Thợ sửa tủ lạnh",
    icon: HOME_UI_ICONS.thoTuLanh,
  },
  {
    id: "cs-thong-cong",
    label: "Thợ thông tắc cống",
    icon: HOME_UI_ICONS.thoThongTacCong,
  },
  { id: "cs-tho-dien", label: "Thợ điện", icon: HOME_UI_ICONS.thoDien },
  {
    id: "cs-tho-nuoc",
    label: "Thợ cấp nước",
    icon: HOME_UI_ICONS.thoCapNuoc,
  },
  {
    id: "cs-tho-wifi",
    label: "Thợ mạng wifi",
    icon: HOME_UI_ICONS.thoMangWifi,
  },
  {
    id: "cs-tho-may-lanh",
    label: "Thợ sửa máy lạnh",
    icon: HOME_UI_ICONS.thoMayLanh,
  },
  { id: "cs-maint-xem", label: "Xem thêm", icon: HOME_UI_ICONS.xemThem },
];

export const constructionServicesMarketplaceItems: HomeIconItem[] = [
  {
    id: "cs-market-bep",
    label: "Thiết bị bếp",
    icon: HOME_UI_ICONS.thietBiBep,
  },
  {
    id: "cs-market-ve-sinh",
    label: "Thiết bị vệ sinh",
    icon: HOME_UI_ICONS.thietBiVeSinh,
  },
  { id: "cs-market-dien", label: "Điện", icon: HOME_UI_ICONS.dien },
  { id: "cs-market-nuoc", label: "Nước", icon: HOME_UI_ICONS.nuoc },
  { id: "cs-market-pccc", label: "PCCC", icon: HOME_UI_ICONS.pccc },
  { id: "cs-market-giuong", label: "Giường", icon: HOME_UI_ICONS.giuong },
  {
    id: "cs-market-ban",
    label: "Bàn làm việc",
    icon: HOME_UI_ICONS.banLamViec,
  },
  { id: "cs-market-sofa", label: "Sofa", icon: HOME_UI_ICONS.sofa },
];

export const constructionServicesLiveItems: HomeLiveItem[] = [
  { id: "cs-live-1", image: HOME_UI_MEDIA.live1, badgeText: "LIVE" },
  { id: "cs-live-2", image: HOME_UI_MEDIA.live2, badgeText: "LIVE" },
];

export const constructionServicesVideoItems: HomeVideoItem[] = [
  { id: "cs-video-1", image: HOME_UI_MEDIA.video1, views: "38.1k" },
  { id: "cs-video-2", image: HOME_UI_MEDIA.video2, views: "24.6k" },
];

export const constructionServicesProducts: HomeProductItem[] = [
  {
    id: "cs-product-sofa",
    name: "Sofa hiện đại phong cách Bắc Âu cao cấp",
    price: "1.200.000đ",
    sold: "Đã bán 1.2k+",
    image: HOME_UI_PRODUCTS.sofa,
  },
  {
    id: "cs-product-ban-an",
    name: "Bàn ăn gỗ sồi tự nhiên chân sắt sơn tĩnh điện",
    price: "2.450.000đ",
    sold: "Đã bán 856",
    image: HOME_UI_PRODUCTS.banAn,
  },
  {
    id: "cs-product-den",
    name: "Đèn học để bàn tối giản cho không gian làm việc",
    price: "350.000đ",
    sold: "Đã bán 2.1k+",
    image: HOME_UI_PRODUCTS.den,
  },
];

export const constructionServicesBanners = {
  hero: HOME_UI_BANNERS.heroWorker,
  design: HOME_UI_BANNERS.design,
  construction: HOME_UI_BANNERS.construction,
  finishing: HOME_UI_BANNERS.finishing,
  maintenance: HOME_UI_BANNERS.maintenance,
  interiorDeal: HOME_UI_BANNERS.interiorDeal,
};
