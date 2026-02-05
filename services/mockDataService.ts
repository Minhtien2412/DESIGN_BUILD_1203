/**
 * Mock Data Service
 * Provides fallback data when BE endpoints are not available
 * Remove or disable when real APIs are deployed
 */

// ============================================
// HOME SCREEN DATA
// ============================================

export const mockFeaturedServices = [
  {
    id: "1",
    name: "Thiết kế kiến trúc",
    label: "Thiết kế kiến trúc",
    icon: "https://cdn-icons-png.flaticon.com/512/1048/1048944.png",
    route: "/services/architecture",
    description: "Thiết kế nhà ở, biệt thự, resort",
    price: "Từ 150.000đ/m²",
  },
  {
    id: "2",
    name: "Thiết kế nội thất",
    label: "Thiết kế nội thất",
    icon: "https://cdn-icons-png.flaticon.com/512/2271/2271046.png",
    route: "/services/interior",
    description: "Nội thất cao cấp, hiện đại",
    price: "Từ 200.000đ/m²",
  },
  {
    id: "3",
    name: "Thi công xây dựng",
    label: "Thi công xây dựng",
    icon: "https://cdn-icons-png.flaticon.com/512/1689/1689535.png",
    route: "/services/construction",
    description: "Xây dựng trọn gói",
    price: "Liên hệ báo giá",
  },
  {
    id: "4",
    name: "Cải tạo sửa chữa",
    label: "Cải tạo sửa chữa",
    icon: "https://cdn-icons-png.flaticon.com/512/4264/4264901.png",
    route: "/services/renovation",
    description: "Sửa chữa, nâng cấp",
    price: "Từ 1.500.000đ/m²",
  },
  {
    id: "5",
    name: "Tư vấn phong thủy",
    label: "Tư vấn phong thủy",
    icon: "https://cdn-icons-png.flaticon.com/512/2942/2942037.png",
    route: "/services/fengshui",
    description: "Phong thủy nhà ở, văn phòng",
    price: "Từ 2.000.000đ/lần",
  },
  {
    id: "6",
    name: "Thiết kế cảnh quan",
    label: "Thiết kế cảnh quan",
    icon: "https://cdn-icons-png.flaticon.com/512/628/628283.png",
    route: "/services/landscape",
    description: "Sân vườn, tiểu cảnh",
    price: "Từ 100.000đ/m²",
  },
];

export const mockBanners = [
  {
    id: "1",
    title: "Khuyến mãi tháng 1",
    subtitle: "Giảm 20% thiết kế nội thất",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    route: "/promotions/january",
    backgroundColor: "#FF6B35",
  },
  {
    id: "2",
    title: "Dự án mới",
    subtitle: "Resort Phú Quốc đã hoàn thành",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
    route: "/projects/phu-quoc-resort",
    backgroundColor: "#2E86AB",
  },
  {
    id: "3",
    title: "Tư vấn miễn phí",
    subtitle: "Đăng ký ngay hôm nay",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
    route: "/consultation/free",
    backgroundColor: "#A23B72",
  },
];

export const mockVideos = [
  {
    id: "1",
    title: "Biệt thự hiện đại 3 tầng",
    thumbnail:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400",
    duration: "12:45",
    views: 15420,
    videoUrl: "https://www.youtube.com/watch?v=example1",
  },
  {
    id: "2",
    title: "Nội thất phòng khách sang trọng",
    thumbnail:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400",
    duration: "8:30",
    views: 8932,
    videoUrl: "https://www.youtube.com/watch?v=example2",
  },
  {
    id: "3",
    title: "Quy trình thi công xây dựng",
    thumbnail:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400",
    duration: "15:20",
    views: 21056,
    videoUrl: "https://www.youtube.com/watch?v=example3",
  },
  {
    id: "4",
    title: "Thiết kế sân vườn đẹp",
    thumbnail:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    duration: "10:15",
    views: 12340,
    videoUrl: "https://www.youtube.com/watch?v=example4",
  },
];

