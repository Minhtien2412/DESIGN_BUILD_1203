/**
 * Seed Data for Backend Database
 * Run this script to populate initial data
 * @created 04/02/2026
 *
 * Usage: Copy these objects and insert via admin API or database seeder
 */

// ============================================================================
// WORKERS / THỢ THI CÔNG
// ============================================================================

export const seedWorkers = [
  // === THỢ XÂY DỰNG THÔ ===
  {
    name: "Nguyễn Văn Hùng",
    phone: "0901234567",
    email: "hung.nguyen@email.com",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    specialty: "construction",
    category: "rough",
    skills: ["Xây tường", "Đổ bê tông", "Ép cọc"],
    experience: 15,
    rating: 4.9,
    reviewCount: 234,
    completedJobs: 456,
    hourlyRate: 250000,
    location: "TP. Hồ Chí Minh",
    district: "Quận 7",
    verified: true,
    available: true,
    bio: "15 năm kinh nghiệm xây dựng dân dụng và công nghiệp. Thi công đúng tiến độ, đảm bảo chất lượng.",
  },
  {
    name: "Trần Minh Đức",
    phone: "0912345678",
    email: "duc.tran@email.com",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    specialty: "construction",
    category: "rough",
    skills: ["Đào đất", "San lấp", "Móng cọc"],
    experience: 12,
    rating: 4.8,
    reviewCount: 189,
    completedJobs: 320,
    hourlyRate: 220000,
    location: "Hà Nội",
    district: "Cầu Giấy",
    verified: true,
    available: true,
    bio: "Chuyên thi công móng và nền móng công trình. Có đội ngũ và máy móc riêng.",
  },
  {
    name: "Lê Văn Thành",
    phone: "0923456789",
    email: "thanh.le@email.com",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    specialty: "construction",
    category: "rough",
    skills: ["Thợ sắt", "Coffa", "Kết cấu"],
    experience: 10,
    rating: 4.7,
    reviewCount: 156,
    completedJobs: 280,
    hourlyRate: 200000,
    location: "Đà Nẵng",
    district: "Hải Châu",
    verified: true,
    available: true,
    bio: "Thợ sắt và coffa chuyên nghiệp. Thi công theo bản vẽ kỹ thuật chuẩn.",
  },

  // === THỢ HOÀN THIỆN ===
  {
    name: "Phạm Quốc Bảo",
    phone: "0934567890",
    email: "bao.pham@email.com",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg",
    specialty: "finishing",
    category: "lat-gach",
    skills: ["Gạch ceramic", "Gạch granite", "Gạch 3D"],
    experience: 8,
    rating: 4.9,
    reviewCount: 312,
    completedJobs: 520,
    hourlyRate: 180000,
    location: "TP. Hồ Chí Minh",
    district: "Quận 2",
    verified: true,
    available: true,
    bio: "Thợ lát gạch top đầu Sài Gòn. Thi công nhanh, đẹp, đường chỉ thẳng.",
  },
  {
    name: "Hoàng Văn Tùng",
    phone: "0945678901",
    email: "tung.hoang@email.com",
    avatar: "https://randomuser.me/api/portraits/men/5.jpg",
    specialty: "finishing",
    category: "son",
    skills: ["Sơn tường", "Sơn gỗ", "Sơn epoxy"],
    experience: 12,
    rating: 4.8,
    reviewCount: 278,
    completedJobs: 430,
    hourlyRate: 160000,
    location: "Hà Nội",
    district: "Thanh Xuân",
    verified: true,
    available: true,
    bio: "Sơn đẹp bền màu, không bong tróc. Chuyên sơn nhà ở và công trình lớn.",
  },
  {
    name: "Võ Thanh Phong",
    phone: "0956789012",
    email: "phong.vo@email.com",
    avatar: "https://randomuser.me/api/portraits/men/6.jpg",
    specialty: "finishing",
    category: "thach-cao",
    skills: ["Trần phẳng", "Trần giật cấp", "Vách ngăn"],
    experience: 7,
    rating: 4.7,
    reviewCount: 198,
    completedJobs: 310,
    hourlyRate: 170000,
    location: "TP. Hồ Chí Minh",
    district: "Bình Thạnh",
    verified: true,
    available: true,
    bio: "Thợ thạch cao lành nghề. Thi công trần và vách ngăn đẹp, bền.",
  },
  {
    name: "Đỗ Minh Tuấn",
    phone: "0967890123",
    email: "tuan.do@email.com",
    avatar: "https://randomuser.me/api/portraits/men/7.jpg",
    specialty: "finishing",
    category: "noi-that",
    skills: ["Tủ bếp", "Tủ quần áo", "Giường ngủ"],
    experience: 10,
    rating: 4.9,
    reviewCount: 245,
    completedJobs: 380,
    hourlyRate: 200000,
    location: "TP. Hồ Chí Minh",
    district: "Gò Vấp",
    verified: true,
    available: true,
    bio: "Thợ mộc nội thất chuyên nghiệp. Thiết kế và thi công theo yêu cầu.",
  },

  // === THỢ ĐIỆN NƯỚC ===
  {
    name: "Bùi Văn Nam",
    phone: "0978901234",
    email: "nam.bui@email.com",
    avatar: "https://randomuser.me/api/portraits/men/8.jpg",
    specialty: "electrical",
    category: "dien",
    skills: ["Điện dân dụng", "Điện công nghiệp", "Điện năng lượng mặt trời"],
    experience: 14,
    rating: 4.8,
    reviewCount: 289,
    completedJobs: 450,
    hourlyRate: 180000,
    location: "TP. Hồ Chí Minh",
    district: "Quận 9",
    verified: true,
    available: true,
    bio: "Kỹ thuật viên điện có chứng chỉ. An toàn là trên hết.",
  },
  {
    name: "Trương Văn Hải",
    phone: "0989012345",
    email: "hai.truong@email.com",
    avatar: "https://randomuser.me/api/portraits/men/9.jpg",
    specialty: "plumbing",
    category: "nuoc",
    skills: ["Cấp thoát nước", "Điều hòa", "Xử lý nước"],
    experience: 11,
    rating: 4.7,
    reviewCount: 234,
    completedJobs: 380,
    hourlyRate: 170000,
    location: "Hà Nội",
    district: "Hoàng Mai",
    verified: true,
    available: true,
    bio: "Thợ nước chuyên nghiệp. Xử lý mọi vấn đề về cấp thoát nước.",
  },
];

