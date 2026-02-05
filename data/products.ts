/**
 * Products Data Types - Production
 * Data from API only - no mock/demo data
 * Cleaned for production
 */

// Category types for construction industry
export type ProductCategory =
  | "villa" // Biệt thự
  | "interior" // Nội thất
  | "materials" // Vật liệu xây dựng
  | "architecture" // Thiết kế kiến trúc
  | "construction" // Thi công
  | "consultation" // Tư vấn
  | "furniture" // Đồ nội thất
  | "lighting" // Thiết bị chiếu sáng
  | "sanitary"; // Thiết bị vệ sinh

// Pricing type
export type PriceType = "fixed" | "contact";

// Seller/Company info
export interface Seller {
  id: string;
  name: string;
  type: "individual" | "company";
  logo?: any;
  rating?: number;
  verified?: boolean;
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
  yearsInBusiness?: number;
}

export type Product = {
  id: string;
  name: string;
  price: number;
  priceType?: PriceType;
  image: any;
  description?: string;
  category?: ProductCategory | string;
  categoryId?: string;
  brand?: string;
  type?: string;
  discountPercent?: number;
  flashSale?: boolean;
  stock?: number;
  rating?: number;
  reviewCount?: number;
  freeShipping?: boolean;
  warranty?: string;
  origin?: string;
  tags?: string[];
  status?:
    | "DRAFT"
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "ACTIVE"
    | "INACTIVE";
  isBestseller?: boolean;
  isNew?: boolean;
  sold?: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  seller?: Seller;
  soldCount?: number;
  location?: string;
  // New Shopee-style fields
  deliveryDays?: string; // e.g., "2-3 ngày", "3-5 ngày"
  voucher?: string; // e.g., "2.2", "SALE"
  isLive?: boolean; // Live selling badge
  ratingCount?: number; // Number of ratings
};

// Empty sellers array - data from API only
export const SELLERS: Seller[] = [];

