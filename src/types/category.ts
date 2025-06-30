export interface ProductCategoryDTO {
  id: string;
  name: string;
  description: string;
  handle: string;
  is_active: boolean;
  is_internal: boolean;
  rank: number;
  parent_category: ProductCategoryDTO | null;
  parent_category_id: string | null;
  category_children: ProductCategoryDTO[];
  products: ProductDTO[];
  created_at: string | Date;
  updated_at: string | Date;
  metadata?: Record<string, any>;
  deleted_at?: string | Date;
}

export interface ProductDTO {
  id: string;
  title: string;
  handle: string;
  // Add other product fields as needed
}

export interface CreateCategoryFormData {
  name: string;
  description: string;
  handle: string;
  is_active: boolean;
  is_internal: boolean;
  parent_category_id?: string;
}
