/**
 * Video Data Types - Production
 * Data from API + Demo Videos xây dựng
 * Updated: 13/01/2026
 */

export type VideoItem = {
  id: string;
  title: string;
  url: string | number;
  fallbackUrl?: string;
  thumbnail?: string;
  author?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  views?: number;
  duration?: string;
  category?: VideoCategory;
  hashtags?: string[];
  type?: 'vod' | 'live' | 'demo';
  authorSlug?: string;
  authorAvatarUrl?: string;
  description?: string;
  createdAt?: string;
};

export type VideoCategory = 
  | 'construction' // Xây dựng
  | 'design' // Thiết kế
  | 'villa' // Biệt thự
  | 'resort' // Resort
  | 'interior' // Nội thất
  | 'landscape' // Cảnh quan
  | 'material' // Vật liệu
  | 'technique' // Kỹ thuật
  | 'timelapse' // Tiến độ
  | 'other';

// Use dynamic require to tolerate missing file during early dev before generation
const __generated: any = (() => { try { return require('./localVideos.generated'); } catch { return {}; } })();
const GENERATED_VIDEOS: VideoItem[] = Array.isArray(__generated.GENERATED_VIDEOS) ? __generated.GENERATED_VIDEOS as VideoItem[] : [];

// ==================== DEMO VIDEOS XÂY DỰNG ====================
// Video demo showcase các dự án và quy trình xây dựng

