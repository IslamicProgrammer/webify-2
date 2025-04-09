import { createNextApiHandler } from '@trpc/server/adapters/next';

import { appRouter } from '@/server/routers/appRouter';

export const handler = createNextApiHandler({
  router: appRouter,
  createContext: () => ({})
});

export { handler as GET, handler as POST };
