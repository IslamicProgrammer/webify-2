import { notFound } from 'next/navigation';

import { CustomerClient } from './client';

import { auth } from '@/server/auth';
import { api, HydrateClient } from '@/trpc/server';

export default async function CustomerDetailPage({ params }: any) {
  const session = await auth();

  if (!session?.user) return notFound();

  await api.customers.getById.prefetch({ id: params.id });

  return (
    <HydrateClient>
      <CustomerClient id={params.id} />
    </HydrateClient>
  );
}