export const DEMO_CONSTRUCTION_VIDEOS: VideoItem[] = [
  // === BIỆT THỰ & VILLA ===
  {
    id: 'demo-villa-001',
    title: 'Quá trình xây dựng Biệt thự hiện đại 3 tầng',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Thay bằng URL thật
    thumbnail: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
    author: 'Design Build Team',
    authorAvatarUrl: 'https://ui-avatars.com/api/?name=DB&background=6366f1&color=fff',
    likes: 1250,
    comments: 89,
    shares: 45,
    views: 15000,
    duration: '12:35',
    category: 'villa',
    hashtags: ['biệtthự', 'xâydựng', 'hiệnđại', '3tầng'],
    type: 'demo',
    description: 'Video tiến độ xây dựng biệt thự hiện đại từ móng đến hoàn thiện',
    createdAt: '2025-12-01',
  },
  {
    id: 'demo-villa-002',
    title: 'Timelapse xây dựng Villa nghỉ dưỡng Đà Lạt',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    author: 'Design Build Team',
    authorAvatarUrl: 'https://ui-avatars.com/api/?name=DB&background=6366f1&color=fff',
    likes: 2100,
    comments: 156,
    shares: 78,
    views: 28000,
    duration: '8:20',
    category: 'timelapse',
    hashtags: ['timelapse', 'villa', 'đàlạt', 'nghỉdưỡng'],
    type: 'demo',
    description: 'Timelapse đẹp mắt quá trình xây dựng villa từ đầu đến cuối',
    createdAt: '2025-11-15',
  },
  
  // === RESORT & NHÀ HÀNG ===
  {
    id: 'demo-resort-001',
    title: 'Xây dựng Resort 5 sao tại Phú Quốc - Giai đoạn 1',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    author: 'Design Build Team',
    authorAvatarUrl: 'https://ui-avatars.com/api/?name=DB&background=6366f1&color=fff',
    likes: 3500,
    comments: 234,
    shares: 120,
    views: 45000,
    duration: '18:45',
    category: 'resort',
    hashtags: ['resort', 'phúquốc', '5sao', 'xâydựng'],
    type: 'demo',
    description: 'Quá trình thi công resort cao cấp với view biển tuyệt đẹp',
    createdAt: '2025-10-20',
  },
  {
    id: 'demo-resort-002',
    title: 'Hoàn thiện Bungalow gỗ cao cấp',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800',
    author: 'Design Build Team',
    authorAvatarUrl: 'https://ui-avatars.com/api/?name=DB&background=6366f1&color=fff',
    likes: 1800,
    comments: 112,
    shares: 56,
    views: 22000,
    duration: '10:15',
    category: 'construction',
    hashtags: ['bungalow', 'gỗ', 'caocấp', 'resort'],
    type: 'demo',
    description: 'Kỹ thuật xây dựng bungalow gỗ truyền thống kết hợp hiện đại',
    createdAt: '2025-11-01',
  },

  // === THIẾT KẾ NỘI THẤT ===
  {
    id: 'demo-interior-001',
    title: 'Thi công nội thất căn hộ Penthouse luxury',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    author: 'Design Build Team',
    authorAvatarUrl: 'https://ui-avatars.com/api/?name=DB&background=6366f1&color=fff',
    likes: 2800,
    comments: 189,
    shares: 95,
    views: 35000,
    duration: '15:30',
    category: 'interior',
    hashtags: ['nộithất', 'penthouse', 'luxury', 'cănnhà'],
    type: 'demo',
    description: 'Quá trình hoàn thiện nội thất penthouse với vật liệu cao cấp',
    createdAt: '2025-12-10',
  },
  {
    id: 'demo-interior-002',
    title: 'Thiết kế và thi công phòng khách hiện đại',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800',
    author: 'Design Build Team',
    authorAvatarUrl: 'https://ui-avatars.com/api/?name=DB&background=6366f1&color=fff',
    likes: 1500,
    comments: 78,
    shares: 42,
    views: 18000,
    duration: '9:45',
    category: 'interior',
    hashtags: ['phòngkhách', 'hiệnđại', 'nộithất', 'thiếtkế'],
    type: 'demo',
    description: 'Hướng dẫn chi tiết thiết kế phòng khách phong cách hiện đại',
    createdAt: '2025-11-25',
  },

  // === KỸ THUẬT XÂY DỰNG ===
  {
    id: 'demo-technique-001',
    title: 'Kỹ thuật đổ móng bê tông cốt thép chuẩn',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
    author: 'Design Build Team',
    authorAvatarUrl: 'https://ui-avatars.com/api/?name=DB&background=6366f1&color=fff',
    likes: 4200,
    comments: 312,
    shares: 185,
    views: 65000,
    duration: '22:10',
    category: 'technique',
    hashtags: ['móng', 'bêtông', 'kỹthuật', 'xâydựng'],
    type: 'demo',
    description: 'Hướng dẫn chi tiết kỹ thuật đổ móng đúng chuẩn kỹ thuật',
    createdAt: '2025-09-15',
  },
  {
    id: 'demo-technique-002',
    title: 'Quy trình chống thấm sàn mái hiệu quả',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    author: 'Design Build Team',
    authorAvatarUrl: 'https://ui-avatars.com/api/?name=DB&background=6366f1&color=fff',
    likes: 3100,
    comments: 267,
    shares: 145,
    views: 48000,
    duration: '16:40',
    category: 'technique',
    hashtags: ['chốngthấm', 'sànmái', 'kỹthuật', 'xâydựng'],
    type: 'demo',
    description: 'Phương pháp chống thấm sàn mái bền vững, hiệu quả cao',
    createdAt: '2025-10-05',
  },

  // === CẢNH QUAN & SÂN VƯỜN ===
  {
    id: 'demo-landscape-001',
    title: 'Thiết kế sân vườn biệt thự phong cách Nhật Bản',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800',
    author: 'Design Build Team',
    authorAvatarUrl: 'https://ui-avatars.com/api/?name=DB&background=6366f1&color=fff',
    likes: 2400,
    comments: 156,
    shares: 89,
    views: 32000,
    duration: '14:20',
    category: 'landscape',
    hashtags: ['sânvườn', 'nhậtbản', 'cảnhquan', 'biệtthự'],
    type: 'demo',
    description: 'Hướng dẫn thiết kế sân vườn zen phong cách Nhật Bản',
    createdAt: '2025-11-10',
  },
  {
    id: 'demo-landscape-002',
    title: 'Thi công hồ bơi vô cực cho villa',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=800',
    author: 'Design Build Team',
    authorAvatarUrl: 'https://ui-avatars.com/api/?name=DB&background=6366f1&color=fff',
    likes: 2900,
    comments: 178,
    shares: 98,
    views: 38000,
    duration: '19:55',
    category: 'landscape',
    hashtags: ['hồbơi', 'vôcực', 'villa', 'thicông'],
    type: 'demo',
    description: 'Quá trình xây dựng hồ bơi vô cực view núi đẹp như mơ',
    createdAt: '2025-10-28',
  },

  // === VẬT LIỆU XÂY DỰNG ===
  {
    id: 'demo-material-001',
    title: 'So sánh các loại gạch ốp lát cao cấp',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800',
    author: 'Design Build Team',
    authorAvatarUrl: 'https://ui-avatars.com/api/?name=DB&background=6366f1&color=fff',
    likes: 1900,
    comments: 134,
    shares: 67,
    views: 25000,
    duration: '11:30',
    category: 'material',
    hashtags: ['gạchốp', 'vậtliệu', 'caocấp', 'xâydựng'],
    type: 'demo',
    description: 'Review chi tiết các loại gạch ốp lát phổ biến hiện nay',
    createdAt: '2025-11-20',
  },
  {
    id: 'demo-material-002',
    title: 'Lựa chọn sơn ngoại thất chống nắng mưa',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800',
    author: 'Design Build Team',
    authorAvatarUrl: 'https://ui-avatars.com/api/?name=DB&background=6366f1&color=fff',
    likes: 1650,
    comments: 98,
    shares: 54,
    views: 21000,
    duration: '8:45',
    category: 'material',
    hashtags: ['sơn', 'ngoạithất', 'vậtliệu', 'chốngnắng'],
    type: 'demo',
    description: 'Tư vấn chọn sơn ngoại thất bền màu, chống thấm tốt nhất',
    createdAt: '2025-12-05',
  },
];

