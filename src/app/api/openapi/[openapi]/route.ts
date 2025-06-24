import { type NextRequest } from 'next/server';
import { createOpenApiFetchHandler } from 'trpc-to-openapi';

import { appRouter } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';

export const dynamic = 'force-dynamic';

const handler = (req: NextRequest) =>
  createOpenApiFetchHandler({
    endpoint: '/api/openapi',
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers })
  });

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE, handler as OPTIONS, handler as HEAD };
