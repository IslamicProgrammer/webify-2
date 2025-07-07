// src/server/api/root.ts
import { appsRouter } from './routers/apps';
import { categoriesRouter } from './routers/categories';
import { customersRouter } from './routers/customers';
import { productsRouter } from './routers/products';

import { createCallerFactory, createTRPCRouter } from '@/server/api/trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  apps: appsRouter,
  categories: categoriesRouter,
  products: productsRouter,
  customers: customersRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const result = await trpc.apps.getAll();
 *       ^? App[]
 */
export const createCaller = createCallerFactory(appRouter);
