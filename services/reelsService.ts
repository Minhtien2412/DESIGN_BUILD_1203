/**
 * Reels Service - Quản lý video reels từ server cache
 * 
 * Flow mới:
 * 1. Server lưu trữ ~2GB video từ Pexels
 * 2. Random display, không trùng lặp cho mỗi user/session
 * 3. Auto-cleanup video cũ, tải mới tự động
 * 
 * Priority: Server Cache API > User uploads > Pexels trực tiếp > Mock
 * 
 * Created: 13/01/2026
 * Updated: 16/01/2026 - Video Cache System
 */

import { ENV } from '@/config/env';
import pexelsService, { type PexelsVideo } from '@/services/pexelsService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ==================== TYPES ====================

export interface ReelUser {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  followers: string;
  isFollowing: boolean;
}

export interface Reel {
  id: string;
  slug?: string; // URL-friendly unique identifier (vĩnh viễn)
  title?: string; // Tên video để tìm kiếm
  user: ReelUser;
  videoUrl: string;
  thumbnail: string;
  description: string;
  music: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  views: string;
  duration: string;
  liked: boolean;
  saved: boolean;
  category: string;
  tags: string[];
  searchKeywords?: string[]; // Keywords để tìm kiếm
  source: 'user' | 'pexels' | 'mock' | 'server'; // Thêm 'server' source
  createdAt?: string;
}

export interface ReelsResponse {
  reels: Reel[];
  hasMore: boolean;
  nextPage?: number;
  source: 'user' | 'pexels' | 'mixed' | 'server';
  sessionId?: string;
  stats?: { watched: number; remaining: number };
}

// ==================== API ENDPOINTS ====================

const API_BASE_URL = ENV.API_BASE_URL;
const SESSION_KEY = 'reels_session_id';

// ==================== SESSION MANAGEMENT ====================

/**
 * Lấy hoặc tạo session ID cho tracking video history
 */
async function getOrCreateSessionId(): Promise<string> {
  try {
    let sessionId = await AsyncStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  } catch (error) {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Reset session để xem lại video từ đầu
 */
export async function resetSession(): Promise<string> {
  const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await AsyncStorage.setItem(SESSION_KEY, newSessionId);
  console.log('[ReelsService] Session reset:', newSessionId);
  return newSessionId;
}

// ==================== SERVER VIDEO CACHE API (MAIN) ====================

/**
 * [MAIN API] Lấy video feed random từ server cache
 * 
 * Tính năng:
 * - Video được lưu sẵn trên server (~2GB)
 * - Random shuffle, không trùng lặp cho mỗi session
 * - Auto-cleanup video cũ, tải mới tự động
 */
export async function getServerFeed(limit = 10): Promise<ReelsResponse> {
  try {
    const sessionId = await getOrCreateSessionId();
    
    console.log(`[ReelsService] Fetching feed: session=${sessionId.slice(-8)}, limit=${limit}`);
    
    // Timeout ngắn 3s để tránh đơ app
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(
      `${API_BASE_URL}/reels/feed?limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': ENV.API_KEY || '',
          'X-Session-Id': sessionId,
        },
        signal: controller.signal,
      }
    );
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.log('[ReelsService] Feed API error:', response.status);
      return { reels: [], hasMore: false, source: 'server' };
    }

    const data = await response.json();
    const videos = data.data?.videos || [];
    const stats = data.data?.stats || { watched: 0, remaining: 0 };
    
    const reels: Reel[] = videos.map((video: any) => ({
      ...video,
      source: 'server' as const,
    }));

    console.log(`[ReelsService] Loaded ${reels.length} videos (watched: ${stats.watched}, remaining: ${stats.remaining})`);

    return {
      reels,
      hasMore: data.hasMore || stats.remaining > 0,
      source: 'server',
      sessionId: data.data?.sessionId || sessionId,
      stats,
    };
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      console.log('[ReelsService] Feed API timeout - using fallback');
    } else {
      console.log('[ReelsService] Feed API error:', error);
    }
    return { reels: [], hasMore: false, source: 'server' };
  }
}

/**
 * Lấy reels từ server backend (legacy, có pagination)
 */
export async function getServerReels(
  category = 'all',
  page = 1,
  limit = 15
): Promise<ReelsResponse> {
  try {
    console.log(`[ReelsService] Fetching from server: category=${category}, page=${page}`);
    
    const response = await fetch(
      `${API_BASE_URL}/reels?category=${category}&page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': ENV.API_KEY || '',
        },
      }
    );

    if (!response.ok) {
      console.log('[ReelsService] Server API not available, status:', response.status);
      return { reels: [], hasMore: false, source: 'server' };
    }

    const data = await response.json();
    
    // Server trả về format chuẩn
    const reels: Reel[] = (data.reels || []).map((reel: any) => ({
      ...reel,
      source: 'server' as const,
    }));

    console.log(`[ReelsService] Loaded ${reels.length} reels from server`);

    return {
      reels,
      hasMore: data.hasMore || false,
      nextPage: data.page ? data.page + 1 : page + 1,
      source: 'server',
    };
  } catch (error) {
    console.log('[ReelsService] Server API error:', error);
    return { reels: [], hasMore: false, source: 'server' };
  }
}

