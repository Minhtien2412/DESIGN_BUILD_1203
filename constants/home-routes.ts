/**
 * Home Module Routes Configuration
 * Maps all home screen modules to their corresponding routes
 */

// Service routes mapping (11 services from home)
export const SERVICE_ROUTES: Record<number, string> = {
  1: '/services/house-design', // Thiết kế nhà ✅ NEW
  2: '/services/interior-design', // Thiết kế nội thất
  3: '/services/construction-lookup', // Tra cứu xây dựng
  4: '/services/permit', // Xin phép
  5: '/services/sample-docs', // Hồ sơ mẫu
  6: '/services/feng-shui', // Lỗ ban
  7: '/services/color-chart', // Bảng mẫu
  8: '/services/quality-consulting', // Tư vấn chất lượng
  9: '/services/construction-company', // Công ty xây dựng
  10: '/services/company-detail', // Công ty nội thất (dùng trang chi tiết công ty)
  11: '/services/quality-supervision', // Giám sát chất lượng
};

// Construction utilities route mapping (8 utilities) - map directly to existing screens
// Ensure each id routes to an actual file under app/utilities/
export const CONSTRUCTION_UTILITY_ROUTES: Record<number, string> = {
  1: '/utilities/ep-coc',          // Ép cọc (exists: app/utilities/ep-coc.tsx)
  2: '/utilities/dao-dat',         // Đào đất (exists: app/utilities/dao-dat.tsx)
  3: '/utilities/vat-lieu',        // Vật liệu (exists: app/utilities/vat-lieu.tsx)
  4: '/utilities/nhan-cong',       // Nhân công (exists: app/utilities/nhan-cong.tsx)
  5: '/utilities/tho-xay',         // Thợ xây (exists: app/utilities/tho-xay.tsx)
  6: '/utilities/tho-coffa',       // Thợ coffa (exists: app/utilities/tho-coffa.tsx)
  7: '/utilities/tho-dien-nuoc',   // Thợ điện nước (exists: app/utilities/tho-dien-nuoc.tsx)
  8: '/utilities/be-tong',         // Bê tông (exists: app/utilities/be-tong.tsx)
};

// Finishing utilities direct route mapping (8 utilities) - map to existing screens under app/finishing/
export const FINISHING_UTILITY_ROUTES: Record<number, string> = {
  1: '/finishing/lat-gach',     // Thợ lát gạch
  2: '/finishing/thach-cao',    // Thợ thạch cao
  3: '/finishing/son',          // Thợ sơn
  4: '/finishing/da',           // Thợ đá
  5: '/finishing/lam-cua',      // Thợ làm cửa
  6: '/finishing/lan-can',      // Thợ lan can
  7: '/finishing/tho-tong-hop', // Thợ công (tổng hợp)
  8: '/finishing/camera',       // Thợ camera
};

// Equipment shopping category mapping (8 categories)
export const EQUIPMENT_SHOPPING_SLUGS: Record<number, string> = {
  1: 'kitchen-equipment', // Thiết bị bếp
  2: 'sanitary-equipment', // Thiết bị vệ sinh
  3: 'electrical', // Điện
  4: 'plumbing', // Nước
  5: 'fire-safety', // PCCC
  6: 'dining-tables', // Bàn ăn
  7: 'study-desks', // Bàn học
  8: 'sofas', // Sofa
};

// Library (Architecture) type mapping (7 types)
export const LIBRARY_TYPES: Record<number, string> = {
  1: 'office', // Văn phòng
  2: 'townhouse', // Nhà phố
  3: 'villa', // Biệt thự
  4: 'classic-villa', // Biệt thự cổ điển
  5: 'hotel', // Khách sạn
  6: 'factory', // Nhà xưởng
  7: 'serviced-apartment', // Căn hộ dịch vụ
};

// Design utilities slug mapping (7 utilities)
export const DESIGN_UTILITY_SLUGS: Record<number, string> = {
  1: 'architects', // Kiến trúc sư
  2: 'supervision-engineers', // Kỹ sư giám sát
  3: 'structural-engineers', // Kỹ sư kết cấu
  4: 'electrical-engineers', // Kỹ sư điện
  5: 'plumbing-engineers', // Kỹ sư nước
  6: 'cost-estimators', // Dự toán
  7: 'interior-designers', // Nội thất
};

// Helper functions
export const getServiceRoute = (serviceId: number): string => {
  return SERVICE_ROUTES[serviceId] || '/';
};

export const getConstructionUtilityRoute = (utilityId: number): string => {
  return CONSTRUCTION_UTILITY_ROUTES[utilityId] || '/';
};

export const getFinishingUtilityRoute = (utilityId: number): string => {
  return FINISHING_UTILITY_ROUTES[utilityId] || '/';
};

export const getEquipmentShoppingRoute = (equipmentId: number): string => {
  const slug = EQUIPMENT_SHOPPING_SLUGS[equipmentId];
  return slug ? `/shopping/${slug}` : '/';
};

export const getLibraryRoute = (libraryId: number): string => {
  const type = LIBRARY_TYPES[libraryId];
  return type ? `/projects/architecture-portfolio?type=${type}` : '/projects/architecture-portfolio';
};

export const getDesignUtilityRoute = (utilityId: number): string => {
  const slug = DESIGN_UTILITY_SLUGS[utilityId];
  return slug ? `/utilities/${slug}` : '/';
};

// Video handling
export const handleVideoPress = (videoItem: any, category: 'design' | 'construction') => {
  // Return data for opening ReelsPlayer modal
  return {
    video: videoItem,
    category,
    action: 'openReels',
  };
};

// Quick access to all route generators
export const RouteHelpers = {
  service: getServiceRoute,
  constructionUtility: getConstructionUtilityRoute,
  finishingUtility: getFinishingUtilityRoute,
  equipmentShopping: getEquipmentShoppingRoute,
  library: getLibraryRoute,
  designUtility: getDesignUtilityRoute,
  video: handleVideoPress,
};
export default RouteHelpers;
