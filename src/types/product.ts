// src/types/product.ts
import type { CreateProductDTO, ProductCategoryDTO, ProductDTO, ProductVariantDTO, UpdateProductDTO } from '@medusajs/types';

// Re-export Medusa types directly
export type { ProductDTO, ProductVariantDTO, ProductCategoryDTO };

// Tenant extension for products
export interface ProductTenant {
  id: string;
  app_id: string;
  user_id: string;
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at?: string | Date;
}

// Extended ProductDTO with tenant information
export interface ProductWithTenant extends ProductDTO {
  product_tenant?: ProductTenant;
}

// Product list response
export interface ProductListResponse {
  products: ProductDTO[];
  total: number;
  count: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// Product statistics
export interface ProductStats {
  total: number;
  published: number;
  draft: number;
  withVariants: number;
  withImages: number;
  categorized: number;
}

// Product filters for querying
export interface ProductFilters {
  appId?: string;
  search?: string;
  sortBy?: 'title' | 'created_at' | 'updated_at' | 'status' | 'handle';
  sortOrder?: 'asc' | 'desc';
  status?: 'all' | 'draft' | 'proposed' | 'published' | 'rejected';
  categoryId?: string;
  hasVariants?: boolean;
  priceRange?: {
    min?: number;
    max?: number;
  };
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

// Extended create product input with tenant info
export interface CreateProductWithTenant extends Omit<CreateProductDTO, 'id'> {
  appId: string;
}

// Extended update product input
export interface UpdateProductWithTenant extends UpdateProductDTO {
  appId: string;
  productId: string;
}

// Bulk product upload
export interface BulkProductUpload {
  file: File;
  appId: string;
}

// Excel template row structure
export interface ProductTemplateRow {
  title: string;
  subtitle?: string;
  description?: string;
  handle?: string;
  status: 'draft' | 'proposed' | 'published' | 'rejected';
  thumbnail?: string;
  images?: string; // Comma-separated URLs
  weight?: number;
  length?: number;
  height?: number;
  width?: number;
  origin_country?: string;
  hs_code?: string;
  mid_code?: string;
  material?: string;
  tags?: string; // Comma-separated tags
  categories?: string; // Comma-separated category names
  variant_title?: string;
  variant_sku?: string;
  variant_inventory?: number;
  variant_weight?: number;
  variant_allow_backorder?: boolean;
  variant_manage_inventory?: boolean;
  variant_options?: string; // JSON string of options
}
