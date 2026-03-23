/**
 * useProductsAsync Hook
 * Fetches furniture products for the Worker home ProductSection with async flow.
 * Provides loading/error/empty states. Falls back to local FURNITURE_PRODUCTS.
 *
 * @created 2026-03-16 — Round 4 async expansion
 */

import type { ProductCardItem } from "@/components/home/ProductCard";
import { FURNITURE_PRODUCTS } from "@/components/home/ProductSection";
import { apiFetch } from "@/services/api";
import { useCallback, useEffect, useRef, useState } from "react";

interface ApiProduct {
  id: string | number;
  name: string;
  price: number;
  images?: string[];
  thumbnail?: string;
  discount?: number;
  soldCount?: number;
  category?: string;
}

function transformProduct(item: ApiProduct): ProductCardItem {
  const price =
    typeof item.price === "number"
      ? `${item.price.toLocaleString("vi-VN")}₫`
      : String(item.price);
  const image = item.thumbnail || item.images?.[0] || "";
  return {
    id: Number(item.id),
    name: item.name,
    price,
    image,
    discount: item.discount ? `-${item.discount}%` : undefined,
    soldCount: item.soldCount,
    route: `/products/${item.id}`,
  };
}

export interface UseProductsAsyncResult {
  products: ProductCardItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useProductsAsync(): UseProductsAsyncResult {
  const [products, setProducts] =
    useState<ProductCardItem[]>(FURNITURE_PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFetch<{ data: ApiProduct[] }>(
        "/home/products/furniture?limit=12",
      );
      const items = (response.data || []).map(transformProduct);
      if (items.length > 0) {
        setProducts(items);
      }
      // if empty, keep fallback
    } catch (err) {
      console.warn("[useProductsAsync] API failed, using local fallback");
      // Keep local fallback — don't surface error if we have fallback data
      if (products.length === 0) {
        setError(
          err instanceof Error ? err.message : "Failed to load products",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      const timer = setTimeout(() => fetchProducts(), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  return { products, isLoading, error, refresh };
}
