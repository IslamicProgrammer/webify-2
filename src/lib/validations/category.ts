// src/lib/validations/category.ts
import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Name must be less than 100 characters'),
  handle: z
    .string()
    .min(1, 'Handle is required')
    .max(100, 'Handle must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Handle must contain only lowercase letters, numbers, and hyphens')
    .refine(val => !val.startsWith('-') && !val.endsWith('-'), 'Handle cannot start or end with a hyphen'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  parent_category_id: z.string().optional(),
  is_active: z.boolean().default(true),
  is_internal: z.boolean().default(false),
  rank: z.number().optional()
});

export const updateCategorySchema = createCategorySchema.partial();

export const getCategoriesQuerySchema = z.object({
  appId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'created_at', 'updated_at', 'rank', 'handle']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  isActive: z.boolean().optional(),
  isInternal: z.boolean().optional(),
  parentCategoryId: z.string().nullable().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
});

export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;
export type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>;
export type GetCategoriesQuery = z.infer<typeof getCategoriesQuerySchema>;
