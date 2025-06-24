import { notFound } from 'next/navigation';

import { BotDetailContent } from './_components/bot-detail-content';

import { auth } from '@/server/auth';
import { api, HydrateClient } from '@/trpc/server';

export default async function BotDetailPage({ params }: any) {
  const session = await auth();

  if (!session?.user) return notFound();

  await api.apps.getById.prefetch({ id: params.id });

  const response = await fetch(
    'http://localhost:3001/api/trpc/hello.hello', // ✅ call base `/api/trpc`
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([
        {
          id: 1,
          jsonrpc: '2.0',
          method: 'query',
          params: {
            input: { id: params.id }
          }
        }
      ])
    }
  );

  console.log('Response from server:', response);

  return (
    <HydrateClient>
      <BotDetailContent id={params.id} />
    </HydrateClient>
  );
}
