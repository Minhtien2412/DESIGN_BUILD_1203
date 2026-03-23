import { ImageSourcePropType } from "react-native";

export type HomeImageSource = ImageSourcePropType | string;

export type ServiceItem = {
  id: string;
  title: string;
  icon: HomeImageSource;
  badge?: string;
};

export type ServiceSectionData = {
  id: string;
  title: string;
  actionLabel?: string;
  searchPillLabel?: string;
  items: ServiceItem[];
  backgroundColor?: string;
  titleColor?: string;
};

export type BannerData = {
  id: string;
  image: HomeImageSource;
  height?: number;
  badge?: string;
};

export type MediaCardData = {
  id: string;
  title: string;
  subtitle: string;
  image: HomeImageSource;
  badge: "LIVE" | "VIDEO";
  meta: string;
};

export type ProductCardData = {
  id: string;
  title: string;
  price: string;
  sold: string;
  image: HomeImageSource;
  subtitle?: string;
};

export type TabItemData = {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
};

export type CustomerHomeMock = {
  headerTitle: string;
  headerSubtitle: string;
  searchPlaceholder: string;
  services: ServiceSectionData;
  heroBanner: BannerData;
  media: MediaCardData[];
  designUtilities: ServiceSectionData;
  designBanner: BannerData;
  constructionUtilities: ServiceSectionData;
  constructionBanner: BannerData;
  finishingUtilities: ServiceSectionData;
  finishingBanner: BannerData;
  maintenanceUtilities: ServiceSectionData;
  maintenanceBanner: BannerData;
  marketplaceUtilities: ServiceSectionData;
  secondaryMedia: MediaCardData[];
  products: ProductCardData[];
  finalBanner: BannerData;
  tabs: TabItemData[];
};

export type WorkerHomeMock = {
  headerTitle: string;
  headerSubtitle: string;
  searchPlaceholder: string;
  heroBanner: BannerData;
  designUtilities: ServiceSectionData;
  designBanner: BannerData;
  constructionUtilities: ServiceSectionData;
  constructionBanner: BannerData;
  finishingUtilities: ServiceSectionData;
  finishingBanner: BannerData;
  referralBanner: BannerData;
  tabs: TabItemData[];
};

export type InternalQuickAction = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  tint: string;
};

export type InternalMetric = {
  id: string;
  label: string;
  value: string;
};

export type InternalPayrollRow = {
  id: string;
  name: string;
  phone: string;
  dailyRate: string;
  attendance: ("done" | "done" | "done" | "pending")[];
};

export type InternalRating = {
  id: string;
  name: string;
  score: string;
  active?: boolean;
};

export type InternalStatusStep = {
  id: string;
  title: string;
  subtitle: string;
  status: "done" | "active" | "upcoming";
};

export type InternalDeliveryContact = {
  name: string;
  role: string;
  phone: string;
  plate: string;
  rating: string;
};

export type InternalHomeMock = {
  headerTitle: string;
  headerSubtitle: string;
  searchPlaceholder: string;
  quickActions: InternalQuickAction[];
  metrics: InternalMetric[];
  projectTitle: string;
  projectPeriod: string;
  paymentMethod: string;
  payrollTotal: string;
  payrollRows: InternalPayrollRow[];
  ratings: InternalRating[];
  deliveryContact: InternalDeliveryContact;
  statusSteps: InternalStatusStep[];
  tabs: TabItemData[];
};