export const mockNews = [
  {
    id: "1",
    title: "Xu hướng thiết kế nhà 2026",
    summary:
      "Những xu hướng thiết kế nhà ở được dự đoán sẽ thịnh hành trong năm 2026...",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
    date: "2026-01-28",
    category: "Xu hướng",
    author: "Admin",
  },
  {
    id: "2",
    title: "Cách chọn vật liệu xây dựng",
    summary:
      "Hướng dẫn chi tiết cách lựa chọn vật liệu xây dựng chất lượng, tiết kiệm...",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400",
    date: "2026-01-25",
    category: "Kiến thức",
    author: "Kiến trúc sư Minh",
  },
  {
    id: "3",
    title: "Phong thủy phòng ngủ",
    summary: "Những nguyên tắc phong thủy cần biết khi thiết kế phòng ngủ...",
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400",
    date: "2026-01-22",
    category: "Phong thủy",
    author: "Thầy Hùng",
  },
];

export const mockFlashSales = [
  {
    id: "1",
    name: "Gói thiết kế căn hộ",
    originalPrice: 15000000,
    salePrice: 9900000,
    discount: 34,
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=300",
    soldCount: 45,
    totalStock: 100,
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    name: "Tư vấn phong thủy online",
    originalPrice: 3000000,
    salePrice: 1500000,
    discount: 50,
    image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=300",
    soldCount: 78,
    totalStock: 100,
    endTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    name: "Gói render 3D nội thất",
    originalPrice: 8000000,
    salePrice: 4990000,
    discount: 38,
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=300",
    soldCount: 23,
    totalStock: 50,
    endTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
  },
];

// ============================================
// COMMUNITY FEED
// ============================================

export const mockCommunityFeed = [
  {
    id: "1",
    type: "post",
    author: {
      id: "1",
      name: "Kiến trúc sư Minh",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      verified: true,
    },
    content:
      "Vừa hoàn thành dự án biệt thự tại Đà Lạt. Concept thiên nhiên hòa quyện với kiến trúc hiện đại.",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600",
    ],
    likes: 234,
    comments: 45,
    shares: 12,
    createdAt: "2026-01-29T10:30:00Z",
  },
  {
    id: "2",
    type: "article",
    author: {
      id: "2",
      name: "Nội thất Việt",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      verified: true,
    },
    title: "5 mẹo decor phòng khách nhỏ",
    content:
      "Làm thế nào để phòng khách nhỏ trông rộng rãi hơn? Bài viết chia sẻ 5 mẹo đơn giản...",
    thumbnail:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600",
    readTime: 5,
    likes: 189,
    comments: 32,
    createdAt: "2026-01-28T14:00:00Z",
  },
  {
    id: "3",
    type: "question",
    author: {
      id: "3",
      name: "Nguyễn Văn A",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
      verified: false,
    },
    content:
      "Mọi người cho em hỏi, xây nhà 2 tầng diện tích 100m2 thì chi phí khoảng bao nhiêu ạ?",
    tags: ["xây dựng", "chi phí", "nhà 2 tầng"],
    answers: 15,
    likes: 45,
    createdAt: "2026-01-28T09:15:00Z",
  },
];

// ============================================
// CRM DATA
// ============================================

export const mockCrmLeads = [
  {
    id: "1",
    name: "Trần Văn B",
    email: "tranvanb@email.com",
    phone: "0901234567",
    source: "Website",
    status: "new",
    value: 50000000,
    assignedTo: "Nhân viên A",
    createdAt: "2026-01-29T08:00:00Z",
    notes: "Quan tâm thiết kế biệt thự",
  },
  {
    id: "2",
    name: "Lê Thị C",
    email: "lethic@email.com",
    phone: "0907654321",
    source: "Facebook",
    status: "contacted",
    value: 30000000,
    assignedTo: "Nhân viên B",
    createdAt: "2026-01-28T15:30:00Z",
    notes: "Cần tư vấn nội thất căn hộ",
  },
  {
    id: "3",
    name: "Phạm Văn D",
    email: "phamvand@email.com",
    phone: "0912345678",
    source: "Referral",
    status: "qualified",
    value: 120000000,
    assignedTo: "Nhân viên A",
    createdAt: "2026-01-27T10:00:00Z",
    notes: "Dự án resort 500m2",
  },
];

