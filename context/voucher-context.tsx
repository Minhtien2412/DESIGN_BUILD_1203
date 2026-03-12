/**
 * Voucher Context - Global Voucher State Management
 * Manages applied vouchers, voucher wallet, and discount calculations
 * Updated: 09/02/2026
 */

import VoucherService, {
    calculateDiscount,
    canApplyVoucher,
    formatCurrency,
    formatVoucherDiscount,
    isVoucherValid,
    MOCK_VOUCHERS,
    Voucher,
} from "@/services/voucherService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { Alert } from "react-native";

// ==================== TYPES ====================

interface AppliedVoucher {
  voucher: Voucher;
  discountAmount: number;
}

interface VoucherContextType {
  // Voucher wallet (user's collected vouchers)
  myVouchers: Voucher[];
  publicVouchers: Voucher[];
  loading: boolean;
  dataSource: "api" | "mock";

  // Applied voucher for current checkout
  appliedVoucher: AppliedVoucher | null;
  appliedFreeshipVoucher: AppliedVoucher | null;

  // Actions
  fetchVouchers: () => Promise<void>;
  claimVoucher: (voucher: Voucher) => Promise<boolean>;
  applyVoucher: (voucher: Voucher, orderAmount: number) => boolean;
  applyVoucherByCode: (code: string, orderAmount: number) => boolean;
  removeVoucher: () => void;
  removeFreeshipVoucher: () => void;
  clearAllVouchers: () => void;

  // Computed
  getAvailableVouchers: (orderAmount: number) => Voucher[];
  getBestVoucher: (orderAmount: number) => Voucher | null;
  getTotalDiscount: () => number;
  getShippingDiscount: () => number;
}

// ==================== CONTEXT ====================

const VoucherContext = createContext<VoucherContextType | undefined>(undefined);

const VOUCHER_STORAGE_KEY = "@user_vouchers";

// ==================== PROVIDER ====================

