import type { ImageSourcePropType } from "react-native";

export const HOME_UI_ICONS = {
  // DỊCH VỤ
  thietKeNha: require("@/assets/icon_new/Bộ icon giao diện/thiết kế nhà.png"),
  thietKeNoiThat: require("@/assets/icon_new/Bộ icon giao diện/thiết kế nội thất.png"),
  traCuuXayDung: require("@/assets/icon_new/Bộ icon giao diện/tra cứu xây dựng.png"),
  xinPhep: require("@/assets/icon_new/Bộ icon giao diện/xin phép.png"),
  hoSoMau: require("@/assets/icon_new/Bộ icon giao diện/hồ sơ mẫu.png"),
  suaNha: require("@/assets/icon_new/Bộ icon giao diện/sửa nhà.png"),
  mauNha: require("@/assets/icon_new/Bộ icon giao diện/mẫu nhà.png"),
  tuVanChatLuong: require("@/assets/icon_new/Bộ icon giao diện/tư vấn chất lượng.png"),
  congTyXayDung: require("@/assets/icon_new/Bộ icon giao diện/công ty xây dựng.png"),
  congTyNoiThat: require("@/assets/icon_new/Bộ icon giao diện/công ty tk noi thât.png"),
  giamSatThiCong: require("@/assets/icon_new/Bộ icon giao diện/giám sát thi công.png"),
  xemThem: require("@/assets/icon_new/Bộ icon giao diện/xem thêm.png"),

  // TIỆN ÍCH THIẾT KẾ
  kienTrucSu: require("@/assets/icon_new/Bộ icon giao diện/kiến trúc sư.png"),
  kySu: require("@/assets/icon_new/Bộ icon giao diện/kỹ sư.png"),
  ketCau: require("@/assets/icon_new/Bộ icon giao diện/kết cấu.png"),
  dienCt: require("@/assets/icon_new/Bộ icon giao diện/điện ct.png"),
  nuocKySu: require("@/assets/icon_new/Bộ icon giao diện/kỹ sư nươc.png"),
  duToan: require("@/assets/icon_new/Bộ icon giao diện/dự toán.png"),
  noiThat: require("@/assets/icon_new/Bộ icon giao diện/showroom nt.png"),
  congCuAi: require("@/assets/icon_new/Bộ icon giao diện/công nghệ Ai.png"),

  // TIỆN ÍCH XÂY DỰNG
  epCoc: require("@/assets/icon_new/Bộ icon giao diện/ép cọc.png"),
  daoDat: require("@/assets/icon_new/Bộ icon giao diện/đào đất.png"),
  vatLieu: require("@/assets/icon_new/Bộ icon giao diện/xưởng vật liệu.png"),
  nhanCongXayDung: require("@/assets/icon_new/Bộ icon giao diện/nhân công xây dựng.png"),
  thoXay: require("@/assets/icon_new/Bộ icon giao diện/thợ xây.png"),
  thoSat: require("@/assets/icon_new/Bộ icon giao diện/thợ sắt.png"),
  thoCoffa: require("@/assets/icon_new/Bộ icon giao diện/thợ cofa.png"),
  thoCoKhi: require("@/assets/icon_new/Bộ icon giao diện/thợ co khí.png"),
  thoToTuong: require("@/assets/icon_new/Bộ icon giao diện/thợ tô tườn.png"),
  thoDienNuoc: require("@/assets/icon_new/Bộ icon giao diện/thợ nước.png"),
  beTong: require("@/assets/icon_new/Bộ icon giao diện/bê tông.png"),

  // TIỆN ÍCH HOÀN THIỆN
  thoOpGach: require("@/assets/icon_new/Bộ icon giao diện/thợ lát gạch.png"),
  thoThachCao: require("@/assets/icon_new/Bộ icon giao diện/thợ trần thạc cao.png"),
  thoSon: require("@/assets/icon_new/Bộ icon giao diện/thợ sơn.png"),
  thoDa: require("@/assets/icon_new/Bộ icon giao diện/thợ đá.png"),
  thoLamCua: require("@/assets/icon_new/Bộ icon giao diện/thợ cửa.png"),
  thoLanCan: require("@/assets/icon_new/Bộ icon giao diện/thợ lan can.png"),
  thoCong: require("@/assets/icon_new/Bộ icon giao diện/thợ cổng.png"),
  thoCamera: require("@/assets/icon_new/Bộ icon giao diện/thợ camera.png"),

  // TIỆN ÍCH BẢO TRÌ
  thoMayGiat: require("@/assets/icon_new/Bộ icon giao diện/thợ máy giặt.png"),
  thoTuLanh: require("@/assets/icon_new/Bộ icon giao diện/thợ tủ lạnh.png"),
  thoThongTacCong: require("@/assets/icon_new/Bộ icon giao diện/thợ thông cống.png"),
  thoDien: require("@/assets/icon_new/Bộ icon giao diện/thợ điện lực.png"),
  thoCapNuoc: require("@/assets/icon_new/Bộ icon giao diện/thợ cấp nước.png"),
  thoMangWifi: require("@/assets/icon_new/Bộ icon giao diện/thợ wifi.png"),
  thoMayLanh: require("@/assets/icon_new/Bộ icon giao diện/thợ máy lạnh.png"),

  // MARKET PLACE
  thietBiBep: require("@/assets/icon_new/Bộ icon giao diện/thiết bị bếp.png"),
  thietBiVeSinh: require("@/assets/icon_new/Bộ icon giao diện/tbvệ sinh.png"),
  dien: require("@/assets/icon_new/Bộ icon giao diện/điện.png"),
  nuoc: require("@/assets/icon_new/Bộ icon giao diện/nước.png"),
  pccc: require("@/assets/icon_new/Bộ icon giao diện/pccc.png"),
  giuong: require("@/assets/icon_new/Bộ icon giao diện/giường.png"),
  banLamViec: require("@/assets/icon_new/Bộ icon giao diện/bàn làm việc.webp"),
  sofa: require("@/assets/icon_new/Bộ icon giao diện/sofa.png"),
} satisfies Record<string, ImageSourcePropType>;

