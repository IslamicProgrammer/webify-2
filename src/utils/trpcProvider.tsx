'use client';

import { PropsWithChildren } from 'react';

import { trpc } from './trpc';

export function TRPCProvider({ children }: PropsWithChildren) {
  return children;
}

export default trpc.withTRPC(TRPCProvider);