// ============================================================================
// SERVICES / DỊCH VỤ
// ============================================================================

export const seedServices = [
  {
    name: "Thiết kế kiến trúc",
    slug: "thiet-ke-kien-truc",
    description:
      "Dịch vụ thiết kế kiến trúc nhà ở, biệt thự, resort với phong cách hiện đại và tối ưu công năng",
    category: "design",
    icon: "📐",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800",
    priceMin: 150000,
    priceMax: 500000,
    priceUnit: "m²",
    rating: 4.9,
    orderCount: 1250,
    features: [
      "Thiết kế theo phong thủy",
      "Hồ sơ xin phép xây dựng",
      "Revise không giới hạn",
      "Bản vẽ 3D chi tiết",
    ],
    active: true,
  },
  {
    name: "Thiết kế nội thất",
    slug: "thiet-ke-noi-that",
    description:
      "Thiết kế nội thất cao cấp, phong cách hiện đại, tân cổ điển, Indochine",
    category: "design",
    icon: "🛋️",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800",
    priceMin: 200000,
    priceMax: 800000,
    priceUnit: "m²",
    rating: 4.8,
    orderCount: 980,
    features: [
      "Render 3D photorealistic",
      "Bảng vật liệu chi tiết",
      "Hỗ trợ thi công",
      "Bảo hành thiết kế",
    ],
    active: true,
  },
  {
    name: "Thi công xây dựng",
    slug: "thi-cong-xay-dung",
    description:
      "Thi công xây dựng trọn gói từ móng đến hoàn thiện với đội ngũ chuyên nghiệp",
    category: "construction",
    icon: "🏗️",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
    priceMin: 4500000,
    priceMax: 8000000,
    priceUnit: "m²",
    rating: 4.7,
    orderCount: 560,
    features: [
      "Bảo hành 5 năm",
      "Thanh toán theo tiến độ",
      "Báo cáo tiến độ hàng tuần",
      "Bảo hiểm công trình",
    ],
    active: true,
  },
  {
    name: "Cải tạo sửa chữa",
    slug: "cai-tao-sua-chua",
    description: "Dịch vụ cải tạo, sửa chữa, nâng cấp nhà ở và công trình",
    category: "renovation",
    icon: "🔧",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800",
    priceMin: 1500000,
    priceMax: 5000000,
    priceUnit: "m²",
    rating: 4.6,
    orderCount: 720,
    features: [
      "Khảo sát miễn phí",
      "Báo giá trong 24h",
      "Không phá dỡ nếu có thể",
      "Dọn dẹp sạch sẽ",
    ],
    active: true,
  },
  {
    name: "Tư vấn phong thủy",
    slug: "tu-van-phong-thuy",
    description: "Tư vấn phong thủy nhà ở, văn phòng theo tuổi gia chủ",
    category: "consulting",
    icon: "☯️",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    priceMin: 2000000,
    priceMax: 10000000,
    priceUnit: "lần",
    rating: 4.9,
    orderCount: 340,
    features: [
      "Thầy phong thủy uy tín",
      "Báo cáo chi tiết",
      "Giải pháp cải thiện",
      "Hỗ trợ sau tư vấn",
    ],
    active: true,
  },
];

