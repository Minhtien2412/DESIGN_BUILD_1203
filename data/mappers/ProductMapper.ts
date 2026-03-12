/**
 * ProductMapper — DTO ↔ Domain Entity conversion
 * ================================================
 * Isolates BE response shape from domain model.
 * If BE changes field names, only this file needs updating.
 */

import type {
    Product,
    ProductImage,
    ProductSeller,
} from "@/domain/entities/Product";
import { ProductCategory, ProductStatus } from "@/domain/entities/Product";
import type { ProductApiDto } from "../datasources/remote/ProductApi";

export class ProductMapper {
  /**
   * Convert raw API DTO → domain Product entity.
   */
  static toDomain(dto: ProductApiDto): Product {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description ?? "",
      price: typeof dto.price === "string" ? parseFloat(dto.price) : dto.price,
      category: ProductMapper.toCategory(dto.category),
      stock: dto.stock ?? 0,
      status: ProductMapper.toStatus(dto.status),
      rejectionReason: dto.rejectionReason,
      reviewedBy: dto.reviewedBy,
      reviewedAt: dto.reviewedAt,
      createdBy: dto.createdBy,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      viewCount: dto.viewCount ?? 0,
      soldCount: dto.soldCount ?? 0,
      isBestseller: dto.isBestseller ?? false,
      isNew: dto.isNew ?? true,
      images: ProductMapper.toImages(dto.images),
      seller: ProductMapper.toSeller(dto.seller),
    };
  }

  /**
   * Convert a list of API DTOs → domain Product array.
   */
  static toDomainList(dtos: ProductApiDto[]): Product[] {
    return dtos.map(ProductMapper.toDomain);
  }

  // ── Internal helpers ──────────────────────────

  private static toCategory(raw: string): ProductCategory {
    if (Object.values(ProductCategory).includes(raw as ProductCategory)) {
      return raw as ProductCategory;
    }
    return ProductCategory.OTHER;
  }

  private static toStatus(raw: string): ProductStatus {
    if (Object.values(ProductStatus).includes(raw as ProductStatus)) {
      return raw as ProductStatus;
    }
    return ProductStatus.PENDING;
  }

  private static toImages(
    raw?: Array<{
      id: number;
      url: string;
      isPrimary: boolean;
      displayOrder: number;
      createdAt: string;
    }>,
  ): ProductImage[] {
    if (!raw || raw.length === 0) return [];
    return raw
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((img) => ({
        id: img.id,
        url: img.url,
        isPrimary: img.isPrimary ?? false,
        displayOrder: img.displayOrder ?? 0,
        createdAt: img.createdAt,
      }));
  }

  private static toSeller(raw?: {
    id: number;
    name: string;
    email: string;
  }): ProductSeller | undefined {
    if (!raw) return undefined;
    return {
      id: raw.id,
      name: raw.name ?? "",
      email: raw.email ?? "",
    };
  }
}
