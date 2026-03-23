/**
 * RoleContext — Manages user role (4 roles) + onboarding state
 *
 * Roles: worker | engineer | contractor | customer
 *
 * - Persists role selection + onboarding status in AsyncStorage
 * - Provides role switch functionality
 * - Controls startup flow (splash → onboarding → role select → home)
 *
 * @created 2026-03-05
 * @updated 2026-03-21 — Expanded from 2 roles to 4 roles + onboarding
 */

import { ROLES, type AppRole, type RoleMeta } from "@/constants/roleTheme";
import {
    getOnboardingStatus,
    getSavedRole,
    setOnboardingSeen as persistOnboardingSeen,
    saveRole as persistRole,
    resetOnboarding as removeOnboarding,
    clearRole as removeRole,
} from "@/utils/roleStorage";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

/** Re-export AppRole so other files can still import from here */
export type { AppRole } from "@/constants/roleTheme";

interface RoleContextType {
  /** Current role: worker | engineer | contractor | customer */
  role: AppRole | null;
  /** Metadata for current role */
  roleMeta: RoleMeta | null;
  /** Whether role has been loaded from storage */
  roleLoaded: boolean;
  /** Whether role has been selected (not null) */
  hasRole: boolean;
  /** Whether onboarding has been seen */
  onboardingSeen: boolean;
  /** Whether initial loading (role + onboarding) is complete */
  initialized: boolean;

  // Legacy convenience booleans
  isCustomer: boolean;
  isWorker: boolean;
  isEngineer: boolean;
  isContractor: boolean;

  /** Set role and persist */
  setRole: (role: AppRole) => Promise<void>;
  /** Toggle to next role (cycles through 4 roles) */
  toggleRole: () => Promise<void>;
  /** Clear role (for logout/reset) */
  clearRole: () => Promise<void>;
  /** Mark onboarding as seen */
  setOnboardingSeen: () => Promise<void>;
  /** Reset everything (onboarding + role) */
  resetAll: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const ROLE_ORDER: AppRole[] = ["worker", "engineer", "contractor", "customer"];

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<AppRole | null>(null);
  const [onboardingSeen, setOnboardingSeenState] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load persisted state on mount
  useEffect(() => {
    (async () => {
      try {
        const [storedRole, seenOnboarding] = await Promise.all([
          getSavedRole(),
          getOnboardingStatus(),
        ]);
        if (storedRole) setRoleState(storedRole);
        setOnboardingSeenState(seenOnboarding);
      } catch (e) {
        console.warn("[RoleContext] Failed to load state:", e);
      } finally {
        setInitialized(true);
      }
    })();
  }, []);

  const setRole = useCallback(async (newRole: AppRole) => {
    try {
      await persistRole(newRole);
      setRoleState(newRole);
    } catch (e) {
      console.warn("[RoleContext] Failed to save role:", e);
    }
  }, []);

  const toggleRole = useCallback(async () => {
    const currentIdx = role ? ROLE_ORDER.indexOf(role) : -1;
    const nextIdx = (currentIdx + 1) % ROLE_ORDER.length;
    await setRole(ROLE_ORDER[nextIdx]);
  }, [role, setRole]);

  const clearRole = useCallback(async () => {
    try {
      await removeRole();
      setRoleState(null);
    } catch (e) {
      console.warn("[RoleContext] Failed to clear role:", e);
    }
  }, []);

  const markOnboardingSeen = useCallback(async () => {
    try {
      await persistOnboardingSeen();
      setOnboardingSeenState(true);
    } catch (e) {
      console.warn("[RoleContext] Failed to set onboarding:", e);
    }
  }, []);

  const resetAll = useCallback(async () => {
    await Promise.all([removeRole(), removeOnboarding()]);
    setRoleState(null);
    setOnboardingSeenState(false);
  }, []);

  const roleMeta = useMemo(() => (role ? ROLES[role] : null), [role]);

  return (
    <RoleContext.Provider
      value={{
        role,
        roleMeta,
        roleLoaded: initialized,
        hasRole: role !== null,
        onboardingSeen,
        initialized,
        isCustomer: role === "customer",
        isWorker: role === "worker",
        isEngineer: role === "engineer",
        isContractor: role === "contractor",
        setRole,
        toggleRole,
        clearRole,
        setOnboardingSeen: markOnboardingSeen,
        resetAll,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return ctx;
}
