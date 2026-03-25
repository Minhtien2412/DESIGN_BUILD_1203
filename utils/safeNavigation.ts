/**
 * Safe Navigation Utilities
 * ─────────────────────────────────────────────────────────────────
 * Wraps expo-router with:
 *  - Anti-broken-link fallback (→ coming-soon / +not-found)
 *  - Param validation
 *  - Feature-mapping-aware navigation via item `id`
 *
 * Usage in components:
 *   import { safeNavigate, navigateByFeatureId } from '@/utils/safeNavigation';
 */

import { getFeatureMapping, resolveRoute } from "@/constants/feature-map";
import { MISC } from "@/constants/route-registry";
import { Href, router } from "expo-router";

/** Feature statuses that should block navigation and redirect to coming-soon */
const BLOCKED_STATUSES = new Set([
  "coming-soon",
  "disabled",
  "hidden",
  "placeholder",
]);

/**
 * Navigate to a route safely.
 * If the route is empty or navigation throws, redirects to coming-soon fallback.
 */
export function safeNavigate(
  route: string,
  params?: Record<string, string>,
): void {
  if (!route || route === "/") {
    router.push(MISC.COMING_SOON as Href);
    return;
  }

  try {
    if (params && Object.keys(params).length > 0) {
      router.push({ pathname: route as any, params });
    } else {
      router.push(route as Href);
    }
  } catch {
    router.push(MISC.COMING_SOON as Href);
  }
}

/**
 * Navigate by data-item id using the central feature-map registry.
 * Automatically resolves route + params.
 * Blocks navigation for disabled/coming-soon/hidden features.
 */
export function navigateByFeatureId(id: string): void {
  const mapping = getFeatureMapping(id);

  // Block disabled features
  if (
    mapping?.isDisabled ||
    (mapping?.status && BLOCKED_STATUSES.has(mapping.status))
  ) {
    router.push(MISC.COMING_SOON as Href);
    return;
  }

  const { route, params } = resolveRoute(id, MISC.COMING_SOON);
  safeNavigate(route, params);
}

/**
 * Check if a feature is navigable (not blocked/disabled).
 * Useful for rendering status badges on icons.
 */
export function isFeatureReady(id: string): boolean {
  const mapping = getFeatureMapping(id);
  if (!mapping) return false;
  if (mapping.isDisabled) return false;
  if (mapping.status && BLOCKED_STATUSES.has(mapping.status)) return false;
  return true;
}

/**
 * Get the display status for a feature (for badges/overlays).
 */
export function getFeatureDisplayStatus(
  id: string,
): "ready" | "coming-soon" | "disabled" | "mock" {
  const mapping = getFeatureMapping(id);
  if (!mapping) return "coming-soon";
  if (mapping.isDisabled) return "disabled";
  if (mapping.status === "coming-soon" || mapping.status === "hidden")
    return "coming-soon";
  if (mapping.status === "ui-only" || mapping.dataSource === "mock")
    return "mock";
  return "ready";
}

/**
 * Navigate and replace current route safely.
 */
export function safeReplace(
  route: string,
  params?: Record<string, string>,
): void {
  if (!route || route === "/") {
    router.replace(MISC.COMING_SOON as Href);
    return;
  }

  try {
    if (params && Object.keys(params).length > 0) {
      router.replace({ pathname: route as any, params });
    } else {
      router.replace(route as Href);
    }
  } catch {
    router.replace(MISC.COMING_SOON as Href);
  }
}

/**
 * Go back safely — if no history, navigate to home.
 */
export function safeGoBack(): void {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/(tabs)" as Href);
  }
}
