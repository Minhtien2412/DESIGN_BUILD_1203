/**
 * Centralized banner asset registry.
 * All banner images use ASCII-safe filenames under assets/banner/bo-banner/.
 * Original Vietnamese-named files from "Bộ Banner/" were copied here to fix
 * Metro bundler "Invalid JPG, no size found" errors on Windows.
 */
import type { ImageSourcePropType } from "react-native";

const FALLBACK_BANNER = require("@/assets/banner/banner-home-1.jpg");

function safeBanner(source: ImageSourcePropType): ImageSourcePropType {
  try {
    return source ?? FALLBACK_BANNER;
  } catch {
    return FALLBACK_BANNER;
  }
}

export const BANNER_ASSETS = {
  /** Tiện ích thiết kế */
  tienIchThietKe: safeBanner(
    require("@/assets/banner/bo-banner/tien-ich-thiet-ke.jpg"),
  ),
  /** Tìm thợ nhanh */
  timThoNhanh: safeBanner(
    require("@/assets/banner/bo-banner/tim-tho-nhanh.jpg"),
  ),
  /** Tìm thợ */
  timTho: safeBanner(require("@/assets/banner/bo-banner/tim-tho.jpg")),
  /** Tiện ích bảo trì */
  tienIchBaoTri: safeBanner(
    require("@/assets/banner/bo-banner/tien-ich-bao-tri.jpg"),
  ),
  /** Tiện ích nội thất 2 */
  tienIchNoiThat: safeBanner(
    require("@/assets/banner/bo-banner/tien-ich-noi-that-2.jpg"),
  ),
  /** Quyền lợi khách */
  quyenLoiKhach: safeBanner(
    require("@/assets/banner/bo-banner/quyen-loi-khach.jpg"),
  ),
  /** Quyền lợi thợ */
  quyenLoiTho: safeBanner(
    require("@/assets/banner/bo-banner/quyen-loi-tho.jpg"),
  ),
  /** Khuyến mãi 2 */
  khuyenMai2: safeBanner(require("@/assets/banner/bo-banner/khuyen-mai-2.jpg")),
  /** Khuyến mãi 3 */
  khuyenMai3: safeBanner(require("@/assets/banner/bo-banner/khuyen-mai-3.jpg")),
  /** Generated - team banner */
  genTeam: safeBanner(
    require("@/assets/banner/bo-banner/gen-img-mar17-458pm.jpg"),
  ),
  /** Generated - design banner */
  genDesign: safeBanner(
    require("@/assets/banner/bo-banner/gen-img-mar17-505pm.jpg"),
  ),
  /** Generated - interior banner */
  genInterior: safeBanner(
    require("@/assets/banner/bo-banner/gen-img-mar10-136pm.jpg"),
  ),
  /** Generated - deal banner */
  genDeal: safeBanner(
    require("@/assets/banner/bo-banner/gen-img-mar10-140pm.jpg"),
  ),
  /** Generated - Mar 17 extra */
  genMar17Extra: safeBanner(
    require("@/assets/banner/bo-banner/gen-img-mar17-505pm-2.jpg"),
  ),
  /** Fallback */
  fallback: FALLBACK_BANNER,
} satisfies Record<string, ImageSourcePropType>;

/** Filename mapping: Vietnamese original → ASCII-safe name */
export const BANNER_FILENAME_MAP: Record<string, string> = {
  "tiện ích thiết kế.jpg": "tien-ich-thiet-ke.jpg",
  "tìm thợ nhanh.jpg": "tim-tho-nhanh.jpg",
  "Tìm thợ.jpg": "tim-tho.jpg",
  "tiện ích bảo trì.jpg": "tien-ich-bao-tri.jpg",
  "TIỆN ÍCH NỘI THẤT 2.jpg": "tien-ich-noi-that-2.jpg",
  "quyền lơi khach.jpg": "quyen-loi-khach.jpg",
  "quyền lợi thợ.jpg": "quyen-loi-tho.jpg",
  "KHUYỄN MÃI 2.jpg": "khuyen-mai-2.jpg",
  "KHUYỄN MÃI 3.jpg": "khuyen-mai-3.jpg",
  "Generated-Image-March-17,-2026---4_58PM11.jpg": "gen-img-mar17-458pm.jpg",
  "Generated-Image-March-17,-2026---5_05PM2222.jpg": "gen-img-mar17-505pm.jpg",
  "Generated Image March 10, 2026 - 1_36PM.jpg": "gen-img-mar10-136pm.jpg",
  "Generated Image March 10, 2026 - 1_40PM.jpg": "gen-img-mar10-140pm.jpg",
  "Generated Image March 17, 2026 - 5_05PM.jpg": "gen-img-mar17-505pm-2.jpg",
};