/**
 * Lấy storage stats từ server
 */
export async function getServerStats(): Promise<{
  videoCount: number;
  totalSize: string;
  usedPercent: number;
} | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/reels/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ENV.API_KEY || '',
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.log('[ReelsService] Error fetching stats:', error);
    return null;
  }
}

/**
 * Lấy categories từ server
 */
export async function getServerCategories(): Promise<{ id: string; name: string; icon: string }[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/reels/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ENV.API_KEY || '',
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.log('[ReelsService] Error fetching categories:', error);
    return [];
  }
}

/**
 * Ghi nhận view cho video (với watch duration)
 */
export async function recordServerView(
  videoId: string,
  watchDuration = 0,
  completed = false
): Promise<void> {
  try {
    const sessionId = await getOrCreateSessionId();
    
    await fetch(`${API_BASE_URL}/reels/${videoId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ENV.API_KEY || '',
        'X-Session-Id': sessionId,
      },
      body: JSON.stringify({ watchDuration, completed }),
    });
  } catch (error) {
    // Silent fail - không quan trọng
  }
}

// ==================== USER REELS API ====================

/**
 * Lấy video từ bài viết (posts) của user - ưu tiên cao nhất
 */
export async function getVideosFromPosts(page = 1, limit = 10): Promise<Reel[]> {
  try {
    // Lấy posts có video
    const response = await fetch(`${API_BASE_URL}/posts?hasVideo=true&page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ENV.API_KEY || '',
      },
    });

    if (!response.ok) {
      console.log('[ReelsService] Posts API not available');
      return [];
    }

    const data = await response.json();
    const posts = data.posts || data.data || [];
    
    // Convert posts with videos to Reel format
    return posts
      .filter((post: any) => post.videoUrl || post.video || (post.media && post.media.some((m: any) => m.type === 'video')))
      .map((post: any) => {
        const videoMedia = post.media?.find((m: any) => m.type === 'video');
        return {
          id: `post_${post.id || post._id}`,
          user: {
            id: post.user?.id || post.userId,
            name: post.user?.name || post.userName || 'User',
            avatar: post.user?.avatar || `https://i.pravatar.cc/150?u=${post.userId}`,
            verified: post.user?.verified || false,
            followers: formatNumber(post.user?.followersCount || 0),
            isFollowing: post.user?.isFollowing || false,
          },
          videoUrl: post.videoUrl || post.video || videoMedia?.url || '',
          thumbnail: post.thumbnail || videoMedia?.thumbnail || post.images?.[0] || `https://picsum.photos/400/700?random=${post.id}`,
          description: post.content || post.description || post.caption || '',
          music: '♪ Original Sound',
          likes: post.likesCount || post.likes || 0,
          comments: post.commentsCount || post.comments || 0,
          shares: post.sharesCount || post.shares || 0,
          saves: post.savesCount || post.saves || 0,
          views: formatNumber(post.viewsCount || post.views || 0),
          duration: post.videoDuration || '0:30',
          liked: post.isLiked || false,
          saved: post.isSaved || false,
          category: post.category || 'general',
          tags: post.tags || [],
          source: 'user' as const,
          createdAt: post.createdAt,
        };
      });
  } catch (error) {
    console.log('[ReelsService] Error fetching videos from posts:', error);
    return [];
  }
}

/**
 * Lấy danh sách reels từ người dùng đăng tải
 */
