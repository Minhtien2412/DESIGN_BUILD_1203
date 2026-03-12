/**
 * Safe Asset Loading Utilities
 * Tránh lỗi khi load hình ảnh không tồn tại
 */

export interface SafeAsset {
  source: any;
  fallbackText: string;
}

/**
 * Safely require an asset with fallback
 * Note: Metro requires static paths, so this returns null and relies on getProductIcon mapping
 */
export function safeRequire(path: string, fallbackText: string): SafeAsset {
  // Metro doesn't support dynamic requires - icons must be pre-mapped in getProductIcon
  console.warn(`[SafeAssets] Dynamic require not supported: ${path}. Use getProductIcon() instead.`);
  return {
    source: null,
    fallbackText,
  };
}

/**
 * Get icon for product category with safe fallback
 */
export function getProductIcon(name: string): SafeAsset {
  // Static mapping for Metro bundler compatibility
  const iconMap: Record<string, any> = {
    // Backend APPROVED Products
    'Balo Laptop The North Face': require('@/assets/images/tien-ich-mua-sam-trang-thiet-bi/ban-hoc.webp'),
    'Nồi Cơm Điện Tử Sharp 1.8L': require('@/assets/images/tien-ich-mua-sam-trang-thiet-bi/thiet-bi-bep.webp'),
    'Thảm Yoga TPE Cao Cấp': require('@/assets/images/tien-ich-mua-sam-trang-thiet-bi/sofa.webp'),
    'Tai nghe Sony WH-1000XM5': require('@/assets/images/tien-ich-mua-sam-trang-thiet-bi/dien.webp'),
    
    // Featured Products - Gạch & Sơn
    'Gạch men cao cấp': require('@/assets/images/tien-ich-hoan-thien/tho-lat-gach.webp'),
    'Sơn nước nội thất': require('@/assets/images/tien-ich-hoan-thien/tho-son.webp'),
    'Gạch Terrazzo': require('@/assets/images/tien-ich-hoan-thien/tho-lat-gach.webp'),
    'Gạch ống Đồng Nai': require('@/assets/images/tien-ich-hoan-thien/tho-lat-gach.webp'),
    
    // Thiết bị điện & nước
    'Bồn cầu TOTO': require('@/assets/images/tien-ich-mua-sam-trang-thiet-bi/thiet-bi-ve-sinh.webp'),
    'Điều hòa Daikin': require('@/assets/images/BỘ ICON DICH VỤ/Điện.webp'),
    'Đèn LED thông minh': require('@/assets/images/tien-ich-mua-sam-trang-thiet-bi/dien.webp'),
    'Bồn rửa Inox 304': require('@/assets/images/tien-ich-mua-sam-trang-thiet-bi/thiet-bi-ve-sinh.webp'),
    'Vòi sen cao cấp': require('@/assets/images/BỘ ICON DICH VỤ/Nước.webp'),
    'Quạt trần DC Inverter': require('@/assets/images/tien-ich-mua-sam-trang-thiet-bi/dien.webp'),
    
    // Cửa & kính
    'Cửa gỗ công nghiệp': require('@/assets/images/tien-ich-hoan-thien/tho-lam-cua.webp'),
    'Kính cường lực': require('@/assets/images/tien-ich-hoan-thien/tho-lam-cua.webp'),
    
    // Vật liệu xây dựng
    'Xi măng PCB40': require('@/assets/images/tien-ich-xay-dung/be-tong.webp'),
    'Thép Hòa Phát': require('@/assets/images/tien-ich-xay-dung/ep-coc.webp'),
    'Cát xây dựng': require('@/assets/images/tien-ich-xay-dung/dao-dat.webp'),
    'Đá 1x2': require('@/assets/images/tien-ich-xay-dung/vat-lieu.webp'),
    'Tôn lạnh 0.5mm': require('@/assets/images/tien-ich-xay-dung/tho-xay.webp'),
    'Tôn chống nóng': require('@/assets/images/tien-ich-xay-dung/tho-coffa.webp'),
    
    // Nội thất & hoàn thiện
    'Tấm PVC vân gỗ': require('@/assets/images/tien-ich-hoan-thien/tho-thachcao-.webp'),
    'Đá Granite': require('@/assets/images/tien-ich-hoan-thien/tho-da.webp'),
    'Sàn gỗ công nghiệp': require('@/assets/images/tien-ich-mua-sam-trang-thiet-bi/ban-hoc.webp'),
    'Bếp từ đôi': require('@/assets/images/tien-ich-mua-sam-trang-thiet-bi/thiet-bi-bep.webp'),
    'Máy hút mùi': require('@/assets/images/BỘ ICON DICH VỤ/Thiết bị bếp.webp'),
    'Tủ bếp Acrylic': require('@/assets/images/tien-ich-mua-sam-trang-thiet-bi/ban-an.webp'),
    'Sofa da thật': require('@/assets/images/tien-ich-mua-sam-trang-thiet-bi/sofa.webp'),
    'Bàn ăn 6 ghế': require('@/assets/images/tien-ich-mua-sam-trang-thiet-bi/ban-an.webp'),
    'Bàn làm việc': require('@/assets/images/tien-ich-mua-sam-trang-thiet-bi/ban-hoc.webp'),
    
    // Additional common products
    'Ổ cắm điện': require('@/assets/images/tien-ich-mua-sam-trang-thiet-bi/dien.webp'),
    'Công tắc thông minh': require('@/assets/images/tien-ich-mua-sam-trang-thiet-bi/dien.webp'),
    'Ống nước PPR': require('@/assets/images/tien-ich-mua-sam-trang-thiet-bi/nuoc.webp'),
    'Van khóa': require('@/assets/images/BỘ ICON DICH VỤ/Nước.webp'),
    'Thiết bị PCCC': require('@/assets/images/tien-ich-mua-sam-trang-thiet-bi/pccc.webp'),
  };

  const icon = iconMap[name];
  if (icon) {
    return { source: icon, fallbackText: name };
  }

  // Fallback to null (ImagePlaceholder will show placeholder)
  return { source: null, fallbackText: name };
}

/**
 * Preload common icons to avoid runtime errors
 */
export const COMMON_ICONS = {
  // Equipment
  thietBiVeSinh: require('@/assets/images/tien-ich-mua-sam-trang-thiet-bi/thiet-bi-ve-sinh.webp'),
  thietBiBep: require('@/assets/images/tien-ich-mua-sam-trang-thiet-bi/thiet-bi-bep.webp'),
  dien: require('@/assets/images/tien-ich-mua-sam-trang-thiet-bi/dien.webp'),
  nuoc: require('@/assets/images/tien-ich-mua-sam-trang-thiet-bi/nuoc.webp'),
  
  // Construction
  beTong: require('@/assets/images/tien-ich-xay-dung/be-tong.webp'),
  daoNhat: require('@/assets/images/tien-ich-xay-dung/dao-dat.webp'),
  epCoc: require('@/assets/images/tien-ich-xay-dung/ep-coc.webp'),
  vatLieu: require('@/assets/images/tien-ich-xay-dung/vat-lieu.webp'),
  
  // Finishing
  thoLatGach: require('@/assets/images/tien-ich-hoan-thien/tho-lat-gach.webp'),
  thoSon: require('@/assets/images/tien-ich-hoan-thien/tho-son.webp'),
  thoLamCua: require('@/assets/images/tien-ich-hoan-thien/tho-lam-cua.webp'),
  thoDa: require('@/assets/images/tien-ich-hoan-thien/tho-da.webp'),
};
