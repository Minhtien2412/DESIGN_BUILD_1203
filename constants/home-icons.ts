import { ImageSourcePropType } from 'react-native';

// Icons for main Home sections (1-4) from "BỘ ICON DICH VỤ"
export const HOME_BIG_ICONS: Record<string, ImageSourcePropType> = {
  // 1. DỊCH VỤ
  'tk-nha': require('../assets/images/BỘ ICON DICH VỤ/Thiết kế nhà.png'),
  'tk-noi-that': require('../assets/images/BỘ ICON DICH VỤ/Thiết kế nội thất.png'),
  'tra-cuu-xd': require('../assets/images/BỘ ICON DICH VỤ/Tra cứu xây dựng.png'),
  'xin-phep': require('../assets/images/BỘ ICON DICH VỤ/Xin phép.png'),
  'ho-so-mau': require('../assets/images/BỘ ICON DICH VỤ/Hồ sơ mẫu.png'),
  'lo-ban': require('../assets/images/BỘ ICON DICH VỤ/Lỗ ban.png'),
  'bang-mau': require('../assets/images/BỘ ICON DICH VỤ/Bảng màu.png'),
  'tu-van-cl': require('../assets/images/BỘ ICON DICH VỤ/Tư vấn chất lượng.png'),

  // 2. TIỆN ÍCH XÂY DỰNG
  'cty-xd': require('../assets/images/BỘ ICON DICH VỤ/Công ty xây dựng.png'),
  'cty-noi-that': require('../assets/images/BỘ ICON DICH VỤ/Công ty nội thất.png'),
  'giam-sat': require('../assets/images/BỘ ICON DICH VỤ/Giám sát chất lượng.png'),
  'ho-so-mau-2': require('../assets/images/BỘ ICON DICH VỤ/Hồ sơ mẫu.png'),

  // 3. MUA SẮM
  'tb-vs': require('../assets/images/BỘ ICON DICH VỤ/Thiết bị vệ sinh.png'),
  'dien': require('../assets/images/BỘ ICON DICH VỤ/Điện.png'),
  'nuoc': require('../assets/images/BỘ ICON DICH VỤ/Nước.png'),
  'tb-bep': require('../assets/images/BỘ ICON DICH VỤ/Thiết bị bếp.png'),
  'ban-an': require('../assets/images/BỘ ICON DICH VỤ/Bàn ăn.png'),
  'ban-hoc': require('../assets/images/BỘ ICON DICH VỤ/Bàn học.png'),
  'sofa': require('../assets/images/BỘ ICON DICH VỤ/Sofa.png'),
  'pccc': require('../assets/images/BỘ ICON DICH VỤ/PCCC.png'),

  // 4. THƯ VIỆN
  'nha-pho': require('../assets/images/BỘ ICON DICH VỤ/Nhà phố.png'),
  'biet-thu': require('../assets/images/BỘ ICON DICH VỤ/Biệt thự.png'),
  'ban-co-dien': require('../assets/images/BỘ ICON DICH VỤ/Biệt thự cổ điẻn.png'),
  'van-phong': require('../assets/images/BỘ ICON DICH VỤ/Văn phòng.png'),
  'khach-san': require('../assets/images/BỘ ICON DICH VỤ/Khách sạn.png'),
  'nha-xuong': require('../assets/images/BỘ ICON DICH VỤ/Nhà xưởng.png'),
  'chdv': require('../assets/images/BỘ ICON DICH VỤ/Căn hộ dịch vụ.png'),
};

// Icons for utilities sections (5 & 7) from "ICON"
export const HOME_UTILITY_ICONS: Record<string, ImageSourcePropType> = {
  // 5. TIỆN ÍCH XÂY DỰNG (compact) → use existing assets in assets/images/tien-ich-xay-dung
  'ep-coc': require('../assets/images/tien-ich-xay-dung/ep-coc.png'),
  'dao-dat': require('../assets/images/tien-ich-xay-dung/dao-dat.png'),
  'vat-lieu': require('../assets/images/tien-ich-xay-dung/vat-lieu.png'),
  'be-tong': require('../assets/images/tien-ich-xay-dung/be-tong.png'),
  'nhan-cong': require('../assets/images/tien-ich-xay-dung/nhan-cong.png'),
  'tho-xay': require('../assets/images/tien-ich-xay-dung/tho-xay.png'),
  // Note: 'tho-sat' and 'tho-co-khi' assets are not present; keep them unmapped to avoid bundling errors.
  'tho-coffa': require('../assets/images/tien-ich-xay-dung/tho-coffa.png'),
  'tho-to-tuong': require('../assets/images/tien-ich-xay-dung/tho-to-tuong.png'),
  'tho-dien-nuoc': require('../assets/images/tien-ich-xay-dung/tho-dien-nuoc.png'),

  // 7. TIỆN ÍCH HOÀN THIỆN → use existing assets in assets/images/tien-ich-hoan-thien
  'lat-gach': require('../assets/images/tien-ich-hoan-thien/tho-lat-gach.png'),
  'thach-cao': require('../assets/images/tien-ich-hoan-thien/tho-thachcao-.png'),
  'tho-son': require('../assets/images/tien-ich-hoan-thien/tho-son.png'),
  'tho-da': require('../assets/images/tien-ich-hoan-thien/tho-da.png'),
  'lam-cua': require('../assets/images/tien-ich-hoan-thien/tho-lam-cua.png'),
  'lan-can': require('../assets/images/tien-ich-hoan-thien/tho-lan-can.png'),
  'tho-cong': require('../assets/images/tien-ich-hoan-thien/tho-cong.png'),
  'camera': require('../assets/images/tien-ich-hoan-thien/tho-camera.png'),
};
