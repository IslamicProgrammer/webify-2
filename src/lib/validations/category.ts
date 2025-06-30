import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  handle: z
    .string()
    .min(1, 'Handle is required')
    .max(100, 'Handle must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Handle must contain only lowercase letters, numbers, and hyphens'),
  is_active: z.boolean().default(true),
  is_internal: z.boolean().default(false),
  parent_category_id: z.string().optional()
});

export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;
