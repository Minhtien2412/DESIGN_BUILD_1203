/**
 * TikTok-Style Video Platform Types
 * Comprehensive types for TikTok-like video social features
 * 
 * Features:
 * - Video Feed (vertical scroll)
 * - Like/Heart animation
 * - Comments with replies
 * - Share to multiple platforms
 * - User profiles with follow system
 * - Video statistics and analytics
 * 
 * @author AI Assistant
 * @date 23/12/2025
 */

// ============================================
// User & Profile Types
// ============================================

export interface TikTokUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio?: string;
  verified: boolean;
  followersCount: number;
  followingCount: number;
  likesCount: number;
  videosCount: number;
  isFollowing?: boolean;
  isFollowedBy?: boolean;
  createdAt: string;
  socialLinks?: {
    instagram?: string;
    youtube?: string;
    twitter?: string;
    website?: string;
  };
}

export interface UserProfile extends TikTokUser {
  videos: TikTokVideo[];
  likedVideos?: TikTokVideo[];
  savedVideos?: TikTokVideo[];
  playlists?: VideoPlaylist[];
}

export interface VideoPlaylist {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  videosCount: number;
  isPublic: boolean;
  createdAt: string;
}

// ============================================
// Video Types
// ============================================

export interface TikTokVideo {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  previewUrl?: string; // Low-res preview for loading
  
  // Author
  author: TikTokUser;
  
  // Content
  caption: string;
  hashtags: string[];
  mentions: string[];
  music?: VideoMusic;
  
  // Stats
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  
  // User interaction state
  isLiked: boolean;
  isSaved: boolean;
  isFollowingAuthor: boolean;
  
  // Metadata
  duration: number; // seconds
  aspectRatio: number; // width/height
  allowComments: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
  
  // Location & Time
  location?: VideoLocation;
  createdAt: string;
  
  // Additional features
  products?: VideoProduct[]; // Shoppable tags
  effects?: VideoEffect[];
  isAd?: boolean;
  isSponsored?: boolean;
}

export interface VideoMusic {
  id: string;
  name: string;
  artist: string;
  coverUrl?: string;
  duration: number;
  usageCount: number; // How many videos use this sound
}

