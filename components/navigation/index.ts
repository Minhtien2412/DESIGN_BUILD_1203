/**
 * Navigation Components - Barrel Export
 * Import all navigation components from one place
 * @example import { RouteCard, ServiceGrid, EnhancedSearchBar } from '@/components/navigation';
 */

// Main Header & Tab Bar
export { CallHeader, CallHistoryHeader, MeetingHeader } from "./CallHeader";
export type {
    CallHeaderProps,
    CallHistoryHeaderProps,
    CallStatus,
    CallType,
    MeetingHeaderProps
} from "./CallHeader";
export { ChatHeader, MessagesListHeader } from "./ChatHeader";
export type { ChatHeaderProps, MessagesListHeaderProps } from "./ChatHeader";
export { CustomTabBar } from "./custom-tab-bar";
export { CompactHeader, MainHeader } from "./MainHeader";
export type { CompactHeaderProps, MainHeaderProps } from "./MainHeader";
export { PageHeader, SimpleHeader } from "./PageHeader";
export type { PageHeaderProps, SimpleHeaderProps } from "./PageHeader";
export { QuickActionSheet } from "./quick-action-sheet";

// Other navigation components
export { HorizontalScroller } from "./HorizontalScroller";
export type { HorizontalScrollerProps } from "./HorizontalScroller";

export { QuickAccessButton } from "./QuickAccessButton";
export type { QuickAccessButtonProps } from "./QuickAccessButton";

export { EnhancedSearchBar } from "./EnhancedSearchBar";
export type { EnhancedSearchBarProps } from "./EnhancedSearchBar";

