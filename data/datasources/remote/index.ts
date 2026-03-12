/**
 * Remote Data Sources — Barrel export
 */

export { ApiError, apiClient } from "./ApiClient";
export type { ApiClient } from "./ApiClient";

export { productApi } from "./ProductApi";
export type {
    CategoryApiDto, PaginatedApiResponse, ProductApiDto, ProductApiParams
} from "./ProductApi";

