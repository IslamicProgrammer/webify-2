// src/server/api/routers/products.ts
import type { ProductDTO } from '@medusajs/types';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { medusaTokenManager } from '@/lib/medusa-token-manager';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

// Schema for filtering and sorting products
const getProductsSchema = z.object({
  appId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['title', 'created_at', 'updated_at', 'status', 'handle']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  status: z.enum(['all', 'draft', 'proposed', 'published', 'rejected']).default('all'),
  categoryId: z.string().optional(),
  hasVariants: z.boolean().optional(),
  priceRange: z
    .object({
      min: z.number().optional(),
      max: z.number().optional()
    })
    .optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
});

// Create product schema
const createProductSchema = z.object({
  appId: z.string(),
  title: z.string().min(1, 'Product title is required'),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  handle: z.string().optional(),
  status: z.enum(['draft', 'proposed', 'published', 'rejected']).default('draft'),
  thumbnail: z.string().optional(),
  weight: z.number().optional(),
  length: z.number().optional(),
  height: z.number().optional(),
  width: z.number().optional(),
  origin_country: z.string().optional(),
  hs_code: z.string().optional(),
  mid_code: z.string().optional(),
  material: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

const updateProductSchema = z.object({
  appId: z.string(),
  productId: z.string(),
  data: createProductSchema.omit({ appId: true }).partial()
});

const deleteProductSchema = z.object({
  appId: z.string(),
  productId: z.string()
});

// Helper function to generate SKU
const generateSKU = (title: string): string => {
  const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const timestamp = Date.now().toString().slice(-6);

  return `${cleanTitle.slice(0, 6)}-${timestamp}`;
};

export const productsRouter = createTRPCRouter({
  // Get products using custom admin endpoint
  getByApp: protectedProcedure.input(getProductsSchema).query(async ({ input, ctx }) => {
    try {
      console.log('🛍️ DEBUG: Starting getByApp query for products');
      console.log('🛍️ DEBUG: Input:', JSON.stringify(input, null, 2));

      // Build query parameters for custom admin endpoint
      const params: Record<string, any> = {
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

      if (input.status !== 'all') {
        params.status = input.status;
      }

      if (input.categoryId) {
        params.category_id = input.categoryId;
      }

      // Add hasVariants filter - we'll handle this client-side since it requires checking variant count
      if (input.hasVariants !== undefined) {
        params.has_variants = input.hasVariants;
      }

      // Add priceRange filter - we'll handle this client-side
      if (input.priceRange) {
        params.price_min = input.priceRange.min;
        params.price_max = input.priceRange.max;
      }

      console.log('🛍️ DEBUG: Final params:', JSON.stringify(params, null, 2));

      // Use custom admin products endpoint
      const response = await medusaTokenManager.makeAuthenticatedRequest<{
        products: ProductDTO[];
        count: number;
        total: number;
        limit: number;
        offset: number;
        has_more: boolean;
      }>('GET', '/admin/products', undefined, params);

      console.log('🛍️ DEBUG: Response received:', {
        productsCount: response.products?.length || 0,
        total: response.total || response.count
      });

      const products = response.products || [];

      // Client-side filtering for hasVariants if needed
      let filteredProducts = products;

      if (input.hasVariants !== undefined) {
        filteredProducts = filteredProducts.filter(product => {
          const hasMultipleVariants = (product.variants?.length || 0) > 1;

          return input.hasVariants ? hasMultipleVariants : !hasMultipleVariants;
        });
      }

      // Client-side filtering for price range if needed
      if (input.priceRange && (input.priceRange.min !== undefined || input.priceRange.max !== undefined)) {
        filteredProducts = filteredProducts.filter(
          product =>
            // For now, we'll skip price filtering since Medusa v2 prices are complex
            // You can implement proper price fetching here later
            true
        );
      }

      return {
        products: filteredProducts,
        total: response.total || response.count || 0,
        count: filteredProducts.length,
        limit: input.limit,
        offset: input.offset,
        hasMore: response.has_more || false
      };
    } catch (error: any) {
      console.error('🚨 DEBUG: Error in getByApp:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch products: ${error.message}`
      });
    }
  }),

  // Get single product by ID
  getById: protectedProcedure
    .input(
      z.object({
        appId: z.string(),
        productId: z.string()
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const params = {
          user_id: ctx.session.user.id,
          app_id: input.appId,
          expand: 'variants,categories,images,type,collection'
        };

        const response = await medusaTokenManager.makeAuthenticatedRequest<{
          product: ProductDTO;
        }>('GET', `/admin/products/${input.productId}`, undefined, params);

        return response.product;
      } catch (error: any) {
        console.error('🚨 DEBUG: Error in getById:', error);
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Product not found: ${error.message}`
        });
      }
    }),

  // Create new product
  create: protectedProcedure.input(createProductSchema).mutation(async ({ input, ctx }) => {
    try {
      console.log('🛍️ DEBUG: Creating product:', JSON.stringify(input, null, 2));

      const { appId, ...productData } = input;

      // Add tenant information to metadata
      const requestBody = {
        ...productData,
        metadata: {
          app_id: appId,
          user_id: ctx.session.user.id,
          ...productData.metadata
        }
      };

      // Generate handle if not provided
      if (!requestBody.handle && requestBody.title) {
        requestBody.handle = requestBody.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      const params = {
        user_id: ctx.session.user.id,
        app_id: appId
      };

      const response = await medusaTokenManager.makeAuthenticatedRequest<{
        product: ProductDTO;
      }>('POST', '/admin/products', requestBody, params);

      console.log('✅ DEBUG: Product created successfully:', response.product?.id);

      return response.product;
    } catch (error: any) {
      console.error('🚨 DEBUG: Error creating product:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to create product: ${error.message}`
      });
    }
  }),

  // Update product
  update: protectedProcedure.input(updateProductSchema).mutation(async ({ input, ctx }) => {
    try {
      console.log('🛍️ DEBUG: Updating product:', input.productId);

      const params = {
        user_id: ctx.session.user.id,
        app_id: input.appId
      };

      const response = await medusaTokenManager.makeAuthenticatedRequest<{
        product: ProductDTO;
      }>('POST', `/admin/products/${input.productId}`, input.data, params);

      console.log('✅ DEBUG: Product updated successfully');

      return response.product;
    } catch (error: any) {
      console.error('🚨 DEBUG: Error updating product:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to update product: ${error.message}`
      });
    }
  }),

  // Delete product
  delete: protectedProcedure.input(deleteProductSchema).mutation(async ({ input, ctx }) => {
    try {
      console.log('🛍️ DEBUG: Deleting product:', input.productId);

      const params = {
        user_id: ctx.session.user.id,
        app_id: input.appId
      };

      await medusaTokenManager.makeAuthenticatedRequest('DELETE', `/admin/products/${input.productId}`, undefined, params);

      console.log('✅ DEBUG: Product deleted successfully');

      return { success: true };
    } catch (error: any) {
      console.error('🚨 DEBUG: Error deleting product:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to delete product: ${error.message}`
      });
    }
  }),

  // Get product statistics
  getStats: protectedProcedure.input(z.object({ appId: z.string().optional() })).query(async ({ input, ctx }) => {
    try {
      const params: Record<string, any> = {
        user_id: ctx.session.user.id,
        limit: 1000 // Get more products for stats
      };

      if (input.appId) {
        params.app_id = input.appId;
      }

      const response = await medusaTokenManager.makeAuthenticatedRequest<{
        products: ProductDTO[];
      }>('GET', '/admin/products', undefined, params);

      const products = response.products || [];

      const stats = {
        total: products.length,
        published: products.filter(p => p.status === 'published').length,
        draft: products.filter(p => p.status === 'draft').length,
        withVariants: products.filter(p => (p.variants?.length || 0) > 1).length,
        withImages: products.filter(p => (p.images?.length || 0) > 0).length,
        categorized: products.filter(p => (p.categories?.length || 0) > 0).length
      };

      return stats;
    } catch (error: any) {
      console.error('🚨 DEBUG: Error getting stats:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to get product statistics: ${error.message}`
      });
    }
  }),

  // Generate SKU helper
  generateSku: protectedProcedure
    .input(
      z.object({
        title: z.string()
      })
    )
    .query(({ input }) => generateSKU(input.title))
});
