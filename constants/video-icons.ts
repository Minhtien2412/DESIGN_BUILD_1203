import { ImageSourcePropType } from 'react-native';

// Mapping từ video name sang icon tương ứng
export const VIDEO_ICON_MAP: Record<string, ImageSourcePropType> = {
  // Video files mapped to corresponding service icons
  'biet-thu-co-dien-co-hien-tik-tok': require('../assets/images/BỘ ICON DICH VỤ/Biệt thự cổ điẻn.png'),
  'biet-thu-nha-anh-nghia-tiktok': require('../assets/images/BỘ ICON DICH VỤ/Biệt thự.png'),
  'biet-thu-song-lap-chi-nhung-verosa-park-khang-dien': require('../assets/images/BỘ ICON DICH VỤ/Biệt thự.png'),
  'cam-nhan-khach-hang-sau-thi-cong-biet-thu-hien-dai-anh-thanh': require('../assets/images/BỘ ICON DICH VỤ/Biệt thự.png'),
  'cam-nhan-khach-hang-sau-thi-cong-biet-thu-hien-dai-anh-thanh_1': require('../assets/images/BỘ ICON DICH VỤ/Biệt thự.png'),
  'cam-nhan-khach-hang-sau-thi-cong-biet-thu-hien-dai-anh-thanh_2': require('../assets/images/BỘ ICON DICH VỤ/Biệt thự.png'),
  'CARBON': require('../assets/images/ICON/Vật Liệu.png'),
  'den-thong-tang': require('../assets/images/BỘ ICON DICH VỤ/Điện.png'),
  'kiem-tra-do-suc-be-tong': require('../assets/images/ICON/Bê tông.png'),
  'maika': require('../assets/images/BỘ ICON DICH VỤ/Thiết kế nội thất.png'),
  'phong con gai nho anh thanh': require('../assets/images/BỘ ICON DICH VỤ/Thiết kế nội thất.png'),
  'phong-bep-dep-tiktok': require('../assets/images/BỘ ICON DICH VỤ/Thiết bị bếp.png'),
  'VID20250920145722_1': require('../assets/images/ICON/Nhân công xây dựng.png'),
  'VID20250921094034_1': require('../assets/images/ICON/Thợ xây.png'),
};

// Fallback icon cho các video không có mapping
export const DEFAULT_VIDEO_ICON = require('../assets/images/BỘ ICON DICH VỤ/Thiết kế nhà.png');

// Function để lấy icon cho video
export function getVideoIcon(videoFileName: string): ImageSourcePropType {
  // Remove extension và path, chuyển về lowercase để matching tốt hơn
  const cleanName = videoFileName.replace(/\.(mp4|mov|avi|webm)$/i, '').split('/').pop()?.toLowerCase() || '';
  
  // Tìm mapping trực tiếp trước
  const directMatch = Object.keys(VIDEO_ICON_MAP).find(key => 
    key.toLowerCase() === cleanName
  );
  if (directMatch) return VIDEO_ICON_MAP[directMatch];
  
  // Nếu không có mapping trực tiếp, thử matching từ khóa
  if (cleanName.includes('biet-thu') || cleanName.includes('biệt thự')) {
    return require('../assets/images/BỘ ICON DICH VỤ/Biệt thự.png');
  }
  if (cleanName.includes('nha-pho') || cleanName.includes('nhà phố')) {
    return require('../assets/images/BỘ ICON DICH VỤ/Nhà phố.png');
  }
  if (cleanName.includes('phong-bep') || cleanName.includes('bếp')) {
    return require('../assets/images/BỘ ICON DICH VỤ/Thiết bị bếp.png');
  }
  if (cleanName.includes('den') || cleanName.includes('đèn') || cleanName.includes('thong-tang')) {
    return require('../assets/images/BỘ ICON DICH VỤ/Điện.png');
  }
  if (cleanName.includes('be-tong') || cleanName.includes('bê tông') || cleanName.includes('do-suc')) {
    return require('../assets/images/ICON/Bê tông.png');
  }
  if (cleanName.includes('noi-that') || cleanName.includes('phong') || cleanName.includes('maika')) {
    return require('../assets/images/BỘ ICON DICH VỤ/Thiết kế nội thất.png');
  }
  if (cleanName.includes('vid') || cleanName.includes('xay-dung') || cleanName.includes('thi-cong')) {
    return require('../assets/images/ICON/Nhân công xây dựng.png');
  }
  
  return DEFAULT_VIDEO_ICON;
}