import { appsRouter } from './routers/apps';
import { categoriesRouter } from './routers/categories';
import { customersRouter } from './routers/customers';
import { helloRouter } from './routers/hello';

import { createCallerFactory, createTRPCRouter } from '@/server/api/trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  apps: appsRouter,
  hello: helloRouter,
  customers: customersRouter,
  categories: categoriesRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
