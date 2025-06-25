import { z } from 'zod';

import { createTRPCRouter, openApiProcedure, protectedProcedure } from '@/server/api/trpc';

const getCustomersSchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(['firstName', 'lastName', 'createdAt', 'phoneNumber', 'username']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  isPremium: z.boolean().optional(),
  appId: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
});

const sendMessageToCustomerSchema = z.object({
  customerId: z.string().cuid(),
  message: z.string().min(1, 'Message is required'),
  webAppUrl: z.string().url().optional()
});

const updateCustomerSchema = z.object({
  id: z.string().cuid(),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters').optional(),
  phoneNumber: z.string().min(1, 'Phone number is required').max(20, 'Phone number must be less than 20 characters').optional(),
  username: z.string().min(1, 'Username is required').max(50, 'Username must be less than 50 characters').optional(),
  isPremium: z.boolean().optional()
});

const createCustomerSchema = z.object({
  chatId: z.string().optional(),
  appId: z.string().cuid(),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  phoneNumber: z.string().min(1, 'Phone number is required').max(20, 'Phone number must be less than 20 characters').optional(),
  username: z.string().min(1, 'Username is required').max(50, 'Username must be less than 50 characters'),
  isPremium: z.boolean().optional(),
  photoUrl: z.string().url().optional()
});

export const customersRouter = createTRPCRouter({
  create: openApiProcedure
    .meta({ openapi: { method: 'POST', path: '/customers.create' } })
    .input(createCustomerSchema)
    .output(z.object({ success: z.boolean(), customerId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const currentUser = await ctx.db.user.findFirst({
        where: { App: { some: { id: input.appId } } }
      });

      if (!currentUser) throw new Error('Unauthorized or user not found');

      const app = await ctx.db.app.findFirst({
        where: { id: input.appId, userId: currentUser?.id }
      });

      if (!app) throw new Error('Unauthorized or app not found');

      const customer = await ctx.db.customer.create({
        data: {
          ...input,
          appId: input.appId,
          userId: currentUser?.id!,
          chatId: input.chatId || ''
        }
      });

      return { success: true, customerId: customer.id };
    }),

  update: openApiProcedure
    .meta({ openapi: { method: 'PATCH', path: '/customers/update' } })
    .input(updateCustomerSchema)
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const customer = await ctx.db.customer.findFirst({
        where: {
          id: input.id
        }
      });

      if (!customer) throw new Error('Unauthorized or customer not found');

      await ctx.db.customer.update({
        where: { id: input.id },
        data: input
      });

      return { success: true };
    }),
  // Get all customers for the logged-in user with search, sort, and filter
  getAll: protectedProcedure.input(getCustomersSchema).query(async ({ ctx, input }) => {
    const { search, sortBy, sortOrder, isPremium, appId, limit, offset } = input;

    // Build where clause - customers must belong to user's apps
    const where: any = {
      app: {
        userId: ctx.session.user.id
      }
    };

    // Add search functionality
    if (search && search.trim()) {
      where.OR = [
        {
          firstName: {
            contains: search.trim(),
            mode: 'insensitive'
          }
        },
        {
          lastName: {
            contains: search.trim(),
            mode: 'insensitive'
          }
        },
        {
          username: {
            contains: search.trim(),
            mode: 'insensitive'
          }
        },
        {
          phoneNumber: {
            contains: search.trim(),
            mode: 'insensitive'
          }
        }
      ];
    }

    // Add premium filter
    if (isPremium !== undefined) {
      where.isPremium = isPremium;
    }

    // Add app filter
    if (appId) {
      where.appId = appId;
    }

    // Get total count for pagination
    const total = await ctx.db.customer.count({ where });

    // Get customers with pagination and sorting
    const customers = await ctx.db.customer.findMany({
      where,
      include: {
        app: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      take: limit,
      skip: offset
    });

    return {
      customers,
      total,
      hasMore: offset + limit < total
    };
  }),

  // Get customer analytics/stats
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get all customers for user's apps
    const totalCustomers = await ctx.db.customer.count({
      where: {
        app: {
          userId
        }
      }
    });

    // Get premium customers count
    const premiumCustomers = await ctx.db.customer.count({
      where: {
        app: {
          userId
        },
        isPremium: true
      }
    });

    // Get customers per bot
    const customersPerBot = await ctx.db.customer.groupBy({
      by: ['appId'],
      where: {
        app: {
          userId
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    // Get bot names for the grouped data
    const botIds = customersPerBot.map(item => item.appId);
    const bots = await ctx.db.app.findMany({
      where: {
        id: {
          in: botIds
        }
      },
      select: {
        id: true,
        name: true
      }
    });

    const customersPerBotWithNames = customersPerBot.map(item => ({
      ...item,
      botName: bots.find(bot => bot.id === item.appId)?.name || 'Unknown Bot'
    }));

    // Get recent signups (last 30 days)
    const thirtyDaysAgo = new Date();

    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSignups = await ctx.db.customer.count({
      where: {
        app: {
          userId
        },
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Get daily signups for the last 7 days
    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailySignups = await ctx.db.customer.findMany({
      where: {
        app: {
          userId
        },
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      select: {
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group by day
    const signupsByDay = dailySignups.reduce((acc: Record<string, number>, customer) => {
      const day = customer.createdAt.toISOString().split('T')[0];

      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    return {
      totalCustomers,
      premiumCustomers,
      regularCustomers: totalCustomers - premiumCustomers,
      customersPerBot: customersPerBotWithNames,
      recentSignups,
      signupsByDay
    };
  }),

  // Get customer by ID
  getById: protectedProcedure.input(z.object({ id: z.string().cuid() })).query(async ({ ctx, input }) => {
    const customer = await ctx.db.customer.findFirst({
      where: {
        id: input.id,
        app: {
          userId: ctx.session.user.id
        }
      },
      include: {
        app: {
          select: {
            id: true,
            name: true,
            slug: true,
            botToken: true
          }
        }
      }
    });

    return customer;
  }),

  // Send message to customer
  sendMessage: protectedProcedure.input(sendMessageToCustomerSchema).mutation(async ({ ctx, input }) => {
    // First, verify the customer belongs to user's app
    const customer = await ctx.db.customer.findFirst({
      where: {
        chatId: input.customerId,
        app: {
          userId: ctx.session.user.id
        }
      },
      include: {
        app: {
          select: {
            botToken: true
          }
        }
      }
    });

    if (!customer) {
      throw new Error('Customer not found or access denied');
    }

    // Send message via Telegram API
    const payload: Record<string, any> = {
      chat_id: customer.userId, // This should be the Telegram user ID
      text: input.message
    };

    if (input.webAppUrl) {
      payload.reply_markup = {
        inline_keyboard: [
          [
            {
              text: 'Open Mini App',
              web_app: { url: input.webAppUrl }
            }
          ]
        ]
      };
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${customer.app.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.description || 'Failed to send message');
      }

      return { success: true, messageId: result.result.message_id };
    } catch (error) {
      throw new Error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }),

  // Export customers data
  exportData: protectedProcedure
    .input(
      z.object({
        format: z.enum(['csv', 'json']).default('csv'),
        appId: z.string().optional()
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        app: {
          userId: ctx.session.user.id
        }
      };

      if (input.appId) {
        where.appId = input.appId;
      }

      const customers = await ctx.db.customer.findMany({
        where,
        include: {
          app: {
            select: {
              name: true,
              slug: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return {
        customers,
        format: input.format,
        exportedAt: new Date().toISOString()
      };
    })
});