export async function getUserReels(page = 1, limit = 10): Promise<Reel[]> {
  try {
    // Ưu tiên lấy video từ posts trước
    const postsVideos = await getVideosFromPosts(page, Math.ceil(limit / 2));
    
    const response = await fetch(`${API_BASE_URL}/reels?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ENV.API_KEY || '',
      },
    });

    if (!response.ok) {
      console.log('[ReelsService] User API not available, falling back');
      return postsVideos; // Return posts videos if reels API fails
    }

    const data = await response.json();
    
    const reels = (data.reels || data.data || []).map((reel: any) => ({
      id: reel.id || reel._id,
      user: {
        id: reel.user?.id || reel.userId,
        name: reel.user?.name || reel.userName || 'User',
        avatar: reel.user?.avatar || `https://i.pravatar.cc/150?u=${reel.userId}`,
        verified: reel.user?.verified || false,
        followers: formatNumber(reel.user?.followersCount || 0),
        isFollowing: reel.user?.isFollowing || false,
      },
      videoUrl: reel.videoUrl || reel.video,
      thumbnail: reel.thumbnail || reel.thumbnailUrl || reel.videoUrl,
      description: reel.description || reel.caption || '',
      music: reel.music || '♪ Original Sound',
      likes: reel.likesCount || reel.likes || 0,
      comments: reel.commentsCount || reel.comments || 0,
      shares: reel.sharesCount || reel.shares || 0,
      saves: reel.savesCount || reel.saves || 0,
      views: formatNumber(reel.viewsCount || reel.views || 0),
      duration: reel.duration || '0:30',
      liked: reel.isLiked || false,
      saved: reel.isSaved || false,
      category: reel.category || 'general',
      tags: reel.tags || [],
      source: 'user' as const,
      createdAt: reel.createdAt,
    }));
    
    // Combine posts videos (priority) + reels, remove duplicates
    const combined = [...postsVideos, ...reels];
    const uniqueReels = combined.filter((reel, index, self) => 
      index === self.findIndex(r => r.id === reel.id)
    );
    
    return uniqueReels;
  } catch (error) {
    console.log('[ReelsService] Error fetching user reels:', error);
    return [];
  }
}

/**
 * Lấy reels theo category từ user uploads
 */
export async function getUserReelsByCategory(category: string, page = 1, limit = 10): Promise<Reel[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/reels?category=${category}&page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': ENV.API_KEY || '',
        },
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return (data.reels || data.data || []).map((reel: any) => ({
      ...reel,
      source: 'user' as const,
    }));
  } catch (error) {
    console.log('[ReelsService] Error fetching category reels:', error);
    return [];
  }
}

// ==================== PEXELS REELS ====================

/**
 * Lấy videos từ Pexels và convert sang Reel format
 */
export async function getPexelsReels(
  category = 'construction',
  page = 1,
  limit = 10
): Promise<Reel[]> {
  try {
    // Map category to Pexels search query
    const categoryQueries: Record<string, string> = {
      all: 'construction building architecture',
      kientruc: 'architecture modern building design',
      noithat: 'interior design modern living room',
      thicong: 'construction work building site',
      vatlieu: 'construction materials concrete',
      phongthuy: 'feng shui zen garden meditation',
      diennuoc: 'plumbing electrical work',
      sanvuon: 'garden landscape outdoor',
      general: 'construction architecture',
    };

    const query = categoryQueries[category] || categoryQueries.general;
    const response = await pexelsService.searchVideos(query, { page, per_page: limit });

    return response.videos.map((video: PexelsVideo, index: number) => 
      pexelsVideoToReel(video, category, index)
    );
  } catch (error) {
    console.log('[ReelsService] Error fetching Pexels reels:', error);
    return [];
  }
}

/**
 * Convert Pexels video sang Reel format
 */
function pexelsVideoToReel(video: PexelsVideo, category: string, index: number): Reel {
  const sdVideo = video.video_files.find(f => f.quality === 'sd') || video.video_files[0];
  
  return {
    id: `pexels_${video.id}`,
    user: {
      id: `pexels_user_${video.user.id}`,
      name: video.user.name,
      avatar: `https://i.pravatar.cc/150?u=pexels${video.user.id}`,
      verified: true,
      followers: `${Math.floor(Math.random() * 100) + 10}K`,
      isFollowing: false,
    },
    videoUrl: sdVideo?.link || '',
    thumbnail: video.image,
    description: generateDescription(category, index),
    music: '♪ Pexels Music - Free to use',
    likes: Math.floor(Math.random() * 50000) + 1000,
    comments: Math.floor(Math.random() * 1000) + 50,
    shares: Math.floor(Math.random() * 500) + 20,
    saves: Math.floor(Math.random() * 2000) + 100,
    views: formatNumber(Math.floor(Math.random() * 500000) + 10000),
    duration: formatDuration(video.duration),
    liked: false,
    saved: false,
    category,
    tags: getCategoryTags(category),
    source: 'pexels',
  };
}

// ==================== COMBINED REELS ====================

