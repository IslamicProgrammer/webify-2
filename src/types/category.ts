// src/types/category.ts
export interface ProductCategoryDTO {
  id: string;
  name: string;
  description?: string;
  handle: string;
  is_active: boolean;
  is_internal: boolean;
  rank?: number;
  parent_category_id?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
  tenant_handle?: string; // For tenant-specific handles

  // Relationships
  category_children?: ProductCategoryDTO[];
  parent_category?: ProductCategoryDTO;
  products?: any[]; // Product type would be defined elsewhere
}

export interface CategoryStats {
  total: number;
  active: number;
  inactive: number;
  internal: number;
  rootCategories: number;
  subCategories: number;
}

export interface CategoriesResponse {
  categories: ProductCategoryDTO[];
  total: number;
  count: number;
  hasMore: boolean;
}
