import { notFound } from 'next/navigation';

import { CustomerDetailContent } from './_components/customer-detail-content';

import { auth } from '@/server/auth';
import { api, HydrateClient } from '@/trpc/server';

export default async function CustomerDetailPage({ params }: any) {
  const session = await auth();

  if (!session?.user) return notFound();

  await api.customers.getById.prefetch({ id: params.id });

  return (
    <HydrateClient>
      <CustomerDetailContent id={params.id} />
    </HydrateClient>
  );
}
