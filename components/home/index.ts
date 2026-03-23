/**
 * components/home — Barrel Export (Canonical)
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  CANONICAL COMPONENTS (v3 — 2026-06-12, refined Round 4 2026-03-16)│
 * │  These are the actively used building blocks for the home screen.  │
 * │  Team should ONLY import from this barrel file.                    │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │  ❶ Screen compositions: CustomerHomeView, WorkerHomeView           │
 * │  ❷ Header: SearchHeaderBar                                         │
 * │  ❸ Sections: BannerCarousel, CategoryIconGrid, WorkerGrid,         │
 * │     SectionTitle, ProductSection, ProductCard, DesignLiveSection,  │
 * │     VideoThumbnails, CommunityIconGrid, CategoryTagRow             │
 * │  ❹ States: HomeSkeleton, HomeEmpty                                 │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │  DEPRECATED (v1/v2 — kept for backward compat but NOT for new use) │
 * │  SearchBar, ServiceGrid, SimpleHero, TopBar, UserProfile,          │
 * │  UtilityGrid, ConstructionIcons, CategoryChips,                    │
 * │  EquipmentGridSection, FeaturedProducts, FlashSaleSection,         │
 * │  LibraryGridSection, RepairServicesGrid, StatsBar,                 │
 * │  TopWorkersSection, TrendingSection                                │
 * └─────────────────────────────────────────────────────────────────────┘
 */

// ============================================================================
// ❶ CANONICAL — Screen Compositions
// ============================================================================
export { CustomerHomeView } from "./CustomerHomeView";
export { WorkerHomeView } from "./WorkerHomeView";

// ============================================================================
// ❷ CANONICAL — Header
// ============================================================================
export { SearchHeaderBar } from "./SearchHeaderBar";
export type { SearchHeaderBarProps } from "./SearchHeaderBar";

// ============================================================================
// ❸ CANONICAL — Section Components
// ============================================================================
export { BannerCarousel } from "./BannerCarousel";
export type { BannerItem } from "./BannerCarousel";
export { CategoryIconGrid } from "./CategoryIconGrid";
export type { GridItem } from "./CategoryIconGrid";
export { CategoryTagRow } from "./CategoryTagRow";
export { CommunityIconGrid } from "./CommunityIconGrid";
export { DesignLiveSection } from "./DesignLiveSection";
export { ProductCard } from "./ProductCard";
export type { ProductCardItem } from "./ProductCard";
export { ProductSection } from "./ProductSection";
export { SectionTitle } from "./SectionTitle";
export type { SectionTitleProps } from "./SectionTitle";
export { VideoThumbnails } from "./VideoThumbnails";
export { WorkerGrid } from "./WorkerGrid";

// ============================================================================
// ❹ CANONICAL — State Components
// ============================================================================
export { HomeEmpty } from "./HomeEmpty";
export { HomeSkeleton } from "./HomeSkeleton";

// ============================================================================
// SHARED — Used by other screens (keep exported)
// ============================================================================
export { VideoPlayer } from "./video-player";

// ============================================================================
// DEPRECATED — v1/v2 components (DO NOT USE in new code)
// Kept for backward compatibility; will be removed in future cleanup.
// ============================================================================
/** @deprecated Use SearchHeaderBar instead */
export { SearchBar } from "./SearchBar";
/** @deprecated Use CategoryIconGrid instead */
export { ServiceGrid } from "./ServiceGrid";
/** @deprecated Use BannerCarousel instead */
export { SimpleHero } from "./SimpleHero";
/** @deprecated Use SearchHeaderBar instead */
export { TopBar } from "./TopBar";
/** @deprecated No longer used in home screen */
export { UserProfile } from "./UserProfile";
/** @deprecated Use CategoryIconGrid instead */
export { UtilityGrid } from "./UtilityGrid";
/** @deprecated Icons are now inline in data/home-data.ts */
export {
    ConstructionIcon,
    DesignServiceCard,
    ICON_COLORS,
    ServiceIconButton,
    UNIFIED_ICONS,
    WorkerCardIcon
} from "./ConstructionIcons";
/** @deprecated Use CategoryIconGrid with filter chips */
export { CategoryChips } from "./CategoryChips";
/** @deprecated Use CategoryIconGrid instead */
export { EquipmentGrid } from "./EquipmentGridSection";
/** @deprecated Use ProductSection instead */
export { FeaturedProducts } from "./FeaturedProducts";
/** @deprecated Use ProductSection with flash sale data */
export { FlashSaleSection } from "./FlashSaleSection";
/** @deprecated Use CategoryIconGrid instead */
export { LibraryGrid } from "./LibraryGridSection";
/** @deprecated Use WorkerGrid instead */
export { RepairServicesGrid } from "./RepairServicesGrid";
/** @deprecated Stats moved to useWorkerStats hook */
export { StatsBar } from "./StatsBar";
/** @deprecated Use WorkerGrid instead */
export { TopWorkersSection } from "./TopWorkersSection";
/** @deprecated Use ProductSection instead */
export {
    BestsellerSection,
    NewArrivalsSection,
    TrendingSection
} from "./TrendingSection";

// ============================================================================
// Type Re-exports (kept for backward compat)
// ============================================================================
export type { ServiceItem } from "./ServiceGrid";
export type { UtilityItem } from "./UtilityGrid";

