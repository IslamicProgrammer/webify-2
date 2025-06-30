import { ProductCategoryDTO } from '@/types/category';

export const mockCategories: ProductCategoryDTO[] = [
  {
    id: 'cat_01',
    name: 'Electronics',
    description: 'Electronic devices and accessories',
    handle: 'electronics',
    is_active: true,
    is_internal: false,
    rank: 1,
    parent_category: null,
    parent_category_id: null,
    category_children: [
      {
        id: 'cat_02',
        name: 'Smartphones',
        description: 'Mobile phones and accessories',
        handle: 'smartphones',
        is_active: true,
        is_internal: false,
        rank: 1,
        parent_category: null,
        parent_category_id: 'cat_01',
        category_children: [],
        products: [],
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 'cat_03',
        name: 'Laptops',
        description: 'Portable computers and accessories',
        handle: 'laptops',
        is_active: true,
        is_internal: false,
        rank: 2,
        parent_category: null,
        parent_category_id: 'cat_01',
        category_children: [],
        products: [],
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      }
    ],
    products: [],
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z'
  },
  {
    id: 'cat_04',
    name: 'Clothing',
    description: 'Fashion and apparel items',
    handle: 'clothing',
    is_active: true,
    is_internal: false,
    rank: 2,
    parent_category: null,
    parent_category_id: null,
    category_children: [
      {
        id: 'cat_05',
        name: "Men's Clothing",
        description: 'Clothing for men',
        handle: 'mens-clothing',
        is_active: true,
        is_internal: false,
        rank: 1,
        parent_category: null,
        parent_category_id: 'cat_04',
        category_children: [],
        products: [],
        created_at: '2024-01-12T10:00:00Z',
        updated_at: '2024-01-12T10:00:00Z'
      }
    ],
    products: [],
    created_at: '2024-01-11T10:00:00Z',
    updated_at: '2024-01-11T10:00:00Z'
  },
  {
    id: 'cat_06',
    name: 'Books',
    description: 'Books and educational materials',
    handle: 'books',
    is_active: false,
    is_internal: true,
    rank: 3,
    parent_category: null,
    parent_category_id: null,
    category_children: [],
    products: [],
    created_at: '2024-01-13T10:00:00Z',
    updated_at: '2024-01-13T10:00:00Z'
  }
];
