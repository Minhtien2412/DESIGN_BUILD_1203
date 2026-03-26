import { Product } from "@/data/products";
import * as CartAPI from "@/services/api/cart.service";
import { cartBadge } from "@/services/notification-badge";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import Toast from "react-native-toast-message";

// Cart Item Type
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

// Cart Context Type
interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  isSyncing: boolean;
  addToCart: (
    product: Product,
    quantity?: number,
    size?: string,
    color?: string,
  ) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartItem: (productId: string) => CartItem | undefined;
  syncWithServer: () => Promise<void>;
}

// Create Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Storage Key
const CART_STORAGE_KEY = "@shopping_cart";

/** Try to get auth token to determine if user is logged in */
async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem("access_token");
  } catch {
    return null;
  }
}

// Cart Provider Component
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load cart from storage on mount - DEFERRED to avoid blocking startup
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      loadCart();
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Save cart to storage whenever items change
  useEffect(() => {
    if (isLoaded) {
      saveCartLocal();
      const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
      cartBadge
        .set(totalQty)
        .catch((err: any) => console.warn("Failed to update cart badge:", err));
    }
  }, [items, isLoaded]);

  // Load cart — try server first (if authenticated), fallback to local
  const loadCart = async () => {
    setIsLoading(true);
    try {
      const token = await getAuthToken();
      if (token) {
        try {
          const serverCart = await CartAPI.getCart();
          if (serverCart.items.length > 0) {
            const mapped = serverCart.items.map((si) => ({
              id: si.id,
              product: si.product,
              quantity: si.quantity,
              selectedSize: undefined,
              selectedColor: undefined,
            }));
            setItems(mapped);
            setIsLoaded(true);
            return;
          }
        } catch {
          // Server unreachable — fall through to local
        }
      }
      // Fallback: load from AsyncStorage
      const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (cartData) {
        setItems(JSON.parse(cartData));
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setIsLoaded(true);
      setIsLoading(false);
    }
  };

  // Save cart to AsyncStorage (always, as local cache)
  const saveCartLocal = async () => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  };

  // Debounced server sync — called after local mutations
  const scheduleServerSync = useCallback(() => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(async () => {
      const token = await getAuthToken();
      if (!token) return; // Guest mode — skip server sync
      try {
        setIsSyncing(true);
        await CartAPI.syncCart(
          items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        );
      } catch {
        // Silent fail — local state is truth, will retry on next change
      } finally {
        setIsSyncing(false);
      }
    }, 1500); // 1.5s debounce
  }, [items]);

  // Sync with server explicitly (e.g. after login)
  const syncWithServer = useCallback(async () => {
    const token = await getAuthToken();
    if (!token) return;
    try {
      setIsSyncing(true);
      const localItems = items.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
      }));
      const serverCart = await CartAPI.syncCart(localItems);
      if (serverCart.items.length > 0) {
        const mapped = serverCart.items.map((si) => ({
          id: si.id,
          product: si.product,
          quantity: si.quantity,
          selectedSize: undefined,
          selectedColor: undefined,
        }));
        setItems(mapped);
      }
    } catch (error) {
      console.warn("Cart sync failed, keeping local state:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [items]);

  // Add item to cart (optimistic local + debounced server sync)
  const addToCart = (
    product: Product,
    quantity: number = 1,
    size?: string,
    color?: string,
  ) => {
    setItems((currentItems) => {
      const existingItemIndex = currentItems.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color,
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
        return updatedItems;
      } else {
        const newItem: CartItem = {
          id: `${product.id}-${size || "default"}-${color || "default"}-${Date.now()}`,
          product,
          quantity,
          selectedSize: size,
          selectedColor: color,
        };

        Toast.show({
          type: "success",
          text1: "Đã thêm vào giỏ hàng",
          text2: `${product.name} (${quantity})`,
          position: "bottom",
          visibilityTime: 2000,
        });

        return [...currentItems, newItem];
      }
    });
    scheduleServerSync();
  };

  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId),
    );

    if (item) {
      Toast.show({
        type: "info",
        text1: "Đã xóa khỏi giỏ hàng",
        text2: item.product.name,
        position: "bottom",
        visibilityTime: 2000,
      });
    }
    scheduleServerSync();
  };

  // Update item quantity
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item,
      ),
    );
    scheduleServerSync();
  };

  // Clear entire cart
  const clearCart = () => {
    setItems([]);
    // Also clear on server if authenticated
    getAuthToken().then((token) => {
      if (token) CartAPI.clearCart().catch(() => {});
    });
  };

  // Get specific cart item by product ID
  const getCartItem = (productId: string): CartItem | undefined => {
    return items.find((item) => item.product.id === productId);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  const value: CartContextType = {
    items,
    totalItems,
    totalPrice,
    isLoading,
    isSyncing,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItem,
    syncWithServer,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Custom Hook
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
