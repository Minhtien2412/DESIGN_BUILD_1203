/**
 * Mock Project Data - Comprehensive Sample Projects
 * Provides realistic sample data for testing and demonstration
 */

import { ProjectStatus, ProjectType } from '@/hooks/useProjects';

/**
 * Mock Project type - matches mock data structure
 * Used for demo/testing without backend API
 */
export interface MockProject {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  progress: number;
  location: string;
  budget: number;
  client: {
    id: number | string;
    name: string;
    phone?: string;
    email?: string;
  };
  team: { id: string; name: string; role: string }[];
  start_date: string;
  end_date: string;
  images: string[];
  documents: { id: string; name: string; url: string; size: number; uploaded_at: string }[];
  created_at: string;
  updated_at: string;
}

/**
 * Sample project images URLs (can be replaced with real assets)
 */
const PROJECT_IMAGES = {
  residential: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
  commercial: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
  landscape: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
  interior: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800',
  renovation: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800',
};

/**
 * Generate realistic Vietnamese names
 */
const CLIENT_NAMES = [
  'Nguyễn Văn An',
  'Trần Thị Bình',
  'Lê Hoàng Cường',
  'Phạm Thị Dung',
  'Hoàng Văn Em',
  'Đặng Thị Phương',
  'Vũ Minh Giang',
  'Bùi Thị Hoa',
  'Đinh Văn Khải',
  'Ngô Thị Linh',
];

const TEAM_MEMBERS = [
  { id: 't1', name: 'KTS. Nguyễn Minh', role: 'Kiến trúc sư trưởng' },
  { id: 't2', name: 'KS. Trần Hải', role: 'Kỹ sư giám sát' },
  { id: 't3', name: 'Lê Thanh Tùng', role: 'Quản lý dự án' },
  { id: 't4', name: 'Phạm Thị Mai', role: 'Thiết kế nội thất' },
  { id: 't5', name: 'Hoàng Anh Tuấn', role: 'Kỹ sư điện' },
  { id: 't6', name: 'Đỗ Văn Hùng', role: 'Thợ xây chính' },
  { id: 't7', name: 'Nguyễn Thị Lan', role: 'Kế toán dự án' },
  { id: 't8', name: 'Vũ Đức Anh', role: 'Kỹ sư cơ khí' },
];

const LOCATIONS = [
  'Quận 1, TP. Hồ Chí Minh',
  'Quận 2, TP. Hồ Chí Minh',
  'Quận 7, TP. Hồ Chí Minh',
  'Quận Bình Thạnh, TP. Hồ Chí Minh',
  'Hà Đông, Hà Nội',
  'Cầu Giấy, Hà Nội',
  'Hải Châu, Đà Nẵng',
  'Nha Trang, Khánh Hòa',
  'Biên Hòa, Đồng Nai',
  'Thủ Đức, TP. Hồ Chí Minh',
];

/**
 * Helper: Generate random date in past/future
 */
function randomDate(startDaysAgo: number, endDaysAgo: number): string {
  const now = new Date();
  const days = Math.floor(Math.random() * (endDaysAgo - startDaysAgo)) + startDaysAgo;
  const date = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return date.toISOString();
}

/**
 * Helper: Get random item from array
 */
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Helper: Get random items from array
 */
function randomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, arr.length));
}

/**
 * Comprehensive Mock Projects
 * 15 sample projects with various statuses, types, and progress levels
 */