export const HOME_UI_CONTROL_ICONS = {
  search: require("@/assets/icon_new/Bộ icon giao diện/tra cứu xây dựng.png"),
  play: require("@/assets/images/ICON/Camera.png"),
} satisfies Record<string, ImageSourcePropType>;

export const HOME_UI_BANNERS = {
  heroWorker: require("@/assets/banner/banner-home-1.jpg"),
  heroCustomer: require("@/assets/banner/banner-home-2.jpg"),
  design: require("@/assets/banner/Bộ Banner/tiện ích thiết kế.jpg"),
  construction: require("@/assets/banner/Bộ Banner/tìm thợ nhanh.jpg"),
  finishing: require("@/assets/banner/Bộ Banner/Tìm thợ.jpg"),
  maintenance: require("@/assets/banner/Bộ Banner/tiện ích bảo trì.jpg"),
  interiorDeal: require("@/assets/banner/Bộ Banner/TIỆN ÍCH NỘI THẤT 2.jpg"),
} satisfies Record<string, ImageSourcePropType>;

export const HOME_UI_MEDIA = {
  live1: require("@/assets/images/placeholder-video.webp"),
  live2: require("@/assets/images/placeholder-video.webp"),
  video1: require("@/assets/banner/banner-promo-1.jpg"),
  video2: require("@/assets/banner/banner-promo-2.jpg"),
} satisfies Record<string, ImageSourcePropType>;

export const HOME_UI_PRODUCTS = {
  sofa: require("@/assets/images/tien-ich-mua-sam-trang-thiet-bi/sofa.webp"),
  banAn: require("@/assets/images/tien-ich-mua-sam-trang-thiet-bi/ban-an.webp"),
  den: require("@/assets/images/tien-ich-mua-sam-trang-thiet-bi/dien.webp"),
  giuong: require("@/assets/icon_new/Bộ icon giao diện/giường.png"),
} satisfies Record<string, ImageSourcePropType>;

export interface AssetMapEntry {
  label: string;
  file: string;
  note?: string;
}