/**
 * Lấy reels từ tất cả nguồn với priority:
 * 1. Server Feed API (Video cache với random, không trùng) - ƯU TIÊN CAO NHẤT
 * 2. Server Reels API (legacy, có pagination)  
 * 3. User uploads (posts + reels)
 * 4. Pexels API trực tiếp (fallback)
 * 5. Mock data (fallback cuối)
 */
export async function getReels(
  category = 'all',
  page = 1,
  limit = 15
): Promise<ReelsResponse> {
  // 1. THỬ LẤY TỪ SERVER FEED API (video cache - ưu tiên cao nhất)
  // Server có ~2GB video, random không trùng
  if (page === 1) {
    const feedResponse = await getServerFeed(limit);
    
    if (feedResponse.reels.length >= limit) {
      console.log('[ReelsService] Using server feed cache');
      return feedResponse;
    }
    
    // Nếu feed không đủ, thử legacy API
    if (feedResponse.reels.length > 0) {
      // Có video từ feed, bổ sung thêm
      const additional = limit - feedResponse.reels.length;
      const legacyResponse = await getServerReels(category, page, additional);
      
      const combined = [...feedResponse.reels, ...legacyResponse.reels];
      return {
        reels: combined,
        hasMore: true,
        source: 'server',
        sessionId: feedResponse.sessionId,
        stats: feedResponse.stats,
      };
    }
  }

  // 2. THỬ SERVER REELS API (legacy)
  const serverReels = await getServerReels(category, page, limit);
  
  if (serverReels.reels.length >= limit) {
    console.log('[ReelsService] Using server legacy API');
    return serverReels;
  }

  // 3. NẾU SERVER KHÔNG ĐỦ, THỬ LẤY TỪ USER UPLOADS
  const userReels = await getUserReels(page, limit);
  
  if (userReels.length >= limit) {
    return {
      reels: userReels,
      hasMore: true,
      nextPage: page + 1,
      source: 'user',
    };
  }
  
  // 4. COMBINE: Server + User + Pexels trực tiếp
  const combined: Reel[] = [];
  
  // Thêm server reels trước
  combined.push(...serverReels.reels);
  
  // Thêm user reels
  combined.push(...userReels);
  
  // Tính số còn thiếu
  const remaining = limit - combined.length;
  
  if (remaining > 0) {
    // 5. BỔ SUNG TỪ PEXELS TRỰC TIẾP nếu cần
    const categories = category === 'all' 
      ? ['general', 'kientruc', 'noithat', 'thicong']
      : [category];
    
    const pexelsPromises = categories.map(cat => 
      getPexelsReels(cat, page, Math.ceil(remaining / categories.length))
    );
    
    const pexelsResults = await Promise.all(pexelsPromises);
    const pexelsReels = pexelsResults.flat();
    
    combined.push(...shuffleArray(pexelsReels).slice(0, remaining));
  }
  
  // Xác định source dựa trên nội dung
  let source: 'user' | 'pexels' | 'mixed' | 'server' = 'mixed';
  if (serverReels.reels.length > 0 && userReels.length === 0) {
    source = 'server';
  } else if (userReels.length > 0 && serverReels.reels.length === 0) {
    source = 'user';
  }
  
  return {
    reels: combined,
    hasMore: true,
    nextPage: page + 1,
    source,
  };
}

/**
 * Shuffle array ngẫu nhiên
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Lấy reels theo category
 */
export async function getReelsByCategory(
  category: string,
  page = 1,
  limit = 10
): Promise<ReelsResponse> {
  // 1. Thử lấy từ User API trước
  const userReels = await getUserReelsByCategory(category, page, limit);
  
  if (userReels.length >= limit) {
    return {
      reels: userReels,
      hasMore: true,
      nextPage: page + 1,
      source: 'user',
    };
  }
  
  // 2. Bổ sung từ Pexels
  const remaining = limit - userReels.length;
  const pexelsReels = await getPexelsReels(category, page, remaining);
  
  const combined = [...userReels, ...pexelsReels];
  
  return {
    reels: combined,
    hasMore: combined.length >= limit,
    nextPage: page + 1,
    source: userReels.length > 0 ? 'mixed' : 'pexels',
  };
}

/**
 * Lấy reels của một user cụ thể
 */
export async function getUserProfileReels(userId: string, page = 1, limit = 10): Promise<Reel[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/reels?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': ENV.API_KEY || '',
        },
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return (data.reels || data.data || []).map((reel: any) => ({
      ...reel,
      source: 'user' as const,
    }));
  } catch (error) {
    console.log('[ReelsService] Error fetching user profile reels:', error);
    return [];
  }
}

