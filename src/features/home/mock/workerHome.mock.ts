import { WorkerHomeMock } from "./home.types";
import { homeAssets } from "./homeAssets";

export const workerHomeMock: WorkerHomeMock = {
  headerTitle: "Việc mới & quyền lợi cho thợ",
  headerSubtitle:
    "Nhận job nhanh, theo dõi thưởng giới thiệu và cập nhật tiện ích thi công.",
  searchPlaceholder: "Tìm việc theo tay nghề, khu vực hoặc vật tư...",
  heroBanner: {
    id: "worker-hero",
    image: homeAssets.banners.workerHero,
    height: 188,
    badge: "Quyền lợi của thợ",
  },
  designUtilities: {
    id: "worker-design",
    title: "Tiện ích thiết kế",
    items: [
      { id: "kts", title: "Kiến trúc sư", icon: homeAssets.icons.kienTrucSu },
      { id: "ks", title: "Kỹ sư", icon: homeAssets.icons.kySu },
      { id: "ket-cau", title: "Kết cấu", icon: homeAssets.icons.ketCau },
      { id: "dien", title: "Điện", icon: homeAssets.icons.dien },
      { id: "nuoc", title: "Nước", icon: homeAssets.icons.nuoc },
      { id: "du-toan", title: "Dự toán", icon: homeAssets.icons.duToan },
      { id: "noi-that", title: "Nội thất", icon: homeAssets.icons.noiThat },
      {
        id: "ai",
        title: "Công cụ AI",
        icon: homeAssets.icons.ai,
        badge: "HOT",
      },
    ],
  },
  designBanner: {
    id: "worker-design-banner",
    image: homeAssets.banners.design,
    height: 176,
  },
  constructionUtilities: {
    id: "worker-construction",
    title: "Tiện ích xây dựng",
    actionLabel: "Xem thêm",
    items: [
      { id: "ep-coc", title: "Ép cọc", icon: homeAssets.icons.epCoc },
      { id: "dao-dat", title: "Đào đất", icon: homeAssets.icons.daoDat },
      { id: "vat-lieu", title: "Vật liệu", icon: homeAssets.icons.vatLieu },
      {
        id: "nhan-cong",
        title: "Nhân công XD",
        icon: homeAssets.icons.nhanCong,
      },
      { id: "tho-xay", title: "Thợ xây", icon: homeAssets.icons.thoXay },
      { id: "tho-sat", title: "Thợ sắt", icon: homeAssets.icons.thoSat },
      { id: "coffa", title: "Thợ coffa", icon: homeAssets.icons.thoCoffa },
      { id: "co-khi", title: "Thợ cơ khí", icon: homeAssets.icons.thoCoKhi },
      { id: "to-tuong", title: "Thợ tô tường", icon: homeAssets.icons.thoTo },
      { id: "dien-nuoc", title: "Điện nước", icon: homeAssets.icons.thoDien },
      { id: "be-tong", title: "Bê tông", icon: homeAssets.icons.beTong },
      {
        id: "construction-more",
        title: "Xem thêm",
        icon: homeAssets.icons.xemThem,
      },
    ],
  },
  constructionBanner: {
    id: "worker-fast-banner",
    image: homeAssets.banners.findFast,
    height: 176,
  },
  finishingUtilities: {
    id: "worker-finishing",
    title: "Tiện ích hoàn thiện",
    items: [
      { id: "lat-gach", title: "Thợ lát gạch", icon: homeAssets.icons.latGach },
      {
        id: "thach-cao",
        title: "Thợ thạch cao",
        icon: homeAssets.icons.thachCao,
      },
      { id: "tho-son", title: "Thợ sơn", icon: homeAssets.icons.thoSon },
      { id: "tho-da", title: "Thợ đá", icon: homeAssets.icons.thoDa },
      { id: "lam-cua", title: "Thợ làm cửa", icon: homeAssets.icons.thoCua },
      { id: "lan-can", title: "Thợ lan can", icon: homeAssets.icons.thoLanCan },
      { id: "tho-cong", title: "Thợ cổng", icon: homeAssets.icons.thoCong },
      { id: "camera", title: "Thợ camera", icon: homeAssets.icons.camera },
    ],
  },
  finishingBanner: {
    id: "worker-nearby-banner",
    image: homeAssets.banners.findNearby,
    height: 176,
  },
  referralBanner: {
    id: "worker-referral",
    image: homeAssets.banners.workerReferral,
    height: 184,
    badge: "Giới thiệu thợ",
  },
  tabs: [
    { id: "home", label: "Trang chủ", icon: "home", active: true },
    { id: "jobs", label: "Việc làm", icon: "briefcase-outline" },
    { id: "rewards", label: "Quà tặng", icon: "gift-outline" },
    { id: "notifications", label: "Thông báo", icon: "notifications-outline" },
    { id: "profile", label: "Cá nhân", icon: "person-outline" },
  ],
};