export const mockCrmClients = [
  {
    id: "1",
    name: "Công ty ABC",
    email: "contact@abc.com",
    phone: "0281234567",
    type: "business",
    totalProjects: 3,
    totalValue: 500000000,
    status: "active",
    address: "123 Nguyễn Huệ, Q1, TP.HCM",
  },
  {
    id: "2",
    name: "Nguyễn Văn E",
    email: "nguyenvane@email.com",
    phone: "0909876543",
    type: "individual",
    totalProjects: 1,
    totalValue: 80000000,
    status: "active",
    address: "456 Lê Lợi, Q3, TP.HCM",
  },
];

export const mockCrmDeals = [
  {
    id: "1",
    title: "Thiết kế biệt thự Thảo Điền",
    client: "Công ty ABC",
    value: 150000000,
    stage: "negotiation",
    probability: 70,
    expectedCloseDate: "2026-02-15",
    assignedTo: "Sales Manager",
  },
  {
    id: "2",
    title: "Nội thất căn hộ Vinhomes",
    client: "Nguyễn Văn E",
    value: 80000000,
    stage: "proposal",
    probability: 50,
    expectedCloseDate: "2026-02-28",
    assignedTo: "Nhân viên B",
  },
];

export const mockCrmActivities = [
  {
    id: "1",
    type: "call",
    subject: "Gọi điện tư vấn",
    description: "Tư vấn gói thiết kế biệt thự",
    relatedTo: "Trần Văn B",
    scheduledAt: "2026-01-30T09:00:00Z",
    status: "scheduled",
    assignedTo: "Nhân viên A",
  },
  {
    id: "2",
    type: "meeting",
    subject: "Họp khảo sát hiện trạng",
    description: "Khảo sát mặt bằng dự án resort",
    relatedTo: "Phạm Văn D",
    scheduledAt: "2026-01-31T14:00:00Z",
    status: "scheduled",
    assignedTo: "Kiến trúc sư Minh",
  },
  {
    id: "3",
    type: "email",
    subject: "Gửi báo giá",
    description: "Gửi bảng báo giá chi tiết",
    relatedTo: "Lê Thị C",
    scheduledAt: "2026-01-29T16:00:00Z",
    status: "completed",
    assignedTo: "Nhân viên B",
  },
];

// ============================================
// FILES & DOCUMENTS
// ============================================

export const mockFiles = [
  {
    id: "1",
    name: "Bản vẽ mặt bằng.dwg",
    type: "dwg",
    size: 2457600,
    url: "https://example.com/files/matbang.dwg",
    projectId: "1",
    uploadedBy: "Kiến trúc sư Minh",
    uploadedAt: "2026-01-28T10:00:00Z",
  },
  {
    id: "2",
    name: "Render 3D phòng khách.jpg",
    type: "image",
    size: 1843200,
    url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800",
    projectId: "1",
    uploadedBy: "Designer A",
    uploadedAt: "2026-01-27T15:30:00Z",
  },
  {
    id: "3",
    name: "Hợp đồng thiết kế.pdf",
    type: "pdf",
    size: 524288,
    url: "https://example.com/files/hopdong.pdf",
    projectId: "1",
    uploadedBy: "Admin",
    uploadedAt: "2026-01-25T09:00:00Z",
  },
];

export const mockDocuments = [
  {
    id: "1",
    title: "Hồ sơ thiết kế biệt thự ABC",
    category: "design",
    files: 12,
    lastModified: "2026-01-28T16:00:00Z",
    status: "active",
    sharedWith: ["client@abc.com"],
  },
  {
    id: "2",
    title: "Tài liệu kỹ thuật dự án XYZ",
    category: "technical",
    files: 8,
    lastModified: "2026-01-26T11:00:00Z",
    status: "archived",
    sharedWith: [],
  },
];

// ============================================
// BUSINESS OPERATIONS
// ============================================

