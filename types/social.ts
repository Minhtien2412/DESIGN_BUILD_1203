/**
 * Social Feed Types
 * Facebook-style social network features
 * 
 * Features:
 * - Posts (text, images, videos)
 * - Timeline (personal & news feed)
 * - Reactions (like, love, haha, wow, sad, angry)
 * - Comments with replies
 * - Sharing posts
 * - User profiles
 * 
 * @author AI Assistant
 * @date 23/12/2025
 */

// ============================================
// User Types
// ============================================

export interface SocialUser {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  coverPhoto?: string;
  bio?: string;
  verified: boolean;
  friendsCount: number;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFriend?: boolean;
  isFollowing?: boolean;
  mutualFriendsCount?: number;
  createdAt: string;
}

export interface UserProfile extends SocialUser {
  email?: string;
  phone?: string;
  location?: string;
  workplace?: string;
  education?: string;
  relationship?: 'single' | 'in_relationship' | 'engaged' | 'married' | 'complicated' | 'open';
  birthday?: string;
  website?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

// ============================================
// Post Types
// ============================================

export interface Post {
  id: string;
  authorId: string;
  author: SocialUser;
  content: string;
  media?: PostMedia[];
  privacy: PostPrivacy;
  location?: PostLocation;
  feeling?: string;
  taggedUsers?: SocialUser[];
  
  // Engagement
  reactionsCount: number;
  reactions: ReactionSummary;
  commentsCount: number;
  sharesCount: number;
  
  // User's interaction
  myReaction?: ReactionType | null;
  isSaved?: boolean;
  
  // Sharing
  sharedPost?: Post; // Original post if this is a share
  sharedFrom?: SocialUser; // User who shared (if shared)
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Meta
  isEdited: boolean;
  isPinned?: boolean;
  isSponsored?: boolean;
}

export interface PostMedia {
  id: string;
  type: 'image' | 'video' | 'link';
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number; // For videos
  altText?: string;
}

export interface PostLocation {
  id: string;
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
}

export type PostPrivacy = 'public' | 'friends' | 'friends_except' | 'specific_friends' | 'only_me';

// ============================================
// Reaction Types
// ============================================

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

export interface Reaction {
  userId: string;
  user: SocialUser;
  type: ReactionType;
  createdAt: string;
}

export interface ReactionSummary {
  like: number;
  love: number;
  haha: number;
  wow: number;
  sad: number;
  angry: number;
  topReactions: ReactionType[]; // Top 3 reaction types
}

export const REACTION_EMOJIS: Record<ReactionType, string> = {
  like: '👍',
  love: '❤️',
  haha: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😠',
};

export const REACTION_COLORS: Record<ReactionType, string> = {
  like: '#2078F4',
  love: '#F33E58',
  haha: '#F7B125',
  wow: '#F7B125',
  sad: '#F7B125',
  angry: '#E9710F',
};

// ============================================
// Comment Types
// ============================================

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: SocialUser;
  content: string;
  media?: PostMedia;
  
  // Engagement
  reactionsCount: number;
  reactions: ReactionSummary;
  myReaction?: ReactionType | null;
  
  // Replies
  repliesCount: number;
  replies?: Comment[];
  parentId?: string; // For nested replies
  replyTo?: SocialUser; // User being replied to
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
}

// ============================================
// Timeline Types
// ============================================

export interface Timeline {
  posts: Post[];
  nextCursor?: string;
  hasMore: boolean;
}

export type FeedType = 'news_feed' | 'profile' | 'friends' | 'groups' | 'pages' | 'saved';

export interface FeedFilter {
  type?: FeedType;
  userId?: string;
  groupId?: string;
  pageId?: string;
  mediaOnly?: boolean;
  fromDate?: string;
  toDate?: string;
}

// ============================================
// Story Types
// ============================================

export interface Story {
  id: string;
  authorId: string;
  author: SocialUser;
  media: StoryMedia;
  viewsCount: number;
  viewers?: SocialUser[];
  hasViewed?: boolean;
  createdAt: string;
  expiresAt: string; // Stories expire after 24h
}

export interface StoryMedia {
  type: 'image' | 'video';
  url: string;
  duration?: number;
  backgroundColor?: string;
  text?: string;
  textPosition?: { x: number; y: number };
  stickers?: StorySticcker[];
}

export interface StorySticcker {
  id: string;
  type: 'emoji' | 'gif' | 'poll' | 'question' | 'location' | 'mention' | 'hashtag' | 'music';
  content: string;
  position: { x: number; y: number };
  scale?: number;
  rotation?: number;
}

// ============================================
// Notification Types
// ============================================

export type SocialNotificationType = 
  | 'post_reaction'
  | 'comment'
  | 'comment_reaction'
  | 'reply'
  | 'mention'
  | 'share'
  | 'friend_request'
  | 'friend_accepted'
  | 'birthday'
  | 'memory'
  | 'tag'
  | 'group_post'
  | 'page_post';

