/**
 * Shopping Products Types
 * Dữ liệu thực tế từ API - không còn mock data
 * Cleaned for production
 */

import { Product } from '@/services/api';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Banner {
  id: string;
  image: any;
  title: string;
  subtitle?: string;
  endTime?: Date;
}

// Empty arrays - data from API only
export const MOCK_CATEGORIES: Category[] = [];
export const MOCK_BANNERS: Banner[] = [];
export const MOCK_PRODUCTS: Product[] = [];

/**
 * Get products from API
 * Use ProductService or apiFetch('/products') instead
 */
export function getProducts(): Product[] {
  return MOCK_PRODUCTS;
}

/**
 * Get product by ID from API
 */
export function getProductById(id: string): Product | undefined {
  return MOCK_PRODUCTS.find(p => p.id === id);
}

/**
 * Get categories from API
 */
export function getCategories(): Category[] {
  return MOCK_CATEGORIES;
}

export default {
  products: MOCK_PRODUCTS,
  categories: MOCK_CATEGORIES,
  banners: MOCK_BANNERS,
};