// Sample products for search - can be enhanced from API
export const PRODUCTS: Product[] = [
  // ============================================
  // PHONG THỦY - Feng Shui Category
  // ============================================
  {
    id: "fengshui-001",
    name: "Tư Vấn Phong Thủy Nhà Ở",
    price: 5000000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    },
    description:
      "Dịch vụ tư vấn phong thủy nhà ở chuyên nghiệp. Xem hướng nhà, bố trí nội thất, hóa giải xung khắc theo bát trạch.",
    category: "consultation",
    brand: "ThietKeResort",
    rating: 4.9,
    reviewCount: 256,
    tags: [
      "phong thủy",
      "phong thuỷ",
      "tư vấn",
      "nhà ở",
      "bát trạch",
      "hướng nhà",
      "feng shui",
    ],
    isNew: true,
    isBestseller: true,
    status: "ACTIVE",
  },
  {
    id: "fengshui-002",
    name: "Thiết Kế Nhà Theo Phong Thủy",
    price: 80000000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
    },
    description:
      "Thiết kế kiến trúc nhà ở kết hợp phong thủy. Tối ưu hướng nhà, vị trí phòng ngủ, bếp, bàn thờ theo ngũ hành.",
    category: "architecture",
    brand: "ThietKeResort",
    rating: 4.8,
    reviewCount: 189,
    tags: [
      "phong thủy",
      "phong thuỷ",
      "thiết kế",
      "kiến trúc",
      "ngũ hành",
      "feng shui",
    ],
    isNew: true,
    status: "ACTIVE",
  },
  {
    id: "fengshui-003",
    name: "Vật Phẩm Phong Thủy - Tỳ Hưu",
    price: 2500000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
    },
    description:
      "Tỳ Hưu đá phong thủy chiêu tài lộc, hóa giải sát khí. Chất liệu đá tự nhiên, kích thước phù hợp bàn làm việc.",
    category: "furniture",
    brand: "PhongThuyViet",
    rating: 4.7,
    reviewCount: 320,
    tags: [
      "phong thủy",
      "phong thuỷ",
      "tỳ hưu",
      "vật phẩm",
      "chiêu tài",
      "feng shui",
    ],
    isBestseller: true,
    status: "ACTIVE",
    stock: 50,
  },
  {
    id: "fengshui-004",
    name: "Cây Phong Thủy - Kim Tiền",
    price: 350000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400",
    },
    description:
      "Cây kim tiền phong thủy hợp mệnh Kim, mang lại tài lộc và may mắn. Cây dễ chăm sóc, phù hợp trong nhà.",
    category: "furniture",
    brand: "GreenFengShui",
    rating: 4.6,
    reviewCount: 450,
    tags: [
      "phong thủy",
      "phong thuỷ",
      "cây phong thủy",
      "kim tiền",
      "mệnh kim",
      "feng shui",
    ],
    isNew: true,
    status: "ACTIVE",
    stock: 100,
  },
  {
    id: "fengshui-005",
    name: "Xem Tuổi Làm Nhà & Động Thổ",
    price: 3000000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400",
    },
    description:
      "Dịch vụ xem tuổi làm nhà, chọn ngày động thổ, ngày cất nóc theo phong thủy. Tính hợp tuổi gia chủ và hướng nhà.",
    category: "consultation",
    brand: "ThietKeResort",
    rating: 4.9,
    reviewCount: 178,
    tags: [
      "phong thủy",
      "phong thuỷ",
      "xem tuổi",
      "động thổ",
      "cất nóc",
      "ngày tốt",
      "feng shui",
    ],
    status: "ACTIVE",
  },
  // ============================================
  // BIỆT THỰ - Villa Category
  // ============================================
  {
    id: "villa-001",
    name: "Thiết kế Biệt thự Hiện đại 3 Tầng",
    price: 150000000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400",
    },
    description:
      "Thiết kế biệt thự hiện đại 3 tầng với phong cách tối giản, tận dụng ánh sáng tự nhiên. Diện tích 200-300m².",
    category: "villa",
    brand: "ThietKeResort",
    rating: 4.9,
    reviewCount: 128,
    tags: ["biệt thự", "hiện đại", "3 tầng", "tối giản"],
    isNew: true,
    status: "ACTIVE",
  },
  {
    id: "villa-002",
    name: "Biệt thự Tân Cổ Điển Châu Âu",
    price: 280000000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400",
    },
    description:
      "Thiết kế biệt thự phong cách tân cổ điển Châu Âu, sang trọng và đẳng cấp. Diện tích 350-500m².",
    category: "villa",
    brand: "ThietKeResort",
    rating: 4.8,
    reviewCount: 95,
    tags: ["biệt thự", "cổ điển", "châu âu", "sang trọng"],
    isBestseller: true,
    status: "ACTIVE",
  },
  {
    id: "villa-003",
    name: "Biệt thự Vườn Nhiệt Đới",
    price: 200000000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400",
    },
    description:
      "Biệt thự hòa mình với thiên nhiên, sân vườn nhiệt đới xanh mát. Phù hợp vùng ngoại ô, nghỉ dưỡng.",
    category: "villa",
    brand: "ThietKeResort",
    rating: 4.7,
    reviewCount: 72,
    tags: ["biệt thự", "sân vườn", "nhiệt đới", "nghỉ dưỡng"],
    status: "ACTIVE",
  },

  // ============================================
  // NỘI THẤT - Interior Category
  // ============================================
  {
    id: "interior-001",
    name: "Thiết kế Nội thất Phòng Khách Hiện đại",
    price: 45000000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400",
    },
    description:
      "Thiết kế nội thất phòng khách phong cách hiện đại, tối giản với tông màu trung tính.",
    category: "interior",
    brand: "InteriorPro",
    rating: 4.8,
    reviewCount: 156,
    tags: ["nội thất", "phòng khách", "hiện đại", "tối giản"],
    isBestseller: true,
    status: "ACTIVE",
  },
  {
    id: "interior-002",
    name: "Nội thất Phòng Ngủ Luxury",
    price: 65000000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400",
    },
    description:
      "Thiết kế nội thất phòng ngủ cao cấp, sang trọng với chất liệu gỗ tự nhiên và vải cao cấp.",
    category: "interior",
    brand: "InteriorPro",
    rating: 4.9,
    reviewCount: 89,
    tags: ["nội thất", "phòng ngủ", "luxury", "gỗ tự nhiên"],
    isNew: true,
    status: "ACTIVE",
  },

  // ============================================
  // VẬT LIỆU XÂY DỰNG - Materials Category
  // ============================================
  {
    id: "material-001",
    name: "Xi Măng Hà Tiên PCB40",
    price: 115000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=400",
    },
    description:
      "Xi măng Hà Tiên PCB40, chất lượng cao, phù hợp cho công trình dân dụng và công nghiệp.",
    category: "materials",
    brand: "Hà Tiên",
    rating: 4.7,
    reviewCount: 342,
    tags: ["xi măng", "vật liệu", "xây dựng"],
    status: "ACTIVE",
    stock: 5000,
  },
  {
    id: "material-002",
    name: "Gạch Men Viglacera 60x60",
    price: 185000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=400",
    },
    description:
      "Gạch men Viglacera 60x60cm, bề mặt bóng, chống trơn trượt, phù hợp sàn nhà và văn phòng.",
    category: "materials",
    brand: "Viglacera",
    rating: 4.6,
    reviewCount: 215,
    tags: ["gạch men", "Viglacera", "lát sàn"],
    discountPercent: 15,
    flashSale: true,
    status: "ACTIVE",
    stock: 2000,
  },
  {
    id: "material-003",
    name: "Sơn Dulux Nội Thất Cao Cấp",
    price: 850000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400",
    },
    description:
      "Sơn Dulux nội thất cao cấp, chống nấm mốc, dễ lau chùi, bảo hành 5 năm.",
    category: "materials",
    brand: "Dulux",
    rating: 4.8,
    reviewCount: 478,
    tags: ["sơn", "Dulux", "nội thất"],
    status: "ACTIVE",
    stock: 800,
  },

  // ============================================
  // THI CÔNG - Construction Category
  // ============================================
  {
    id: "construction-001",
    name: "Thi công Xây dựng Trọn gói",
    price: 0,
    priceType: "contact",
    image: {
      uri: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400",
    },
    description:
      "Dịch vụ thi công xây dựng trọn gói từ móng đến hoàn thiện. Đội ngũ kỹ sư và thợ lành nghề.",
    category: "construction",
    brand: "ThietKeResort",
    rating: 4.9,
    reviewCount: 67,
    tags: ["thi công", "xây dựng", "trọn gói"],
    isBestseller: true,
    status: "ACTIVE",
  },
  {
    id: "construction-002",
    name: "Hoàn thiện Nội thất Chuyên nghiệp",
    price: 0,
    priceType: "contact",
    image: {
      uri: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400",
    },
    description:
      "Dịch vụ hoàn thiện nội thất từ A-Z, bao gồm trần thạch cao, sơn, ốp gạch, lắp đặt thiết bị.",
    category: "construction",
    brand: "ThietKeResort",
    rating: 4.8,
    reviewCount: 93,
    tags: ["thi công", "hoàn thiện", "nội thất"],
    status: "ACTIVE",
  },

  // ============================================
  // TƯ VẤN - Consultation Category
  // ============================================
  {
    id: "consult-001",
    name: "Tư vấn Phong thủy Công trình",
    price: 5000000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    },
    description:
      "Dịch vụ tư vấn phong thủy cho công trình xây dựng, bố trí nội thất theo nguyên tắc cân bằng.",
    category: "consultation",
    brand: "ThietKeResort",
    rating: 4.7,
    reviewCount: 45,
    tags: ["tư vấn", "phong thủy", "xây dựng"],
    status: "ACTIVE",
  },
  {
    id: "consult-002",
    name: "Giám sát Chất lượng Công trình",
    price: 0,
    priceType: "contact",
    image: {
      uri: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400",
    },
    description:
      "Dịch vụ giám sát chất lượng thi công, đảm bảo tiến độ và chất lượng công trình theo tiêu chuẩn.",
    category: "consultation",
    brand: "ThietKeResort",
    rating: 4.9,
    reviewCount: 38,
    tags: ["giám sát", "chất lượng", "thi công"],
    isNew: true,
    status: "ACTIVE",
  },

  // ============================================
  // THIẾT BỊ VỆ SINH - Sanitary Category
  // ============================================
  {
    id: "sanitary-001",
    name: "Bồn Cầu TOTO 1 Khối",
    price: 8500000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400",
    },
    description:
      "Bồn cầu TOTO 1 khối, công nghệ xả xoáy Tornado, tiết kiệm nước, dễ vệ sinh.",
    category: "sanitary",
    brand: "TOTO",
    rating: 4.9,
    reviewCount: 256,
    tags: ["bồn cầu", "TOTO", "thiết bị vệ sinh"],
    isBestseller: true,
    status: "ACTIVE",
    stock: 150,
  },
  {
    id: "sanitary-002",
    name: "Vòi Sen Grohe Euphoria",
    price: 4200000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400",
    },
    description:
      "Vòi sen Grohe Euphoria, công nghệ DreamSpray cho dòng nước đều, tiết kiệm nước 50%.",
    category: "sanitary",
    brand: "Grohe",
    rating: 4.8,
    reviewCount: 189,
    tags: ["vòi sen", "Grohe", "thiết bị vệ sinh"],
    discountPercent: 20,
    flashSale: true,
    status: "ACTIVE",
    stock: 80,
  },

  // ============================================
  // ĐÈN CHIẾU SÁNG - Lighting Category
  // ============================================
  {
    id: "lighting-001",
    name: "Đèn Chùm Pha Lê Châu Âu",
    price: 12500000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400",
    },
    description:
      "Đèn chùm pha lê phong cách Châu Âu cổ điển, sang trọng, phù hợp phòng khách và sảnh biệt thự.",
    category: "lighting",
    brand: "Crystal Light",
    rating: 4.9,
    reviewCount: 87,
    tags: ["đèn chùm", "pha lê", "châu âu", "sang trọng", "chiếu sáng"],
    isBestseller: true,
    status: "ACTIVE",
    stock: 25,
  },
  {
    id: "lighting-002",
    name: "Đèn LED Panel 600x600",
    price: 650000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400",
    },
    description:
      "Đèn LED Panel âm trần 600x600mm, ánh sáng trắng 6500K, tiết kiệm điện 80%.",
    category: "lighting",
    brand: "Rạng Đông",
    rating: 4.7,
    reviewCount: 234,
    tags: ["đèn LED", "panel", "âm trần", "tiết kiệm điện"],
    discountPercent: 10,
    status: "ACTIVE",
    stock: 500,
  },
  {
    id: "lighting-003",
    name: "Đèn Thả Bàn Ăn Modern",
    price: 2800000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400",
    },
    description:
      "Đèn thả bàn ăn phong cách hiện đại, chất liệu nhôm cao cấp, điều chỉnh độ cao linh hoạt.",
    category: "lighting",
    brand: "Nordic Design",
    rating: 4.6,
    reviewCount: 156,
    tags: ["đèn thả", "bàn ăn", "hiện đại", "nordic"],
    isNew: true,
    status: "ACTIVE",
    stock: 120,
  },

  // ============================================
  // ĐỒ NỘI THẤT - Furniture Category
  // ============================================
  {
    id: "furniture-001",
    name: "Sofa Góc Da Thật Cao Cấp",
    price: 35000000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
    },
    description:
      "Sofa góc chữ L bọc da thật Ý, khung gỗ sồi tự nhiên, đệm cao su non êm ái.",
    category: "furniture",
    brand: "Italian Home",
    rating: 4.9,
    reviewCount: 178,
    tags: ["sofa", "da thật", "cao cấp", "phòng khách", "nội thất"],
    isBestseller: true,
    status: "ACTIVE",
    stock: 15,
  },
  {
    id: "furniture-002",
    name: "Giường Ngủ Gỗ Óc Chó",
    price: 28000000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400",
    },
    description:
      "Giường ngủ gỗ óc chó tự nhiên 100%, kích thước 1m8x2m, thiết kế hiện đại.",
    category: "furniture",
    brand: "Nội Thất Hòa Phát",
    rating: 4.8,
    reviewCount: 95,
    tags: ["giường ngủ", "gỗ óc chó", "phòng ngủ", "nội thất"],
    isNew: true,
    status: "ACTIVE",
    stock: 30,
  },
  {
    id: "furniture-003",
    name: "Bàn Ăn 6 Ghế Gỗ Sồi",
    price: 18500000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400",
    },
    description:
      "Bộ bàn ăn 6 ghế gỗ sồi Mỹ, mặt bàn oval, ghế bọc vải nỉ cao cấp chống bám bụi.",
    category: "furniture",
    brand: "Woodland",
    rating: 4.7,
    reviewCount: 124,
    tags: ["bàn ăn", "gỗ sồi", "phòng ăn", "nội thất"],
    discountPercent: 15,
    flashSale: true,
    status: "ACTIVE",
    stock: 20,
  },
  {
    id: "furniture-004",
    name: "Tủ Quần Áo 4 Cánh Cửa Lùa",
    price: 22000000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    },
    description:
      "Tủ quần áo 4 cánh cửa lùa, gỗ MDF phủ Melamine chống xước, gương toàn thân.",
    category: "furniture",
    brand: "An Cường",
    rating: 4.6,
    reviewCount: 89,
    tags: ["tủ quần áo", "cửa lùa", "phòng ngủ", "nội thất"],
    status: "ACTIVE",
    stock: 40,
  },

  // ============================================
  // KIẾN TRÚC - Architecture Category
  // ============================================
  {
    id: "architecture-001",
    name: "Thiết Kế Nhà Phố 4 Tầng",
    price: 60000000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
    },
    description:
      "Thiết kế nhà phố 4 tầng hiện đại, mặt tiền 5m, bao gồm hồ sơ kiến trúc và kết cấu.",
    category: "architecture",
    brand: "ThietKeResort",
    rating: 4.8,
    reviewCount: 156,
    tags: ["nhà phố", "thiết kế", "kiến trúc", "4 tầng", "hiện đại"],
    isBestseller: true,
    status: "ACTIVE",
  },
  {
    id: "architecture-002",
    name: "Thiết Kế Căn Hộ Chung Cư",
    price: 25000000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
    },
    description:
      "Thiết kế nội thất căn hộ chung cư 70-100m², phong cách tối giản, tối ưu không gian.",
    category: "architecture",
    brand: "ThietKeResort",
    rating: 4.7,
    reviewCount: 203,
    tags: ["căn hộ", "chung cư", "thiết kế", "nội thất", "tối giản"],
    isNew: true,
    status: "ACTIVE",
  },
  {
    id: "architecture-003",
    name: "Thiết Kế Văn Phòng Công Ty",
    price: 45000000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
    },
    description:
      "Thiết kế văn phòng làm việc hiện đại, open space, phòng họp và khu vực tiếp khách.",
    category: "architecture",
    brand: "Office Design Pro",
    rating: 4.8,
    reviewCount: 78,
    tags: ["văn phòng", "thiết kế", "office", "công ty", "hiện đại"],
    status: "ACTIVE",
  },

  // ============================================
  // VẬT LIỆU BỔ SUNG - More Materials
  // ============================================
  {
    id: "material-004",
    name: "Gỗ Ốp Tường Composite",
    price: 450000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    },
    description:
      "Gỗ nhựa composite ốp tường, chống nước, chống mối mọt, vân gỗ tự nhiên.",
    category: "materials",
    brand: "WPC Vietnam",
    rating: 4.6,
    reviewCount: 167,
    tags: ["gỗ ốp tường", "composite", "vật liệu", "chống nước"],
    isNew: true,
    status: "ACTIVE",
    stock: 3000,
  },
  {
    id: "material-005",
    name: "Đá Granite Nhập Khẩu",
    price: 1200000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=400",
    },
    description:
      "Đá Granite nhập khẩu Ấn Độ, độ cứng cao, phù hợp làm mặt bếp và sàn nhà.",
    category: "materials",
    brand: "India Stone",
    rating: 4.8,
    reviewCount: 134,
    tags: ["đá granite", "nhập khẩu", "mặt bếp", "sàn nhà", "vật liệu"],
    isBestseller: true,
    status: "ACTIVE",
    stock: 500,
  },
  {
    id: "material-006",
    name: "Sàn Gỗ Công Nghiệp 12mm",
    price: 320000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=400",
    },
    description:
      "Sàn gỗ công nghiệp 12mm, cốt HDF chống ẩm, bảo hành 15 năm, lắp đặt dễ dàng.",
    category: "materials",
    brand: "Kronoswiss",
    rating: 4.7,
    reviewCount: 289,
    tags: ["sàn gỗ", "công nghiệp", "HDF", "lát sàn", "vật liệu"],
    discountPercent: 20,
    flashSale: true,
    status: "ACTIVE",
    stock: 2500,
  },

  // ============================================
  // DỊCH VỤ THI CÔNG BỔ SUNG
  // ============================================
  {
    id: "construction-003",
    name: "Cải Tạo Sửa Chữa Nhà Ở",
    price: 0,
    priceType: "contact",
    image: {
      uri: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400",
    },
    description:
      "Dịch vụ cải tạo, sửa chữa nhà ở trọn gói: chống thấm, sơn lại, thay cửa, nâng cấp điện nước.",
    category: "construction",
    brand: "ThietKeResort",
    rating: 4.7,
    reviewCount: 145,
    tags: ["cải tạo", "sửa chữa", "nhà ở", "thi công", "chống thấm"],
    status: "ACTIVE",
  },
  {
    id: "construction-004",
    name: "Xây Dựng Nhà Xưởng",
    price: 0,
    priceType: "contact",
    image: {
      uri: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400",
    },
    description:
      "Thiết kế và thi công nhà xưởng, kho bãi, nhà kho công nghiệp. Kết cấu thép tiền chế.",
    category: "construction",
    brand: "Steel Construction",
    rating: 4.8,
    reviewCount: 56,
    tags: ["nhà xưởng", "kho bãi", "kết cấu thép", "thi công", "công nghiệp"],
    isNew: true,
    status: "ACTIVE",
  },

  // ============================================
  // THIẾT BỊ VỆ SINH BỔ SUNG
  // ============================================
  {
    id: "sanitary-003",
    name: "Lavabo Đặt Bàn Caesar",
    price: 3200000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400",
    },
    description:
      "Lavabo đặt bàn Caesar, thiết kế hiện đại, men sứ cao cấp chống bám bẩn.",
    category: "sanitary",
    brand: "Caesar",
    rating: 4.7,
    reviewCount: 178,
    tags: ["lavabo", "Caesar", "thiết bị vệ sinh", "chậu rửa"],
    status: "ACTIVE",
    stock: 200,
  },
  {
    id: "sanitary-004",
    name: "Bồn Tắm Đứng Kính Cường Lực",
    price: 15000000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400",
    },
    description:
      "Cabin tắm đứng kính cường lực 10mm, khung inox 304, kích thước 90x90cm.",
    category: "sanitary",
    brand: "Euroking",
    rating: 4.8,
    reviewCount: 134,
    tags: ["bồn tắm", "cabin tắm", "kính cường lực", "thiết bị vệ sinh"],
    isNew: true,
    isBestseller: true,
    status: "ACTIVE",
    stock: 50,
  },

  // ============================================
  // TƯ VẤN BỔ SUNG
  // ============================================
  {
    id: "consult-003",
    name: "Lập Dự Toán Chi Phí Xây Dựng",
    price: 3000000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400",
    },
    description:
      "Dịch vụ lập dự toán chi phí xây dựng chi tiết, bao gồm vật tư, nhân công, máy móc.",
    category: "consultation",
    brand: "ThietKeResort",
    rating: 4.8,
    reviewCount: 89,
    tags: ["dự toán", "chi phí", "xây dựng", "tư vấn", "ngân sách"],
    status: "ACTIVE",
  },
  {
    id: "consult-004",
    name: "Tư Vấn Xin Giấy Phép Xây Dựng",
    price: 8000000,
    priceType: "fixed",
    image: {
      uri: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400",
    },
    description:
      "Hỗ trợ hoàn thiện hồ sơ và xin giấy phép xây dựng, giấy phép sửa chữa nhà ở.",
    category: "consultation",
    brand: "Legal Construction",
    rating: 4.6,
    reviewCount: 67,
    tags: ["giấy phép", "xây dựng", "tư vấn", "pháp lý", "hồ sơ"],
    isNew: true,
    status: "ACTIVE",
  },
];

