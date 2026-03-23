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

export const designServicesControlIcons = HOME_UI_CONTROL_ICONS;

export const designServicesTopItems: HomeIconItem[] = [
  {
    id: "ds-thiet-ke-nha",
    label: "Thiết kế nhà",
    icon: HOME_UI_ICONS.thietKeNha,
  },
  {
    id: "ds-thiet-ke-noi-that",
    label: "Thiết kế nội thất",
    icon: HOME_UI_ICONS.thietKeNoiThat,
  },
  {
    id: "ds-tra-cuu",
    label: "Tra cứu xây dựng",
    icon: HOME_UI_ICONS.traCuuXayDung,
  },
  { id: "ds-xin-phep", label: "Xin phép", icon: HOME_UI_ICONS.xinPhep },
  { id: "ds-ho-so", label: "Hồ sơ mẫu", icon: HOME_UI_ICONS.hoSoMau },
  { id: "ds-sua-nha", label: "Sửa nhà", icon: HOME_UI_ICONS.suaNha },
  { id: "ds-mau-nha", label: "Mẫu nhà", icon: HOME_UI_ICONS.mauNha },
  {
    id: "ds-tu-van",
    label: "Tư vấn chất lượng",
    icon: HOME_UI_ICONS.tuVanChatLuong,
  },
  {
    id: "ds-cong-ty-xd",
    label: "Công ty xây dựng",
    icon: HOME_UI_ICONS.congTyXayDung,
  },
  {
    id: "ds-cong-ty-nt",
    label: "Công ty nội thất",
    icon: HOME_UI_ICONS.congTyNoiThat,
  },
  {
    id: "ds-giam-sat",
    label: "Giám sát thi công",
    icon: HOME_UI_ICONS.giamSatThiCong,
  },
  { id: "ds-xem-them", label: "Xem thêm", icon: HOME_UI_ICONS.xemThem },
];

export const designServicesDesignItems: HomeIconItem[] = [
  {
    id: "ds-kien-truc-su",
    label: "Kiến trúc sư",
    icon: HOME_UI_ICONS.kienTrucSu,
  },
  { id: "ds-ky-su", label: "Kỹ sư", icon: HOME_UI_ICONS.kySu },
  { id: "ds-ket-cau", label: "Kết cấu", icon: HOME_UI_ICONS.ketCau },
  { id: "ds-dien", label: "Điện", icon: HOME_UI_ICONS.dienCt },
  { id: "ds-nuoc", label: "Nước", icon: HOME_UI_ICONS.nuocKySu },
  { id: "ds-du-toan", label: "Dự toán", icon: HOME_UI_ICONS.duToan },
  { id: "ds-noi-that", label: "Nội thất", icon: HOME_UI_ICONS.noiThat },
  { id: "ds-ai", label: "Công cụ AI", icon: HOME_UI_ICONS.congCuAi },
];

export const designServicesMaintenanceItems: HomeIconItem[] = [
  {
    id: "ds-may-giat",
    label: "Thợ sửa máy giặt",
    icon: HOME_UI_ICONS.thoMayGiat,
  },
  {
    id: "ds-tu-lanh",
    label: "Thợ sửa tủ lạnh",
    icon: HOME_UI_ICONS.thoTuLanh,
  },
  {
    id: "ds-thong-cong",
    label: "Thợ thông tắc cống",
    icon: HOME_UI_ICONS.thoThongTacCong,
  },
  { id: "ds-tho-dien", label: "Thợ điện", icon: HOME_UI_ICONS.thoDien },
  {
    id: "ds-tho-nuoc",
    label: "Thợ cấp nước",
    icon: HOME_UI_ICONS.thoCapNuoc,
  },
  {
    id: "ds-tho-wifi",
    label: "Thợ mạng wifi",
    icon: HOME_UI_ICONS.thoMangWifi,
  },
  {
    id: "ds-tho-may-lanh",
    label: "Thợ sửa máy lạnh",
    icon: HOME_UI_ICONS.thoMayLanh,
  },
  { id: "ds-maint-xem", label: "Xem thêm", icon: HOME_UI_ICONS.xemThem },
];

export const designServicesMarketplaceItems: HomeIconItem[] = [
  {
    id: "ds-market-bep",
    label: "Thiết bị bếp",
    icon: HOME_UI_ICONS.thietBiBep,
  },
  {
    id: "ds-market-ve-sinh",
    label: "Thiết bị vệ sinh",
    icon: HOME_UI_ICONS.thietBiVeSinh,
  },
  { id: "ds-market-dien", label: "Điện", icon: HOME_UI_ICONS.dien },
  { id: "ds-market-nuoc", label: "Nước", icon: HOME_UI_ICONS.nuoc },
  { id: "ds-market-pccc", label: "PCCC", icon: HOME_UI_ICONS.pccc },
  { id: "ds-market-giuong", label: "Giường", icon: HOME_UI_ICONS.giuong },
  {
    id: "ds-market-ban",
    label: "Bàn làm việc",
    icon: HOME_UI_ICONS.banLamViec,
  },
  { id: "ds-market-sofa", label: "Sofa", icon: HOME_UI_ICONS.sofa },
];

export const designServicesLiveItems: HomeLiveItem[] = [
  { id: "ds-live-1", image: HOME_UI_MEDIA.live1, badgeText: "LIVE" },
  { id: "ds-live-2", image: HOME_UI_MEDIA.live2, badgeText: "LIVE" },
];

export const designServicesVideoItems: HomeVideoItem[] = [
  { id: "ds-video-1", image: HOME_UI_MEDIA.video1, views: "29.0k" },
  { id: "ds-video-2", image: HOME_UI_MEDIA.video2, views: "21.4k" },
];

export const designServicesProducts: HomeProductItem[] = [
  {
    id: "ds-product-sofa",
    name: "Sofa hiện đại phong cách Bắc Âu cao cấp",
    price: "1.200.000đ",
    sold: "Đã bán 1.2k+",
    image: HOME_UI_PRODUCTS.sofa,
  },
  {
    id: "ds-product-ban-an",
    name: "Bàn ăn gỗ sồi tự nhiên chân sắt sơn tĩnh điện",
    price: "2.450.000đ",
    sold: "Đã bán 856",
    image: HOME_UI_PRODUCTS.banAn,
  },
  {
    id: "ds-product-den",
    name: "Đèn học để bàn tối giản cho không gian làm việc",
    price: "350.000đ",
    sold: "Đã bán 2.1k+",
    image: HOME_UI_PRODUCTS.den,
  },
];

export const designServicesBanners = {
  hero: HOME_UI_BANNERS.heroCustomer,
  design: HOME_UI_BANNERS.design,
  maintenance: HOME_UI_BANNERS.maintenance,
  interiorDeal: HOME_UI_BANNERS.interiorDeal,
};
