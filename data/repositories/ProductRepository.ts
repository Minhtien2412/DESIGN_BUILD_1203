/**
 * ProductRepository — Concrete implementation
 * ============================================
 * Implements IProductRepository using ProductApi + ProductMapper.
 * This is the ONLY class the DI container needs to wire up.
 *
 * Flow: Screen → Hook → UseCase → IProductRepository
 *                                       ↓
 *                               ProductRepository
 *                                 ↓            ↓
 *                           ProductApi    ProductMapper
 */

import type {
    CreateProductDto,
    ModerateProductDto,
    PaginatedResult,
    Product,
    ProductCategoryInfo,
    ProductFilter,
    UpdateProductDto,
} from "@/domain/entities/Product";
import type { IProductRepository } from "@/domain/repositories/IProductRepository";
import type {
    PaginatedApiResponse,
    ProductApiDto,
} from "../datasources/remote/ProductApi";
import { productApi } from "../datasources/remote/ProductApi";
import { ProductMapper } from "../mappers/ProductMapper";

export class ProductRepository implements IProductRepository {
  // ── Queries ───────────────────────────────────

  async getAll(filter?: ProductFilter): Promise<PaginatedResult<Product>> {
    const raw = await productApi.getAll(
      filter ? this.toApiParams(filter) : undefined,
    );
    return this.mapPaginated(raw);
  }

  async getById(id: number): Promise<Product> {
    const dto = await productApi.getById(id);
    return ProductMapper.toDomain(dto);
  }

  async getFeatured(): Promise<PaginatedResult<Product>> {
    const raw = await productApi.getFeatured();
    return this.mapPaginated(raw);
  }

  async getBestSellers(limit?: number): Promise<PaginatedResult<Product>> {
    const raw = await productApi.getBestSellers(limit);
    return this.mapPaginated(raw);
  }

  async getNewArrivals(limit?: number): Promise<PaginatedResult<Product>> {
    const raw = await productApi.getNewArrivals(limit);
    return this.mapPaginated(raw);
  }

  async getCategories(): Promise<ProductCategoryInfo[]> {
    return productApi.getCategories();
  }

  async search(
    query: string,
    limit?: number,
  ): Promise<PaginatedResult<Product>> {
    const raw = await productApi.search(query, limit);
    return this.mapPaginated(raw);
  }

  // ── Mutations ─────────────────────────────────

  async create(data: CreateProductDto): Promise<Product> {
    const dto = await productApi.create(data);
    return ProductMapper.toDomain(dto);
  }

  async update(id: number, data: UpdateProductDto): Promise<Product> {
    const dto = await productApi.update(id, data);
    return ProductMapper.toDomain(dto);
  }

  async delete(id: number): Promise<void> {
    await productApi.delete(id);
  }

  // ── Admin ─────────────────────────────────────

  async moderate(id: number, data: ModerateProductDto): Promise<Product> {
    const dto = await productApi.moderate(id, data.action, data.reason);
    return ProductMapper.toDomain(dto);
  }

  async getPending(filter?: ProductFilter): Promise<PaginatedResult<Product>> {
    const raw = await productApi.getPending(
      filter ? this.toApiParams(filter) : undefined,
    );
    return this.mapPaginated(raw);
  }

  // ── Private helpers ───────────────────────────

  private mapPaginated(
    raw: PaginatedApiResponse<ProductApiDto>,
  ): PaginatedResult<Product> {
    return {
      data: ProductMapper.toDomainList(raw.data),
      meta: raw.meta,
    };
  }

  private toApiParams(filter: ProductFilter): Record<string, any> {
    const params: Record<string, any> = {};
    if (filter.page) params.page = filter.page;
    if (filter.limit) params.limit = filter.limit;
    if (filter.category) params.category = filter.category;
    if (filter.search) params.search = filter.search;
    if (filter.status) params.status = filter.status;
    if (filter.minPrice !== undefined) params.minPrice = filter.minPrice;
    if (filter.maxPrice !== undefined) params.maxPrice = filter.maxPrice;
    if (filter.sortBy) params.sortBy = filter.sortBy;
    if (filter.sortOrder) params.sortOrder = filter.sortOrder;
    if (filter.sellerId) params.sellerId = filter.sellerId;
    if (filter.featured !== undefined) params.featured = filter.featured;
    if (filter.inStock !== undefined) params.inStock = filter.inStock;
    return params;
  }
}
