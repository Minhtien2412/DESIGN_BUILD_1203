/**
 * RoleContext — Manages user role (Khách / Thợ) across the app
 *
 * - Persists role selection in AsyncStorage
 * - Provides role switch functionality
 * - Shows role selection screen on first launch
 *
 * @created 2026-03-05
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

export type AppRole = "khach" | "tho";

interface RoleContextType {
  /** Current role: 'khach' (customer) or 'tho' (worker) */
  role: AppRole | null;
  /** Whether role has been loaded from storage */
  roleLoaded: boolean;
  /** Whether role has been selected (not null) */
  hasRole: boolean;
  /** true = Khách, false = Thợ */
  isCustomer: boolean;
  /** Set role and persist */
  setRole: (role: AppRole) => Promise<void>;
  /** Toggle between khach/tho */
  toggleRole: () => Promise<void>;
  /** Clear role (for logout/reset) */
  clearRole: () => Promise<void>;
}

const ROLE_STORAGE_KEY = "@app_role";

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<AppRole | null>(null);
  const [roleLoaded, setRoleLoaded] = useState(false);

  // Load persisted role on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(ROLE_STORAGE_KEY);
        if (stored === "khach" || stored === "tho") {
          setRoleState(stored);
        }
      } catch (e) {
        console.warn("[RoleContext] Failed to load role:", e);
      } finally {
        setRoleLoaded(true);
      }
    })();
  }, []);

  const setRole = useCallback(async (newRole: AppRole) => {
    try {
      await AsyncStorage.setItem(ROLE_STORAGE_KEY, newRole);
      setRoleState(newRole);
    } catch (e) {
      console.warn("[RoleContext] Failed to save role:", e);
    }
  }, []);

  const toggleRole = useCallback(async () => {
    const newRole: AppRole = role === "khach" ? "tho" : "khach";
    await setRole(newRole);
  }, [role, setRole]);

  const clearRole = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(ROLE_STORAGE_KEY);
      setRoleState(null);
    } catch (e) {
      console.warn("[RoleContext] Failed to clear role:", e);
    }
  }, []);

  return (
    <RoleContext.Provider
      value={{
        role,
        roleLoaded,
        hasRole: role !== null,
        isCustomer: role === "khach",
        setRole,
        toggleRole,
        clearRole,
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