// Video categories với icon và màu sắc
export const VIDEO_CATEGORIES = {
  construction: { label: 'Xây dựng', icon: 'construct', color: '#f59e0b' },
  design: { label: 'Thiết kế', icon: 'color-palette', color: '#8b5cf6' },
  villa: { label: 'Biệt thự', icon: 'home', color: '#10b981' },
  resort: { label: 'Resort', icon: 'business', color: '#3b82f6' },
  interior: { label: 'Nội thất', icon: 'bed', color: '#ec4899' },
  landscape: { label: 'Cảnh quan', icon: 'leaf', color: '#22c55e' },
  material: { label: 'Vật liệu', icon: 'cube', color: '#64748b' },
  technique: { label: 'Kỹ thuật', icon: 'build', color: '#ef4444' },
  timelapse: { label: 'Tiến độ', icon: 'time', color: '#0ea5e9' },
  other: { label: 'Khác', icon: 'apps', color: '#6b7280' },
} as const;

// Combine all videos
export const VIDEOS: VideoItem[] = [...DEMO_CONSTRUCTION_VIDEOS];

// Merge generated list with curated seed items (de-dup by id)
const seed = VIDEOS;
const seen = new Set<string>(seed.map((v) => v.id));
export const ALL_LOCAL_VIDEOS: VideoItem[] = [
  ...seed,
  ...GENERATED_VIDEOS.filter((v: VideoItem) => !seen.has(v.id)),
];

// Helper functions
export function getVideosByCategory(category: VideoCategory): VideoItem[] {
  return ALL_LOCAL_VIDEOS.filter(v => v.category === category);
}

export function getPopularVideos(limit = 10): VideoItem[] {
  return [...ALL_LOCAL_VIDEOS]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, limit);
}

export function getRecentVideos(limit = 10): VideoItem[] {
  return [...ALL_LOCAL_VIDEOS]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, limit);
}

export function searchVideos(query: string): VideoItem[] {
  const q = query.toLowerCase();
  return ALL_LOCAL_VIDEOS.filter(v => 
    v.title.toLowerCase().includes(q) ||
    v.description?.toLowerCase().includes(q) ||
    v.hashtags?.some(h => h.toLowerCase().includes(q))
  );
}