export const mockInvoices = [
  {
    id: "INV-2026-001",
    client: "Công ty ABC",
    amount: 75000000,
    status: "paid",
    dueDate: "2026-01-15",
    paidDate: "2026-01-14",
    items: [
      { description: "Thiết kế mặt bằng", amount: 30000000 },
      { description: "Thiết kế 3D", amount: 45000000 },
    ],
  },
  {
    id: "INV-2026-002",
    client: "Nguyễn Văn E",
    amount: 40000000,
    status: "pending",
    dueDate: "2026-02-01",
    paidDate: null,
    items: [
      { description: "Tư vấn thiết kế", amount: 10000000 },
      { description: "Thiết kế nội thất", amount: 30000000 },
    ],
  },
  {
    id: "INV-2026-003",
    client: "Lê Thị C",
    amount: 15000000,
    status: "overdue",
    dueDate: "2026-01-20",
    paidDate: null,
    items: [
      { description: "Tư vấn phong thủy", amount: 5000000 },
      { description: "Báo cáo chi tiết", amount: 10000000 },
    ],
  },
];

export const mockContracts = [
  {
    id: "CTR-2026-001",
    title: "Hợp đồng thiết kế biệt thự Thảo Điền",
    client: "Công ty ABC",
    value: 150000000,
    status: "active",
    startDate: "2026-01-01",
    endDate: "2026-06-30",
    signedDate: "2025-12-28",
  },
  {
    id: "CTR-2026-002",
    title: "Hợp đồng thi công nội thất",
    client: "Nguyễn Văn E",
    value: 80000000,
    status: "pending",
    startDate: "2026-02-01",
    endDate: "2026-04-30",
    signedDate: null,
  },
];

export const mockPayments = [
  {
    id: "PAY-001",
    invoiceId: "INV-2026-001",
    amount: 75000000,
    method: "bank_transfer",
    status: "completed",
    transactionDate: "2026-01-14T10:30:00Z",
    note: "Thanh toán đợt 1",
  },
  {
    id: "PAY-002",
    invoiceId: "INV-2026-002",
    amount: 20000000,
    method: "cash",
    status: "completed",
    transactionDate: "2026-01-20T14:00:00Z",
    note: "Đặt cọc 50%",
  },
];

export const mockEquipment = [
  {
    id: "1",
    name: "Máy khoan Bosch GSB 16RE",
    category: "power_tools",
    status: "available",
    location: "Kho A",
    lastMaintenance: "2026-01-15",
    assignedTo: null,
  },
  {
    id: "2",
    name: "Máy cắt gạch Makita",
    category: "power_tools",
    status: "in_use",
    location: "Công trình B",
    lastMaintenance: "2026-01-10",
    assignedTo: "Đội thi công 1",
  },
  {
    id: "3",
    name: "Giàn giáo 10m",
    category: "scaffolding",
    status: "maintenance",
    location: "Kho A",
    lastMaintenance: "2026-01-28",
    assignedTo: null,
  },
];

export const mockCommunications = [
  {
    id: "1",
    type: "email",
    subject: "Xác nhận họp ngày 30/01",
    from: "admin@thietkeresort.com",
    to: "client@abc.com",
    content: "Kính gửi Quý khách, chúng tôi xác nhận lịch họp...",
    sentAt: "2026-01-29T08:00:00Z",
    status: "sent",
  },
  {
    id: "2",
    type: "sms",
    subject: "Nhắc nhở thanh toán",
    from: "system",
    to: "0909876543",
    content: "Hóa đơn INV-2026-002 sắp đến hạn thanh toán...",
    sentAt: "2026-01-28T09:00:00Z",
    status: "delivered",
  },
];

// ============================================
// ADMIN DASHBOARD
// ============================================

export const mockAdminDashboard = {
  overview: {
    totalRevenue: 500000000,
    monthlyRevenue: 125000000,
    totalProjects: 45,
    activeProjects: 12,
    totalClients: 89,
    newClientsThisMonth: 8,
    pendingInvoices: 5,
    overdueInvoices: 2,
  },
  revenueChart: [
    { month: "T8", value: 85000000 },
    { month: "T9", value: 92000000 },
    { month: "T10", value: 110000000 },
    { month: "T11", value: 98000000 },
    { month: "T12", value: 120000000 },
    { month: "T1", value: 125000000 },
  ],
  projectsByStatus: {
    planning: 5,
    in_progress: 12,
    review: 3,
    completed: 25,
  },
  topPerformers: [
    { name: "Kiến trúc sư Minh", projects: 8, revenue: 180000000 },
    { name: "Designer A", projects: 6, revenue: 120000000 },
    { name: "Nhân viên B", projects: 5, revenue: 95000000 },
  ],
  recentActivities: [
    {
      action: "Hoàn thành dự án",
      detail: "Biệt thự Quận 2",
      time: "2 giờ trước",
    },
    { action: "Hợp đồng mới", detail: "CTR-2026-003", time: "5 giờ trước" },
    { action: "Thanh toán nhận", detail: "75.000.000đ", time: "1 ngày trước" },
  ],
};