export function VoucherProvider({ children }: { children: ReactNode }) {
  const [myVouchers, setMyVouchers] = useState<Voucher[]>([]);
  const [publicVouchers, setPublicVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<"api" | "mock">("mock");
  const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucher | null>(
    null,
  );
  const [appliedFreeshipVoucher, setAppliedFreeshipVoucher] =
    useState<AppliedVoucher | null>(null);

  // Load cached vouchers on mount
  useEffect(() => {
    loadCachedVouchers();
  }, []);

  const loadCachedVouchers = async () => {
    try {
      const cached = await AsyncStorage.getItem(VOUCHER_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setMyVouchers(parsed);
      } else {
        // Use mock data as initial
        const claimed = MOCK_VOUCHERS.filter((v) => v.isClaimed);
        setMyVouchers(claimed);
      }
    } catch {
      const claimed = MOCK_VOUCHERS.filter((v) => v.isClaimed);
      setMyVouchers(claimed);
    }
  };

  const saveCachedVouchers = async (vouchers: Voucher[]) => {
    try {
      await AsyncStorage.setItem(VOUCHER_STORAGE_KEY, JSON.stringify(vouchers));
    } catch {
      // silently fail
    }
  };

  // Fetch vouchers from API
  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const [myResult, publicResult] = await Promise.all([
        VoucherService.getMyVouchers(),
        VoucherService.getPublicVouchers(),
      ]);

      if (myResult.ok && myResult.data?.vouchers) {
        setMyVouchers(myResult.data.vouchers);
        saveCachedVouchers(myResult.data.vouchers);
        setDataSource("api");
      } else {
        const claimed = MOCK_VOUCHERS.filter((v) => v.isClaimed);
        setMyVouchers(claimed);
        setDataSource("mock");
      }

      if (publicResult.ok && publicResult.data?.vouchers) {
        setPublicVouchers(publicResult.data.vouchers);
      } else {
        setPublicVouchers(MOCK_VOUCHERS.filter((v) => !v.isClaimed));
      }
    } catch {
      const claimed = MOCK_VOUCHERS.filter((v) => v.isClaimed);
      setMyVouchers(claimed);
      setPublicVouchers(MOCK_VOUCHERS.filter((v) => !v.isClaimed));
      setDataSource("mock");
    } finally {
      setLoading(false);
    }
  }, []);

  // Claim a public voucher
  const claimVoucherAction = useCallback(
    async (voucher: Voucher): Promise<boolean> => {
      try {
        const result = await VoucherService.claimVoucher(voucher.code);
        if (result.ok) {
          const updatedVoucher = { ...voucher, isClaimed: true };
          setMyVouchers((prev) => {
            const updated = [...prev, updatedVoucher];
            saveCachedVouchers(updated);
            return updated;
          });
          setPublicVouchers((prev) => prev.filter((v) => v.id !== voucher.id));
          return true;
        }
      } catch {
        // API failed, do local claim for mock mode
      }

      // Mock fallback: local claim
      const updatedVoucher = { ...voucher, isClaimed: true };
      setMyVouchers((prev) => {
        const updated = [...prev, updatedVoucher];
        saveCachedVouchers(updated);
        return updated;
      });
      setPublicVouchers((prev) => prev.filter((v) => v.id !== voucher.id));
      return true;
    },
    [],
  );

  // Apply a voucher to the current order
  const applyVoucher = useCallback(
    (voucher: Voucher, orderAmount: number): boolean => {
      const { canApply, reason } = canApplyVoucher(voucher, orderAmount);
      if (!canApply) {
        Alert.alert("Không thể áp dụng", reason || "Voucher không hợp lệ");
        return false;
      }

      const discountAmount = calculateDiscount(voucher, orderAmount);

      if (voucher.type === "freeship") {
        setAppliedFreeshipVoucher({ voucher, discountAmount });
        Alert.alert(
          "Thành công!",
          `Đã áp dụng: ${formatVoucherDiscount(voucher)}`,
        );
      } else {
        // Replace existing non-freeship voucher
        setAppliedVoucher({ voucher, discountAmount });
        Alert.alert(
          "Thành công!",
          `Đã áp dụng: ${formatVoucherDiscount(voucher)}\nTiết kiệm: ${formatCurrency(discountAmount)}`,
        );
      }

      return true;
    },
    [],
  );

  // Apply voucher by code
  const applyVoucherByCode = useCallback(
    (code: string, orderAmount: number): boolean => {
      const allVouchers = [...myVouchers, ...publicVouchers, ...MOCK_VOUCHERS];
      const voucher = allVouchers.find(
        (v) => v.code.toUpperCase() === code.toUpperCase(),
      );

      if (!voucher) {
        Alert.alert("Lỗi", "Mã voucher không tồn tại");
        return false;
      }

      return applyVoucher(voucher, orderAmount);
    },
    [myVouchers, publicVouchers, applyVoucher],
  );

  // Remove applied voucher
  const removeVoucher = useCallback(() => {
    setAppliedVoucher(null);
  }, []);

  const removeFreeshipVoucher = useCallback(() => {
    setAppliedFreeshipVoucher(null);
  }, []);

  const clearAllVouchers = useCallback(() => {
    setAppliedVoucher(null);
    setAppliedFreeshipVoucher(null);
  }, []);

  // Get vouchers applicable for a given order amount
  const getAvailableVouchers = useCallback(
    (orderAmount: number): Voucher[] => {
      return myVouchers
        .filter((v) => isVoucherValid(v) && v.isClaimed)
        .filter((v) => {
          const { canApply } = canApplyVoucher(v, orderAmount);
          return canApply;
        })
        .sort(
          (a, b) =>
            calculateDiscount(b, orderAmount) -
            calculateDiscount(a, orderAmount),
        );
    },
    [myVouchers],
  );

  // Get best voucher for a given order
  const getBestVoucher = useCallback(
    (orderAmount: number): Voucher | null => {
      const available = getAvailableVouchers(orderAmount).filter(
        (v) => v.type !== "freeship",
      );
      return available.length > 0 ? available[0] : null;
    },
    [getAvailableVouchers],
  );

  // Get total product discount
  const getTotalDiscount = useCallback((): number => {
    return appliedVoucher?.discountAmount || 0;
  }, [appliedVoucher]);

  // Get shipping discount
  const getShippingDiscount = useCallback((): number => {
    return appliedFreeshipVoucher?.discountAmount || 0;
  }, [appliedFreeshipVoucher]);

  const value: VoucherContextType = {
    myVouchers,
    publicVouchers,
    loading,
    dataSource,
    appliedVoucher,
    appliedFreeshipVoucher,
    fetchVouchers,
    claimVoucher: claimVoucherAction,
    applyVoucher,
    applyVoucherByCode,
    removeVoucher,
    removeFreeshipVoucher,
    clearAllVouchers,
    getAvailableVouchers,
    getBestVoucher,
    getTotalDiscount,
    getShippingDiscount,
  };

  return (
    <VoucherContext.Provider value={value}>{children}</VoucherContext.Provider>
  );
}

// ==================== HOOK ====================

export function useVoucher() {
  const context = useContext(VoucherContext);
  if (!context) {
    throw new Error("useVoucher must be used within a VoucherProvider");
  }
  return context;
}

export default VoucherProvider;
