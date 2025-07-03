// src/server/api/routers/categories.ts
import { ProductCategoryDTO } from '@medusajs/types';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { medusaTokenManager } from '@/lib/medusa-token-manager';
import { createCategorySchema } from '@/lib/validations/category';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

export const categoriesRouter = createTRPCRouter({
  // Get all categories for a specific app
  getByApp: protectedProcedure.query(async ({ input, ctx }) => {
    try {
      const response = await medusaTokenManager.makeAuthenticatedRequest<{ product_categories: ProductCategoryDTO[] }>('GET', '/admin/product-categories', undefined, {
        user_id: ctx.session.user.id
      });

      console.log('response.product_categories', response.product_categories);
      return response.product_categories || [];
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch categories'
      });
    }
  }),

  // Create a new category
  create: protectedProcedure
    .input(
      z.object({
        appId: z.string(),
        data: createCategorySchema
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await medusaTokenManager.makeAuthenticatedRequest('POST', '/admin/product-categories', {
          name: input.data.name,
          handle: input.data.handle,
          description: input.data.description,
          parent_category_id: input.data.parent_category_id,
          is_active: input.data.is_active,
          is_internal: input.data.is_internal,
          additional_data: {
            app_id: input.appId,
            user_id: ctx.session.user.id
          }
        });

        return response.product_category;
      } catch (error) {
        console.error('Error creating category:', JSON.stringify(error, null, 2));
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create category'
        });
      }
    }),

  // Update a category
  update: protectedProcedure
    .input(
      z.object({
        appId: z.string(),
        categoryId: z.string(),
        data: createCategorySchema.partial()
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await medusaTokenManager.makeAuthenticatedRequest('POST', `/admin/product-categories/${input.categoryId}`, {
          ...input.data,
          additional_data: {
            app_id: input.appId,
            user_id: ctx.session.user.id
          }
        });

        return response.product_category;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update category'
        });
      }
    }),

  // Delete a category
  delete: protectedProcedure
    .input(
      z.object({
        appId: z.string(),
        categoryId: z.string()
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await medusaTokenManager.makeAuthenticatedRequest('DELETE', `/admin/product-categories/${input.categoryId}`);

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete category'
        });
      }
    })
});
