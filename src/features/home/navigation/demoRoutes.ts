import { APP_ROUTES } from "@/constants/typed-routes";
import { UserRole } from "@/types/role";
import { Href } from "expo-router";

const withParams = (
  pathname: string,
  params: Record<string, string | number | undefined>,
): Href => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      search.set(key, String(value));
    }
  });

  const query = search.toString();
  return (query ? `${pathname}?${query}` : pathname) as Href;
};

export const demoRoleHomeRoute = (role: UserRole) =>
  withParams(APP_ROUTES.DEMO_ROLE_BASED_HOME, { role });

export const demoServiceCategoryRoute = (
  categoryId: string,
  role: UserRole,
  title?: string,
) =>
  withParams(APP_ROUTES.DEMO_SERVICE_CATEGORY_DETAIL, {
    categoryId,
    role,
    title,
  });

export const demoBannerCampaignRoute = (
  campaignId: string,
  role: UserRole,
  title?: string,
) =>
  withParams(APP_ROUTES.DEMO_BANNER_CAMPAIGN_DETAIL, {
    campaignId,
    role,
    title,
  });

export const demoProductDetailRoute = (productId: string, role?: UserRole) =>
  withParams(APP_ROUTES.DEMO_PRODUCT_DETAIL, { productId, role });

export const demoWorkerRewardsRoute = (): Href =>
  APP_ROUTES.DEMO_WORKER_REWARDS_DETAIL as Href;

export const demoInternalDashboardRoute = (section?: string) =>
  withParams(APP_ROUTES.DEMO_INTERNAL_DASHBOARD_DETAIL, { section });

export const demoCustomerTabRoute = (tabId: string): Href => {
  switch (tabId) {
    case "home":
      return demoRoleHomeRoute("customer");
    case "utilities":
      return demoServiceCategoryRoute(
        "services",
        "customer",
        "Tiện ích khách hàng",
      );
    case "live":
      return demoBannerCampaignRoute(
        "live-1",
        "customer",
        "Live / Video nổi bật",
      );
    case "shop":
      return demoProductDetailRoute("desk", "customer");
    case "profile":
      return demoBannerCampaignRoute(
        "customer-hero",
        "customer",
        "Tài khoản khách hàng",
      );
    default:
      return demoRoleHomeRoute("customer");
  }
};

export const demoWorkerTabRoute = (tabId: string): Href => {
  switch (tabId) {
    case "home":
      return demoRoleHomeRoute("worker");
    case "jobs":
      return demoServiceCategoryRoute(
        "worker-construction",
        "worker",
        "Việc làm theo tay nghề",
      );
    case "rewards":
      return demoWorkerRewardsRoute();
    case "notifications":
      return demoBannerCampaignRoute("worker-hero", "worker", "Thông báo thợ");
    case "profile":
      return demoBannerCampaignRoute("worker-referral", "worker", "Hồ sơ thợ");
    default:
      return demoRoleHomeRoute("worker");
  }
};

export const demoInternalTabRoute = (tabId: string): Href => {
  switch (tabId) {
    case "home":
      return demoRoleHomeRoute("internal_manager");
    case "projects":
      return demoInternalDashboardRoute("projects");
    case "manage":
      return demoRoleHomeRoute("internal_manager");
    case "notifications":
      return demoInternalDashboardRoute("notifications");
    case "profile":
      return demoInternalDashboardRoute("profile");
    default:
      return demoRoleHomeRoute("internal_manager");
  }
};

export const demoInternalQuickActionRoute = (actionId: string): Href =>
  demoInternalDashboardRoute(actionId);
