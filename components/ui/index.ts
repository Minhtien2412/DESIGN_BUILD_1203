// UI atoms & molecules barrel
export { default as ActiveCallMiniOverlay } from './active-call-mini-overlay';
export { AnimatedCategoryGrid } from './animated-grid';
export { default as BottomNotice } from './bottom-notice';
export { Button } from './button';
export { CallActionButtons, CallStatusIndicator, QuickCallButton } from './call-action-buttons';
export { CartBadge } from './cart-badge';
export { CategoryHeader, CategoryHeaderIcon } from './category-header';
export { ConstructionProgressCard } from './construction-progress-card';
export { Container } from './container';
export { DesignGrid } from './design-grid';
export { default as FinishPage } from './finish-page';
export { default as GlobalShortcuts } from './global-shortcuts';
export { IconSymbol } from './icon-symbol';
export { IncomingCallOverlay, useIncomingCall } from './incoming-call-overlay';
export { InfoBox } from './info-box';
export { default as InlineVideo } from './inline-video';
export { Input } from './input';
export { Loader } from './loader';
export { MediaViewerProvider, useMediaViewer } from './media-viewer';
export { MenuCard, type MenuCardItem } from './menu-card';
export { MenuGrid } from './menu-grid';
export { default as NotificationPopup } from './notification-popup';
export { NotificationsBadge } from './notifications-badge';
export { ProductCard } from './product-card';
export { ProductGrid } from './product-grid';
export { QuickCallWidget } from './quick-call-widget';
export { RemoteIcon } from './remote-icon';
export { NOTIFICATION_TEMPLATES, RichNotification, createNotificationFromTemplate, type NotificationTemplate } from './rich-notification';
export { Section } from './section';
export { default as SegmentedTabs } from './segmented-tabs';
export { ServiceImageIcon } from './service-image-icon';
export { SurfaceCard } from './surface-card';
export { ToastProvider } from './toast-provider';
export { VideoCard } from './video-card';
export { VideoGrid } from './video-grid';

// ============================================
// NEW PHASE 1 WEEK 1 COMPONENTS (16 Components)
// ============================================

// Form Components (3/3 = 100%)
export { default as Checkbox, CheckboxGroup } from './checkbox';
export { default as RadioGroup } from './radio';
export { default as Select } from './select';

// Feedback Components  
export { default as Alert, AlertProvider, useAlert } from './alert';
export { default as Badge, NotificationBadge } from './badge';
export { ConfirmDialog, default as Modal } from './modal';
export { default as Skeleton, SkeletonAvatar, SkeletonCard, SkeletonCircle, SkeletonList, SkeletonText } from './skeleton';

// Display Components
export { default as Avatar, AvatarGroup } from './avatar';
export { default as Card, CardActions, CardContent, CardHeader, CardMedia, ProductCard as ProductCardNew } from './card';
export { default as Chip, ChipGroup } from './chip';
export { default as ListItem, SectionHeader } from './list-item';
export { TabPanel, default as Tabs } from './tabs';

// ============================================
// PHASE 2 - PROJECT MANAGEMENT COMPONENTS
// ============================================

export { default as CostTracker, type BudgetCategory, type CostItem } from './cost-tracker';
export { default as TaskManagement, type Task } from './task-management';

// ============================================
// SHARED USER/CONTRACTOR INFO COMPONENTS
// ============================================

export { ContractorInfoCard, type ContractorInfoCardProps } from './contractor-info-card';

// ============================================
// DATA SYNC / CRM INTEGRATION COMPONENTS
// ============================================

export { CRMDataList } from './CRMDataList';
export { SyncStatusBadge } from './SyncStatusBadge';

