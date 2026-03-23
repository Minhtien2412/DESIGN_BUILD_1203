/**
 * Onboarding & Role Storage Helpers
 *
 * Manages onboardingSeen + selectedRole persistence via AsyncStorage.
 *
 * @created 2026-03-21
 */

import type { AppRole } from "@/constants/roleTheme";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  ONBOARDING_SEEN: "@onboarding_seen",
  SELECTED_ROLE: "@app_role",
} as const;

// ────────── Onboarding ──────────

export async function getOnboardingStatus(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(KEYS.ONBOARDING_SEEN);
    return val === "true";
  } catch {
    return false;
  }
}

export async function setOnboardingSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.ONBOARDING_SEEN, "true");
  } catch (e) {
    console.warn("[storage] Failed to set onboarding seen:", e);
  }
}

export async function resetOnboarding(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.ONBOARDING_SEEN);
  } catch (e) {
    console.warn("[storage] Failed to reset onboarding:", e);
  }
}

// ────────── Role ──────────

const VALID_ROLES: AppRole[] = ["worker", "engineer", "contractor", "customer"];

export async function getSavedRole(): Promise<AppRole | null> {
  try {
    const val = await AsyncStorage.getItem(KEYS.SELECTED_ROLE);
    if (val && VALID_ROLES.includes(val as AppRole)) {
      return val as AppRole;
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveRole(role: AppRole): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SELECTED_ROLE, role);
  } catch (e) {
    console.warn("[storage] Failed to save role:", e);
  }
}

export async function clearRole(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.SELECTED_ROLE);
  } catch (e) {
    console.warn("[storage] Failed to clear role:", e);
  }
}

// ────────── Full Reset ──────────

export async function resetAllAppState(): Promise<void> {
  await Promise.all([resetOnboarding(), clearRole()]);
}
