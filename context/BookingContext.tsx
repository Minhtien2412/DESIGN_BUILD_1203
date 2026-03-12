/**
 * BookingContext
 * Centralized state for service bookings (Vua Thợ-style)
 * Manages active bookings, booking history, and booking notifications
 */

import {
    cancelBooking,
    createBooking,
    getUserBookings,
    type BookingStatus,
    type CreateBookingData,
    type ServiceBooking,
} from "@/services/servicesApi";
import { getItem, setItem } from "@/utils/storage";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

// ============================================================================
// Types
// ============================================================================

export interface BookingWorkerInfo {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  rating: number;
  category: string;
}

export interface ActiveBooking {
  id: string;
  workerId: string;
  workerInfo: BookingWorkerInfo;
  serviceCategory: string;
  scheduledDate: string; // ISO date YYYY-MM-DD
  scheduledTime?: string; // HH:mm
  price: number;
  notes?: string;
  status: BookingStatus;
  createdAt: string;
  apiBookingId?: number; // ID from backend
}

interface BookingContextType {
  // State
  activeBookings: ActiveBooking[];
  loadingBookings: boolean;
  totalActive: number;

  // Actions
  createNewBooking: (
    worker: BookingWorkerInfo,
    serviceData: CreateBookingData,
    price: number,
    scheduledTime?: string,
  ) => Promise<ActiveBooking>;
  cancelActiveBooking: (bookingId: string) => Promise<void>;
  refreshBookings: () => Promise<void>;
  getBookingById: (id: string) => ActiveBooking | undefined;
  getBookingsByStatus: (status: BookingStatus) => ActiveBooking[];
  clearCompletedBookings: () => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const BOOKINGS_KEY = "active_bookings";

// ============================================================================
// Provider
// ============================================================================

export function BookingProvider({ children }: { children: ReactNode }) {
  const [activeBookings, setActiveBookings] = useState<ActiveBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Load bookings from local storage on mount
  useEffect(() => {
    const loadBookings = async () => {
      try {
        const stored = await getItem(BOOKINGS_KEY);
        if (stored) {
          setActiveBookings(JSON.parse(stored));
        }
      } catch (error) {
        console.error("[BookingContext] Failed to load from storage:", error);
      }
    };
    const frameId = requestAnimationFrame(() => {
      loadBookings();
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Persist to storage on change (including empty array to clear storage)
  const didInitRef = useRef(false);
  useEffect(() => {
    // Skip the first render to avoid overwriting before load completes
    if (!didInitRef.current) {
      didInitRef.current = true;
      return;
    }
    setItem(BOOKINGS_KEY, JSON.stringify(activeBookings)).catch((err) =>
      console.error("[BookingContext] Failed to persist:", err),
    );
  }, [activeBookings]);

  // Refresh from API
  const refreshBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const response = await getUserBookings({ limit: 50 });
      if (response.success && response.data.length > 0) {
        // Merge API bookings with local bookings
        setActiveBookings((prev) => {
          const apiIds = new Set(
            response.data.map((b: ServiceBooking) => String(b.id)),
          );
          // Keep local bookings not yet synced to API
          const localOnly = prev.filter(
            (b) => !b.apiBookingId || !apiIds.has(String(b.apiBookingId)),
          );
          // Map API bookings to ActiveBooking
          const fromApi: ActiveBooking[] = response.data.map(
            (b: ServiceBooking) => {
              const existing = prev.find((lb) => lb.apiBookingId === b.id);
              return {
                id: existing?.id || `booking-${b.id}`,
                workerId: existing?.workerId || "",
                workerInfo: existing?.workerInfo || {
                  id: "",
                  name: "Thợ",
                  rating: 0,
                  category: "",
                },
                serviceCategory: existing?.serviceCategory || "",
                scheduledDate: b.startDate,
                price: b.totalPrice || 0,
                notes: b.notes || undefined,
                status: b.status,
                createdAt: b.createdAt,
                apiBookingId: b.id,
              };
            },
          );
          return [...fromApi, ...localOnly];
        });
      }
    } catch (error) {
      console.warn("[BookingContext] Failed to refresh from API:", error);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  // Create new booking
  const createNewBooking = useCallback(
    async (
      worker: BookingWorkerInfo,
      serviceData: CreateBookingData,
      price: number,
      scheduledTime?: string,
    ): Promise<ActiveBooking> => {
      const localId = `booking-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      const newBooking: ActiveBooking = {
        id: localId,
        workerId: worker.id,
        workerInfo: worker,
        serviceCategory: worker.category,
        scheduledDate: serviceData.startDate,
        scheduledTime,
        price,
        notes: serviceData.notes,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      };

      // Try to create via API
      try {
        const response = await createBooking(serviceData);
        if (response.success && response.data?.id) {
          newBooking.apiBookingId = response.data.id;
          newBooking.status = response.data.status || "PENDING";
          console.log(
            "[BookingContext] ✅ Booking created via API:",
            response.data.id,
          );
        }
      } catch (error) {
        console.warn(
          "[BookingContext] ⚠️ API booking failed, saved locally:",
          error,
        );
      }

      setActiveBookings((prev) => [newBooking, ...prev]);
      return newBooking;
    },
    [],
  );

  // Cancel booking (no stale closure – uses functional update)
  const cancelActiveBooking = useCallback(async (bookingId: string) => {
    // Read current bookings via ref-less approach: optimistic update first
    let apiId: number | undefined;
    setActiveBookings((prev) => {
      const target = prev.find((b) => b.id === bookingId);
      apiId = target?.apiBookingId;
      return prev.map((b) =>
        b.id === bookingId ? { ...b, status: "CANCELLED" as BookingStatus } : b,
      );
    });

    // Cancel via API if synced
    if (apiId) {
      try {
        await cancelBooking(apiId);
        console.log("[BookingContext] ✅ Booking cancelled via API");
      } catch (error) {
        console.warn("[BookingContext] ⚠️ API cancel failed:", error);
      }
    }
  }, []);

  // Get booking by ID
  const getBookingById = useCallback(
    (id: string) => activeBookings.find((b) => b.id === id),
    [activeBookings],
  );

  // Get bookings by status
  const getBookingsByStatus = useCallback(
    (status: BookingStatus) =>
      activeBookings.filter((b) => b.status === status),
    [activeBookings],
  );

  // Clear completed/cancelled bookings (storage is synced via useEffect)
  const clearCompletedBookings = useCallback(async () => {
    setActiveBookings((prev) =>
      prev.filter((b) => b.status !== "COMPLETED" && b.status !== "CANCELLED"),
    );
  }, []);

  const totalActive = activeBookings.filter(
    (b) => b.status !== "COMPLETED" && b.status !== "CANCELLED",
  ).length;

  return (
    <BookingContext.Provider
      value={{
        activeBookings,
        loadingBookings,
        totalActive,
        createNewBooking,
        cancelActiveBooking,
        refreshBookings,
        getBookingById,
        getBookingsByStatus,
        clearCompletedBookings,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}

export default BookingContext;
