/**
 * Company Service API
 * Handles fetching company details from backend
 * Backend: https://baotienweb.cloud/api/v1/companies
 */

import { apiFetch } from "./api";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CompanyService {
  id: number;
  name: string;
  price: string;
  description?: string;
}

export interface CompanyPortfolio {
  id: number;
  title: string;
  location: string;
  area: string;
  year: number;
  image: string;
  images?: string[];
  description?: string;
}

export interface CompanyReview {
  id: number;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  comment: string;
  images?: string[];
}

export interface CompanyProfile {
  id: number | string;
  name: string;
  slug?: string;
  logo: string;
  coverImage: string;
  rating: number;
  reviewCount: number;
  projectCount: number;
  establishedYear: number;
  location: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  specialties: string[];
  services: CompanyService[];
  portfolio: CompanyPortfolio[];
  reviews: CompanyReview[];
  verified?: boolean;
  type?: "design" | "construction" | "supplier" | "other";
}

export interface CompanyListItem {
  id: number | string;
  name: string;
  logo: string;
  rating: number;
  reviewCount: number;
  location: string;
  specialties: string[];
  verified: boolean;
  // Extended fields (may be undefined from API)
  scale?: string;
  region?: string;
  reviews?: number;
  projects?: number;
  yearEstablished?: number;
  featured?: boolean;
  featuredProjects?: { image: string; title?: string }[];
}