// ============================================================================
// HOUSE TEMPLATES / MẪU NHÀ
// ============================================================================

export const seedHouseTemplates = [
  {
    name: "Nhà phố hiện đại 3 tầng",
    slug: "nha-pho-hien-dai-3-tang",
    type: "townhouse",
    style: "modern",
    floors: 3,
    bedrooms: 4,
    bathrooms: 3,
    area: 120,
    landArea: 80,
    width: 5,
    length: 16,
    description:
      "Thiết kế nhà phố 3 tầng phong cách hiện đại với không gian mở, tối ưu ánh sáng tự nhiên",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    ],
    features: [
      "Phòng khách rộng 30m²",
      "Bếp mở liên thông phòng ăn",
      "Sân thượng có hồ bơi mini",
      "Hầm để xe 2 ô tô",
    ],
    estimatedCost: 2500000000,
    designPrice: 80000000,
    popular: true,
    views: 15420,
  },
  {
    name: "Biệt thự vườn 2 tầng",
    slug: "biet-thu-vuon-2-tang",
    type: "villa",
    style: "tropical",
    floors: 2,
    bedrooms: 5,
    bathrooms: 4,
    area: 350,
    landArea: 500,
    width: 20,
    length: 25,
    description:
      "Biệt thự vườn phong cách nhiệt đới, hòa quyện với thiên nhiên",
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
    ],
    features: [
      "Sân vườn 200m²",
      "Hồ bơi ngoài trời",
      "Phòng gym riêng",
      "Nhà xe 3 chỗ",
    ],
    estimatedCost: 8500000000,
    designPrice: 250000000,
    popular: true,
    views: 12350,
  },
  {
    name: "Nhà cấp 4 mái Thái",
    slug: "nha-cap-4-mai-thai",
    type: "single-story",
    style: "thai",
    floors: 1,
    bedrooms: 3,
    bathrooms: 2,
    area: 100,
    landArea: 150,
    width: 10,
    length: 15,
    description: "Nhà cấp 4 mái Thái tiết kiệm chi phí, phù hợp vùng nông thôn",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    ],
    features: [
      "Thiết kế thoáng mát",
      "Chi phí xây dựng thấp",
      "Sân vườn rộng rãi",
      "Phù hợp người cao tuổi",
    ],
    estimatedCost: 800000000,
    designPrice: 25000000,
    popular: true,
    views: 28900,
  },
];

// ============================================================================
// FLASH SALES / KHUYẾN MÃI
// ============================================================================

export const seedFlashSales = [
  {
    title: "Giảm 30% Thiết kế kiến trúc",
    description: "Áp dụng cho thiết kế nhà phố dưới 200m²",
    serviceId: 1,
    discountPercent: 30,
    discountAmount: null,
    maxDiscount: 50000000,
    minOrderValue: 50000000,
    startTime: "2026-02-01T00:00:00Z",
    endTime: "2026-02-28T23:59:59Z",
    quantity: 50,
    usedCount: 12,
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400",
    active: true,
  },
  {
    title: "Gạch lát nền -40%",
    description: "Gạch ceramic 60x60 nhập khẩu Ý",
    productId: 101,
    discountPercent: 40,
    discountAmount: null,
    maxDiscount: null,
    minOrderValue: 10000000,
    startTime: "2026-02-04T09:00:00Z",
    endTime: "2026-02-04T21:00:00Z",
    quantity: 100,
    usedCount: 45,
    image: "https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=400",
    active: true,
  },
  {
    title: "Sơn Dulux giảm 500K",
    description: "Mua 5 thùng giảm ngay 500.000đ",
    productId: 102,
    discountPercent: null,
    discountAmount: 500000,
    maxDiscount: null,
    minOrderValue: 2500000,
    startTime: "2026-02-01T00:00:00Z",
    endTime: "2026-02-15T23:59:59Z",
    quantity: 200,
    usedCount: 89,
    image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400",
    active: true,
  },
];

// ============================================================================
// LIVESTREAMS
// ============================================================================

