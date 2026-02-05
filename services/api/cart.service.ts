/**
 * Cart API Service
 * Sync giỏ hàng với backend database
 * Created: 03/02/2026
 */

import type { Product } from "@/data/products";
import { apiFetch } from "../api";

// ==================== TYPES ====================

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  addedAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
  updatedAt: string;
}

export interface AddToCartDto {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

export interface ApplyCouponDto {
  couponCode: string;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
}

// ==================== API FUNCTIONS ====================

const BASE_PATH = "/cart";

/**
 * Lấy giỏ hàng của user hiện tại
 */
export async function getCart(): Promise<Cart> {
  try {
    console.log("[CartService] Fetching cart...");

    const cart = await apiFetch<Cart>(BASE_PATH, {
      method: "GET",
    });

    console.log("[CartService] ✅ Cart loaded:", cart.itemCount, "items");
    return cart;
  } catch (error: any) {
    console.error("[CartService] ❌ Failed to fetch cart:", error);
    // Return empty cart instead of throwing
    return {
      id: "",
      userId: "",
      items: [],
      subtotal: 0,
      discount: 0,
      total: 0,
      itemCount: 0,
      updatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Thêm sản phẩm vào giỏ hàng
 */
export async function addToCart(data: AddToCartDto): Promise<Cart> {
  try {
    console.log("[CartService] Adding to cart:", data.productId);

    const cart = await apiFetch<Cart>(`${BASE_PATH}/items`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    console.log("[CartService] ✅ Added to cart");
    return cart;
  } catch (error: any) {
    console.error("[CartService] ❌ Failed to add to cart:", error);
    throw new Error(error.message || "Không thể thêm sản phẩm vào giỏ hàng.");
  }
}

/**
 * Cập nhật số lượng sản phẩm
 */
export async function updateCartItem(
  itemId: string,
  data: UpdateCartItemDto,
): Promise<Cart> {
  try {
    console.log("[CartService] Updating cart item:", itemId);

    const cart = await apiFetch<Cart>(`${BASE_PATH}/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });

    console.log("[CartService] ✅ Cart item updated");
    return cart;
  } catch (error: any) {
    console.error("[CartService] ❌ Failed to update cart item:", error);
    throw new Error("Không thể cập nhật giỏ hàng.");
  }
}

/**
 * Xóa sản phẩm khỏi giỏ hàng
 */
export async function removeFromCart(itemId: string): Promise<Cart> {
  try {
    console.log("[CartService] Removing from cart:", itemId);

    const cart = await apiFetch<Cart>(`${BASE_PATH}/items/${itemId}`, {
      method: "DELETE",
    });

    console.log("[CartService] ✅ Item removed from cart");
    return cart;
  } catch (error: any) {
    console.error("[CartService] ❌ Failed to remove from cart:", error);
    throw new Error("Không thể xóa sản phẩm khỏi giỏ hàng.");
  }
}

/**
 * Xóa toàn bộ giỏ hàng
 */
export async function clearCart(): Promise<void> {
  try {
    console.log("[CartService] Clearing cart...");

    await apiFetch<void>(BASE_PATH, {
      method: "DELETE",
    });

    console.log("[CartService] ✅ Cart cleared");
  } catch (error: any) {
    console.error("[CartService] ❌ Failed to clear cart:", error);
    throw new Error("Không thể xóa giỏ hàng.");
  }
}

/**
 * Áp dụng mã giảm giá
 */
export async function applyCoupon(couponCode: string): Promise<{
  cart: Cart;
  discount: number;
  message: string;
}> {
  try {
    console.log("[CartService] Applying coupon:", couponCode);

    const response = await apiFetch<{
      cart: Cart;
      discount: number;
      message: string;
    }>(`${BASE_PATH}/coupon`, {
      method: "POST",
      body: JSON.stringify({ couponCode }),
    });

    console.log("[CartService] ✅ Coupon applied:", response.discount);
    return response;
  } catch (error: any) {
    console.error("[CartService] ❌ Failed to apply coupon:", error);
    throw new Error(error.message || "Mã giảm giá không hợp lệ.");
  }
}

/**
 * Xóa mã giảm giá
 */
export async function removeCoupon(): Promise<Cart> {
  try {
    console.log("[CartService] Removing coupon...");

    const cart = await apiFetch<Cart>(`${BASE_PATH}/coupon`, {
      method: "DELETE",
    });

    console.log("[CartService] ✅ Coupon removed");
    return cart;
  } catch (error: any) {
    console.error("[CartService] ❌ Failed to remove coupon:", error);
    throw new Error("Không thể xóa mã giảm giá.");
  }
}

/**
 * Lấy tổng quan giỏ hàng (nhẹ hơn getCart)
 */
export async function getCartSummary(): Promise<CartSummary> {
  try {
    console.log("[CartService] Fetching cart summary...");

    const summary = await apiFetch<CartSummary>(`${BASE_PATH}/summary`, {
      method: "GET",
    });

    console.log("[CartService] ✅ Cart summary loaded");
    return summary;
  } catch (error: any) {
    console.error("[CartService] ❌ Failed to fetch cart summary:", error);
    return {
      itemCount: 0,
      subtotal: 0,
      discount: 0,
      shippingFee: 0,
      total: 0,
    };
  }
}

/**
 * Sync local cart với server (khi user đăng nhập)
 */
export async function syncCart(
  localItems: Array<{ productId: string; quantity: number }>,
): Promise<Cart> {
  try {
    console.log("[CartService] Syncing cart with server...");

    const cart = await apiFetch<Cart>(`${BASE_PATH}/sync`, {
      method: "POST",
      body: JSON.stringify({ items: localItems }),
    });

    console.log("[CartService] ✅ Cart synced:", cart.itemCount, "items");
    return cart;
  } catch (error: any) {
    console.error("[CartService] ❌ Failed to sync cart:", error);
    throw new Error("Không thể đồng bộ giỏ hàng.");
  }
}

/**
 * Validate giỏ hàng trước khi checkout
 */
export async function validateCart(): Promise<{
  valid: boolean;
  errors: Array<{
    productId: string;
    message: string;
  }>;
  cart: Cart;
}> {
  try {
    console.log("[CartService] Validating cart...");

    const response = await apiFetch<{
      valid: boolean;
      errors: Array<{ productId: string; message: string }>;
      cart: Cart;
    }>(`${BASE_PATH}/validate`, {
      method: "POST",
    });

    console.log(
      "[CartService] ✅ Cart validation:",
      response.valid ? "passed" : "failed",
    );
    return response;
  } catch (error: any) {
    console.error("[CartService] ❌ Cart validation failed:", error);
    throw new Error("Không thể kiểm tra giỏ hàng.");
  }
}

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
  getCartSummary,
  syncCart,
  validateCart,
};