export const MOCK_PROJECTS: MockProject[] = [
  // 1. Luxury Residential Villa - Active
  {
    id: 'proj_001',
    name: 'Biệt thự Vinhomes Central Park',
    description: 'Thiết kế và thi công biệt thự cao cấp 3 tầng, phong cách hiện đại kết hợp cổ điển, diện tích 450m²',
    type: 'residential',
    status: 'active',
    progress: 68,
    location: 'Quận Bình Thạnh, TP. Hồ Chí Minh',
    budget: 8500000000, // 8.5 billion VND
    client: {
      id: 1001,
      name: 'Nguyễn Văn An',
      phone: '+84 909 123 456',
      email: 'nguyenvanan@email.com',
    },
    team: [
      { id: 't1', name: 'KTS. Nguyễn Minh', role: 'Kiến trúc sư trưởng' },
      { id: 't2', name: 'KS. Trần Hải', role: 'Kỹ sư giám sát' },
      { id: 't3', name: 'Lê Thanh Tùng', role: 'Quản lý dự án' },
      { id: 't6', name: 'Đỗ Văn Hùng', role: 'Thợ xây chính' },
    ],
    start_date: randomDate(-90, -60),
    end_date: randomDate(30, 60),
    images: [PROJECT_IMAGES.residential],
    documents: [
      { id: 'd001', name: 'Thiết kế kiến trúc.pdf', url: '#', size: 5242880, uploaded_at: randomDate(-80, -70) },
      { id: 'd002', name: 'Bản vẽ kỹ thuật.dwg', url: '#', size: 12582912, uploaded_at: randomDate(-70, -60) },
      { id: 'd003', name: 'Dự toán chi tiết.xlsx', url: '#', size: 2097152, uploaded_at: randomDate(-60, -50) },
    ],
    created_at: randomDate(-95, -90),
    updated_at: randomDate(-2, 0),
  },

  // 2. Shopping Mall - Active
  {
    id: 'proj_002',
    name: 'Trung tâm thương mại Pearl Plaza',
    description: 'Xây dựng trung tâm thương mại quy mô lớn 7 tầng, tổng diện tích 15,000m², bao gồm siêu thị, khu vui chơi, rạp chiếu phim',
    type: 'commercial',
    status: 'active',
    progress: 45,
    location: 'Quận 1, TP. Hồ Chí Minh',
    budget: 125000000000, // 125 billion VND
    client: {
      id: 1002,
      name: 'Công ty TNHH Đầu tư Bất động sản ABC',
      phone: '+84 028 3823 4567',
      email: 'contact@abc-invest.com',
    },
    team: randomItems(TEAM_MEMBERS, 6),
    start_date: randomDate(-120, -100),
    end_date: randomDate(180, 210),
    images: [PROJECT_IMAGES.commercial],
    documents: [
      { id: 'd004', name: 'Quy hoạch tổng mặt bằng.pdf', url: '#', size: 8388608, uploaded_at: randomDate(-110, -100) },
      { id: 'd005', name: 'Thiết kế kết cấu.pdf', url: '#', size: 15728640, uploaded_at: randomDate(-100, -90) },
    ],
    created_at: randomDate(-125, -120),
    updated_at: randomDate(-1, 0),
  },

  // 3. Public Park Landscape - Active
  {
    id: 'proj_003',
    name: 'Công viên Thảo Điền',
    description: 'Thiết kế cảnh quan công viên công cộng rộng 5 hecta, bao gồm hồ nước, đường đi bộ, khu vui chơi trẻ em, và khu tập thể dục',
    type: 'landscape',
    status: 'active',
    progress: 72,
    location: 'Quận 2, TP. Hồ Chí Minh',
    budget: 28000000000, // 28 billion VND
    client: {
      id: 'c003',
      name: 'UBND Quận 2',
      phone: '+84 028 3744 5555',
      email: 'ubnd@quan2.gov.vn',
    },
    team: randomItems(TEAM_MEMBERS, 4),
    start_date: randomDate(-150, -120),
    end_date: randomDate(20, 40),
    images: [PROJECT_IMAGES.landscape],
    documents: [
      { id: 'd006', name: 'Thiết kế cảnh quan tổng thể.pdf', url: '#', size: 10485760, uploaded_at: randomDate(-140, -130) },
    ],
    created_at: randomDate(-155, -150),
    updated_at: randomDate(-3, 0),
  },

  // 4. Office Interior - Completed
  {
    id: 'proj_004',
    name: 'Nội thất văn phòng Tech Startup Hub',
    description: 'Thiết kế và thi công nội thất văn phòng làm việc cho 200 nhân viên, phong cách hiện đại, không gian mở',
    type: 'interior',
    status: 'completed',
    progress: 100,
    location: 'Quận 7, TP. Hồ Chí Minh',
    budget: 3200000000, // 3.2 billion VND
    client: {
      id: 'c004',
      name: 'Công ty Cổ phần Công nghệ XYZ',
      phone: '+84 909 888 777',
      email: 'hr@xyztech.vn',
    },
    team: randomItems(TEAM_MEMBERS, 3),
    start_date: randomDate(-180, -160),
    end_date: randomDate(-30, -20),
    images: [PROJECT_IMAGES.interior],
    documents: [
      { id: 'd007', name: 'Bản vẽ nội thất.pdf', url: '#', size: 6291456, uploaded_at: randomDate(-170, -160) },
      { id: 'd008', name: 'Bảng màu & vật liệu.pdf', url: '#', size: 3145728, uploaded_at: randomDate(-160, -150) },
    ],
    created_at: randomDate(-185, -180),
    updated_at: randomDate(-25, -20),
  },

  // 5. Apartment Renovation - Active
  {
    id: 'proj_005',
    name: 'Cải tạo căn hộ Masteri Thảo Điền',
    description: 'Cải tạo và nâng cấp căn hộ 120m², thay đổi bố cục, nâng cấp hệ thống điện nước, làm mới hoàn toàn nội thất',
    type: 'renovation',
    status: 'active',
    progress: 55,
    location: 'Quận 2, TP. Hồ Chí Minh',
    budget: 1800000000, // 1.8 billion VND
    client: {
      id: 'c005',
      name: 'Trần Thị Bình',
      phone: '+84 918 222 333',
      email: 'binhtt@gmail.com',
    },
    team: randomItems(TEAM_MEMBERS, 3),
    start_date: randomDate(-60, -45),
    end_date: randomDate(15, 30),
    images: [PROJECT_IMAGES.renovation],
    documents: [
      { id: 'd009', name: 'Bản vẽ cải tạo.pdf', url: '#', size: 4194304, uploaded_at: randomDate(-55, -50) },
    ],
    created_at: randomDate(-65, -60),
    updated_at: randomDate(-2, 0),
  },

  // 6. Townhouse - Planning
  {
    id: 'proj_006',
    name: 'Nhà phố 4 tầng Gò Vấp',
    description: 'Thiết kế nhà phố hiện đại 4 tầng, diện tích 5x20m, bao gồm gara, phòng khách, 4 phòng ngủ, sân thượng',
    type: 'residential',
    status: 'planning',
    progress: 15,
    location: 'Quận Gò Vấp, TP. Hồ Chí Minh',
    budget: 4500000000, // 4.5 billion VND
    client: {
      id: 'c006',
      name: 'Lê Hoàng Cường',
      phone: '+84 903 444 555',
      email: 'cuonglh@email.com',
    },
    team: randomItems(TEAM_MEMBERS, 2),
    start_date: randomDate(-10, 0),
    end_date: randomDate(120, 150),
    images: [PROJECT_IMAGES.residential],
    documents: [],
    created_at: randomDate(-15, -10),
    updated_at: randomDate(-1, 0),
  },

  // 7. Restaurant Interior - Completed
  {
    id: 'proj_007',
    name: 'Nhà hàng The Garden Kitchen',
    description: 'Thiết kế nội thất nhà hàng cao cấp phong cách tropical, diện tích 300m², sức chứa 80 khách',
    type: 'interior',
    status: 'completed',
    progress: 100,
    location: 'Quận 3, TP. Hồ Chí Minh',
    budget: 2500000000, // 2.5 billion VND
    client: {
      id: 'c007',
      name: 'Công ty TNHH F&B Garden',
      phone: '+84 028 3930 1234',
      email: 'info@gardenkitchen.vn',
    },
    team: randomItems(TEAM_MEMBERS, 4),
    start_date: randomDate(-240, -210),
    end_date: randomDate(-60, -45),
    images: [PROJECT_IMAGES.interior],
    documents: [
      { id: 'd010', name: 'Concept thiết kế.pdf', url: '#', size: 7340032, uploaded_at: randomDate(-230, -220) },
      { id: 'd011', name: 'Bản vẽ thi công.dwg', url: '#', size: 9437184, uploaded_at: randomDate(-220, -210) },
    ],
    created_at: randomDate(-245, -240),
    updated_at: randomDate(-50, -45),
  },

  // 8. Hotel Complex - Active
  {
    id: 'proj_008',
    name: 'Khách sạn Seaside Resort',
    description: 'Xây dựng khu nghỉ dưỡng cao cấp 5 sao, 8 tầng, 120 phòng, bao gồm spa, hồ bơi, nhà hàng, khu hội nghị',
    type: 'commercial',
    status: 'active',
    progress: 38,
    location: 'Nha Trang, Khánh Hòa',
    budget: 185000000000, // 185 billion VND
    client: {
      id: 'c008',
      name: 'Tập đoàn Du lịch Đông Nam',
      phone: '+84 258 3888 999',
      email: 'investment@dongnam-group.com',
    },
    team: randomItems(TEAM_MEMBERS, 8),
    start_date: randomDate(-200, -180),
    end_date: randomDate(300, 360),
    images: [PROJECT_IMAGES.commercial],
    documents: [
      { id: 'd012', name: 'Thiết kế tổng thể resort.pdf', url: '#', size: 20971520, uploaded_at: randomDate(-190, -180) },
      { id: 'd013', name: 'Hồ sơ môi trường.pdf', url: '#', size: 5242880, uploaded_at: randomDate(-180, -170) },
    ],
    created_at: randomDate(-205, -200),
    updated_at: randomDate(-1, 0),
  },

  // 9. Garden Landscape - Planning
  {
    id: 'proj_009',
    name: 'Sân vườn Biệt thự Riviera',
    description: 'Thiết kế cảnh quan sân vườn biệt thự 800m², bao gồm hồ koi, tiểu cảnh đá, vườn hoa nhiệt đới',
    type: 'landscape',
    status: 'planning',
    progress: 8,
    location: 'Quận 2, TP. Hồ Chí Minh',
    budget: 1200000000, // 1.2 billion VND
    client: {
      id: 'c009',
      name: 'Phạm Thị Dung',
      phone: '+84 912 777 888',
      email: 'dungpt@email.com',
    },
    team: randomItems(TEAM_MEMBERS, 2),
    start_date: randomDate(10, 20),
    end_date: randomDate(90, 110),
    images: [PROJECT_IMAGES.landscape],
    documents: [],
    created_at: randomDate(-5, 0),
    updated_at: randomDate(-1, 0),
  },

  // 10. Old House Renovation - Paused
  {
    id: 'proj_010',
    name: 'Cải tạo nhà cổ Phố Cổ Hà Nội',
    description: 'Cải tạo và bảo tồn nhà ống cổ truyền thống tại phố cổ Hà Nội, giữ nguyên kiến trúc ngoại thất, hiện đại hóa nội thất',
    type: 'renovation',
    status: 'paused',
    progress: 22,
    location: 'Hoàn Kiếm, Hà Nội',
    budget: 3800000000, // 3.8 billion VND
    client: {
      id: 'c010',
      name: 'Hoàng Văn Em',
      phone: '+84 904 111 222',
      email: 'emhv@gmail.com',
    },
    team: randomItems(TEAM_MEMBERS, 3),
    start_date: randomDate(-80, -70),
    end_date: randomDate(40, 60),
    images: [PROJECT_IMAGES.renovation],
    documents: [
      { id: 'd014', name: 'Hồ sơ di sản.pdf', url: '#', size: 8388608, uploaded_at: randomDate(-75, -70) },
    ],
    created_at: randomDate(-85, -80),
    updated_at: randomDate(-20, -15),
  },

  // 11. Showroom - Active
  {
    id: 'proj_011',
    name: 'Showroom Xe Luxury Motors',
    description: 'Thiết kế và xây dựng showroom ô tô cao cấp, diện tích 1200m², trưng bày 15 xe, khu vực tư vấn, phòng ký hợp đồng',
    type: 'commercial',
    status: 'active',
    progress: 82,
    location: 'Quận 7, TP. Hồ Chí Minh',
    budget: 18000000000, // 18 billion VND
    client: {
      id: 'c011',
      name: 'Công ty TNHH Luxury Motors',
      phone: '+84 028 5413 8888',
      email: 'sales@luxurymotors.vn',
    },
    team: randomItems(TEAM_MEMBERS, 5),
    start_date: randomDate(-140, -120),
    end_date: randomDate(10, 20),
    images: [PROJECT_IMAGES.commercial],
    documents: [
      { id: 'd015', name: 'Thiết kế showroom.pdf', url: '#', size: 11534336, uploaded_at: randomDate(-130, -120) },
    ],
    created_at: randomDate(-145, -140),
    updated_at: randomDate(-2, 0),
  },

  // 12. Penthouse Interior - Completed
  {
    id: 'proj_012',
    name: 'Penthouse Vinhomes Golden River',
    description: 'Thiết kế nội thất penthouse duplex 250m², phong cách tân cổ điển, bao gồm 4 phòng ngủ, phòng giải trí, sân thượng riêng',
    type: 'interior',
    status: 'completed',
    progress: 100,
    location: 'Quận 1, TP. Hồ Chí Minh',
    budget: 6800000000, // 6.8 billion VND
    client: {
      id: 'c012',
      name: 'Đặng Thị Phương',
      phone: '+84 908 333 444',
      email: 'phuongdt@email.com',
    },
    team: randomItems(TEAM_MEMBERS, 4),
    start_date: randomDate(-300, -270),
    end_date: randomDate(-90, -75),
    images: [PROJECT_IMAGES.interior],
    documents: [
      { id: 'd016', name: 'Concept nội thất.pdf', url: '#', size: 13631488, uploaded_at: randomDate(-290, -280) },
      { id: 'd017', name: 'Album hoàn thành.pdf', url: '#', size: 25165824, uploaded_at: randomDate(-80, -75) },
    ],
    created_at: randomDate(-305, -300),
    updated_at: randomDate(-70, -65),
  },

  // 13. Factory Building - Active
  {
    id: 'proj_013',
    name: 'Nhà máy sản xuất GreenTech',
    description: 'Xây dựng nhà máy sản xuất thiết bị điện tử, quy mô 5000m², bao gồm nhà xưởng, kho bãi, văn phòng hành chính',
    type: 'commercial',
    status: 'active',
    progress: 60,
    location: 'Biên Hòa, Đồng Nai',
    budget: 42000000000, // 42 billion VND
    client: {
      id: 'c013',
      name: 'Công ty TNHH GreenTech Electronics',
      phone: '+84 251 3955 777',
      email: 'facility@greentech.vn',
    },
    team: randomItems(TEAM_MEMBERS, 6),
    start_date: randomDate(-160, -140),
    end_date: randomDate(50, 70),
    images: [PROJECT_IMAGES.commercial],
    documents: [
      { id: 'd018', name: 'Thiết kế nhà máy.pdf', url: '#', size: 16777216, uploaded_at: randomDate(-150, -140) },
      { id: 'd019', name: 'Hệ thống PCCC.pdf', url: '#', size: 7340032, uploaded_at: randomDate(-140, -130) },
    ],
    created_at: randomDate(-165, -160),
    updated_at: randomDate(-1, 0),
  },

  // 14. Residential Compound - Planning
  {
    id: 'proj_014',
    name: 'Khu biệt thự Bella Vista',
    description: 'Quy hoạch và thiết kế khu biệt thự cao cấp 50 căn, bao gồm cổng chính, đường nội bộ, công viên trung tâm, hồ bơi chung',
    type: 'residential',
    status: 'planning',
    progress: 5,
    location: 'Thủ Đức, TP. Hồ Chí Minh',
    budget: 280000000000, // 280 billion VND
    client: {
      id: 'c014',
      name: 'Công ty Cổ phần Địa ốc Bella',
      phone: '+84 028 6291 5555',
      email: 'invest@bella-estate.vn',
    },
    team: randomItems(TEAM_MEMBERS, 7),
    start_date: randomDate(30, 50),
    end_date: randomDate(540, 600),
    images: [PROJECT_IMAGES.residential],
    documents: [],
    created_at: randomDate(-10, -5),
    updated_at: randomDate(-1, 0),
  },

  // 15. Café Interior - Completed
  {
    id: 'proj_015',
    name: 'Quán Cà phê Moonlight Corner',
    description: 'Thiết kế nội thất quán cà phê phong cách Indochine, diện tích 150m², sức chứa 50 khách, có khu vực outdoor',
    type: 'interior',
    status: 'completed',
    progress: 100,
    location: 'Quận 3, TP. Hồ Chí Minh',
    budget: 980000000, // 980 million VND
    client: {
      id: 'c015',
      name: 'Vũ Minh Giang',
      phone: '+84 909 666 777',
      email: 'giang.vm@moonlight.cafe',
    },
    team: randomItems(TEAM_MEMBERS, 3),
    start_date: randomDate(-200, -180),
    end_date: randomDate(-50, -40),
    images: [PROJECT_IMAGES.interior],
    documents: [
      { id: 'd020', name: 'Thiết kế nội thất cafe.pdf', url: '#', size: 5242880, uploaded_at: randomDate(-190, -180) },
    ],
    created_at: randomDate(-205, -200),
    updated_at: randomDate(-45, -40),
  },
];

