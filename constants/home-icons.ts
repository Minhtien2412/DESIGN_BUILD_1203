import { ImageSourcePropType } from 'react-native';

// Icons for main Home sections (1-4) from "BỘ ICON DICH VỤ"
export const HOME_BIG_ICONS: Record<string, ImageSourcePropType> = {
  // 1. DỊCH VỤ
  'tk-nha': require('../assets/images/BỘ ICON DICH VỤ/Thiết kế nhà.webp'),
  'tk-noi-that': require('../assets/images/BỘ ICON DICH VỤ/Thiết kế nội thất.webp'),
  'tra-cuu-xd': require('../assets/images/BỘ ICON DICH VỤ/Tra cứu xây dựng.webp'),
  'xin-phep': require('../assets/images/BỘ ICON DICH VỤ/Xin phép.webp'),
  'ho-so-mau': require('../assets/images/BỘ ICON DICH VỤ/Hồ sơ mẫu.webp'),
  'lo-ban': require('../assets/images/BỘ ICON DICH VỤ/Lỗ ban.webp'),
  'bang-mau': require('../assets/images/BỘ ICON DICH VỤ/Bảng màu.webp'),
  'tu-van-cl': require('../assets/images/BỘ ICON DICH VỤ/Tư vấn chất lượng.webp'),

  // 2. TIỆN ÍCH XÂY DỰNG
  'cty-xd': require('../assets/images/BỘ ICON DICH VỤ/Công ty xây dựng.webp'),
  'cty-noi-that': require('../assets/images/BỘ ICON DICH VỤ/Công ty nội thất.webp'),
  'giam-sat': require('../assets/images/BỘ ICON DICH VỤ/Giám sát chất lượng.webp'),
  'ho-so-mau-2': require('../assets/images/BỘ ICON DICH VỤ/Hồ sơ mẫu.webp'),

  // 3. MUA SẮM
  'tb-vs': require('../assets/images/BỘ ICON DICH VỤ/Thiết bị vệ sinh.webp'),
  'dien': require('../assets/images/BỘ ICON DICH VỤ/Điện.webp'),
  'nuoc': require('../assets/images/BỘ ICON DICH VỤ/Nước.webp'),
  'tb-bep': require('../assets/images/BỘ ICON DICH VỤ/Thiết bị bếp.webp'),
  'ban-an': require('../assets/images/BỘ ICON DICH VỤ/Bàn ăn.webp'),
  'ban-hoc': require('../assets/images/BỘ ICON DICH VỤ/Bàn học.webp'),
  'sofa': require('../assets/images/BỘ ICON DICH VỤ/Sofa.webp'),
  'pccc': require('../assets/images/BỘ ICON DICH VỤ/PCCC.webp'),

  // 4. THƯ VIỆN
  'nha-pho': require('../assets/images/BỘ ICON DICH VỤ/Nhà phố.webp'),
  'biet-thu': require('../assets/images/BỘ ICON DICH VỤ/Biệt thự.webp'),
  'ban-co-dien': require('../assets/images/BỘ ICON DICH VỤ/Biệt thự cổ điẻn.webp'),
  'van-phong': require('../assets/images/BỘ ICON DICH VỤ/Văn phòng.webp'),
  'khach-san': require('../assets/images/BỘ ICON DICH VỤ/Khách sạn.webp'),
  'nha-xuong': require('../assets/images/BỘ ICON DICH VỤ/Nhà xưởng.webp'),
  'chdv': require('../assets/images/BỘ ICON DICH VỤ/Căn hộ dịch vụ.webp'),
};

// Icons for utilities sections (5 & 7) from "ICON"
export const HOME_UTILITY_ICONS: Record<string, ImageSourcePropType> = {
  // 5. TIỆN ÍCH XÂY DỰNG (compact) → use existing assets in assets/images/tien-ich-xay-dung
  'ep-coc': require('../assets/images/tien-ich-xay-dung/ep-coc.webp'),
  'dao-dat': require('../assets/images/tien-ich-xay-dung/dao-dat.webp'),
  'vat-lieu': require('../assets/images/tien-ich-xay-dung/vat-lieu.webp'),
  'be-tong': require('../assets/images/tien-ich-xay-dung/be-tong.webp'),
  'nhan-cong': require('../assets/images/tien-ich-xay-dung/nhan-cong.webp'),
  'tho-xay': require('../assets/images/tien-ich-xay-dung/tho-xay.webp'),
  // Note: 'tho-sat' and 'tho-co-khi' assets are not present; keep them unmapped to avoid bundling errors.
  'tho-coffa': require('../assets/images/tien-ich-xay-dung/tho-coffa.webp'),
  'tho-to-tuong': require('../assets/images/tien-ich-xay-dung/tho-to-tuong.webp'),
  'tho-dien-nuoc': require('../assets/images/tien-ich-xay-dung/tho-dien-nuoc.webp'),

  // 7. TIỆN ÍCH HOÀN THIỆN → use existing assets in assets/images/tien-ich-hoan-thien
  'lat-gach': require('../assets/images/tien-ich-hoan-thien/tho-lat-gach.webp'),
  'thach-cao': require('../assets/images/tien-ich-hoan-thien/tho-thachcao-.webp'),
  'tho-son': require('../assets/images/tien-ich-hoan-thien/tho-son.webp'),
  'tho-da': require('../assets/images/tien-ich-hoan-thien/tho-da.webp'),
  'lam-cua': require('../assets/images/tien-ich-hoan-thien/tho-lam-cua.webp'),
  'lan-can': require('../assets/images/tien-ich-hoan-thien/tho-lan-can.webp'),
  'tho-cong': require('../assets/images/tien-ich-hoan-thien/tho-cong.webp'),
  'camera': require('../assets/images/tien-ich-hoan-thien/tho-camera.webp'),
};
