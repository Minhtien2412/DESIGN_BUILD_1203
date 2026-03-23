/**
 * Home banner data — 4 independent carousel datasets
 * require() must remain at module scope for Metro bundler
 */
import { type BannerItem } from "@/components/home/BannerCarousel";

/** Banner — sau DỊCH VỤ: dịch vụ & thiết kế */
export const DESIGN_BANNERS: BannerItem[] = [
  {
    id: "d1",
    image: require("@/assets/banner/banner-home-1.jpg"),
    route: "/design-image-library",
  },
  {
    id: "d2",
    image: require("@/assets/banner/banner-home-2.jpg"),
    route: "/consultation",
  },
  {
    id: "d3",
    image: require("@/assets/banner/banner-home-3.jpg"),
    route: "/categories",
  },
];

/** Banner — sau XÂY DỰNG & HOÀN THIỆN: thi công */
export const CONSTRUCTION_BANNERS: BannerItem[] = [
  {
    id: "c1",
    image: require("@/assets/banner/banner-home-4.jpg"),
    route: "/construction",
  },
  {
    id: "c2",
    image: require("@/assets/banner/banner-home-5.jpg"),
    route: "/find-workers",
  },
  {
    id: "c3",
    image: require("@/assets/banner/banner-home-6.jpg"),
    route: "/budget",
  },
  {
    id: "c4",
    image: require("@/assets/banner/BANNER-1.jpg"),
    route: "/construction",
  },
];

/** Banner — sau BẢO TRÌ SỬA CHỮA: bảo trì */
export const MAINTENANCE_BANNERS: BannerItem[] = [
  {
    id: "m1",
    image: require("@/assets/banner/BANNER-4.jpeg"),
    route: "/find-workers",
  },
  {
    id: "m2",
    image: require("@/assets/banner/BANNER-5.jpeg"),
    route: "/customer-support",
  },
  {
    id: "m3",
    image: require("@/assets/banner/BANNER-6.jpeg"),
    route: "/quote-request",
  },
];

/** Banner — sau MUA SẮM: promo / mua sắm */
export const SHOPPING_BANNERS: BannerItem[] = [
  {
    id: "s1",
    image: require("@/assets/banner/banner-promo-1.jpg"),
    route: "/categories",
  },
  {
    id: "s2",
    image: require("@/assets/banner/banner-promo-2.jpg"),
    route: "/categories",
  },
  {
    id: "s3",
    image: require("@/assets/banner/banner-promo-3.jpg"),
    route: "/search",
  },
  {
    id: "s4",
    image: require("@/assets/banner/banner-promo-4.jpg"),
    route: "/search",
  },
  {
    id: "s5",
    image: require("@/assets/banner/banner-promo-5.jpg"),
    route: "/cart",
  },
];