export const mockAdminStats = {
  users: {
    total: 52,
    active: 48,
    newThisWeek: 3,
    byRole: {
      admin: 2,
      manager: 5,
      staff: 15,
      client: 30,
    },
  },
  projects: {
    total: 45,
    thisMonth: 8,
    completionRate: 78,
  },
  finance: {
    revenue: 500000000,
    expenses: 320000000,
    profit: 180000000,
    profitMargin: 36,
  },
};

// ============================================
// MOCK API SERVICE
// ============================================

type MockEndpoint = {
  data: unknown;
  delay?: number;
};

const mockEndpoints: Record<string, MockEndpoint> = {
  "/home/featured-services": { data: mockFeaturedServices },
  "/home/banners": { data: mockBanners },
  "/home/videos": { data: mockVideos },
  "/home/news": { data: mockNews },
  "/flash-sales": { data: mockFlashSales },
  "/community/feed": { data: mockCommunityFeed },
  "/crm/leads": { data: mockCrmLeads },
  "/crm/clients": { data: mockCrmClients },
  "/crm/deals": { data: mockCrmDeals },
  "/crm/activities": { data: mockCrmActivities },
  "/files": { data: mockFiles },
  "/documents": { data: mockDocuments },
  "/invoices": { data: mockInvoices },
  "/contracts": { data: mockContracts },
  "/payments": { data: mockPayments },
  "/equipment": { data: mockEquipment },
  "/communications": { data: mockCommunications },
  "/admin/dashboard": { data: mockAdminDashboard },
  "/admin/stats": { data: mockAdminStats },
};

/**
 * Check if an endpoint has mock data available
 */
export function hasMockData(endpoint: string): boolean {
  return endpoint in mockEndpoints;
}

/**
 * Get mock data for an endpoint
 * Returns null if no mock data exists
 */
export function getMockData<T = unknown>(endpoint: string): T | null {
  const mock = mockEndpoints[endpoint];
  return mock ? (mock.data as T) : null;
}

/**
 * Simulate API call with mock data
 * Useful for development and testing
 */
export async function mockFetch<T = unknown>(
  endpoint: string,
  options?: { delay?: number },
): Promise<{ data: T | null; status: number; ok: boolean }> {
  const delay = options?.delay ?? 200;

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, delay));

  const mock = mockEndpoints[endpoint];

  if (mock) {
    return {
      data: mock.data as T,
      status: 200,
      ok: true,
    };
  }

  return {
    data: null,
    status: 404,
    ok: false,
  };
}

/**
 * Wrapper that tries real API first, falls back to mock data
 */
export async function fetchWithMockFallback<T = unknown>(
  endpoint: string,
  realFetch: () => Promise<T>,
): Promise<T> {
  try {
    const result = await realFetch();
    return result;
  } catch (error) {
    console.log(`[MockData] Real API failed for ${endpoint}, using mock data`);
    const mockData = getMockData<T>(endpoint);
    if (mockData) {
      return mockData;
    }
    throw error;
  }
}

export default {
  hasMockData,
  getMockData,
  mockFetch,
  fetchWithMockFallback,
  // Export individual data sets
  featuredServices: mockFeaturedServices,
  banners: mockBanners,
  videos: mockVideos,
  news: mockNews,
  flashSales: mockFlashSales,
  communityFeed: mockCommunityFeed,
  crmLeads: mockCrmLeads,
  crmClients: mockCrmClients,
  crmDeals: mockCrmDeals,
  crmActivities: mockCrmActivities,
  files: mockFiles,
  documents: mockDocuments,
  invoices: mockInvoices,
  contracts: mockContracts,
  payments: mockPayments,
  equipment: mockEquipment,
  communications: mockCommunications,
  adminDashboard: mockAdminDashboard,
  adminStats: mockAdminStats,
};
