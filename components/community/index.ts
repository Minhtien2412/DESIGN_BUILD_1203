/**
 * Community Components Index
 * ==========================
 *
 * Export all community-related components.
 */

// Feed Card Components
export {
    AnnouncementCard,
    DevelopmentPlanCard,
    FeedItemRenderer,
    NewsCard,
    PhotoCard,
    VideoCard
} from "./FeedCards";

// Facebook-style Feed Card Components
export {
    CreatePostCard,
    FacebookFeedCard,
    StoryCard
} from "./FacebookFeedCard";

// Comments Sheet - Bottom sheet for comments/reviews
export { CommentsSheetProvider, useCommentsSheet } from "./CommentsSheet";
export type {
    Comment,
    CommentAuthor,
    CommentsSheetOptions
} from "./CommentsSheet";

// Share Sheet - Modal for sharing content
export { ShareSheetProvider, useShareSheet } from "./ShareSheet";
export type { ShareItem, ShareSheetOptions } from "./ShareSheet";

// More Options Menu - Post options (save, hide, report, etc.)
export { MoreOptionsProvider, useMoreOptions } from "./MoreOptionsMenu";
export type {
    MoreOptionsItem,
    MoreOptionsSheetOptions
} from "./MoreOptionsMenu";

// Vertical Video Feed - TikTok-style video viewer
export {
    useVerticalVideoFeed, VerticalVideoFeedProvider
} from "./VerticalVideoFeed";
export type { VideoItem } from "./VerticalVideoFeed";

// Feed Video Player
export { FeedVideoPlayer } from "./FeedVideoPlayer";

// Types
export type {
    AnnouncementFeedItem,
    CommunityFeedItem,
    DevelopmentPlanFeedItem,
    NewsFeedItem,
    PhotoFeedItem,
    VideoFeedItem
} from "../../services/communityFeedService";