// Helper functions
export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

export function getFlashSaleProducts(): Product[] {
  return PRODUCTS.filter((p) => p.flashSale);
}

/**
 * Chuẩn hóa chuỗi tiếng Việt để tìm kiếm
 * - Chuyển thành chữ thường
 * - Chuẩn hóa dấu tiếng Việt (ủy vs ủỷ, ui vs ùi, etc.)
 */
export function normalizeVietnamese(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD") // Tách dấu thành ký tự riêng
    .replace(/[\u0300-\u036f]/g, "") // Xóa dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .trim();
}

/**
 * Tìm kiếm sản phẩm với hỗ trợ tiếng Việt
 * - Tìm trong: name, description, category, brand, tags
 * - Hỗ trợ tìm không dấu
 */
export function searchProducts(query: string): Product[] {
  if (!query || !query.trim()) return [];

  const normalizedQuery = normalizeVietnamese(query);
  const originalQuery = query.toLowerCase().trim();

  return PRODUCTS.filter((p) => {
    // Tìm trong tên
    if (
      p.name.toLowerCase().includes(originalQuery) ||
      normalizeVietnamese(p.name).includes(normalizedQuery)
    ) {
      return true;
    }

    // Tìm trong mô tả
    if (
      p.description &&
      (p.description.toLowerCase().includes(originalQuery) ||
        normalizeVietnamese(p.description).includes(normalizedQuery))
    ) {
      return true;
    }

    // Tìm trong danh mục
    if (
      p.category &&
      (p.category.toLowerCase().includes(originalQuery) ||
        normalizeVietnamese(p.category).includes(normalizedQuery))
    ) {
      return true;
    }

    // Tìm trong thương hiệu
    if (
      p.brand &&
      (p.brand.toLowerCase().includes(originalQuery) ||
        normalizeVietnamese(p.brand).includes(normalizedQuery))
    ) {
      return true;
    }

    // Tìm trong tags
    if (
      p.tags &&
      p.tags.some(
        (tag) =>
          tag.toLowerCase().includes(originalQuery) ||
          normalizeVietnamese(tag).includes(normalizedQuery),
      )
    ) {
      return true;
    }

    return false;
  });
}