export interface VideoLocation {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

export interface VideoProduct {
  id: string;
  name: string;
  price: number;
  currency: string;
  imageUrl: string;
  productUrl: string;
}

export interface VideoEffect {
  id: string;
  name: string;
  iconUrl: string;
}

// ============================================
// Comment Types
// ============================================

export interface TikTokComment {
  id: string;
  videoId: string;
  author: TikTokUser;
  content: string;
  likesCount: number;
  repliesCount: number;
  isLiked: boolean;
  isPinned: boolean;
  isAuthorReply: boolean; // Author of video replied
  createdAt: string;
  replies?: TikTokComment[];
  mentions?: string[];
}

export interface CommentReply extends TikTokComment {
  parentId: string;
  replyToUser?: TikTokUser;
}

// ============================================
// Interaction Types
// ============================================

export interface VideoInteractionState {
  videoId: string;
  isLiked: boolean;
  isSaved: boolean;
  isFollowingAuthor: boolean;
  watchProgress: number; // 0-1
  watchTime: number; // seconds
  hasCommented: boolean;
  hasShared: boolean;
}

export type SharePlatform = 
  | 'facebook'
  | 'messenger'
  | 'instagram'
  | 'instagram_story'
  | 'whatsapp'
  | 'zalo'
  | 'telegram'
  | 'twitter'
  | 'tiktok'
  | 'copy_link'
  | 'sms'
  | 'email'
  | 'more';

export interface ShareAction {
  platform: SharePlatform;
  icon: string;
  label: string;
  color: string;
}

// ============================================
// Feed Types
// ============================================

export type FeedType = 'for_you' | 'following' | 'trending' | 'live';

export interface VideoFeed {
  type: FeedType;
  videos: TikTokVideo[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface FeedFilter {
  category?: string;
  hashtag?: string;
  musicId?: string;
  locationId?: string;
  userId?: string;
}

// ============================================
// Search Types
// ============================================

export interface SearchResult {
  type?: 'video' | 'user' | 'hashtag' | 'music' | 'location' | 'all';
  videos?: TikTokVideo[];
  users?: TikTokUser[];
  hashtags?: HashtagResult[];
  music?: VideoMusic[];
  locations?: VideoLocation[];
}

export interface HashtagResult {
  id: string;
  name: string;
  viewsCount: number;
  videosCount: number;
  isFollowing: boolean;
}

// ============================================
// Notification Types
// ============================================

export type TikTokNotificationType = 
  | 'like'
  | 'comment'
  | 'mention'
  | 'follow'
  | 'share'
  | 'duet'
  | 'stitch'
  | 'live'
  | 'system';

export interface TikTokNotification {
  id: string;
  type: TikTokNotificationType;
  title: string;
  message: string;
  thumbnail?: string;
  user?: TikTokUser;
  video?: TikTokVideo;
  isRead: boolean;
  createdAt: string;
}

// ============================================
// Live Stream Types
// ============================================

export interface LiveStream {
  id: string;
  host: TikTokUser;
  title: string;
  viewersCount: number;
  likesCount: number;
  startedAt: string;
  thumbnail?: string;
  isFollowing: boolean;
}

export interface LiveComment {
  id: string;
  user: TikTokUser;
  content: string;
  giftValue?: number;
  createdAt: string;
}

export interface LiveGift {
  id: string;
  name: string;
  iconUrl: string;
  coinValue: number;
  animation?: string;
}

// ============================================
// API Request/Response Types
// ============================================

// Video Feed
export interface GetFeedRequest {
  type: FeedType;
  cursor?: string;
  limit?: number;
  filter?: FeedFilter;
}

export interface GetFeedResponse {
  success: boolean;
  feed: VideoFeed;
}

// Like Video
export interface LikeVideoRequest {
  videoId: string;
}

export interface LikeVideoResponse {
  success: boolean;
  isLiked: boolean;
  likesCount: number;
}

// Follow User
export interface FollowUserRequest {
  userId: string;
}

export interface FollowUserResponse {
  success: boolean;
  isFollowing: boolean;
  followersCount: number;
}

// Comments
export interface GetCommentsRequest {
  videoId: string;
  cursor?: string;
  limit?: number;
  sort?: 'newest' | 'popular';
}

export interface GetCommentsResponse {
  success: boolean;
  comments: TikTokComment[];
  total: number;
  nextCursor?: string;
  hasMore: boolean;
}

export interface PostCommentRequest {
  videoId: string;
  content: string;
  parentId?: string; // For replies
  replyToUserId?: string;
  mentions?: string[];
}

export interface PostCommentResponse {
  success: boolean;
  comment: TikTokComment;
  commentsCount: number;
}

export interface LikeCommentRequest {
  commentId: string;
}

export interface LikeCommentResponse {
  success: boolean;
  isLiked: boolean;
  likesCount: number;
}

// Share
export interface ShareVideoRequest {
  videoId: string;
  platform: SharePlatform;
}

export interface ShareVideoResponse {
  success: boolean;
  sharesCount: number;
  shareUrl?: string;
}

// User Profile
export interface GetUserProfileRequest {
  userId?: string;
  username?: string;
}

export interface GetUserProfileResponse {
  success: boolean;
  user: UserProfile;
}

export interface GetUserVideosRequest {
  userId: string;
  type?: 'uploaded' | 'liked' | 'saved';
  cursor?: string;
  limit?: number;
}

export interface GetUserVideosResponse {
  success: boolean;
  videos: TikTokVideo[];
  nextCursor?: string;
  hasMore: boolean;
}

// Search
export interface SearchRequest {
  query: string;
  type?: 'all' | 'video' | 'user' | 'hashtag' | 'music';
  cursor?: string;
  limit?: number;
}

export interface SearchResponse {
  success: boolean;
  results: SearchResult;
  nextCursor?: string;
  hasMore: boolean;
}

// Analytics
export interface VideoAnalytics {
  videoId: string;
  views: number;
  uniqueViewers: number;
  avgWatchTime: number;
  completionRate: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  traffic: {
    forYou: number;
    following: number;
    profile: number;
    search: number;
    sound: number;
    hashtag: number;
    other: number;
  };
  demographics: {
    gender: { male: number; female: number; other: number };
    ageGroups: { [key: string]: number };
    topCountries: { country: string; percentage: number }[];
  };
}

// ============================================
// UI State Types
// ============================================

export interface TikTokUIState {
  currentFeedType: FeedType;
  currentVideoIndex: number;
  isCommentsOpen: boolean;
  isShareSheetOpen: boolean;
  isUserProfileOpen: boolean;
  isMuted: boolean;
  isAutoplay: boolean;
  videoQuality: 'auto' | 'low' | 'medium' | 'high';
}

export interface TikTokPlayerState {
  isPlaying: boolean;
  isBuffering: boolean;
  isMuted: boolean;
  progress: number;
  duration: number;
  error?: string;
}

// ============================================
// Animation Types
// ============================================

export interface HeartAnimation {
  id: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface FloatingEmoji {
  id: string;
  emoji: string;
  startX: number;
  startY: number;
}

// ============================================
// Settings Types
// ============================================

export interface TikTokSettings {
  autoplayEnabled: boolean;
  soundEnabled: boolean;
  dataSaverMode: boolean;
  downloadQuality: 'low' | 'medium' | 'high';
  contentPreferences: string[];
  restrictedMode: boolean;
  privateAccount: boolean;
  allowComments: 'everyone' | 'friends' | 'nobody';
  allowDuet: 'everyone' | 'friends' | 'nobody';
  allowStitch: 'everyone' | 'friends' | 'nobody';
  allowDownloads: boolean;
}

// ============================================
// Constants
// ============================================

export const SHARE_PLATFORMS: ShareAction[] = [
  { platform: 'facebook', icon: 'logo-facebook', label: 'Facebook', color: '#1877F2' },
  { platform: 'messenger', icon: 'chatbubble', label: 'Messenger', color: '#0084FF' },
  { platform: 'instagram', icon: 'logo-instagram', label: 'Instagram', color: '#E4405F' },
  { platform: 'instagram_story', icon: 'albums', label: 'Story', color: '#E4405F' },
  { platform: 'whatsapp', icon: 'logo-whatsapp', label: 'WhatsApp', color: '#25D366' },
  { platform: 'zalo', icon: 'chatbubbles', label: 'Zalo', color: '#0068FF' },
  { platform: 'telegram', icon: 'paper-plane', label: 'Telegram', color: '#0088CC' },
  { platform: 'twitter', icon: 'logo-twitter', label: 'Twitter', color: '#1DA1F2' },
  { platform: 'copy_link', icon: 'link', label: 'Copy link', color: '#6B7280' },
  { platform: 'sms', icon: 'chatbox', label: 'SMS', color: '#34C759' },
  { platform: 'email', icon: 'mail', label: 'Email', color: '#EA4335' },
  { platform: 'more', icon: 'ellipsis-horizontal', label: 'More', color: '#6B7280' },
];

export const FEED_TABS: { type: FeedType; label: string }[] = [
  { type: 'following', label: 'Following' },
  { type: 'for_you', label: 'For You' },
];

export const VIDEO_CATEGORIES = [
  'Entertainment',
  'Dance',
  'Comedy',
  'Sports',
  'Food',
  'Beauty',
  'Fashion',
  'Travel',
  'Education',
  'Gaming',
  'Music',
  'Pets',
  'DIY',
  'Fitness',
  'News',
];
