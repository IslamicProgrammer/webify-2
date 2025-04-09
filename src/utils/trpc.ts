// src/utils/trpc.ts
import { httpBatchLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';

import { AppRouter } from '@/server/routers/appRouter';

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        httpBatchLink({
          url: '/api/trpc'
        })
      ]
    };
  },
  ssr: false
});
