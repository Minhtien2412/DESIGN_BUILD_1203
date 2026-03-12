/**
 * Use Case: GetProducts
 * =====================
 * Pure business logic — no framework dependencies.
 * Receives a repository via constructor injection.
 */

import type {
    PaginatedResult,
    Product,
    ProductFilter,
} from "../entities/Product";
import type { IProductRepository } from "../repositories/IProductRepository";

export class GetProducts {
  constructor(private readonly repo: IProductRepository) {}

  async execute(filter?: ProductFilter): Promise<PaginatedResult<Product>> {
    return this.repo.getAll(filter);
  }
}

export class GetProductById {
  constructor(private readonly repo: IProductRepository) {}

  async execute(id: number): Promise<Product> {
    return this.repo.getById(id);
  }
}

export class GetFeaturedProducts {
  constructor(private readonly repo: IProductRepository) {}

  async execute(): Promise<PaginatedResult<Product>> {
    return this.repo.getFeatured();
  }
}

export class GetBestSellers {
  constructor(private readonly repo: IProductRepository) {}

  async execute(limit?: number): Promise<PaginatedResult<Product>> {
    return this.repo.getBestSellers(limit);
  }
}

export class GetNewArrivals {
  constructor(private readonly repo: IProductRepository) {}

  async execute(limit?: number): Promise<PaginatedResult<Product>> {
    return this.repo.getNewArrivals(limit);
  }
}

export class SearchProducts {
  constructor(private readonly repo: IProductRepository) {}

  async execute(
    query: string,
    limit?: number,
  ): Promise<PaginatedResult<Product>> {
    return this.repo.search(query, limit);
  }
}
