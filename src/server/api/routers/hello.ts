// server/api/routers/hello.ts
import { z } from 'zod';

import { createTRPCRouter, openApiProcedure } from '@/server/api/trpc';

export const helloRouter = createTRPCRouter({
  get: openApiProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/hello.get',
        summary: 'Get app by ID'
      }
    })
    .input(z.object({ id: z.string().cuid() }))
    .output(z.any())
    .query(async ({ ctx, input }) => ctx.db.app.findFirst({ where: { id: input.id } }))
});
