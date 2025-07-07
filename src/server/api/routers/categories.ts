// src/server/api/routers/categories.ts
import { ProductCategoryDTO } from '@medusajs/types';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { medusaTokenManager } from '@/lib/medusa-token-manager';
import { createCategorySchema } from '@/lib/validations/category';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

// Enhanced schema for filtering and sorting
const getCategoriesSchema = z.object({
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

export const categoriesRouter = createTRPCRouter({
  // Enhanced getByApp with comprehensive filtering
  getByApp: protectedProcedure.input(getCategoriesSchema).query(async ({ input, ctx }) => {
    try {
      console.log('🔍 DEBUG: Starting getByApp query');
      console.log('🔍 DEBUG: Input:', JSON.stringify(input, null, 2));
      console.log('🔍 DEBUG: User ID:', ctx.session.user.id);

      // Build query parameters
      const params: {
        user_id: string;
        limit: number;
        offset: number;
        sort_by: string;
        sort_order: string;
        app_id?: string;
        search?: string;
        is_active?: string;
        is_internal?: string;
        parent_category_id?: string;
        date_from?: string;
        date_to?: string;
      } = {
        user_id: ctx.session.user.id,
        limit: input.limit,
        offset: input.offset,
        sort_by: input.sortBy,
        sort_order: input.sortOrder
      };

      // Add optional filters
      if (input.appId) {
        params.app_id = input.appId;
      }

      if (input.search) {
        params.search = input.search;
      }

      if (input.isActive !== undefined) {
        params.is_active = input.isActive.toString();
      }

      if (input.isInternal !== undefined) {
        params.is_internal = input.isInternal.toString();
      }

      if (input.parentCategoryId !== undefined) {
        params.parent_category_id = input.parentCategoryId || 'null';
      }

      if (input.dateFrom) {
        params.date_from = input.dateFrom.toISOString();
      }

      if (input.dateTo) {
        params.date_to = input.dateTo.toISOString();
      }

      console.log('🔍 DEBUG: Final params:', JSON.stringify(params, null, 2));
      console.log('🔍 DEBUG: About to make request to /admin/categories');

      // Test if medusaTokenManager is initialized
      console.log('🔍 DEBUG: medusaTokenManager available:', !!medusaTokenManager);

      const response = await medusaTokenManager.makeAuthenticatedRequest<{
        product_categories: ProductCategoryDTO[];
        total: number;
        count: number;
        has_more: boolean;
      }>('GET', '/admin/categories', undefined, params);

      console.log('🔍 DEBUG: Response received:', {
        categoriesCount: response.product_categories?.length || 0,
        total: response.total,
        count: response.count,
        responseKeys: Object.keys(response || {})
      });

      return {
        categories: response.product_categories || [],
        total: response.total || 0,
        count: response.count || 0,
        hasMore: response.has_more || false
      };
    } catch (error: any) {
      console.error('🚨 DEBUG: Error in getByApp:', {
        message: error.message,
        status: error.status,
        response: error.response?.data,
        stack: error.stack
      });

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch categories: ${error.message}`
      });
    }
  }),

  // Get category statistics - simplified version
  getStats: protectedProcedure.input(z.object({ appId: z.string().optional() })).query(async ({ input, ctx }) => {
    try {
      const params: any = {
        user_id: ctx.session.user.id,
        limit: 1000 // Get more categories for stats calculation
      };

      if (input.appId) {
        params.app_id = input.appId;
      }

      console.log('Making stats request with params:', params);

      // Get all categories to calculate stats
      const response = await medusaTokenManager.makeAuthenticatedRequest<{
        product_categories: ProductCategoryDTO[];
      }>('GET', '/admin/categories', undefined, params);

      const categories = response.product_categories || [];

      console.log('Stats calculation for categories:', categories.length);

      const stats = {
        total: categories.length,
        active: categories.filter(cat => cat.is_active).length,
        inactive: categories.filter(cat => !cat.is_active).length,
        internal: categories.filter(cat => cat.is_internal).length,
        rootCategories: categories.filter(cat => !cat.parent_category_id).length,
        subCategories: categories.filter(cat => cat.parent_category_id).length
      };

      console.log('Calculated stats:', stats);

      return stats;
    } catch (error: any) {
      console.error('Failed to fetch category stats:', {
        message: error.message,
        status: error.status,
        response: error.response?.data
      });

      // Return default stats instead of throwing error
      return {
        total: 0,
        active: 0,
        inactive: 0,
        internal: 0,
        rootCategories: 0,
        subCategories: 0
      };
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
        console.log('Creating category:', input);

        const response = await medusaTokenManager.makeAuthenticatedRequest('POST', '/admin/categories', {
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

        console.log('Category created:', response);

        return response.product_category;
      } catch (error: any) {
        console.error('Error creating category:', {
          message: error.message,
          status: error.status,
          response: error.response?.data
        });

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create category: ${error.message}`
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
        console.log('Updating category:', input);

        const response = await medusaTokenManager.makeAuthenticatedRequest('POST', `/admin/categories/${input.categoryId}`, {
          ...input.data,
          additional_data: {
            app_id: input.appId,
            user_id: ctx.session.user.id
          }
        });

        console.log('Category updated:', response);

        return response.product_category;
      } catch (error: any) {
        console.error('Error updating category:', {
          message: error.message,
          status: error.status,
          response: error.response?.data
        });

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to update category: ${error.message}`
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
    .mutation(async ({ input }) => {
      try {
        console.log('Deleting category:', input);

        await medusaTokenManager.makeAuthenticatedRequest('DELETE', `/admin/categories/${input.categoryId}`);

        console.log('Category deleted successfully');

        return { success: true };
      } catch (error: any) {
        console.error('Error deleting category:', {
          message: error.message,
          status: error.status,
          response: error.response?.data
        });

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to delete category: ${error.message}`
        });
      }
    })
});
