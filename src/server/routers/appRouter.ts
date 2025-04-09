import { initTRPC } from '@trpc/server';
import slugify from 'slugify';
import { Telegraf } from 'telegraf'; // Assuming you use telegraf for bot validation
import { z } from 'zod';

import { auth } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/prisma';

const t = initTRPC.create();

export const { router } = t;
export const publicProcedure = t.procedure;

export const appRouter = router({
  // Get apps for a user
  getApps: publicProcedure
    .input(z.object({ userId: z.string() })) // Validate userId input
    .query(async ({ input }) => prisma.app.findMany({ where: { userId: input.userId } })),

  // Create a new bot with token validation
  createBot: publicProcedure
    .input(z.object({ name: z.string(), botToken: z.string() })) // Validate input
    .mutation(async ({ input }) => {
      // Validate the BotFather token
      const bot = new Telegraf(input.botToken);
      const session = await auth();

      try {
        // Try to get the bot's information using the token to validate it
        const botInfo = await bot.telegram.getMe();

        // Check if the bot was successfully fetched
        if (!botInfo) {
          throw new Error('Invalid BotFather token');
        }

        // Generate slug from the bot name
        const slug = slugify(input.name, { lower: true, strict: true });

        // Create a new bot
        const newBot = await prisma.app.create({
          data: {
            name: input.name,
            botToken: input.botToken,
            userId: session?.user?.id,
            slug
          }
        });

        return newBot;
      } catch (error) {
        throw new Error('Invalid BotFather token');
      }
    })
});

export type AppRouter = typeof appRouter; // Export router type for client-side usage
