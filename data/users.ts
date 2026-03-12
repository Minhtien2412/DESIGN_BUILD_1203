import type { ImageSourcePropType } from 'react-native';

export type WorkerStatus = 'available' | 'busy' | 'working';

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: ImageSourcePropType;
  role: string; // từ USER_ROLES.role
  rating?: number; // 1-5
  reviewCount?: number;
  joinedDate: string; // ISO date
  location?: string;
  // Worker-specific fields
  isWorker?: boolean;
  workerType?: string; // e.g. 'tho-xay', 'tho-son'
  status?: WorkerStatus;
  currentProjectId?: string; // id của project đang làm
  availability?: string; // e.g. 'Sáng nay', 'Tối nay'
  hourlyRate?: number; // VND/giờ
  experience?: string; // e.g. '5 năm'
  skills?: string[]; // e.g. ['Xây tường', 'Trát vữa']
  completedProjects?: number;
};

export const USERS: User[] = [
  // Khách hàng
  {
    id: 'u1',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0901234567',
    role: 'khach-hang',
    rating: 4.5,
    reviewCount: 12,
    joinedDate: '2023-01-15T00:00:00Z',
    location: 'Hồ Chí Minh',
  },
  {
    id: 'u2',
    name: 'Trần Thị B',
    email: 'tranthib@example.com',
    phone: '0912345678',
    role: 'khach-hang',
    rating: 4.8,
    reviewCount: 8,
    joinedDate: '2023-03-20T00:00:00Z',
    location: 'Hà Nội',
  },

  // Admin
  {
    id: 'u3',
    name: 'Admin System',
    email: 'admin@buildapp.com',
    role: 'admin',
    joinedDate: '2022-12-01T00:00:00Z',
  },

  // Nhà thầu
  {
    id: 'u4',
    name: 'Công ty Xây dựng ABC',
    email: 'contact@abcconstruction.com',
    phone: '0281234567',
    role: 'nha-thau',
    rating: 4.6,
    reviewCount: 45,
    joinedDate: '2023-02-10T00:00:00Z',
    location: 'Hồ Chí Minh',
  },

  // Công ty
  {
    id: 'u5',
    name: 'Tập đoàn Bất động sản XYZ',
    email: 'hr@xyzrealestate.com',
    phone: '0248765432',
    role: 'cong-ty',
    rating: 4.9,
    reviewCount: 120,
    joinedDate: '2022-11-05T00:00:00Z',
    location: 'Hà Nội',
  },

  // Thợ xây - Available
  {
    id: 'w1',
    name: 'Anh Minh - Thợ xây',
    email: 'minh.thoxay@example.com',
    phone: '0934567890',
    avatar: require('../assets/images/react-logo.webp'),
    role: 'tho-xay',
    rating: 4.7,
    reviewCount: 28,
    joinedDate: '2023-04-12T00:00:00Z',
    location: 'Hồ Chí Minh',
    isWorker: true,
    workerType: 'tho-xay',
    status: 'available',
    availability: 'Sáng nay',
    hourlyRate: 450000,
    experience: '8 năm',
    skills: ['Xây tường', 'Trát vữa', 'Lắp đặt cửa sổ', 'Hoàn thiện'],
    completedProjects: 45,
  },

  // Thợ xây - Working
  {
    id: 'w2',
    name: 'Anh Tùng - Thợ xây',
    email: 'tung.thoxay@example.com',
    phone: '0945678901',
    avatar: require('../assets/images/react-logo.webp'),
    role: 'tho-xay',
    rating: 4.5,
    reviewCount: 35,
    joinedDate: '2023-01-08T00:00:00Z',
    location: 'Hồ Chí Minh',
    isWorker: true,
    workerType: 'tho-xay',
    status: 'working',
    currentProjectId: 'p001',
    availability: 'Đang làm việc',
    hourlyRate: 420000,
    experience: '6 năm',
    skills: ['Xây nhà', 'Cốp pha', 'Đổ bê tông'],
    completedProjects: 32,
  },

  // Thợ xây - Busy
  {
    id: 'w3',
    name: 'Anh Hùng - Thợ xây',
    email: 'hung.thoxay@example.com',
    phone: '0956789012',
    avatar: require('../assets/images/react-logo.webp'),
    role: 'tho-xay',
    rating: 4.3,
    reviewCount: 22,
    joinedDate: '2023-06-15T00:00:00Z',
    location: 'Bình Dương',
    isWorker: true,
    workerType: 'tho-xay',
    status: 'busy',
    availability: 'Tối nay',
    hourlyRate: 400000,
    experience: '4 năm',
    skills: ['Xây dựng cơ bản', 'Sửa chữa'],
    completedProjects: 18,
  },

  // Thợ sơn - Available
  {
    id: 'w4',
    name: 'Chị Lan - Thợ sơn',
    email: 'lan.thoson@example.com',
    phone: '0967890123',
    avatar: require('../assets/images/react-logo.webp'),
    role: 'tho-son',
    rating: 4.8,
    reviewCount: 41,
    joinedDate: '2023-03-22T00:00:00Z',
    location: 'Hồ Chí Minh',
    isWorker: true,
    workerType: 'tho-son',
    status: 'available',
    availability: 'Chiều nay',
    hourlyRate: 380000,
    experience: '7 năm',
    skills: ['Quét sơn nội thất', 'Sơn ngoại thất', 'Sơn epoxy', 'Sơn trang trí'],
    completedProjects: 58,
  },

  // Thợ sơn - Working
  {
    id: 'w5',
    name: 'Anh Khoa - Thợ sơn',
    email: 'khoa.thoson@example.com',
    phone: '0978901234',
    avatar: require('../assets/images/react-logo.webp'),
    role: 'tho-son',
    rating: 4.6,
    reviewCount: 29,
    joinedDate: '2023-05-10T00:00:00Z',
    location: 'Hồ Chí Minh',
    isWorker: true,
    workerType: 'tho-son',
    status: 'working',
    currentProjectId: 'p002',
    availability: 'Đang thi công',
    hourlyRate: 350000,
    experience: '5 năm',
    skills: ['Sơn nhà', 'Sơn công nghiệp', 'Phủ bóng'],
    completedProjects: 37,
  },

  // Thợ sắt - Available
  {
    id: 'w6',
    name: 'Anh Đào - Thợ sắt',
    email: 'dao.thosat@example.com',
    phone: '0989012345',
    avatar: require('../assets/images/react-logo.webp'),
    role: 'tho-sat',
    rating: 4.4,
    reviewCount: 33,
    joinedDate: '2023-02-28T00:00:00Z',
    location: 'Đồng Nai',
    isWorker: true,
    workerType: 'tho-sat',
    status: 'available',
    availability: 'Ngày mai',
    hourlyRate: 500000,
    experience: '9 năm',
    skills: ['Hàn xì', 'Cắt sắt', 'Lắp đặt cửa sắt', 'Lan can'],
    completedProjects: 67,
  },

  // Thợ điện nước - Busy
  {
    id: 'w7',
    name: 'Anh Bình - Thợ điện nước',
    email: 'binh.thodiennuoc@example.com',
    phone: '0990123456',
    avatar: require('../assets/images/react-logo.webp'),
    role: 'tho-dien-nuoc',
    rating: 4.7,
    reviewCount: 52,
    joinedDate: '2022-12-15T00:00:00Z',
    location: 'Hồ Chí Minh',
    isWorker: true,
    workerType: 'tho-dien-nuoc',
    status: 'busy',
    availability: 'Cuối tuần',
    hourlyRate: 450000,
    experience: '10 năm',
    skills: ['Điện dân dụng', 'Điện công nghiệp', 'Ống nước', 'Sửa chữa'],
    completedProjects: 89,
  },

  // Thợ đá - Working
  {
    id: 'w8',
    name: 'Anh Sơn - Thợ đá',
    email: 'son.thoda@example.com',
    phone: '0911234567',
    avatar: require('../assets/images/react-logo.webp'),
    role: 'tho-da',
    rating: 4.5,
    reviewCount: 27,
    joinedDate: '2023-07-01T00:00:00Z',
    location: 'Bình Dương',
    isWorker: true,
    workerType: 'tho-da',
    status: 'working',
    currentProjectId: 'p003',
    availability: 'Đang lát đá',
    hourlyRate: 600000,
    experience: '6 năm',
    skills: ['Lát đá tự nhiên', 'Đá nhân tạo', 'Đá hoa', 'Đá granite'],
    completedProjects: 43,
  },

  // Thợ coffa - Available
  {
    id: 'w9',
    name: 'Anh Vinh - Thợ coffa',
    email: 'vinh.thocoffa@example.com',
    phone: '0922345678',
    avatar: require('../assets/images/react-logo.webp'),
    role: 'tho-coffa',
    rating: 4.3,
    reviewCount: 19,
    joinedDate: '2023-08-20T00:00:00Z',
    location: 'Hồ Chí Minh',
    isWorker: true,
    workerType: 'tho-coffa',
    status: 'available',
    availability: 'Tuần sau',
    hourlyRate: 480000,
    experience: '4 năm',
    skills: ['Đúc coffa', 'Cốp pha', 'Tháo dỡ'],
    completedProjects: 25,
  },

  // Thợ cơ khí - Working
  {
    id: 'w10',
    name: 'Anh Tài - Thợ cơ khí',
    email: 'tai.thocokhi@example.com',
    phone: '0933456789',
    avatar: require('../assets/images/react-logo.webp'),
    role: 'tho-co-khi',
    rating: 4.6,
    reviewCount: 31,
    joinedDate: '2023-04-05T00:00:00Z',
    location: 'Hồ Chí Minh',
    isWorker: true,
    workerType: 'tho-co-khi',
    status: 'working',
    currentProjectId: 'p004',
    availability: 'Đang lắp máy',
    hourlyRate: 550000,
    experience: '7 năm',
    skills: ['Lắp máy công nghiệp', 'Sửa chữa máy', 'Hàn cơ khí'],
    completedProjects: 38,
  },
];

// Helper functions
export const getWorkersByType = (workerType: string): User[] => {
  return USERS.filter(user => user.workerType === workerType && user.isWorker);
};

export const getWorkersByStatus = (status: WorkerStatus): User[] => {
  return USERS.filter(user => user.status === status && user.isWorker);
};

export const getAvailableWorkers = (): User[] => {
  return getWorkersByStatus('available');
};

export const getBusyWorkers = (): User[] => {
  return getWorkersByStatus('busy');
};

export const getWorkingWorkers = (): User[] => {
  return getWorkersByStatus('working');
};

export const getWorkerById = (id: string): User | undefined => {
  return USERS.find(user => user.id === id && user.isWorker);
};