export const seedLivestreams = [
  {
    title: "Hướng dẫn thi công nền móng",
    description: "Kỹ sư Nguyễn Văn A chia sẻ kinh nghiệm thi công móng cọc",
    hostId: 1,
    hostName: "KTS. Nguyễn Văn A",
    hostAvatar: "https://randomuser.me/api/portraits/men/10.jpg",
    thumbnail:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
    scheduledAt: "2026-02-05T14:00:00Z",
    status: "scheduled",
    category: "construction",
    tags: ["móng cọc", "nền móng", "xây dựng"],
  },
  {
    title: "Review thiết kế nội thất Indochine",
    description:
      "Cùng xem và bình luận các mẫu thiết kế nội thất Indochine đẹp nhất",
    hostId: 2,
    hostName: "Designer Linh Phạm",
    hostAvatar: "https://randomuser.me/api/portraits/women/1.jpg",
    thumbnail:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800",
    scheduledAt: "2026-02-06T19:00:00Z",
    status: "scheduled",
    category: "interior",
    tags: ["nội thất", "Indochine", "thiết kế"],
  },
];

// ============================================================================
// BANNERS
// ============================================================================

export const seedBanners = [
  {
    title: "Tết Nguyên Đán 2026",
    subtitle: "Giảm 20% tất cả dịch vụ thiết kế",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
    link: "/promotions/tet-2026",
    backgroundColor: "#D4AF37",
    position: 1,
    active: true,
    startDate: "2026-01-15",
    endDate: "2026-02-28",
  },
  {
    title: "Dự án mới hoàn thành",
    subtitle: "Biệt thự Phú Mỹ Hưng - 500m²",
    image:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200",
    link: "/projects/biet-thu-phu-my-hung",
    backgroundColor: "#2E86AB",
    position: 2,
    active: true,
    startDate: null,
    endDate: null,
  },
  {
    title: "Đặt lịch tư vấn miễn phí",
    subtitle: "Gặp kiến trúc sư tại văn phòng",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
    link: "/consultation/free",
    backgroundColor: "#10B981",
    position: 3,
    active: true,
    startDate: null,
    endDate: null,
  },
];

// ============================================================================
// CATEGORIES
// ============================================================================

export const seedCategories = [
  // Main categories
  { name: "Thiết kế", slug: "thiet-ke", icon: "📐", type: "main", order: 1 },
  { name: "Xây dựng", slug: "xay-dung", icon: "🏗️", type: "main", order: 2 },
  { name: "Nội thất", slug: "noi-that", icon: "🛋️", type: "main", order: 3 },
  { name: "Vật liệu", slug: "vat-lieu", icon: "🧱", type: "main", order: 4 },
  { name: "Nhân công", slug: "nhan-cong", icon: "👷", type: "main", order: 5 },

  // Worker categories
  {
    name: "Thợ xây",
    slug: "tho-xay",
    icon: "🧱",
    type: "worker",
    parentSlug: "nhan-cong",
    order: 1,
  },
  {
    name: "Thợ sắt",
    slug: "tho-sat",
    icon: "⚙️",
    type: "worker",
    parentSlug: "nhan-cong",
    order: 2,
  },
  {
    name: "Thợ điện",
    slug: "tho-dien",
    icon: "⚡",
    type: "worker",
    parentSlug: "nhan-cong",
    order: 3,
  },
  {
    name: "Thợ nước",
    slug: "tho-nuoc",
    icon: "🚿",
    type: "worker",
    parentSlug: "nhan-cong",
    order: 4,
  },
  {
    name: "Thợ sơn",
    slug: "tho-son",
    icon: "🎨",
    type: "worker",
    parentSlug: "nhan-cong",
    order: 5,
  },
  {
    name: "Thợ gạch",
    slug: "tho-gach",
    icon: "🔲",
    type: "worker",
    parentSlug: "nhan-cong",
    order: 6,
  },
  {
    name: "Thợ mộc",
    slug: "tho-moc",
    icon: "🪵",
    type: "worker",
    parentSlug: "nhan-cong",
    order: 7,
  },

  // House types
  { name: "Nhà phố", slug: "nha-pho", icon: "🏠", type: "house", order: 1 },
  { name: "Biệt thự", slug: "biet-thu", icon: "🏡", type: "house", order: 2 },
  { name: "Căn hộ", slug: "can-ho", icon: "🏢", type: "house", order: 3 },
  { name: "Văn phòng", slug: "van-phong", icon: "🏛️", type: "house", order: 4 },
  { name: "Khách sạn", slug: "khach-san", icon: "🏨", type: "house", order: 5 },
  { name: "Nhà hàng", slug: "nha-hang", icon: "🍽️", type: "house", order: 6 },
];

// ============================================================================
// EXPORT ALL
// ============================================================================

export const allSeedData = {
  workers: seedWorkers,
  services: seedServices,
  houseTemplates: seedHouseTemplates,
  flashSales: seedFlashSales,
  livestreams: seedLivestreams,
  banners: seedBanners,
  categories: seedCategories,
};

export default allSeedData;
