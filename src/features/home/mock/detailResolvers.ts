import { UserRole } from "@/types/role";

import { customerHomeMock } from "./customerHome.mock";
import {
    MediaCardData,
    ProductCardData,
    ServiceSectionData
} from "./home.types";
import { homeAssets } from "./homeAssets";
import { internalHomeMock } from "./internalHome.mock";
import { workerHomeMock } from "./workerHome.mock";

const customerSections = [
  customerHomeMock.services,
  customerHomeMock.designUtilities,
  customerHomeMock.constructionUtilities,
  customerHomeMock.finishingUtilities,
  customerHomeMock.maintenanceUtilities,
  customerHomeMock.marketplaceUtilities,
];

const workerSections = [
  workerHomeMock.designUtilities,
  workerHomeMock.constructionUtilities,
  workerHomeMock.finishingUtilities,
];

const customerBanners = [
  customerHomeMock.heroBanner,
  customerHomeMock.designBanner,
  customerHomeMock.constructionBanner,
  customerHomeMock.finishingBanner,
  customerHomeMock.maintenanceBanner,
  customerHomeMock.finalBanner,
];

const workerBanners = [
  workerHomeMock.heroBanner,
  workerHomeMock.designBanner,
  workerHomeMock.constructionBanner,
  workerHomeMock.finishingBanner,
  workerHomeMock.referralBanner,
];

const customerMedia = [
  ...customerHomeMock.media,
  ...customerHomeMock.secondaryMedia,
];

export function getRoleLabel(role: UserRole) {
  switch (role) {
    case "customer":
      return "Khách hàng";
    case "worker":
      return "Thợ";
    case "internal_manager":
      return "Nội bộ";
    default:
      return "Ứng dụng";
  }
}

export function resolveServiceSection(
  role: UserRole,
  categoryId?: string,
  title?: string,
) {
  const source = role === "worker" ? workerSections : customerSections;
  const section =
    source.find((item) => item.id === categoryId) ??
    source[0] ??
    customerSections[0];

  return {
    section: {
      ...section,
      title: title ?? section.title,
    } as ServiceSectionData,
    summary:
      role === "worker"
        ? "Danh mục dành cho thợ/freelancer, ưu tiên việc làm gần bạn và tổ đội phù hợp tay nghề."
        : "Danh mục dịch vụ dành cho khách hàng, bám theo flow thiết kế - xây dựng - hoàn thiện.",
  };
}

export function resolveBannerCampaign(
  role: UserRole,
  campaignId?: string,
  title?: string,
) {
  const bannerSource = role === "worker" ? workerBanners : customerBanners;
  const mediaSource = role === "customer" ? customerMedia : [];

  const banner = bannerSource.find((item) => item.id === campaignId);
  const media = mediaSource.find((item) => item.id === campaignId);

  const resolvedImage =
    banner?.image ?? media?.image ?? homeAssets.banners.design;
  const resolvedTitle =
    title ?? media?.title ?? banner?.badge ?? "Chi tiết chiến dịch";

  return {
    image: resolvedImage,
    title: resolvedTitle,
    subtitle:
      media?.subtitle ??
      "Nội dung chiến dịch được trình bày theo đúng design language của home screen để dễ dàng nối CMS/API sau này.",
    badge: banner?.badge ?? media?.badge ?? "Campaign",
  };
}

export function resolveProduct(productId?: string) {
  return (customerHomeMock.products.find((item) => item.id === productId) ??
    customerHomeMock.products[0]) as ProductCardData;
}

export function resolveWorkerRewardData() {
  return {
    heroImage: workerHomeMock.referralBanner.image,
    currentReward: "100.000đ",
    referralCode: "THO12345",
    stats: [
      { id: "referred", label: "Số thợ đã giới thiệu", value: "18" },
      { id: "success", label: "Đăng ký thành công", value: "16" },
      { id: "pending", label: "Còn thiếu để nhận TV", value: "2 thợ" },
      { id: "milestone", label: "Mốc tiếp theo", value: "20 thợ" },
    ],
  };
}

export function resolveInternalDashboard(section?: string) {
  const sectionTitleMap: Record<string, string> = {
    projects: "Chi tiết dự án nội bộ",
    notifications: "Thông báo điều phối",
    profile: "Hồ sơ nội bộ",
    meeting: "Tạo cuộc họp & nhóm chat",
    schedule: "Lịch hẹn công việc",
    order: "Chi tiết đơn vật tư",
    payroll: "Bảng lương & mời thợ",
    manage: "Quản lý tổng hợp",
  };

  return {
    title: sectionTitleMap[section ?? "manage"] ?? "Chi tiết dashboard nội bộ",
    projectTitle: internalHomeMock.projectTitle,
    projectPeriod: internalHomeMock.projectPeriod,
    metrics: internalHomeMock.metrics,
    quickActions: internalHomeMock.quickActions,
    statusSteps: internalHomeMock.statusSteps,
    contact: internalHomeMock.deliveryContact,
  };
}

export function buildSpecRows(product: ProductCardData) {
  return [
    {
      id: "project",
      label: "Dự án phù hợp",
      value: "Vinhomes Q9 / Nhà phố / Nội thất",
    },
    { id: "delivery", label: "Ngày giao", value: "26/03/2026" },
    { id: "warranty", label: "Bảo hành", value: "24 tháng" },
    { id: "stock", label: "Kho khả dụng", value: "Còn hàng" },
    { id: "product", label: "Mã SP", value: product.id.toUpperCase() },
  ];
}

export function getMockMediaHighlights(): MediaCardData[] {
  return customerMedia;
}
