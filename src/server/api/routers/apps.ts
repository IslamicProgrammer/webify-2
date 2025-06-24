import { z } from 'zod';

import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';

// Shared Zod Schemas
const createAppSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  botToken: z.string().min(1, 'Bot token is required'),
  webhookUrl: z.string().url('Invalid webhook URL').optional(),
  miniAppUrl: z.string().url('Invalid mini app URL').optional(),
  slug: z.string().min(1, 'Slug is required'),
  imageUrl: z.string().url('Invalid image URL').optional()
});

const updateAppSchema = createAppSchema.extend({
  id: z.string().cuid(),
  imageUrl: z.string().url('Invalid image URL').optional()
});

const getAllAppsSchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  status: z.enum(['all', 'active', 'inactive']).default('all'),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
});

export const appsRouter = createTRPCRouter({
  // Create a new app
  create: protectedProcedure.input(createAppSchema).mutation(async ({ ctx, input }) =>
    ctx.db.app.create({
      data: {
        name: input.name,
        botToken: input.botToken,
        webhookUrl: input.webhookUrl,
        miniAppUrl: input.miniAppUrl,
        slug: input.slug,
        userId: ctx.session.user.id
      }
    })
  ),

  // Get all apps for the logged-in user with search, sort, and filter
  getAll: protectedProcedure.input(getAllAppsSchema).query(async ({ ctx, input }) => {
    const { search, sortBy, sortOrder, status, limit, offset } = input;

    // Build where clause
    const where: any = {
      userId: ctx.session.user.id
    };

    // Add search functionality
    if (search && search.trim()) {
      where.OR = [
        {
          name: {
            contains: search.trim(),
            mode: 'insensitive'
          }
        },
        {
          botToken: {
            contains: search.trim(),
            mode: 'insensitive'
          }
        }
      ];
    }

    // Add status filter (assuming you have an isActive field)
    if (status !== 'all') {
      where.isActive = status === 'active';
    }

    // Get total count for pagination
    const total = await ctx.db.app.count({ where });

    // Get apps with pagination and sorting
    const apps = await ctx.db.app.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      take: limit,
      skip: offset
    });

    return {
      apps,
      total,
      hasMore: offset + limit < total
    };
  }),

  // Get latest app for current user
  getLatest: protectedProcedure.query(async ({ ctx }) =>
    ctx.db.app.findFirst({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: 'desc' }
    })
  ),

  // Get app by ID
  getById: protectedProcedure.input(z.object({ id: z.string().cuid() })).query(async ({ ctx, input }) =>
    ctx.db.app.findFirst({
      where: {
        id: input.id,
        userId: ctx.session.user.id
      }
    })
  ),
  getPublicById: publicProcedure.input(z.object({ id: z.string().cuid() })).query(async ({ ctx, input }) =>
    ctx.db.app.findFirst({
      where: {
        id: input.id
      }
    })
  ),

  // Update app
  update: protectedProcedure.input(updateAppSchema).mutation(async ({ ctx, input }) =>
    ctx.db.app.update({
      where: {
        id: input.id
      },
      data: {
        name: input.name,
        botToken: input.botToken,
        webhookUrl: input.webhookUrl,
        miniAppUrl: input.miniAppUrl,
        slug: input.slug,
        imageUrl: input.imageUrl
      }
    })
  ),

  // Delete app
  delete: protectedProcedure.input(z.object({ id: z.string().cuid() })).mutation(async ({ ctx, input }) =>
    ctx.db.app.delete({
      where: {
        id: input.id
      }
    })
  )
});