export interface SocialNotification {
  id: string;
  type: SocialNotificationType;
  actor: SocialUser;
  actors?: SocialUser[]; // Multiple actors (e.g., "A, B and 3 others liked...")
  target?: {
    type: 'post' | 'comment' | 'story' | 'profile';
    id: string;
    preview?: string;
  };
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ============================================
// API Request/Response Types
// ============================================

// Get Feed
export interface GetFeedRequest {
  filter?: FeedFilter;
  cursor?: string;
  limit?: number;
}

export interface GetFeedResponse {
  success: boolean;
  data: Timeline;
}

// Create Post
export interface CreatePostRequest {
  content: string;
  media?: File[] | string[];
  privacy?: PostPrivacy;
  location?: Omit<PostLocation, 'id'>;
  feeling?: string;
  taggedUserIds?: string[];
}

export interface CreatePostResponse {
  success: boolean;
  post: Post;
}

// Update Post
export interface UpdatePostRequest {
  content?: string;
  privacy?: PostPrivacy;
  location?: Omit<PostLocation, 'id'> | null;
  feeling?: string | null;
}

export interface UpdatePostResponse {
  success: boolean;
  post: Post;
}

// React to Post
export interface ReactToPostRequest {
  postId: string;
  type: ReactionType | null; // null to remove reaction
}

export interface ReactToPostResponse {
  success: boolean;
  reactions: ReactionSummary;
  reactionsCount: number;
  myReaction: ReactionType | null;
}

// Get Comments
export interface GetCommentsRequest {
  postId: string;
  parentId?: string; // For replies
  cursor?: string;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'popular';
}

export interface GetCommentsResponse {
  success: boolean;
  comments: Comment[];
  nextCursor?: string;
  hasMore: boolean;
  total: number;
}

// Create Comment
export interface CreateCommentRequest {
  postId: string;
  content: string;
  media?: File | string;
  parentId?: string; // For replies
  replyToUserId?: string;
}

export interface CreateCommentResponse {
  success: boolean;
  comment: Comment;
  commentsCount: number;
}

// Share Post
export interface SharePostRequest {
  postId: string;
  content?: string;
  privacy?: PostPrivacy;
}

export interface SharePostResponse {
  success: boolean;
  post: Post;
  sharesCount: number;
}

// User Profile
export interface GetProfileRequest {
  userId?: string;
  username?: string;
}

export interface GetProfileResponse {
  success: boolean;
  user: UserProfile;
}

// Search
export interface SocialSearchRequest {
  query: string;
  type?: 'all' | 'posts' | 'people' | 'photos' | 'videos' | 'pages' | 'groups' | 'places';
  cursor?: string;
  limit?: number;
}

export interface SocialSearchResponse {
  success: boolean;
  results: {
    posts?: Post[];
    users?: SocialUser[];
    pages?: any[];
    groups?: any[];
    places?: PostLocation[];
  };
  nextCursor?: string;
  hasMore: boolean;
}

// ============================================
// UI State Types
// ============================================

export interface SocialUIState {
  activeFeed: FeedType;
  isComposerOpen: boolean;
  activePostId?: string;
  isCommentsOpen: boolean;
  isShareSheetOpen: boolean;
  isReactionPickerOpen: boolean;
}

export interface PostComposerState {
  content: string;
  media: PostMedia[];
  privacy: PostPrivacy;
  location?: PostLocation;
  feeling?: string;
  taggedUsers: SocialUser[];
  isUploading: boolean;
  uploadProgress: number;
}

// ============================================
// Constants
// ============================================

export const PRIVACY_OPTIONS: { value: PostPrivacy; label: string; icon: string }[] = [
  { value: 'public', label: 'Công khai', icon: 'globe-outline' },
  { value: 'friends', label: 'Bạn bè', icon: 'people-outline' },
  { value: 'friends_except', label: 'Bạn bè ngoại trừ...', icon: 'people-outline' },
  { value: 'specific_friends', label: 'Bạn bè cụ thể', icon: 'person-outline' },
  { value: 'only_me', label: 'Chỉ mình tôi', icon: 'lock-closed-outline' },
];

export const FEED_TABS: { type: FeedType; label: string; icon: string }[] = [
  { type: 'news_feed', label: 'Bảng tin', icon: 'newspaper-outline' },
  { type: 'friends', label: 'Bạn bè', icon: 'people-outline' },
  { type: 'groups', label: 'Nhóm', icon: 'chatbubbles-outline' },
  { type: 'pages', label: 'Trang', icon: 'flag-outline' },
  { type: 'saved', label: 'Đã lưu', icon: 'bookmark-outline' },
];

export const FEELINGS = [
  '😊 hạnh phúc',
  '😍 yêu thương',
  '😂 vui vẻ',
  '🤔 suy nghĩ',
  '😎 tuyệt vời',
  '😴 mệt mỏi',
  '😤 tức giận',
  '😢 buồn',
  '🥳 đang ăn mừng',
  '🏃 đang hoạt động',
  '✈️ đang du lịch',
  '📚 đang học',
  '💼 đang làm việc',
  '🎮 đang chơi game',
  '🎵 đang nghe nhạc',
];