// ==================== INTERACTIONS ====================

/**
 * Like/Unlike a reel
 */
export async function toggleReelLike(reelId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/reels/${reelId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ENV.API_KEY || '',
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Save/Unsave a reel
 */
export async function toggleReelSave(reelId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/reels/${reelId}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ENV.API_KEY || '',
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Increment view count
 */
export async function incrementReelView(reelId: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/reels/${reelId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ENV.API_KEY || '',
      },
    });
  } catch {
    // Silent fail for views
  }
}

// ==================== HELPERS ====================

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function generateDescription(category: string, index: number): string {
  const descriptions: Record<string, string[]> = {
    kientruc: [
      '🏠 Thiết kế kiến trúc hiện đại\n\n#kientruc #design #modern',
      '✨ Biệt thự sang trọng 2026\n\n#biethu #luxury #architecture',
      '🏗️ Xu hướng kiến trúc mới nhất\n\n#trend #building #style',
    ],
    noithat: [
      '🛋️ Nội thất phòng khách hiện đại\n\n#noithat #livingroom #decor',
      '✨ Thiết kế nội thất tối giản\n\n#minimalist #interior #design',
      '🏠 Ý tưởng trang trí nhà đẹp\n\n#homedecor #ideas #inspiration',
    ],
    thicong: [
      '👷 Kỹ thuật thi công chuyên nghiệp\n\n#thicong #xaydung #kythuat',
      '🔨 Bí quyết xây nhà bền đẹp\n\n#construction #tips #building',
      '💪 Công trình chất lượng cao\n\n#quality #work #professional',
    ],
    vatlieu: [
      '🧱 Vật liệu xây dựng chất lượng\n\n#vatlieu #materials #xaydung',
      '📦 So sánh các loại vật liệu\n\n#compare #tips #building',
      '💡 Chọn vật liệu phù hợp\n\n#guide #construction #materials',
    ],
    phongthuy: [
      '🔮 Phong thủy nhà ở may mắn\n\n#phongthuy #fengshui #lucky',
      '☯️ Bố trí phong thủy chuẩn\n\n#harmony #balance #home',
      '✨ Bí quyết phong thủy 2026\n\n#tips #fengshui #prosperity',
    ],
    diennuoc: [
      '🔧 Hướng dẫn sửa chữa điện nước\n\n#diennuoc #DIY #repair',
      '💡 Mẹo lắp đặt an toàn\n\n#tips #electrical #plumbing',
      '🛠️ Kỹ thuật điện nước cơ bản\n\n#basic #guide #home',
    ],
    sanvuon: [
      '🌿 Thiết kế sân vườn đẹp\n\n#sanvuon #garden #landscape',
      '🪴 Cây cảnh cho nhà phố\n\n#plants #urban #green',
      '✨ Tiểu cảnh mini tuyệt đẹp\n\n#miniscape #decor #outdoor',
    ],
    general: [
      '🏠 Video xây dựng hay nhất\n\n#construction #building #design',
      '✨ Ý tưởng thiết kế độc đáo\n\n#creative #ideas #inspiration',
      '💡 Tips hữu ích cho ngôi nhà\n\n#tips #home #useful',
    ],
  };

  const categoryDescs = descriptions[category] || descriptions.general;
  return categoryDescs[index % categoryDescs.length];
}

function getCategoryTags(category: string): string[] {
  const tags: Record<string, string[]> = {
    kientruc: ['kiến trúc', 'design', 'modern', 'architecture'],
    noithat: ['nội thất', 'decor', 'interior', 'home'],
    thicong: ['thi công', 'xây dựng', 'construction', 'building'],
    vatlieu: ['vật liệu', 'materials', 'gạch', 'xi măng'],
    phongthuy: ['phong thủy', 'feng shui', 'harmony', 'luck'],
    diennuoc: ['điện nước', 'plumbing', 'electrical', 'repair'],
    sanvuon: ['sân vườn', 'garden', 'landscape', 'plants'],
    general: ['construction', 'design', 'building', 'home'],
  };
  return tags[category] || tags.general;
}

// ==================== EXPORT ====================

export default {
  // Combined
  getReels,
  getReelsByCategory,
  
  // User specific - ưu tiên video từ posts
  getUserReels,
  getUserReelsByCategory,
  getUserProfileReels,
  getVideosFromPosts,
  
  // Pexels fallback
  getPexelsReels,
  
  // Interactions
  toggleReelLike,
  toggleReelSave,
  incrementReelView,
};
