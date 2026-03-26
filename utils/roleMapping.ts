/**
 * Role Mapping Utility
 * ====================
 * Bridges the backend 9-role RBAC system to the frontend 4-role navigation system.
 *
 * Backend roles (from /auth/me → user.role):
 *   SUPER_ADMIN | ADMIN | STAFF | CONTRACTOR | ENGINEER | ARCHITECT | DESIGNER | SUPPLIER | CLIENT
 *
 * Frontend navigation roles (RoleContext → AppRole):
 *   worker | engineer | contractor | customer
 *
 * Mapping logic:
 *   - SUPER_ADMIN, ADMIN, STAFF → contractor (admin manages like contractor)
 *   - CONTRACTOR                → contractor
 *   - ENGINEER                  → engineer
 *   - ARCHITECT, DESIGNER       → engineer (design/architecture professionals)
 *   - SUPPLIER                  → contractor (supply chain management)
 *   - CLIENT                    → customer
 *   - (no role / unknown)       → customer (safest default)
 *
 * Worker role note:
 *   Worker is assigned via manual role selection during onboarding,
 *   not inferred from backend role. Workers are CLIENT-level users
 *   who self-identify as construction workers.
 */

import type { AppRole } from "@/constants/roleTheme";

/** Backend role string as returned by /auth/me */
export type BackendRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "STAFF"
  | "CONTRACTOR"
  | "ENGINEER"
  | "ARCHITECT"
  | "DESIGNER"
  | "SUPPLIER"
  | "CLIENT";

const BACKEND_TO_APPROLE: Record<BackendRole, AppRole> = {
  SUPER_ADMIN: "contractor",
  ADMIN: "contractor",
  STAFF: "contractor",
  CONTRACTOR: "contractor",
  ENGINEER: "engineer",
  ARCHITECT: "engineer",
  DESIGNER: "engineer",
  SUPPLIER: "contractor",
  CLIENT: "customer",
};

/**
 * Map a backend role string to the FE navigation AppRole.
 * Returns null if `backendRole` is falsy so the caller can
 * fall back to the stored RoleContext selection.
 */
export function mapBackendRoleToAppRole(
  backendRole: string | undefined | null,
): AppRole | null {
  if (!backendRole) return null;
  const upper = backendRole.toUpperCase() as BackendRole;
  return BACKEND_TO_APPROLE[upper] ?? null;
}

/**
 * Check if a backend role has admin-level access.
 */
export function isAdminRole(backendRole: string | undefined | null): boolean {
  if (!backendRole) return false;
  const upper = backendRole.toUpperCase();
  return upper === "SUPER_ADMIN" || upper === "ADMIN";
}

/**
 * Check if a backend role has staff-or-above access.
 */
export function isStaffOrAbove(
  backendRole: string | undefined | null,
): boolean {
  if (!backendRole) return false;
  const upper = backendRole.toUpperCase();
  return upper === "SUPER_ADMIN" || upper === "ADMIN" || upper === "STAFF";
}