export interface CompanyListResponse {
  data: CompanyListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CompanyDetailResponse {
  success: boolean;
  data: CompanyProfile;
  message?: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_COMPANIES: Record<string, CompanyProfile> = {
  "1": {
    id: 1,
    name: "Công ty Thiết kế A&A",
    slug: "aa-design",
    logo: "https://ui-avatars.com/api/?name=AA&background=0066CC&color=fff&size=128",
    coverImage:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
    rating: 4.8,
    reviewCount: 256,
    projectCount: 150,
    establishedYear: 2015,
    location: "Hà Nội",
    address: "123 Nguyễn Trãi, Thanh Xuân, Hà Nội",
    phone: "0123 456 789",
    email: "contact@aanda.vn",
    website: "https://aanda.vn",
    description:
      "Công ty thiết kế kiến trúc A&A chuyên cung cấp dịch vụ thiết kế nhà ở cao cấp, biệt thự, nhà phố với phong cách hiện đại và sang trọng. Đội ngũ kiến trúc sư giàu kinh nghiệm, tư vấn nhiệt tình.",
    specialties: ["Biệt thự", "Nhà phố", "Nhà vườn", "Resort"],
    verified: true,
    type: "design",
    services: [
      { id: 1, name: "Thiết kế kiến trúc", price: "5.000.000₫/m²" },
      { id: 2, name: "Thiết kế nội thất", price: "3.000.000₫/m²" },
      { id: 3, name: "Thi công trọn gói", price: "8.000.000₫/m²" },
      { id: 4, name: "Giám sát thi công", price: "2.000.000₫/tháng" },
    ],
    portfolio: [
      {
        id: 1,
        title: "Biệt thự hiện đại 2 tầng",
        location: "Hà Nội",
        area: "250m²",
        year: 2024,
        image:
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400",
      },
      {
        id: 2,
        title: "Nhà phố 3 tầng",
        location: "TP.HCM",
        area: "180m²",
        year: 2024,
        image:
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400",
      },
      {
        id: 3,
        title: "Villa sang trọng",
        location: "Đà Nẵng",
        area: "400m²",
        year: 2023,
        image:
          "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400",
      },
      {
        id: 4,
        title: "Nhà vườn 1 tầng",
        location: "Bình Dương",
        area: "300m²",
        year: 2023,
        image:
          "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400",
      },
    ],
    reviews: [
      {
        id: 1,
        userId: "user1",
        userName: "Nguyễn Văn A",
        userAvatar:
          "https://ui-avatars.com/api/?name=A&background=4CAF50&color=fff",
        rating: 5,
        date: "15/10/2024",
        comment:
          "Đội ngũ thiết kế rất chuyên nghiệp, tư vấn tận tình. Thiết kế đẹp và phù hợp với nhu cầu gia đình.",
      },
      {
        id: 2,
        userId: "user2",
        userName: "Trần Thị B",
        userAvatar:
          "https://ui-avatars.com/api/?name=B&background=FF9800&color=fff",
        rating: 4,
        date: "20/09/2024",
        comment: "Thiết kế đẹp, thi công nhanh. Giá cả hợp lý.",
      },
      {
        id: 3,
        userId: "user3",
        userName: "Lê Văn C",
        userAvatar:
          "https://ui-avatars.com/api/?name=C&background=9C27B0&color=fff",
        rating: 5,
        date: "05/08/2024",
        comment: "Rất hài lòng với dịch vụ. Sẽ giới thiệu cho bạn bè.",
      },
    ],
  },
  "2": {
    id: 2,
    name: "Công ty Xây dựng Thành Công",
    slug: "thanh-cong-construction",
    logo: "https://ui-avatars.com/api/?name=TC&background=FF6B35&color=fff&size=128",
    coverImage:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800",
    rating: 4.6,
    reviewCount: 189,
    projectCount: 85,
    establishedYear: 2010,
    location: "TP.HCM",
    address: "456 Lê Văn Việt, Quận 9, TP.HCM",
    phone: "0987 654 321",
    email: "info@thanhcong.vn",
    website: "https://thanhcong.vn",
    description:
      "Công ty Xây dựng Thành Công chuyên thi công xây dựng nhà ở, biệt thự, nhà phố. Với hơn 10 năm kinh nghiệm, chúng tôi cam kết chất lượng và tiến độ.",
    specialties: [
      "Thi công nhà ở",
      "Biệt thự",
      "Nhà phố",
      "Công trình công nghiệp",
    ],
    verified: true,
    type: "construction",
    services: [
      { id: 1, name: "Thi công phần thô", price: "4.500.000₫/m²" },
      { id: 2, name: "Hoàn thiện nội thất", price: "3.500.000₫/m²" },
      { id: 3, name: "Xây dựng trọn gói", price: "7.500.000₫/m²" },
      { id: 4, name: "Sửa chữa cải tạo", price: "2.500.000₫/m²" },
    ],
    portfolio: [
      {
        id: 1,
        title: "Nhà phố hiện đại 4 tầng",
        location: "TP.HCM",
        area: "200m²",
        year: 2024,
        image:
          "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400",
      },
      {
        id: 2,
        title: "Biệt thự song lập",
        location: "Bình Dương",
        area: "350m²",
        year: 2024,
        image:
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
      },
    ],
    reviews: [
      {
        id: 1,
        userId: "user4",
        userName: "Phạm Minh D",
        userAvatar:
          "https://ui-avatars.com/api/?name=D&background=2196F3&color=fff",
        rating: 5,
        date: "10/11/2024",
        comment:
          "Thi công đúng tiến độ, chất lượng tốt. Đội ngũ công nhân chuyên nghiệp.",
      },
    ],
  },
  "3": {
    id: 3,
    name: "Nội thất Hoàng Gia",
    slug: "hoang-gia-interior",
    logo: "https://ui-avatars.com/api/?name=HG&background=9C27B0&color=fff&size=128",
    coverImage:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800",
    rating: 4.9,
    reviewCount: 312,
    projectCount: 200,
    establishedYear: 2012,
    location: "Đà Nẵng",
    address: "789 Nguyễn Văn Linh, Hải Châu, Đà Nẵng",
    phone: "0912 345 678",
    email: "contact@hoanggia.vn",
    website: "https://hoanggia.vn",
    description:
      "Nội thất Hoàng Gia chuyên thiết kế và thi công nội thất cao cấp. Phong cách sang trọng, đẳng cấp với vật liệu nhập khẩu.",
    specialties: [
      "Nội thất biệt thự",
      "Nội thất căn hộ",
      "Nội thất văn phòng",
      "Nội thất khách sạn",
    ],
    verified: true,
    type: "design",
    services: [
      { id: 1, name: "Thiết kế nội thất", price: "4.000.000₫/m²" },
      { id: 2, name: "Thi công nội thất", price: "5.500.000₫/m²" },
      { id: 3, name: "Trọn gói thiết kế & thi công", price: "8.500.000₫/m²" },
    ],
    portfolio: [],
    reviews: [],
  },
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get company detail by ID
 */
export async function getCompanyById(
  companyId: string | number,
): Promise<CompanyDetailResponse> {
  try {
    const response = await apiFetch<CompanyDetailResponse>(
      `/companies/${companyId}`,
    );
    return response;
  } catch (error: any) {
    console.error("[CompanyService] Error fetching company by ID:", error);
    // Return mock data for development
    const mockCompany = MOCK_COMPANIES[String(companyId)];
    if (mockCompany) {
      return { success: true, data: mockCompany };
    }
    // Default to first mock company
    return { success: true, data: MOCK_COMPANIES["1"] };
  }
}

/**
 * Get company detail by slug
 */
export async function getCompanyBySlug(
  slug: string,
): Promise<CompanyDetailResponse> {
  try {
    const response = await apiFetch<CompanyDetailResponse>(
      `/companies/slug/${slug}`,
    );
    return response;
  } catch (error: any) {
    console.error("[CompanyService] Error fetching company by slug:", error);
    // Find in mock data by slug
    const mockCompany = Object.values(MOCK_COMPANIES).find(
      (c) => c.slug === slug,
    );
    if (mockCompany) {
      return { success: true, data: mockCompany };
    }
    return { success: true, data: MOCK_COMPANIES["1"] };
  }
}

/**
 * Get list of companies
 */
export async function getCompanies(params?: {
  page?: number;
  limit?: number;
  type?: string;
  location?: string;
  search?: string;
}): Promise<CompanyListResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.type) queryParams.append("type", params.type);
    if (params?.location) queryParams.append("location", params.location);
    if (params?.search) queryParams.append("search", params.search);

    const response = await apiFetch<CompanyListResponse>(
      `/companies?${queryParams}`,
    );
    return response;
  } catch (error: any) {
    console.error("[CompanyService] Error fetching companies:", error);
    // Return mock list
    const mockList: CompanyListItem[] = Object.values(MOCK_COMPANIES).map(
      (c) => ({
        id: c.id,
        name: c.name,
        logo: c.logo,
        rating: c.rating,
        reviewCount: c.reviewCount,
        location: c.location,
        specialties: c.specialties,
        verified: c.verified || false,
      }),
    );
    return {
      data: mockList,
      meta: { total: mockList.length, page: 1, limit: 10, totalPages: 1 },
    };
  }
}

/**
 * Get list of design companies specifically
 */
export async function getDesignCompanies(params?: {
  page?: number;
  limit?: number;
  location?: string;
  search?: string;
}): Promise<CompanyListResponse> {
  return getCompanies({
    ...params,
    type: "design",
  });
}

/**
 * Get list of construction companies specifically
 */
export async function getConstructionCompanies(params?: {
  page?: number;
  limit?: number;
  location?: string;
  search?: string;
}): Promise<CompanyListResponse> {
  return getCompanies({
    ...params,
    type: "construction",
  });
}

/**
 * Get list of interior design companies specifically
 */
export async function getInteriorCompanies(params?: {
  page?: number;
  limit?: number;
  location?: string;
  search?: string;
}): Promise<CompanyListResponse> {
  return getCompanies({
    ...params,
    type: "design",
  });
}

export { MOCK_COMPANIES };