/**
 * Project statistics derived from mock data
 */
export const MOCK_PROJECT_STATS = {
  total: MOCK_PROJECTS.length,
  byStatus: {
    planning: MOCK_PROJECTS.filter(p => p.status === 'planning').length,
    active: MOCK_PROJECTS.filter(p => p.status === 'active').length,
    paused: MOCK_PROJECTS.filter(p => p.status === 'paused').length,
    completed: MOCK_PROJECTS.filter(p => p.status === 'completed').length,
  },
  byType: {
    residential: MOCK_PROJECTS.filter(p => p.type === 'residential').length,
    commercial: MOCK_PROJECTS.filter(p => p.type === 'commercial').length,
    landscape: MOCK_PROJECTS.filter(p => p.type === 'landscape').length,
    interior: MOCK_PROJECTS.filter(p => p.type === 'interior').length,
    renovation: MOCK_PROJECTS.filter(p => p.type === 'renovation').length,
  },
  totalBudget: MOCK_PROJECTS.reduce((sum, p) => sum + (p.budget || 0), 0),
  averageProgress: Math.round(
    MOCK_PROJECTS.reduce((sum, p) => sum + (p.progress ?? 0), 0) / MOCK_PROJECTS.length
  ),
};

/**
 * Filter mock projects by criteria
 */
export function filterMockProjects(filters: {
  status?: ProjectStatus | 'all';
  type?: ProjectType | 'all';
  search?: string;
}): MockProject[] {
  let result = [...MOCK_PROJECTS];

  if (filters.status && filters.status !== 'all') {
    result = result.filter(p => p.status === filters.status);
  }

  if (filters.type && filters.type !== 'all') {
    result = result.filter(p => p.type === filters.type);
  }

  if (filters.search) {
    const query = filters.search.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query) ||
      p.location?.toLowerCase().includes(query) ||
      p.client?.name.toLowerCase().includes(query)
    );
  }

  return result;
}

/**
 * Get mock project by ID
 */
export function getMockProjectById(id: string): MockProject | null {
  return MOCK_PROJECTS.find(p => p.id === id) || null;
}
