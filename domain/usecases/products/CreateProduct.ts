/**
 * Use Case: CreateProduct
 * =======================
 * Business logic for product creation and moderation.
 */

import type {
    CreateProductDto,
    ModerateProductDto,
    Product,
    UpdateProductDto,
} from "../entities/Product";
import type { IProductRepository } from "../repositories/IProductRepository";

export class CreateProduct {
  constructor(private readonly repo: IProductRepository) {}

  async execute(data: CreateProductDto): Promise<Product> {
    // Business validation
    if (data.price <= 0) {
      throw new Error("Giá sản phẩm phải lớn hơn 0");
    }
    if (!data.name.trim()) {
      throw new Error("Tên sản phẩm không được để trống");
    }
    return this.repo.create(data);
  }
}

export class UpdateProduct {
  constructor(private readonly repo: IProductRepository) {}

  async execute(id: number, data: UpdateProductDto): Promise<Product> {
    if (data.price !== undefined && data.price <= 0) {
      throw new Error("Giá sản phẩm phải lớn hơn 0");
    }
    return this.repo.update(id, data);
  }
}

export class DeleteProduct {
  constructor(private readonly repo: IProductRepository) {}

  async execute(id: number): Promise<void> {
    return this.repo.delete(id);
  }
}

export class ModerateProduct {
  constructor(private readonly repo: IProductRepository) {}

  async execute(id: number, data: ModerateProductDto): Promise<Product> {
    if (data.action === "reject" && !data.reason?.trim()) {
      throw new Error("Lý do từ chối không được để trống");
    }
    return this.repo.moderate(id, data);
  }
}
