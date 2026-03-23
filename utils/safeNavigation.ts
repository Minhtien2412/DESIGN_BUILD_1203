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

import { resolveRoute } from "@/constants/feature-map";
import { MISC } from "@/constants/route-registry";
import { Href, router } from "expo-router";

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
 */
export function navigateByFeatureId(id: string): void {
  const { route, params } = resolveRoute(id, MISC.COMING_SOON);
  safeNavigate(route, params);
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
