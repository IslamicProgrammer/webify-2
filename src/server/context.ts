// src/server/context.ts
import { TRPCError } from '@trpc/server';

import { auth } from '@/app/api/auth/[...nextauth]/auth-options'; // Assuming you are importing auth() from your NextAuth setup

export const createContext = async () => {
  const session = await auth(); // Using auth() to get session

  if (!session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return {
    user: session.user // Attach the user to the context
  };
};

export type Context = ReturnType<typeof createContext>;
