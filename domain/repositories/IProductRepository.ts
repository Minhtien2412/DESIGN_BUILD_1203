/**
 * Repository Interface: IProductRepository
 * =========================================
 * Contract for product data access.
 * Domain layer depends ONLY on this interface.
 * Data layer provides the concrete implementation.
 *
 * Follows Dependency Inversion Principle (SOLID "D"):
 *   domain/ defines the contract
 *   data/   implements the contract
 */

import type {
    CreateProductDto,
    ModerateProductDto,
    PaginatedResult,
    Product,
    ProductCategoryInfo,
    ProductFilter,
    UpdateProductDto,
} from "../entities/Product";

export interface IProductRepository {
  // ── Queries (public) ──────────────────────────
  getAll(filter?: ProductFilter): Promise<PaginatedResult<Product>>;
  getById(id: number): Promise<Product>;
  getFeatured(): Promise<PaginatedResult<Product>>;
  getBestSellers(limit?: number): Promise<PaginatedResult<Product>>;
  getNewArrivals(limit?: number): Promise<PaginatedResult<Product>>;
  getCategories(): Promise<ProductCategoryInfo[]>;
  search(query: string, limit?: number): Promise<PaginatedResult<Product>>;

  // ── Mutations (authenticated) ─────────────────
  create(data: CreateProductDto): Promise<Product>;
  update(id: number, data: UpdateProductDto): Promise<Product>;
  delete(id: number): Promise<void>;

  // ── Admin / Moderation ────────────────────────
  moderate(id: number, data: ModerateProductDto): Promise<Product>;
  getPending(filter?: ProductFilter): Promise<PaginatedResult<Product>>;
}
