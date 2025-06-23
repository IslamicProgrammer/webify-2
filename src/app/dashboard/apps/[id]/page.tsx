import { notFound } from 'next/navigation';

import { BotDetailContent } from './_components/bot-detail-content';

import { auth } from '@/server/auth';
import { api, HydrateClient } from '@/trpc/server';

export default async function BotDetailPage({ params }: any) {
  const session = await auth();

  if (!session?.user) return notFound();

  await api.apps.getById.prefetch({ id: params.id });

  return (
    <HydrateClient>
      <BotDetailContent id={params.id} />
    </HydrateClient>
  );
}