export const HOME_UI_ASSET_MAP: AssetMapEntry[] = [
  {
    label: "Thiết kế nhà",
    file: "assets/icon_new/Bộ icon giao diện/thiết kế nhà.png",
  },
  {
    label: "Thiết kế nội thất",
    file: "assets/icon_new/Bộ icon giao diện/thiết kế nội thất.png",
  },
  {
    label: "Tra cứu xây dựng",
    file: "assets/icon_new/Bộ icon giao diện/tra cứu xây dựng.png",
  },
  { label: "Xin phép", file: "assets/icon_new/Bộ icon giao diện/xin phép.png" },
  {
    label: "Hồ sơ mẫu",
    file: "assets/icon_new/Bộ icon giao diện/hồ sơ mẫu.png",
  },
  { label: "Sửa nhà", file: "assets/icon_new/Bộ icon giao diện/sửa nhà.png" },
  { label: "Mẫu nhà", file: "assets/icon_new/Bộ icon giao diện/mẫu nhà.png" },
  {
    label: "Tư vấn chất lượng",
    file: "assets/icon_new/Bộ icon giao diện/tư vấn chất lượng.png",
  },
  {
    label: "Công ty xây dựng",
    file: "assets/icon_new/Bộ icon giao diện/công ty xây dựng.png",
  },
  {
    label: "Công ty nội thất",
    file: "assets/icon_new/Bộ icon giao diện/công ty tk noi thât.png",
  },
  {
    label: "Giám sát thi công",
    file: "assets/icon_new/Bộ icon giao diện/giám sát thi công.png",
  },
  { label: "Xem thêm", file: "assets/icon_new/Bộ icon giao diện/xem thêm.png" },

  {
    label: "Kiến trúc sư",
    file: "assets/icon_new/Bộ icon giao diện/kiến trúc sư.png",
  },
  { label: "Kỹ sư", file: "assets/icon_new/Bộ icon giao diện/kỹ sư.png" },
  { label: "Kết cấu", file: "assets/icon_new/Bộ icon giao diện/kết cấu.png" },
  { label: "Điện", file: "assets/icon_new/Bộ icon giao diện/điện ct.png" },
  { label: "Nước", file: "assets/icon_new/Bộ icon giao diện/kỹ sư nươc.png" },
  { label: "Dự toán", file: "assets/icon_new/Bộ icon giao diện/dự toán.png" },
  {
    label: "Nội thất",
    file: "assets/icon_new/Bộ icon giao diện/showroom nt.png",
  },
  {
    label: "Công cụ AI",
    file: "assets/icon_new/Bộ icon giao diện/công nghệ Ai.png",
  },

  { label: "Ép cọc", file: "assets/icon_new/Bộ icon giao diện/ép cọc.png" },
  { label: "Đào đất", file: "assets/icon_new/Bộ icon giao diện/đào đất.png" },
  {
    label: "Vật liệu",
    file: "assets/icon_new/Bộ icon giao diện/xưởng vật liệu.png",
  },
  {
    label: "Nhân công xây dựng",
    file: "assets/icon_new/Bộ icon giao diện/nhân công xây dựng.png",
  },
  { label: "Thợ xây", file: "assets/icon_new/Bộ icon giao diện/thợ xây.png" },
  { label: "Thợ sắt", file: "assets/icon_new/Bộ icon giao diện/thợ sắt.png" },
  {
    label: "Thợ coffa",
    file: "assets/icon_new/Bộ icon giao diện/thợ cofa.png",
  },
  {
    label: "Thợ cơ khí",
    file: "assets/icon_new/Bộ icon giao diện/thợ co khí.png",
  },
  {
    label: "Thợ tô tường",
    file: "assets/icon_new/Bộ icon giao diện/thợ tô tườn.png",
  },
  {
    label: "Thợ điện nước",
    file: "assets/icon_new/Bộ icon giao diện/thợ nước.png",
  },
  {
    label: "Bê tông / xe bồn",
    file: "assets/icon_new/Bộ icon giao diện/bê tông.png",
  },

  {
    label: "Thợ ốp gạch",
    file: "assets/icon_new/Bộ icon giao diện/thợ lát gạch.png",
  },
  {
    label: "Thợ thạch cao",
    file: "assets/icon_new/Bộ icon giao diện/thợ trần thạc cao.png",
  },
  { label: "Thợ sơn", file: "assets/icon_new/Bộ icon giao diện/thợ sơn.png" },
  { label: "Thợ đá", file: "assets/icon_new/Bộ icon giao diện/thợ đá.png" },
  {
    label: "Thợ làm cửa",
    file: "assets/icon_new/Bộ icon giao diện/thợ cửa.png",
  },
  {
    label: "Thợ lan can",
    file: "assets/icon_new/Bộ icon giao diện/thợ lan can.png",
  },
  { label: "Thợ cổng", file: "assets/icon_new/Bộ icon giao diện/thợ cổng.png" },
  {
    label: "Thợ camera",
    file: "assets/icon_new/Bộ icon giao diện/thợ camera.png",
  },

  {
    label: "Thợ sửa máy giặt",
    file: "assets/icon_new/Bộ icon giao diện/thợ máy giặt.png",
  },
  {
    label: "Thợ sửa tủ lạnh",
    file: "assets/icon_new/Bộ icon giao diện/thợ tủ lạnh.png",
  },
  {
    label: "Thợ thông tắc cống",
    file: "assets/icon_new/Bộ icon giao diện/thợ thông cống.png",
  },
  {
    label: "Thợ điện",
    file: "assets/icon_new/Bộ icon giao diện/thợ điện lực.png",
  },
  {
    label: "Thợ cấp nước",
    file: "assets/icon_new/Bộ icon giao diện/thợ cấp nước.png",
  },
  {
    label: "Thợ mạng wifi",
    file: "assets/icon_new/Bộ icon giao diện/thợ wifi.png",
  },
  {
    label: "Thợ sửa máy lạnh",
    file: "assets/icon_new/Bộ icon giao diện/thợ máy lạnh.png",
  },

  {
    label: "Thiết bị bếp",
    file: "assets/icon_new/Bộ icon giao diện/thiết bị bếp.png",
  },
  {
    label: "Thiết bị vệ sinh",
    file: "assets/icon_new/Bộ icon giao diện/tbvệ sinh.png",
  },
  { label: "Điện", file: "assets/icon_new/Bộ icon giao diện/điện.png" },
  { label: "Nước", file: "assets/icon_new/Bộ icon giao diện/nước.png" },
  { label: "PCCC", file: "assets/icon_new/Bộ icon giao diện/pccc.png" },
  { label: "Giường", file: "assets/icon_new/Bộ icon giao diện/giường.png" },
  {
    label: "Bàn làm việc",
    file: "assets/icon_new/Bộ icon giao diện/bàn làm việc.webp",
  },
  { label: "Sofa", file: "assets/icon_new/Bộ icon giao diện/sofa.png" },
];
