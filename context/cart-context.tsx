import { Product } from "@/data/products";
import { cartBadge } from "@/services/notification-badge";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
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
}

// Create Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Storage Key
const CART_STORAGE_KEY = "@shopping_cart";

// Cart Provider Component
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from storage on mount - DEFERRED to avoid blocking startup
  useEffect(() => {
    // Use requestAnimationFrame to let first frame render
    const frameId = requestAnimationFrame(() => {
      loadCart();
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Save cart to storage whenever items change
  useEffect(() => {
    if (isLoaded) {
      saveCart();
      // Update cart badge
      const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
      cartBadge
        .set(totalQty)
        .catch((err) => console.warn("Failed to update cart badge:", err));
    }
  }, [items, isLoaded]);

  // Load cart from AsyncStorage
  const loadCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (cartData) {
        const parsedCart = JSON.parse(cartData);
        setItems(parsedCart);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setIsLoaded(true);
    }
  };

  // Save cart to AsyncStorage
  const saveCart = async () => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  };

  // Add item to cart
  const addToCart = (
    product: Product,
    quantity: number = 1,
    size?: string,
    color?: string,
  ) => {
    setItems((currentItems) => {
      // Check if item with same product, size, and color already exists
      const existingItemIndex = currentItems.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color,
      );

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
        return updatedItems;
      } else {
        // Add new item
        const newItem: CartItem = {
          id: `${product.id}-${size || "default"}-${color || "default"}-${Date.now()}`,
          product,
          quantity,
          selectedSize: size,
          selectedColor: color,
        };

        // Show success toast
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
  };

  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId),
    );

    // Show toast
    if (item) {
      Toast.show({
        type: "info",
        text1: "Đã xóa khỏi giỏ hàng",
        text2: item.product.name,
        position: "bottom",
        visibilityTime: 2000,
      });
    }
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
  };

  // Clear entire cart
  const clearCart = () => {
    setItems([]);
  };

  // Get specific cart item by product ID
  const getCartItem = (productId: string): CartItem | undefined => {
    return items.find((item) => item.product.id === productId);
  };

  // Calculate total items
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate total price
  const totalPrice = items.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  const value: CartContextType = {
    items,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItem,
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
